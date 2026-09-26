const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../config/database');

// Live Routing logic using Mapbox Directions API
router.post('/', async (req, res, next) => {
  try {
    const { start, startCoords, destinationCampId } = req.body;

    // Use dynamic coordinates from frontend
    if (!startCoords || !startCoords.lat || !startCoords.lng) {
      return res.status(400).json({ status: 'error', message: 'startCoords (lat, lng) are required.' });
    }
    if (!destinationCampId) {
      return res.status(400).json({ status: 'error', message: 'destinationCampId is required.' });
    }

    const originLat = startCoords.lat;
    const originLng = startCoords.lng;

    // 1. Validate destinationCampId and get coordinates
    const campResult = await pool.query('SELECT * FROM relief_camps WHERE id = $1', [destinationCampId]);
    if (!campResult.rows.length) {
      return res.status(404).json({ status: 'error', message: 'Relief camp not found.' });
    }
    
    const camp = campResult.rows[0];
    if (!camp.latitude || !camp.longitude) {
      return res.status(400).json({ status: 'error', message: 'Selected relief camp does not have valid coordinates.' });
    }

    const destLat = camp.latitude;
    const destLng = camp.longitude;

    // Mapbox Directions API request
    const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}`;

    let mapboxResponse;
    try {
      mapboxResponse = await axios.get(url, {
        params: {
          alternatives: true,
          geometries: 'geojson',
          overview: 'full',
          access_token: MAPBOX_TOKEN
        }
      });
    } catch (err) {
      console.error('Mapbox API error:', err.response?.data || err.message);
      return res.status(500).json({ status: 'error', message: 'Unable to calculate a route for this location.' });
    }

    const routesData = mapboxResponse.data.routes;
    if (!routesData || routesData.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Unable to calculate a route for this location.' });
    }

    // Process the shortest route (first route returned by Mapbox)
    const primaryRoute = routesData[0];
    // Mapbox returns coordinates in [lng, lat], but react-leaflet requires [lat, lng]
    const primaryPolyline = primaryRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    
    const shortestRoute = {
      id: 'route_shortest',
      name: 'Shortest Route',
      distance: (primaryRoute.distance / 1000).toFixed(1) + ' km',
      time: Math.round(primaryRoute.duration / 60) + ' min',
      risk_exposure: 'HIGH',
      affected_zones: ['Flood Zone A (DEMO)'],
      polyline: primaryPolyline
    };

    const routesResponse = [shortestRoute];

    // If an alternative route is available, process it as the safer route
    if (routesData.length > 1) {
      const altRoute = routesData[1];
      const altPolyline = altRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      const saferRoute = {
        id: 'route_safer',
        name: 'Lower Exposure Route',
        distance: (altRoute.distance / 1000).toFixed(1) + ' km',
        time: Math.round(altRoute.duration / 60) + ' min',
        risk_exposure: 'LOW',
        affected_zones: [],
        polyline: altPolyline
      };
      routesResponse.push(saferRoute);
    }

    res.status(200).json({
      status: 'success',
      data: {
        routes: routesResponse,
        message: 'Calculated real road routes to the selected relief camp.',
        origin: { latitude: originLat, longitude: originLng },
        destination: {
          id: camp.id,
          name: camp.name,
          latitude: destLat,
          longitude: destLng
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
