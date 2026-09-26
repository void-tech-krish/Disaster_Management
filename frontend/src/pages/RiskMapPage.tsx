// @ts-nocheck
import { useState, useEffect } from 'react';
import RiskMap from '../components/Map/RiskMap';
import api from '../services/api';

const RiskMapPage = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [cycloneData, setCycloneData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showPopulation, setShowPopulation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, cycloneRes] = await Promise.all([
          api.get('/locations'),
          api.get('/risk/cyclone')
        ]);
        
        // Add some mock hazard/risk data since Phase 1 locations API only returned basic coords
        const enrichedLocations = locRes.data.data.locations.map((loc: any, idx: number) => {
          if (loc.name === 'Vijayawada') return { ...loc, hazard: 'Flood', risk_level: 'HIGH', population: 45000 };
          if (loc.name === 'Mumbai') return { ...loc, hazard: 'Flood', risk_level: 'MODERATE', population: 120000 };
          if (loc.name === 'Dehradun') return { ...loc, hazard: 'Landslide', risk_level: 'CRITICAL', population: 18420 };
          return { ...loc, hazard: 'Earthquake', risk_level: 'LOW', population: 5000 };
        });
        setLocations(enrichedLocations);
        
        if (cycloneRes.data?.data?.status === 'success') {
          setCycloneData(cycloneRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-dg-navy mb-2">Interactive Risk Map</h1>
          <p className="text-dg-muted font-medium">View real-time disaster risks and exposed population zones.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end space-y-3">
          <div className="flex space-x-2">
            {['All', 'Flood', 'Landslide', 'Earthquake', 'Cyclone'].map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${activeFilter === f ? 'bg-dg-primary text-white shadow-sm' : 'bg-dg-surface text-dg-muted hover:bg-slate-100 border border-dg-border'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="flex items-center space-x-2 text-sm cursor-pointer bg-dg-surface text-dg-navy font-medium px-3 py-1.5 rounded-lg border border-dg-border hover:border-dg-primary transition-colors shadow-sm">
            <input 
              type="checkbox" 
              className="accent-dg-primary"
              checked={showPopulation}
              onChange={() => setShowPopulation(!showPopulation)}
            />
            <span>Show Population at Risk Layer</span>
          </label>
        </div>
      </header>

      {loading ? (
        <div className="h-[600px] w-full bg-dg-surface animate-pulse rounded-[18px] border border-dg-border flex items-center justify-center">
          <span className="text-dg-muted font-medium">Loading Map Data...</span>
        </div>
      ) : (
        <RiskMap locations={locations} activeFilter={activeFilter} showPopulation={showPopulation} cycloneData={cycloneData} />
      )}
    </div>
  );
};

export default RiskMapPage;
