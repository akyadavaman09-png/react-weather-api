import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (searchCity) => {
    if (!searchCity.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        searchCity
      )}&count=1&language=en&format=json`;

      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error('Geocoding service unavailable.');

      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please try another name.');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error('Weather service unavailable.');

      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        country: country || '',
        temp: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        time: weatherData.current.time,
      });
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData('London');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData(city);
  };

  return (
    <div className="app-container">
      <h1>React Weather Dashboard</h1>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Enter city (e.g. New York)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Fetching...' : 'Search'}
        </button>
      </form>

      {loading && <div className="loading">Loading weather data...</div>}
      {error && <div className="error">{error}</div>}

      {weather && !loading && (
        <div className="weather-card">
          <h2>{weather.city}, {weather.country}</h2>
          <div className="weather-item">
            <span>🌡️ Temperature</span>
            <strong>{weather.temp} °C</strong>
          </div>
          <div className="weather-item">
            <span>💧 Humidity</span>
            <strong>{weather.humidity}%</strong>
          </div>
          <div className="weather-item">
            <span>💨 Wind Speed</span>
            <strong>{weather.wind} km/h</strong>
          </div>
          <div className="weather-item">
            <span>🕒 Updated</span>
            <span>{new Date(weather.time).toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;