// @ts-nocheck
import React from 'react';

const ForecastDisclaimer = ({ isForecast }: { isForecast: boolean }) => {
  if (!isForecast) return null;
  return (
    <div className="bg-charcoal p-3 rounded border border-gray-700 mt-2 text-xs text-gray-400">
      <p className="font-bold text-blue-400 mb-1">AI RISK FORECAST</p>
      <p>This is an AI-generated risk assessment and does not replace official warnings.</p>
    </div>
  );
};

export default ForecastDisclaimer;
