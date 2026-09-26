import React, { useState } from 'react';
import axios from 'axios';

interface LocationSearchProps {
  onLocationSelected: (location: {
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelected }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            types: 'place,locality',
            limit: 5
          }
        }
      );

      setResults(response.data.features);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch location data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (feature: any) => {
    // Parse the context array from Mapbox response to extract state and country
    let state = '';
    let country = '';
    
    if (feature.context) {
      feature.context.forEach((ctx: any) => {
        if (ctx.id.startsWith('region')) state = ctx.text;
        if (ctx.id.startsWith('country')) country = ctx.text;
      });
    }

    const locationData = {
      city: feature.text,
      state: state,
      country: country,
      latitude: feature.center[1], // Mapbox uses [lng, lat]
      longitude: feature.center[0]
    };

    setResults([]);
    setQuery(feature.place_name);
    onLocationSelected(locationData);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get city name
          const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
            {
              params: {
                access_token: MAPBOX_TOKEN,
                types: 'place,locality'
              }
            }
          );
          
          if (response.data.features && response.data.features.length > 0) {
            handleSelect(response.data.features[0]);
          } else {
            // Fallback if Mapbox can't find the city name
            onLocationSelected({
              city: 'Current Location',
              state: '',
              country: '',
              latitude,
              longitude
            });
          }
        } catch (err) {
          setError('Failed to resolve current location');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Location permission denied. Please search manually.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="w-full max-w-md relative">
      <form onSubmit={handleSearch} className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any city (e.g., Vijayawada)..."
          className="flex-1 bg-dg-surface border border-dg-border rounded-lg px-4 py-2 text-dg-navy focus:outline-none focus:border-dg-primary"
        />
        <button 
          type="submit"
          className="bg-dg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors"
          disabled={loading}
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>
      
      <button 
        type="button"
        onClick={handleUseCurrentLocation}
        className="text-sm font-bold text-dg-primary hover:underline mb-2 block"
      >
        [ Use My Location ]
      </button>

      {error && <p className="text-xs text-dg-danger font-bold">{error}</p>}

      {results.length > 0 && (
        <ul className="absolute z-50 w-full bg-dg-surface border border-dg-border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map((feature) => (
            <li 
              key={feature.id}
              onClick={() => handleSelect(feature)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-dg-border last:border-0 text-dg-navy text-sm"
            >
              {feature.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
