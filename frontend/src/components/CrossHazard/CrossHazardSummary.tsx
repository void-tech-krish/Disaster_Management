import React from 'react';

interface Interaction {
  type: string;
  description: string;
  severity: string;
}

interface Gap {
  description: string;
  severity: string;
}

interface CrossHazardData {
  activeHazards: string[];
  crossHazardScore: string;
  interactions: Interaction[];
  cascadeGraph: string[];
  dataConfidence: string;
  assessmentSource: string;
  informationGaps: Gap[];
}

interface Props {
  data: CrossHazardData | null;
}

const CrossHazardSummary: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const hasInteractions = data.interactions.length > 0;

  return (
    <div className="bg-darkslate border border-gray-700 rounded-xl p-6 shadow-xl space-y-6">
      <header className="flex justify-between items-start border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-2">🌐</span> Cross-Hazard Intelligence
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Analyzing potential multi-hazard interactions and cascading impacts.
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${hasInteractions ? 'bg-danger text-white' : 'bg-success text-darkslate'}`}>
            {data.crossHazardScore}
          </span>
          <div className="text-[10px] text-gray-500 uppercase mt-2 tracking-widest">
            Source: {data.assessmentSource}
          </div>
        </div>
      </header>

      {/* Active Hazards Tag Cloud */}
      <div>
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Active Hazards Evaluated</h3>
        {data.activeHazards.length === 0 ? (
          <span className="text-gray-500 italic text-sm">No active hazards detected.</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.activeHazards.map((h, i) => (
              <span key={i} className="bg-gray-800 border border-gray-600 text-gray-200 px-3 py-1 rounded-full text-sm shadow">
                {h}
              </span>
            ))}
          </div>
        )}
      </div>

      {hasInteractions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
          
          {/* Potential Interactions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-warning flex items-center">
              <span className="mr-2">⚡</span> Potential Interactions
            </h3>
            {data.interactions.map((interaction, idx) => (
              <div key={idx} className="bg-charcoal p-4 rounded border border-gray-600">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold mb-2 inline-block ${interaction.severity === 'CRITICAL' || interaction.severity === 'HIGH' ? 'bg-danger text-white' : 'bg-warning text-darkslate'}`}>
                  {interaction.type}
                </span>
                <p className="text-sm text-gray-300">
                  {interaction.description}
                </p>
                <div className="mt-3 text-[10px] text-gray-500 italic">
                  * This represents a potential scenario, not a confirmed event.
                </div>
              </div>
            ))}
          </div>

          {/* Cascading Impact Graph */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-info flex items-center">
              <span className="mr-2">📉</span> Potential Cascading Impact
            </h3>
            <div className="bg-charcoal p-4 rounded border border-gray-600">
              <div className="flex flex-col space-y-2">
                {data.cascadeGraph.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <div className="bg-gray-800 border border-gray-600 p-2 rounded text-center text-sm font-bold shadow">
                      {node}
                    </div>
                    {idx < data.cascadeGraph.length - 1 && (
                      <div className="text-center text-gray-500">
                        ↓
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-4 text-[10px] text-gray-500 uppercase tracking-wide text-center">
                Data Freshness: {data.dataConfidence}
              </div>
            </div>
          </div>
          
        </div>
      )}

      {/* Information Gaps & Uncertainty */}
      {data.informationGaps && data.informationGaps.length > 0 && (
        <div className="bg-gray-900/50 p-4 rounded border border-gray-700 mt-4">
          <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Uncertainty / Limitations</h3>
          <ul className="list-disc list-inside space-y-1">
            {data.informationGaps.map((gap, i) => (
              <li key={i} className="text-xs text-gray-400">{gap.description}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

export default CrossHazardSummary;
