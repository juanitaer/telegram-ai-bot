const axios = require('axios');
function createWeatherService({ apiKey, http = axios } = {}) {
  return { async getWeather(city) {
    try {
      const { data } = await http.get('https://api.openweathermap.org/data/2.5/weather', { params: { q: city, appid: apiKey, units: 'metric', lang: 'es' }, timeout: 8000 });
      return { city: data.name || city, temperature: data.main.temp, maximum: data.main.temp_max, minimum: data.main.temp_min, humidity: data.main.humidity, latitude: data.coord.lat, longitude: data.coord.lon };
    } catch (error) {
      if (error?.response?.status === 404) throw new Error('CITY_NOT_FOUND');
      if (error?.code === 'ECONNABORTED') throw new Error('WEATHER_TIMEOUT');
      throw new Error('WEATHER_UNAVAILABLE');
    }
  } };
}
module.exports = { createWeatherService };
