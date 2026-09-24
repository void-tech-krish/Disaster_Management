// @ts-nocheck
import { useState, useEffect } from 'react';
import axios from 'axios';
import RiskCard from '../components/RiskCard';
import { socket } from '../services/socket';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const Dashboard = () => {
  const { t } = useLanguage();
  const status = useNetworkStatus();
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scenario, setScenario] = useState('Normal');
  const [lastUpdated, setLastUpdated] = useState('');

  const [dataStatus, setDataStatus] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/data-sources/status');
        setDataStatus(res.data.data.sources);
      } catch (err) {
        console.error("Failed to fetch data sources", err);
      }
    };
    fetchData();

    // Mock initial fetch of risks since simulation broadcast is private now
    // Or we just show demo button and trigger assess
    api.post('/risk/assess', { lat: 16.5, lon: 80.64 })
      .then(res => {
         setRisks(res.data.data.risks);
         setLastUpdated(res.data.data.timestamp);
      })
      .catch(console.error);
  }, []);

  const simulateScenario = async (newScenario: string) => {
    // In step 19 we moved to dynamic what-if in /simulator.
    // For Dashboard, we just update the text or navigate to simulator
    setScenario(newScenario);
  };

  const getSourceFreshness = (name: string) => {
    if (status === 'OFFLINE') return 'UNAVAILABLE';
    const s = dataStatus.find(d => d.name === name);
    if (!s) return 'UNAVAILABLE';
    return s.freshness;
  };

  const getSourceStatusLabel = (freshness: string, isRisk: boolean = false) => {
    if (status === 'OFFLINE') {
       if (isRisk) return <span className="text-warning font-bold text-xs uppercase">CACHED AI RISK ASSESSMENT</span>;
       return <span className="text-warning font-bold text-xs uppercase">CACHED DATA</span>;
    }
    if (freshness === 'FRESH' || freshness === 'AGING') return <span className="text-success font-bold text-xs uppercase">LIVE</span>;
    if (freshness === 'STALE' || freshness === 'EXPIRED') return <span className="text-warning font-bold text-xs uppercase">STALE</span>;
    return <span className="text-danger font-bold text-xs uppercase">UNAVAILABLE</span>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('common.dashboard')}</h1>
          <p className="text-gray-400">{t('common.location')}: <span className="text-white">Vijayawada</span></p>
        </div>
        <div className="bg-charcoal p-4 rounded-xl border border-gray-700 flex flex-col justify-center">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-bold">Data & Warning Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Source:</span>
              {getSourceStatusLabel('Risk', true)}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Official Warning:</span>
              <span className="text-xs">{getSourceStatusLabel(getSourceFreshness('Gov Official Alerts'))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Weather:</span>
              <span className="text-xs">{getSourceStatusLabel(getSourceFreshness('OpenMeteo Weather API'))}</span>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {lastUpdated && (
        <p className="text-sm text-gray-400 mb-4 animate-pulse">{t('common.lastUpdated')}</p>
      )}

      {risks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {risks.map((risk, idx) => (
            <RiskCard 
              key={idx}
              hazard={risk.hazard}
              score={risk.risk_score}
              level={risk.risk_level}
              confidence={risk.confidence}
              factors={risk.factors}
              forecasts={risk.forecasts}
              source={risk.source}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-20 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            {t('common.loading')}...
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
