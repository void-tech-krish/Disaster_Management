// @ts-nocheck
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RiskTrend = ({ historicalData, forecastStatus }: { historicalData: any[], forecastStatus?: string }) => {
  
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-darkslate h-48 rounded-xl border border-dashed border-gray-700 flex items-center justify-center text-gray-500 text-sm">
        INSUFFICIENT HISTORICAL DATA
      </div>
    );
  }

  // Format data for Recharts
  const data = historicalData.map(d => ({
    time: new Date(d.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    score: d.risk_score
  })).reverse();

  return (
    <div className="bg-darkslate p-4 rounded-xl border border-gray-700 h-64 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">Risk Trend</h3>
        {forecastStatus === 'FORECAST_NOT_AVAILABLE' && (
          <span className="text-[10px] bg-charcoal px-2 py-0.5 rounded text-gray-400 font-bold border border-gray-600">FORECAST NOT AVAILABLE</span>
        )}
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} />
            <YAxis stroke="#4b5563" fontSize={10} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', fontSize: '12px' }} />
            <Area type="monotone" dataKey="score" stroke="#f59e0b" fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskTrend;
