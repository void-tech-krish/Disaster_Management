import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RiskExplanation from './AI/RiskExplanation';

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
  available?: boolean;
  message?: string;
}

const RiskCard: React.FC<RiskCardProps> = ({ hazard, score, level, confidence, factors = [], forecasts = [], source, available = true, message }) => {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  
  if (available === false) {
    let displayStatus = "Unavailable";
    if (level === "UNKNOWN" || source?.includes("Dataset unavailable")) {
      if (message && (message.includes("trained") || message.includes("DEMO"))) {
         displayStatus = "Model Not Trained";
      } else {
         displayStatus = "Limited Coverage";
      }
    }
    
    return (
      <div className="bg-slate-50 p-6 rounded-[18px] border border-slate-200 shadow-sm flex flex-col h-full opacity-80">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-500 capitalize">{hazard.replace('_', ' ')} Risk</h3>
            {source && (
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                {source}
              </p>
            )}
          </div>
          <span className="font-black text-2xl text-slate-400">-</span>
        </div>
        
        <div className="mb-4 flex justify-between items-end">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border text-slate-500 border-slate-300 bg-slate-100">
            {displayStatus}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 flex-grow flex items-center justify-center text-center">
          <p className="text-sm text-slate-500 font-medium">
            {message || "This assessment is currently unavailable."}
          </p>
        </div>
      </div>
    );
  }

  let levelColor = "text-success";
  let bgGlow = "shadow-success/20";
  let hexColor = "#22c55e"; // green
  
  if (level === "CRITICAL" || level === "UNKNOWN") {
    levelColor = "text-dg-danger";
    bgGlow = "shadow-red-500/10 border-red-200";
    hexColor = "#ef4444"; // red
  } else if (level === "HIGH") {
    levelColor = "text-dg-warning";
    bgGlow = "shadow-orange-500/10 border-orange-200";
    hexColor = "#f97316"; // orange
  } else if (level === "MODERATE") {
    levelColor = "text-yellow-500";
    bgGlow = "shadow-yellow-500/10 border-yellow-200";
    hexColor = "#facc15"; // yellow
  }

  // Prep chart data
  const chartData = [
    { time: 'Now', score: score },
    ...forecasts.map(f => ({ time: f.time, score: f.score }))
  ];

  return (
    <div className={`bg-dg-surface p-6 rounded-[18px] border border-dg-border shadow-sm ${bgGlow} transition-transform hover:-translate-y-1 flex flex-col h-full`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-extrabold text-dg-navy capitalize">{hazard.replace('_', ' ')} Risk</h3>
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
          <div className="text-xs font-bold text-dg-muted">
            Confidence: {(confidence * 100).toFixed(0)}%
          </div>
        )}
      </div>

      <div className="mb-4">
        <button 
          onClick={() => setIsExplanationOpen(true)}
          className="w-full bg-orange-50 hover:bg-orange-100 text-dg-primary border border-orange-200 text-xs font-bold py-2 rounded-lg transition-colors flex justify-center items-center"
        >
          <span className="mr-2">🧠</span> Why this risk?
        </button>
      </div>
      
      {/* Contributing Factors (Explainability) */}
      <div className="bg-dg-bg p-4 rounded-xl border border-dg-border mb-4 flex-grow">
        <h4 className="text-xs font-bold text-dg-muted uppercase tracking-wider mb-3">Contributing Factors</h4>
        <div className="space-y-2">
          {factors.length > 0 ? factors.map((factor, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="capitalize text-dg-navy">{factor.name.replace('_', ' ')}</span>
                <span className="text-dg-muted">{factor.contribution}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-dg-primary h-1.5 rounded-full" style={{ width: `${factor.contribution}%` }}></div>
              </div>
            </div>
          )) : (
            <div className="text-sm text-gray-500 italic">No explainability data available.</div>
          )}
        </div>
        {factors.length > 0 && (
          <p className="text-[10px] text-dg-muted mt-3 font-medium">These factors contributed most to the model's current assessment.</p>
        )}
      </div>

      {/* Forecast Trend Chart */}
      {forecasts.length > 0 && (
        <div className="bg-dg-bg p-4 rounded-xl border border-dg-border h-40 relative">
           <h4 className="text-xs font-bold text-dg-muted uppercase tracking-wider mb-2">Risk Forecast <span className="text-[10px] text-dg-warning bg-dg-warning/10 px-1 rounded ml-1">DEMO</span></h4>
           <div className="absolute top-8 left-2 right-2 bottom-2">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" vertical={false} />
                 <XAxis dataKey="time" stroke="#5F6B7A" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis domain={[0, 100]} hide={true} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1D8', borderRadius: '8px', fontSize: '12px', color: '#182235' }}
                    itemStyle={{ color: hexColor }}
                 />
                 <Line type="monotone" dataKey="score" stroke={hexColor} strokeWidth={2} dot={{ r: 3, fill: hexColor }} activeDot={{ r: 5 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}

      <RiskExplanation 
        isOpen={isExplanationOpen} 
        onClose={() => setIsExplanationOpen(false)} 
        hazardData={{ hazard, level, score, factors }}
      />
    </div>
  );
};

export default RiskCard;
