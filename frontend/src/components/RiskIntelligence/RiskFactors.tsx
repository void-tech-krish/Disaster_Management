// @ts-nocheck
import React from 'react';

interface Factor {
  name: string;
  contribution: number;
}

const RiskFactors = ({ factors, explanationStatus }: { factors: Factor[], explanationStatus?: string }) => {
  if (explanationStatus === 'EXPLANATION_NOT_AVAILABLE' || !factors || factors.length === 0) {
    return (
      <div className="bg-darkslate p-4 rounded-xl border border-dashed border-gray-700 text-center text-gray-500 text-sm">
        EXPLANATION NOT AVAILABLE
      </div>
    );
  }

  return (
    <div className="bg-darkslate p-4 rounded-xl border border-gray-700 space-y-3">
      <h3 className="font-bold text-gray-300 text-sm mb-3 uppercase tracking-wider">Factors contributing to this model assessment</h3>
      {factors.map((f, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{f.name}</span>
            <span className="font-bold text-gray-200">{f.contribution}%</span>
          </div>
          <div className="w-full bg-charcoal rounded-full h-1.5">
            <div 
              className="bg-warning h-1.5 rounded-full" 
              style={{ width: `${f.contribution}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RiskFactors;
