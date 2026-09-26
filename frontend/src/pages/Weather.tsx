import React, { useState } from 'react';
import WeatherCard from '../components/Weather/WeatherCard';
import api from '../services/api';

const Weather = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/weather/search?q=${searchQuery}`);
      setSearchResults(res.data.data);
      if (res.data.data.length === 0) {
        setError('City not found. Try another city.');
      }
    } catch (err) {
      setError('Failed to search cities. Weather service may be unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (city: any) => {
    setSelectedLocation({
      location_city: city.name,
      location_state: city.state,
      location_country: city.country,
      latitude: city.lat,
      longitude: city.lon
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-dg-navy mb-2">Weather</h1>
        <p className="text-slate-500">Check current weather conditions for any location.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 max-w-xl mx-auto relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text"
            className="flex-1 bg-dg-bg border border-dg-border text-dg-text rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-dg-primary focus:border-transparent"
            placeholder="🔍 Search city... (e.g., Mumbai, Delhi, Bengaluru)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-dg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="mt-4 text-danger text-sm font-semibold text-center">{error}</div>}

        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectCity(city)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 border-slate-100 flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-800">{city.name}</span>
                  <span className="text-slate-500 text-sm ml-2">
                    {city.state ? `${city.state}, ` : ''}{city.country}
                  </span>
                </div>
                <span className="text-dg-primary opacity-0 group-hover:opacity-100 text-xl">&rarr;</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="max-w-xl mx-auto">
          <WeatherCard userLocation={selectedLocation} />
        </div>
      )}
    </div>
  );
};

export default Weather;
