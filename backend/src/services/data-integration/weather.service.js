const dataSourceService = require('../dataSources/dataSourceService');
const axios = require('axios');

class WeatherService {
  async getWeatherData(locationName, lat, lon) {
    try {
      if (!process.env.WEATHER_API_URL || !process.env.WEATHER_API_KEY) {
        throw new Error('DATA SOURCE NOT CONFIGURED');
      }

      // Live fetch using environment variables
      const response = await axios.get(`${process.env.WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`);
      
      const rawData = {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        rainfall: response.data.rain ? response.data.rain['1h'] : 0,
        wind_speed: response.data.wind.speed
      };

      const result = await dataSourceService.processIngestion('OpenMeteo Weather API', rawData);

      if (result && result.data.length > 0) {
        return {
          ...result.data[0],
          source: 'Weather API',
          timestamp: new Date().toISOString(),
          status: 'Fresh'
        };
      } else {
         throw new Error('Data normalization failed');
      }
    } catch (error) {
      console.error('Weather Service Error:', error.message);
      await dataSourceService.processIngestion('OpenMeteo Weather API', {}); // Will trigger failure logging
      throw error;
    }
  }
}

module.exports = new WeatherService();
