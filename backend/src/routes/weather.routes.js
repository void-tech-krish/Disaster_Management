const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, weatherController.getCurrentWeather);
router.get('/current', authenticateToken, weatherController.getCurrentWeather);
router.get('/city', authenticateToken, weatherController.getWeatherByCity);
router.get('/search', authenticateToken, weatherController.searchCities);

module.exports = router;
