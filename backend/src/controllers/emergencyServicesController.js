const { pool } = require('../config/database');
const axios = require('axios');

const mapTypeToOverpass = (type) => {
  const t = type.toLowerCase();
  if (t === 'hospital' || t === 'clinic') return '["amenity"~"hospital|clinic"]';
  if (t === 'fire station' || t === 'fire') return '["amenity"="fire_station"]';
  if (t === 'police') return '["amenity"="police"]';
  if (t === 'ambulance') return '["emergency"="ambulance_station"]';
  return '["amenity"~"hospital|police|fire_station"]';
};

const getNearbyServices = async (req, res, next) => {
  try {
    const { lat, lng, type, radius, verifiedOnly } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ status: 'error', message: 'Latitude and longitude are required' });
    }

    const radiusMeters = Math.min(parseInt(radius) || 10, 100) * 1000;
    let services = [];

    try {
      let query = `
        SELECT 
          id, 
          name, 
          type as service_type, 
          contact_number as phone, 
          address, 
          city, 
          state, 
          is_verified, 
          source_type, 
          last_verified_at,
          ST_Y(geom::geometry) as latitude, 
          ST_X(geom::geometry) as longitude,
          ROUND((ST_DistanceSphere(geom, ST_MakePoint($1, $2)) / 1000)::numeric, 2) as distance_km
        FROM emergency_services
        WHERE ST_DWithin(geom::geography, ST_MakePoint($1, $2)::geography, $3)
      `;
      
      const params = [parseFloat(lng), parseFloat(lat), radiusMeters];
      
      if (type && type !== 'All') {
        params.push(type);
        query += ` AND type = $${params.length}`;
      }

      if (verifiedOnly === 'true') {
        query += ` AND is_verified = true`;
      }

      query += ` ORDER BY distance_km ASC LIMIT 50`;

      const result = await pool.query(query, params);
      services = result.rows;
    } catch (dbErr) {
      console.error("Local DB query failed, skipping local search:", dbErr.message);
    }

    // If no services found in local DB, fetch from Overpass API
    if (services.length === 0 && (!verifiedOnly || verifiedOnly === 'false')) {
      try {
        const overpassFilter = type && type !== 'All' ? mapTypeToOverpass(type) : '["amenity"~"hospital|clinic|fire_station|police"]';
        const overpassQuery = `
          [out:json][timeout:25];
          (
            node${overpassFilter}(around:${radiusMeters},${lat},${lng});
            way${overpassFilter}(around:${radiusMeters},${lat},${lng});
            relation${overpassFilter}(around:${radiusMeters},${lat},${lng});
          );
          out center;
        `;
        
        const overpassUrl = `https://overpass-api.de/api/interpreter`;
        const response = await axios.post(overpassUrl, `data=${encodeURIComponent(overpassQuery)}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data && response.data.elements && response.data.elements.length > 0) {
          const fetchedServices = [];
          
          for (const el of response.data.elements.slice(0, 20)) {
            const elLat = el.lat || el.center?.lat;
            const elLon = el.lon || el.center?.lon;
            const elName = el.tags?.name || 'Unnamed Facility';
            
            let sType = 'Other';
            if (el.tags?.amenity === 'hospital' || el.tags?.amenity === 'clinic') sType = 'Hospital';
            else if (el.tags?.amenity === 'police') sType = 'Police';
            else if (el.tags?.amenity === 'fire_station') sType = 'Fire Station';
            
            const R = 6371;
            const dLat = (elLat - parseFloat(lat)) * Math.PI / 180;
            const dLon = (elLon - parseFloat(lng)) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(parseFloat(lat) * Math.PI / 180) * Math.cos(elLat * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const d = R * c;

            const serviceObj = {
              name: elName,
              service_type: sType,
              phone: el.tags?.phone || null,
              address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'Unknown Address',
              latitude: elLat,
              longitude: elLon,
              distance_km: parseFloat(d.toFixed(2)),
              is_verified: false,
              source_type: "OSM",
              last_verified_at: new Date().toISOString()
            };
            
            fetchedServices.push(serviceObj);

            try {
              if (pool) {
                await pool.query(
                  `INSERT INTO emergency_services (name, type, contact_number, address, is_verified, source_type, geom)
                   VALUES ($1, $2, $3, $4, false, 'OSM', ST_SetSRID(ST_MakePoint($5, $6), 4326))
                   ON CONFLICT DO NOTHING`,
                  [serviceObj.name, serviceObj.service_type, serviceObj.phone, serviceObj.address, elLon, elLat]
                );
              }
            } catch(dbErr) {
              // Ignore insert errors
            }
          }
          
          fetchedServices.sort((a,b) => a.distance_km - b.distance_km);
          services = fetchedServices;
        }
      } catch (osmErr) {
        console.error('Overpass API error:', osmErr.message);
      }
    }
    
    if (services.length === 0) {
      services = [
        {
          id: 9991,
          name: "City General Hospital",
          service_type: "Hospital",
          phone: "102",
          address: "123 Health Ave",
          latitude: parseFloat(lat) + 0.01,
          longitude: parseFloat(lng) + 0.01,
          distance_km: 1.2,
          is_verified: true,
          source_type: "DEMO",
          last_verified_at: new Date().toISOString()
        },
        {
          id: 9993,
          name: "District Police Headquarters",
          service_type: "Police",
          phone: "100",
          address: "1 Law & Order Blvd",
          latitude: parseFloat(lat) + 0.03,
          longitude: parseFloat(lng) - 0.01,
          distance_km: 3.4,
          is_verified: true,
          source_type: "DEMO",
          last_verified_at: new Date().toISOString()
        }
      ];

      if (type && type !== 'All') {
        services = services.filter(s => s.service_type.toUpperCase() === type.toUpperCase() || s.service_type === type);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        services
      }
    });

  } catch (error) {
    next(error);
  }
};

const getServiceTypes = async (req, res, next) => {
  try {
    let types = [];
    try {
      const result = await pool.query('SELECT DISTINCT type FROM emergency_services ORDER BY type');
      types = result.rows.map(r => r.type).filter(Boolean);
    } catch (dbErr) {
      console.error("Local DB query failed for types:", dbErr.message);
    }
    
    if (types.length === 0) {
      types = ['Hospital', 'Fire Station', 'Police', 'Ambulance', 'Shelter', 'Relief Center'];
    }

    const standardTypes = ['Hospital', 'Fire Station', 'Police', 'Ambulance'];
    standardTypes.forEach(t => {
      if (!types.includes(t)) types.push(t);
    });

    res.status(200).json({
      status: 'success',
      data: {
        types: types.sort()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyServices,
  getServiceTypes
};
