const axios = require('axios');

const getApiKey = () => process.env.WEATHER_API_KEY;
const getBaseUrl = () => process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
const getGeoUrl = () => 'https://api.openweathermap.org/geo/1.0';

const normalizeWeather = (data, locationInfo = null) => {
  return {
    location: locationInfo || {
      city: data.name,
      state: '',
      country: data.sys.country,
      latitude: data.coord.lat,
      longitude: data.coord.lon
    },
    current: {
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      rainfall: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      high: Math.round(data.main.temp_max),
      low: Math.round(data.main.temp_min)
    },
    updated_at: new Date().toISOString()
  };
};

const getCurrentWeatherByCoordinates = async (latitude, longitude) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('WEATHER_API_KEY is not configured');

  try {
    const geoResponse = await axios.get(`${getGeoUrl()}/reverse`, {
      params: { lat: latitude, lon: longitude, limit: 1, appid: apiKey }
    });
    
    const locationInfo = geoResponse.data.length > 0 ? {
      city: geoResponse.data[0].name,
      state: geoResponse.data[0].state || '',
      country: geoResponse.data[0].country,
      latitude,
      longitude
    } : null;

    const response = await axios.get(`${getBaseUrl()}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: apiKey,
        units: 'metric'
      }
    });

    return normalizeWeather(response.data, locationInfo);
  } catch (error) {
    console.error('Weather API Error:', error.message);
    throw new Error('Failed to fetch weather data');
  }
};

const getCurrentWeatherByCity = async (city) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('WEATHER_API_KEY is not configured');

  try {
    const geoResponse = await axios.get(`${getGeoUrl()}/direct`, {
      params: { q: city, limit: 1, appid: apiKey }
    });

    if (geoResponse.data.length === 0) {
      throw new Error('City not found');
    }

    const loc = geoResponse.data[0];
    
    const response = await axios.get(`${getBaseUrl()}/weather`, {
      params: {
        lat: loc.lat,
        lon: loc.lon,
        appid: apiKey,
        units: 'metric'
      }
    });

    return normalizeWeather(response.data, {
      city: loc.name,
      state: loc.state || '',
      country: loc.country,
      latitude: loc.lat,
      longitude: loc.lon
    });
  } catch (error) {
    if (error.message === 'City not found') throw error;
    console.error('Weather API Error:', error.message);
    throw new Error('Failed to fetch weather data');
  }
};

const searchCities = async (query) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('WEATHER_API_KEY is not configured');

  try {
    const response = await axios.get(`${getGeoUrl()}/direct`, {
      params: { q: query, limit: 5, appid: apiKey }
    });
    return response.data.map(loc => ({
      name: loc.name,
      state: loc.state,
      country: loc.country,
      lat: loc.lat,
      lon: loc.lon
    }));
  } catch (error) {
    console.error('Weather Search Error:', error.message);
    throw new Error('Failed to search cities');
  }
};

module.exports = {
  getCurrentWeatherByCoordinates,
  getCurrentWeatherByCity,
  searchCities
};
