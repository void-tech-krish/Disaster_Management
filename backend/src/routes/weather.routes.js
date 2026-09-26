const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', weatherController.getCurrentWeather);
router.get('/current', weatherController.getCurrentWeather);
router.get('/city', weatherController.getWeatherByCity);
router.get('/search', weatherController.searchCities);

module.exports = router;
