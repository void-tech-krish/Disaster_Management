const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const getFloodRisk = async (locationData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/flood`, {
      MonsoonIntensity: locationData.rainfall ? locationData.rainfall / 10 : 5.0,
      TopographyDrainage: 5.0,
      RiverManagement: locationData.river_distance ? locationData.river_distance / 10 : 5.0,
      Deforestation: 5.0,
      Urbanization: 5.0,
      ClimateChange: 5.0,
      DamsQuality: 5.0,
      Siltation: 5.0,
      AgriculturalPractices: 5.0,
      Encroachments: 5.0,
      IneffectiveDisasterPreparedness: 5.0,
      DrainageSystems: 5.0,
      CoastalVulnerability: 5.0,
      Landslides: 5.0,
      Watersheds: 5.0,
      DeterioratingInfrastructure: 5.0,
      PopulationScore: 5.0,
      WetlandLoss: 5.0,
      InadequatePlanning: 5.0,
      PoliticalFactors: 5.0
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching flood risk:', error.message);
    return { hazard: 'flood', status: 'UNAVAILABLE', risk_score: null, risk_level: 'UNKNOWN', source: 'ML_SERVICE_UNAVAILABLE', confidence: null };
  }
};

const getLandslideRisk = async (locationData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/landslide`, {
      "Temperature (°C)": locationData.temperature || 25.0,
      "Humidity (%)": locationData.humidity || 50.0,
      "Precipitation (mm)": locationData.rainfall || 10.0,
      "Soil Moisture (%)": locationData.soil_moisture || 40.0,
      "Elevation (m)": locationData.elevation || 500.0
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching landslide risk:', error.message);
    return { hazard: 'landslide', status: 'UNAVAILABLE', risk_score: null, risk_level: 'UNKNOWN', source: 'ML_SERVICE_UNAVAILABLE', confidence: null };
  }
};

const getHeatwaveRisk = async (locationData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/heatwave`, {
      TEMP2M: locationData.temperature || 30.0,
      TMAX: locationData.temperature ? locationData.temperature + 5 : 35.0,
      TMIN: locationData.temperature ? locationData.temperature - 5 : 25.0,
      lat: locationData.lat,
      lon: locationData.lon
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching heatwave risk:', error.message);
    return { hazard: 'heatwave', status: 'UNAVAILABLE', risk_score: null, risk_level: 'UNKNOWN', source: 'ML_SERVICE_UNAVAILABLE', confidence: null };
  }
};

const getDroughtRisk = async (locationData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/drought`, {
      RH2M: locationData.humidity || 50.0,
      T2M: locationData.temperature || 30.0
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching drought risk:', error.message);
    return { hazard: 'drought', status: 'UNAVAILABLE', risk_score: null, risk_level: 'UNKNOWN', source: 'ML_SERVICE_UNAVAILABLE', confidence: null };
  }
};

const getCycloneData = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/data/cyclone`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cyclone data:', error.message);
    return { status: 'UNAVAILABLE', source: 'ML_SERVICE_UNAVAILABLE' };
  }
};

const getUnsupportedRisk = async (hazardName) => {
  return {
    hazard: hazardName,
    risk_score: 0,
    risk_level: 'LOW',
    confidence: 0,
    source: 'Dataset unavailable'
  };
};

module.exports = {
  getFloodRisk,
  getLandslideRisk,
  getHeatwaveRisk,
  getDroughtRisk,
  getCycloneData,
  getUnsupportedRisk
};
