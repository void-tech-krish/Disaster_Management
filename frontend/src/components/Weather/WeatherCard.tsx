import { useEffect, useState } from 'react';
import api from '../../services/api';

interface WeatherData {
  location: { city: string; state: string; country: string };
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    condition: string;
    icon: string;
    high: number;
    low: number;
  };
  updated_at: string;
}

const WeatherCard = ({ userLocation }: { userLocation: any }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!userLocation) return;
    setLoading(true);
    setError('');
    try {
      let res;
      if (userLocation.latitude && userLocation.longitude) {
        res = await api.get(`/weather/current?lat=${userLocation.latitude}&lon=${userLocation.longitude}`);
        setWeather(res.data.success ? res.data : res.data.data);
      } else if (userLocation.location_city) {
        res = await api.get(`/weather/city?city=${userLocation.location_city}`);
        setWeather(res.data.data || res.data);
      } else {
        setError('Location not provided.');
        return;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Weather service is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(interval);
  }, [userLocation]);

  if (!userLocation) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#0F172A] flex items-center">
          <span className="text-xl mr-2">🌤</span> Weather
        </h2>
        <button onClick={fetchWeather} className="text-sm text-slate-500 hover:text-slate-700" title="Refresh">
          ↻
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-10 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
        </div>
      ) : error ? (
        <div className="text-danger text-sm">{error}</div>
      ) : weather ? (
        <>
          <div className="text-sm font-semibold text-slate-500 mb-4 flex items-center">
            <span className="text-[#EA580C] mr-1">📍</span>
            {weather.location.city}{weather.location.state ? `, ${weather.location.state}` : ''}
          </div>
          
          <div className="flex items-center space-x-6 mb-6">
            <div className="text-5xl font-black text-[#0F172A]">
              {weather.current.temperature}°C
            </div>
            <div>
              <div className="text-lg font-bold text-slate-700">{weather.current.condition}</div>
              <img src={`https://openweathermap.org/img/wn/${weather.current.icon}.png`} alt={weather.current.condition} className="w-12 h-12 -ml-2" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 mb-4">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Feels like</div>
              <div className="font-bold text-[#0F172A]">{weather.current.feels_like}°C</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Humidity</div>
              <div className="font-bold text-[#0F172A]">{weather.current.humidity}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Wind</div>
              <div className="font-bold text-[#0F172A]">{weather.current.wind_speed} m/s</div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-4">
            <div>High {weather.current.high}°C <span className="mx-2">•</span> Low {weather.current.low}°C</div>
            <div>Updated {weather.updated_at ? new Date(weather.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default WeatherCard;
