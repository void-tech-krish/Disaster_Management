
import { Link } from 'react-router-dom';
import { Brain, Activity, Map } from 'lucide-react';

export default function Showcase() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white">DisasterGuard AI</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          An AI-assisted, location-aware multi-hazard disaster management platform that connects risk assessment, early warning, preparedness, emergency response, logistics, and recovery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <Brain className="h-10 w-10 text-indigo-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Responsible AI</h2>
          <p className="text-gray-400">Flood and landslide risk models provide decision support. Human-in-the-loop enforces all authoritative actions.</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <Map className="h-10 w-10 text-green-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">PostGIS Intelligence</h2>
          <p className="text-gray-400">Spatial relationships between shelters, evacuation zones, and incidents plotted via Leaflet.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <Activity className="h-10 w-10 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Full Lifecycle</h2>
          <p className="text-gray-400">Covers detection, warning, preparedness, response, logistics, and recovery workflows.</p>
        </div>
      </div>

      <div className="bg-blue-900 bg-opacity-20 p-8 rounded-2xl border border-blue-700 text-center space-y-6">
        <h2 className="text-2xl font-bold text-white">Judge & Evaluator Access</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Experience the end-to-end unified disaster operations flow.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium">Dashboard</Link>
          <Link to="/map" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium">GIS Map</Link>
          <Link to="/authority/command-center" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold">Command Center</Link>
          <Link to="/authority/logistics" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium">Logistics</Link>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>SIH 2026 Presentation Showcase. System operates in DEMO mode unless bound to live data streams.</p>
      </div>
    </div>
  );
}
