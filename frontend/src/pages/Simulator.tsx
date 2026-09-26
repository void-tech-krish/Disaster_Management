// @ts-nocheck
import { useState } from 'react';
import api from '../services/api';
import RiskCard from '../components/RiskCard';

const Simulator = () => {
  const [hazard, setHazard] = useState('Flood');
  const [inputs, setInputs] = useState({
    rainfall: 120,
    river_level: 3.2,
    soil_moisture: 65,
    elevation: 120,
    river_distance: 1.2
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Define a realistic baseline to compare against
      const baselineFeatures = {
        rainfall: 50,
        river_level: 1.5,
        soil_moisture: 40,
        elevation: 120,
        river_distance: 1.2
      };

      const res = await api.post('/simulate', {
        hazard,
        locationId: 'Vijayawada',
        features: inputs,
        baselineFeatures: baselineFeatures
      });

      if (res.data.status === 'success') {
        setResult(res.data.data);
      } else {
        setError('Simulation failed: ' + res.data.message);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to simulation engine');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold mb-2">What-If Scenario Simulator</h1>
        <p className="text-gray-400">Modify environmental inputs to forecast theoretical risk exposure.</p>
        <span className="text-xs bg-warning text-darkslate font-bold px-2 py-1 rounded inline-block mt-2 tracking-wide uppercase">AI Scenario Simulation - Not A Prediction</span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 text-warning">Input Parameters</h2>
          <form onSubmit={handleSimulate} className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg space-y-4">
            
            <div className="mb-4">
               <label className="text-sm text-gray-400 uppercase">Hazard Model</label>
               <select 
                 value={hazard}
                 onChange={(e) => setHazard(e.target.value)}
                 className="w-full bg-charcoal border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-warning mt-1"
               >
                 <option value="Flood">Flood</option>
                 <option value="Landslide">Landslide</option>
                 <option value="Heatwave">Heatwave</option>
                 <option value="Drought">Drought</option>
               </select>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-400 uppercase">Rainfall / Precipitation</label>
                <span className="text-sm font-bold">{inputs.rainfall}</span>
              </div>
              <input 
                type="range" name="rainfall" min="0" max="300" step="5"
                value={inputs.rainfall} onChange={handleInputChange}
                className="w-full accent-warning"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-400 uppercase">River Level</label>
                <span className="text-sm font-bold">{inputs.river_level}</span>
              </div>
              <input 
                type="range" name="river_level" min="0" max="10" step="0.1"
                value={inputs.river_level} onChange={handleInputChange}
                className="w-full accent-warning"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-400 uppercase">Soil Moisture (%)</label>
                <span className="text-sm font-bold">{inputs.soil_moisture}</span>
              </div>
              <input 
                type="range" name="soil_moisture" min="0" max="100" step="1"
                value={inputs.soil_moisture} onChange={handleInputChange}
                className="w-full accent-warning"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-warning text-darkslate font-bold py-3 rounded mt-4 hover:bg-yellow-500 transition-colors uppercase tracking-wider"
            >
              {loading ? 'Simulating via ML Service...' : 'Run Simulation'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center italic">This result represents a model scenario and is not a guaranteed prediction of future disaster conditions.</p>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-warning">Simulation Results</h2>
          
          {error && <div className="bg-danger/20 text-danger border border-danger p-4 rounded mb-4">{error}</div>}

          {result ? (
            <div>
              <div className="mb-4 bg-charcoal p-4 rounded-xl border border-gray-700 flex justify-between items-center shadow-inner">
                <div>
                  <p className="text-sm text-gray-400 uppercase">Baseline Score</p>
                  <p className="text-3xl font-bold text-gray-300">{result.baseline?.risk_score || 0}</p>
                </div>
                <div className="text-center px-4 border-l border-r border-gray-600">
                  <p className="text-sm text-gray-400 uppercase">Model Version</p>
                  <p className="text-sm font-mono text-blue-400">{result.model_version}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 uppercase">Scenario Delta</p>
                  <p className={`text-3xl font-bold ${result.difference > 0 ? 'text-danger' : 'text-success'}`}>
                    {result.difference > 0 ? '+' : ''}{result.difference}
                  </p>
                </div>
              </div>
              
              <RiskCard 
                hazard={result.hazard}
                score={result.scenario.risk_score}
                level={result.scenario.risk_level}
                confidence={null} // Simulations are deterministic mappings, confidence applies to real-world prediction bounds
                factors={[]} // Excluded for simulation simplicity unless passed by ML service
                forecasts={[]}
                available={result.scenario.available !== false}
                message={result.scenario.message}
              />
            </div>
          ) : (
            <div className="bg-darkslate h-64 rounded-xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500">
              <span className="text-4xl mb-2">🔬</span>
              <p>Adjust parameters and run simulation to compare risk delta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
