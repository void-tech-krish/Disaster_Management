// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import RiskTrend from '../components/RiskIntelligence/RiskTrend';
import RiskFactors from '../components/RiskIntelligence/RiskFactors';
import ModelInfo from '../components/RiskIntelligence/ModelInfo';
import ForecastDisclaimer from '../components/RiskIntelligence/ForecastDisclaimer';
import CrossHazardSummary from '../components/CrossHazard/CrossHazardSummary';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const LocationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const status = useNetworkStatus();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHazard, setSelectedHazard] = useState('flood');
  const [riskData, setRiskData] = useState<any>({
    explanation: null,
    forecast: null,
    impact: null
  });
  const [crossHazardData, setCrossHazardData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/locations/${id}/profile`);
        setData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch location profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!data) return;
    const fetchRiskIntelligence = async () => {
      try {
        const [expRes, forRes, alertsRes, impactRes, crossHazardRes] = await Promise.all([
          api.get(`/risk/${id}/explanation?hazard=${selectedHazard}`),
          api.get(`/risk/${id}/forecast?hazard=${selectedHazard}`),
          api.get(`/alerts?locationId=${id}`),
          // We simulate passing a geometry bounds or point for this location 
          api.post('/map/impact-analysis', { 
            geometry: { 
              type: "Point", 
              coordinates: [data.lon || 78.9629, data.lat || 20.5937] 
            } 
          }).catch(() => ({ data: { data: null } })),
          api.get(`/cross-hazard/${id}`).catch(() => ({ data: { data: null } }))
        ]);
        setRiskData({
          explanation: expRes.data.data,
          forecast: forRes.data.data,
          impact: impactRes.data?.data
        });
        setAlerts(alertsRes.data.data.alerts || []);
        if (crossHazardRes.data?.data) {
          setCrossHazardData(crossHazardRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch risk intelligence or alerts", err);
      }
    };
    fetchRiskIntelligence();
  }, [id, selectedHazard, data, status]);

  if (loading) return <div className="text-gray-400">Loading location profile...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!data) return <div>No data found.</div>;

  const { location, geographicFactors, hazardProfile } = data;

  const getRiskColor = (level: string) => {
    if (level === 'CRITICAL') return 'text-danger';
    if (level === 'HIGH') return 'text-warning';
    if (level === 'MODERATE') return 'text-yellow-400';
    return 'text-success';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-sm text-gray-400 hover:text-white mb-6 inline-block">&larr; Back to Dashboard</Link>
      
      <header className="mb-8 pb-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold mb-2">{location.name}</h1>
        <p className="text-gray-400">{location.region} • {location.type}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 text-warning">Geographic Factors</h2>
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <ul className="space-y-3 text-sm">
              {Object.entries(geographicFactors).map(([key, value]) => (
                <li key={key} className="flex justify-between border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                  <span className="capitalize text-gray-400">{key.replace('_', ' ')}</span>
                  <span className="text-gray-200 font-semibold">{String(value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-warning">Hazard Profile</h2>
          <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
            <ul className="space-y-3">
              {Object.entries(hazardProfile).map(([hazard, level]) => (
                <li key={hazard} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                  <span className="capitalize text-gray-300">{hazard}</span>
                  <span className={`font-bold px-2 py-1 rounded text-xs border border-current ${getRiskColor(String(level))}`}>
                    {String(level)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-charcoal rounded text-xs text-gray-400 italic">
              Note: Earthquake hazard indicates seismic zone information, not predictions.
            </div>
          </div>
        </div>
      </div>

      {alerts && alerts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-warning">Official Warnings</h2>
          <div className="grid grid-cols-1 gap-4">
            {alerts.map((a: any) => (
              <div key={a.id} className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {status === 'OFFLINE' ? 'CACHED OFFICIAL WARNING' : 'OFFICIAL WARNING'}
                    </span>
                    <span className="font-bold text-red-400">{a.title}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{a.message}</p>
                </div>
                <div className="mt-2 md:mt-0 text-xs text-gray-500 whitespace-nowrap">
                  Valid until: {new Date(a.expiry_time).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Hazard Intelligence */}
      {crossHazardData && (
        <div className="mt-8">
          <CrossHazardSummary data={crossHazardData} />
        </div>
      )}

      {/* Advanced Risk Intelligence Section */}
      <div className="mt-12 border-t border-gray-700 pt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-warning mb-1">Advanced Risk Intelligence</h2>
            <p className="text-sm text-gray-400">Deep-dive analysis of local hazard factors and risk models.</p>
          </div>
          <select 
             value={selectedHazard}
             onChange={(e) => setSelectedHazard(e.target.value)}
             className="bg-charcoal border border-gray-600 rounded px-3 py-2 text-white text-sm"
          >
             <option value="flood">Flood Model</option>
             <option value="landslide">Landslide Model</option>
             <option value="heatwave">Heatwave Model</option>
             <option value="drought">Drought Model</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <RiskTrend 
               historicalData={riskData.forecast?.historical} 
               forecastStatus={riskData.forecast?.forecast}
             />
             <div className="flex justify-end">
               <Link to="/simulator" className="text-sm bg-charcoal hover:bg-gray-700 border border-gray-600 px-4 py-2 rounded transition-colors text-gray-300">
                 Launch Scenario Simulator &rarr;
               </Link>
             </div>
          </div>
          <div>
             <RiskFactors 
               factors={riskData.explanation?.factors} 
               explanationStatus={riskData.explanation?.explanation}
             />
             <ModelInfo 
               modelVersion={riskData.explanation?.model_version || riskData.forecast?.model_version || 'v1.0'}
               source={riskData.explanation?.source_type || 'AI RISK ASSESSMENT'}
               confidence={0.85} 
             />
             <ForecastDisclaimer isForecast={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
