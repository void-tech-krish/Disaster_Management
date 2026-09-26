const weatherService = require('../services/weather.service');

const getCurrentWeather = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ status: 'error', message: 'Missing lat or lon' });
    }
    const weather = await weatherService.getCurrentWeatherByCoordinates(lat, lon);
    res.status(200).json({ status: 'success', data: weather });
  } catch (err) {
    if (err.message === 'WEATHER_API_KEY is not configured') {
      return res.status(503).json({ status: 'error', message: 'Weather service unavailable (missing API key)' });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getWeatherByCity = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ status: 'error', message: 'Missing city name' });
    }
    const weather = await weatherService.getCurrentWeatherByCity(city);
    res.status(200).json({ status: 'success', data: weather });
  } catch (err) {
    if (err.message === 'City not found') {
      return res.status(404).json({ status: 'error', message: 'City not found' });
    }
    if (err.message === 'WEATHER_API_KEY is not configured') {
      return res.status(503).json({ status: 'error', message: 'Weather service unavailable (missing API key)' });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const searchCities = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ status: 'error', message: 'Missing search query' });
    }
    const cities = await weatherService.searchCities(q);
    res.status(200).json({ status: 'success', data: cities });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getCurrentWeather,
  getWeatherByCity,
  searchCities
};
