import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface RiskExplanationProps {
  isOpen: boolean;
  onClose: () => void;
  hazardData: {
    hazard: string;
    level: string;
    score: number;
    factors: any[];
  };
}

const RiskExplanation: React.FC<RiskExplanationProps> = ({ isOpen, onClose, hazardData }) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError('');
      api.post('/ai/explain-risk', {
        hazard: hazardData.hazard,
        location: { city: 'Vijayawada' }, // Mock location for now
        risk: { level: hazardData.level, score: hazardData.score },
        factors: hazardData.factors,
        weather: {}
      })
      .then(res => setExplanation(res.data.explanation))
      .catch(err => setError('AI assistant is temporarily unavailable. Your risk and weather information are still available.'))
      .finally(() => setLoading(false));
    }
  }, [isOpen, hazardData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dg-navy/40 flex items-center justify-center z-[9999] p-4">
      <div className="bg-dg-surface w-full max-w-lg rounded-[18px] shadow-2xl border border-dg-border flex flex-col max-h-[90vh]">
        
        <div className="bg-dg-bg p-4 border-b border-dg-border flex justify-between items-center rounded-t-[18px]">
          <div>
            <h3 className="font-extrabold text-dg-navy text-xl flex items-center">
              <span className="mr-2">🧠</span> Why this risk?
            </h3>
            <p className="text-xs font-bold text-dg-primary uppercase tracking-wider">{hazardData.hazard} Risk: {hazardData.level}</p>
          </div>
          <button onClick={onClose} className="text-dg-muted hover:text-dg-danger font-bold text-2xl">
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto font-medium text-dg-navy text-sm space-y-4 bg-white">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-dg-muted font-bold animate-pulse">Generating explanation...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-dg-danger p-4 rounded-xl border border-dg-danger font-bold">
              {error}
            </div>
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed">
              {explanation}
            </div>
          )}
        </div>

        <div className="bg-orange-50 p-4 border-t border-orange-200 rounded-b-[18px]">
          <p className="text-[10px] font-bold text-dg-primary">
            IMPORTANT: This AI explanation is based on the available model and weather data and does not replace official emergency instructions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskExplanation;
