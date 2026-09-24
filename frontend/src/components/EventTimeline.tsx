// @ts-nocheck
import React from 'react';

interface TimelineEvent {
  id: number;
  event_type: string;
  hazard_type: string;
  message: string;
  risk_score: number;
  severity: string;
  source: string;
  timestamp: string;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  const getDotColor = (severity: string) => {
    if (severity === 'CRITICAL') return 'bg-danger';
    if (severity === 'HIGH') return 'bg-warning';
    if (severity === 'MODERATE') return 'bg-yellow-400';
    return 'bg-info';
  };

  return (
    <div className="relative border-l border-gray-700 ml-3">
      {events.map((event, index) => (
        <div key={event.id} className="mb-8 ml-6 relative">
          <span className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-darkslate ${getDotColor(event.severity)}`}></span>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
            <h3 className="font-bold text-gray-200">{event.event_type.replace('_', ' ')} <span className="text-xs font-normal text-gray-500 ml-2">({event.source})</span></h3>
            <time className="text-xs text-gray-400 font-mono">
              {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </time>
          </div>
          
          <p className="text-sm text-gray-400">{event.message}</p>
          
          {event.risk_score && (
            <div className="mt-2 inline-block px-2 py-1 rounded bg-charcoal text-xs border border-gray-700 text-gray-300">
              Risk: <span className={`font-bold ${getDotColor(event.severity).replace('bg-', 'text-')}`}>{event.risk_score}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventTimeline;
