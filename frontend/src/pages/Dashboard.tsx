// @ts-nocheck
import { useState, useEffect } from 'react';
import axios from 'axios';
import RiskCard from '../components/RiskCard';
import { socket } from '../services/socket';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useAuth } from '../context/AuthContext';
import WeatherCard from '../components/Weather/WeatherCard';

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
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

    const fetchRisk = (lat: number, lon: number) => {
      api.post('/risk/assess', { lat, lon })
        .then(res => {
           setRisks(res.data.data.risks);
           setLastUpdated(res.data.data.timestamp);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to fetch risk data. Please check your backend connection.');
          setLoading(false);
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchRisk(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Geolocation failed or denied, using default Vijayawada coordinates');
          fetchRisk(16.5, 80.64);
        }
      );
    } else {
      fetchRisk(16.5, 80.64);
    }
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
    if (freshness === 'FRESH' || freshness === 'AGING') return <span className="text-dg-success font-bold text-xs uppercase">LIVE</span>;
    if (freshness === 'STALE' || freshness === 'EXPIRED') return <span className="text-dg-warning font-bold text-xs uppercase">STALE</span>;
    return <span className="text-dg-danger font-bold text-xs uppercase">UNAVAILABLE</span>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-dg-navy mb-2">{t('common.dashboard')}</h1>
          <p className="text-dg-muted font-medium">{t('common.location')}: <span className="text-dg-navy font-bold">{user?.location_city || 'Vijayawada'}</span></p>
        </div>
        <div className="bg-dg-surface p-4 rounded-[18px] border border-dg-border flex flex-col justify-center shadow-sm">
          <h3 className="text-xs text-dg-muted uppercase tracking-wider mb-2 font-bold">Data & Warning Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dg-muted font-medium">Risk Source:</span>
              {getSourceStatusLabel('Risk', true)}
            </div>
            <div className="flex justify-between">
              <span className="text-dg-muted font-medium">Official Warning:</span>
              <span className="text-xs">{getSourceStatusLabel(getSourceFreshness('Gov Official Alerts'))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dg-muted font-medium">Weather:</span>
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
        <p className="text-sm text-dg-muted font-medium mb-4 animate-pulse">{t('common.lastUpdated')}</p>
      )}

      <div className="mb-8">
        <WeatherCard userLocation={user?.latitude ? user : { location_city: 'Vijayawada' }} />
      </div>

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
              available={risk.available}
              message={risk.message}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-20 text-dg-muted border border-dashed border-dg-border rounded-[18px]">
            {t('common.loading')}...
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
