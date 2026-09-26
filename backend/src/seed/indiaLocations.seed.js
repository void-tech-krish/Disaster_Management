require('dotenv').config();
const { pool } = require('../config/database');

const statesData = [
  { name: 'Andhra Pradesh', type: 'STATE' },
  { name: 'Arunachal Pradesh', type: 'STATE' },
  { name: 'Assam', type: 'STATE' },
  { name: 'Bihar', type: 'STATE' },
  { name: 'Chhattisgarh', type: 'STATE' },
  { name: 'Goa', type: 'STATE' },
  { name: 'Gujarat', type: 'STATE' },
  { name: 'Haryana', type: 'STATE' },
  { name: 'Himachal Pradesh', type: 'STATE' },
  { name: 'Jharkhand', type: 'STATE' },
  { name: 'Karnataka', type: 'STATE' },
  { name: 'Kerala', type: 'STATE' },
  { name: 'Madhya Pradesh', type: 'STATE' },
  { name: 'Maharashtra', type: 'STATE' },
  { name: 'Manipur', type: 'STATE' },
  { name: 'Meghalaya', type: 'STATE' },
  { name: 'Mizoram', type: 'STATE' },
  { name: 'Nagaland', type: 'STATE' },
  { name: 'Odisha', type: 'STATE' },
  { name: 'Punjab', type: 'STATE' },
  { name: 'Rajasthan', type: 'STATE' },
  { name: 'Sikkim', type: 'STATE' },
  { name: 'Tamil Nadu', type: 'STATE' },
  { name: 'Telangana', type: 'STATE' },
  { name: 'Tripura', type: 'STATE' },
  { name: 'Uttar Pradesh', type: 'STATE' },
  { name: 'Uttarakhand', type: 'STATE' },
  { name: 'West Bengal', type: 'STATE' },
  { name: 'Andaman and Nicobar Islands', type: 'UNION_TERRITORY' },
  { name: 'Chandigarh', type: 'UNION_TERRITORY' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'UNION_TERRITORY' },
  { name: 'Delhi', type: 'UNION_TERRITORY' },
  { name: 'Jammu and Kashmir', type: 'UNION_TERRITORY' },
  { name: 'Ladakh', type: 'UNION_TERRITORY' },
  { name: 'Lakshadweep', type: 'UNION_TERRITORY' },
  { name: 'Puducherry', type: 'UNION_TERRITORY' }
];

const citiesData = [
  { stateName: 'Andhra Pradesh', name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
  { stateName: 'Andhra Pradesh', name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { stateName: 'Maharashtra', name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { stateName: 'Maharashtra', name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { stateName: 'Maharashtra', name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { stateName: 'Gujarat', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { stateName: 'Gujarat', name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { stateName: 'Delhi', name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { stateName: 'Uttarakhand', name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  { stateName: 'Assam', name: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { stateName: 'Jammu and Kashmir', name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { stateName: 'Karnataka', name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { stateName: 'Karnataka', name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  { stateName: 'Tamil Nadu', name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { stateName: 'Tamil Nadu', name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { stateName: 'Uttar Pradesh', name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { stateName: 'Uttar Pradesh', name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { stateName: 'West Bengal', name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { stateName: 'West Bengal', name: 'Darjeeling', lat: 27.0360, lng: 88.2636 },
  { stateName: 'Rajasthan', name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { stateName: 'Rajasthan', name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  { stateName: 'Kerala', name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { stateName: 'Kerala', name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  { stateName: 'Madhya Pradesh', name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { stateName: 'Madhya Pradesh', name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { stateName: 'Bihar', name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { stateName: 'Bihar', name: 'Gaya', lat: 24.7914, lng: 85.0002 },
  { stateName: 'Punjab', name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { stateName: 'Punjab', name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { stateName: 'Haryana', name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
  { stateName: 'Haryana', name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
  { stateName: 'Odisha', name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { stateName: 'Odisha', name: 'Cuttack', lat: 20.4625, lng: 85.8830 },
  { stateName: 'Telangana', name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { stateName: 'Telangana', name: 'Warangal', lat: 17.9689, lng: 79.5941 },
  { stateName: 'Jharkhand', name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  { stateName: 'Jharkhand', name: 'Jamshedpur', lat: 22.8046, lng: 86.2029 },
  { stateName: 'Chhattisgarh', name: 'Raipur', lat: 21.2514, lng: 81.6296 },
  { stateName: 'Chhattisgarh', name: 'Bhilai', lat: 21.1938, lng: 81.3509 },
  { stateName: 'Himachal Pradesh', name: 'Shimla', lat: 31.1048, lng: 77.1734 },
  { stateName: 'Himachal Pradesh', name: 'Manali', lat: 32.2396, lng: 77.1887 },
  { stateName: 'Goa', name: 'Panaji', lat: 15.4909, lng: 73.8278 },
  { stateName: 'Goa', name: 'Vasco da Gama', lat: 15.3980, lng: 73.8111 },
  { stateName: 'Tripura', name: 'Agartala', lat: 23.8315, lng: 91.2868 },
  { stateName: 'Tripura', name: 'Udaipur', lat: 23.5303, lng: 91.4820 },
  { stateName: 'Meghalaya', name: 'Shillong', lat: 25.5788, lng: 91.8933 },
  { stateName: 'Meghalaya', name: 'Tura', lat: 25.5140, lng: 90.2033 },
  { stateName: 'Manipur', name: 'Imphal', lat: 24.8170, lng: 93.9368 },
  { stateName: 'Manipur', name: 'Churachandpur', lat: 24.3323, lng: 93.6816 },
  { stateName: 'Nagaland', name: 'Kohima', lat: 25.6751, lng: 94.1086 },
  { stateName: 'Nagaland', name: 'Dimapur', lat: 25.9069, lng: 93.7268 },
  { stateName: 'Mizoram', name: 'Aizawl', lat: 23.7271, lng: 92.7176 },
  { stateName: 'Mizoram', name: 'Lunglei', lat: 22.8872, lng: 92.7389 },
  { stateName: 'Arunachal Pradesh', name: 'Itanagar', lat: 27.0844, lng: 93.6053 },
  { stateName: 'Arunachal Pradesh', name: 'Tawang', lat: 27.5861, lng: 91.8601 },
  { stateName: 'Sikkim', name: 'Gangtok', lat: 27.3314, lng: 88.6138 },
  { stateName: 'Sikkim', name: 'Namchi', lat: 27.1667, lng: 88.3500 },
  { stateName: 'Chandigarh', name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { stateName: 'Dadra and Nagar Haveli and Daman and Diu', name: 'Daman', lat: 20.3974, lng: 72.8328 },
  { stateName: 'Dadra and Nagar Haveli and Daman and Diu', name: 'Silvassa', lat: 20.2763, lng: 73.0083 },
  { stateName: 'Ladakh', name: 'Leh', lat: 34.1526, lng: 77.5771 },
  { stateName: 'Ladakh', name: 'Kargil', lat: 34.5539, lng: 76.1349 },
  { stateName: 'Andaman and Nicobar Islands', name: 'Port Blair', lat: 11.6234, lng: 92.7265 },
  { stateName: 'Andaman and Nicobar Islands', name: 'Diglipur', lat: 13.2662, lng: 92.9818 },
  { stateName: 'Lakshadweep', name: 'Kavaratti', lat: 10.5667, lng: 72.6369 },
  { stateName: 'Lakshadweep', name: 'Minicoy', lat: 8.2753, lng: 73.0483 },
  { stateName: 'Puducherry', name: 'Puducherry', lat: 11.9416, lng: 79.8083 },
  { stateName: 'Puducherry', name: 'Karaikal', lat: 10.9254, lng: 79.8380 }
];

// Provide fake offset for camps from city center
const campsData = [];
citiesData.forEach(city => {
  campsData.push({
    cityName: city.name,
    name: 'Emergency Shelter ' + city.name,
    address: 'Main Town Hall, ' + city.name,
    lat: city.lat + 0.005,
    lng: city.lng + 0.005,
    capacity: 500,
  });
  campsData.push({
    cityName: city.name,
    name: 'Municipal Relief Centre ' + city.name,
    address: 'Municipal School, ' + city.name,
    lat: city.lat - 0.005,
    lng: city.lng + 0.008,
    capacity: 300,
  });
  campsData.push({
    cityName: city.name,
    name: 'Community Hall ' + city.name,
    address: 'Community Center, ' + city.name,
    lat: city.lat + 0.008,
    lng: city.lng - 0.003,
    capacity: 250,
  });
});


const seedLocations = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Seed states
    for (const state of statesData) {
      await client.query(`
        INSERT INTO states (name, type) 
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
      `, [state.name, state.type]);
    }
    
    // Fetch all states to map stateName to state_id
    const statesResult = await client.query('SELECT id, name FROM states');
    const stateMap = {};
    statesResult.rows.forEach(r => { stateMap[r.name] = r.id; });
    
    // Seed cities
    for (const city of citiesData) {
      const stateId = stateMap[city.stateName];
      if (!stateId) continue;
      
      await client.query(`
        INSERT INTO cities (state_id, name, latitude, longitude) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (state_id, name) DO UPDATE SET
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude
      `, [stateId, city.name, city.lat, city.lng]);
    }

    // Fetch all cities to map cityName to city_id and state_id
    const citiesResult = await client.query('SELECT id, name, state_id FROM cities');
    const cityMap = {};
    citiesResult.rows.forEach(r => { cityMap[r.name] = { id: r.id, state_id: r.state_id }; });

    // Actually let's clean up and use a better idempotent approach for camps:
    // Delete all DEMO camps and re-insert them, or just rely on a check.
    // Given the constraints, doing a delete of all DEMO camps and re-inserting is safest for this script.
    await client.query("DELETE FROM relief_camps WHERE is_demo = true");
    for (const camp of campsData) {
      const cityInfo = cityMap[camp.cityName];
      if (!cityInfo) continue;
      
      await client.query(`
        INSERT INTO relief_camps (state_id, city_id, name, address, latitude, longitude, capacity, status, source_type, is_demo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', 'DEMO', true)
      `, [cityInfo.state_id, cityInfo.id, camp.name, camp.address, camp.lat, camp.lng, camp.capacity]);
    }

    await client.query('COMMIT');
    console.log('India locations seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding locations:', err);
  } finally {
    client.release();
  }
};

seedLocations().then(() => process.exit(0)).catch(() => process.exit(1));
