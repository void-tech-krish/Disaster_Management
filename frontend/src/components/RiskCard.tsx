import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Factor {
  name: string;
  contribution: number;
}

interface Forecast {
  time: string;
  score: number;
  level: string;
}

interface RiskCardProps {
  hazard: string;
  score: number;
  level: string;
  confidence: number;
  factors?: Factor[];
  forecasts?: Forecast[];
  source?: string;
}

const RiskCard: React.FC<RiskCardProps> = ({ hazard, score, level, confidence, factors = [], forecasts = [], source }) => {
  let levelColor = "text-success";
  let bgGlow = "shadow-success/20";
  let hexColor = "#22c55e"; // green
  
  if (level === "CRITICAL" || level === "UNKNOWN") {
    levelColor = "text-danger";
    bgGlow = "shadow-danger/50";
    hexColor = "#ef4444"; // red
  } else if (level === "HIGH") {
    levelColor = "text-warning";
    bgGlow = "shadow-warning/40";
    hexColor = "#f97316"; // orange
  } else if (level === "MODERATE") {
    levelColor = "text-yellow-400";
    bgGlow = "shadow-yellow-400/30";
    hexColor = "#facc15"; // yellow
  }

  // Prep chart data
  const chartData = [
    { time: 'Now', score: score },
    ...forecasts.map(f => ({ time: f.time, score: f.score }))
  ];

  return (
    <div className={`bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg ${bgGlow} transition-transform hover:-translate-y-1 flex flex-col h-full`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold capitalize">{hazard.replace('_', ' ')} Risk</h3>
          {source && (
            <p className="text-[10px] uppercase font-bold tracking-wider text-blue-400 mt-1">
              {source}
            </p>
          )}
        </div>
        <span className={`font-black text-2xl ${levelColor}`}>{score > 0 ? score : '-'}</span>
      </div>
      
      <div className="mb-4 flex justify-between items-end">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${levelColor} border-current`}>
          {level}
        </div>
        {confidence > 0 && (
          <div className="text-xs text-gray-400">
            Confidence: {(confidence * 100).toFixed(0)}%
          </div>
        )}
      </div>
      
      {/* Contributing Factors (Explainability) */}
      <div className="bg-charcoal p-3 rounded-lg mb-4 flex-grow">
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Contributing Factors</h4>
        <div className="space-y-2">
          {factors.length > 0 ? factors.map((factor, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-xs mb-1">
                <span className="capitalize text-gray-300">{factor.name.replace('_', ' ')}</span>
                <span className="text-gray-400">{factor.contribution}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-warning h-1.5 rounded-full" style={{ width: `${factor.contribution}%` }}></div>
              </div>
            </div>
          )) : (
            <div className="text-sm text-gray-500 italic">No explainability data available.</div>
          )}
        </div>
        {factors.length > 0 && (
          <p className="text-[10px] text-gray-500 mt-2 italic">These factors contributed most to the model's current assessment.</p>
        )}
      </div>

      {/* Forecast Trend Chart */}
      {forecasts.length > 0 && (
        <div className="bg-charcoal p-3 rounded-lg h-40 relative">
           <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Risk Forecast <span className="text-[10px] text-warning bg-warning/20 px-1 rounded ml-1">DEMO</span></h4>
           <div className="absolute top-8 left-2 right-2 bottom-2">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                 <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis domain={[0, 100]} hide={true} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px' }}
                    itemStyle={{ color: hexColor }}
                 />
                 <Line type="monotone" dataKey="score" stroke={hexColor} strokeWidth={2} dot={{ r: 3, fill: hexColor }} activeDot={{ r: 5 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}
    </div>
  );
};

export default RiskCard;
