import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="-m-6 bg-[#F8F9FA] text-slate-900 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span>AI-POWERED MULTI-HAZARD EARLY WARNING</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
              Know the risk.<br/>
              Prepare before it happens.<br/>
              <span className="text-[#EA580C]">Stay safe.</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
              Location-aware AI risk monitoring, early warnings and disaster preparedness guidance for communities across India.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard" className="inline-flex justify-center items-center px-8 py-4 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl">
                Check My Risk &rarr;
              </Link>
              <Link to="/map" className="inline-flex justify-center items-center px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md">
                View Risk Map
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
              <div>
                <div className="text-2xl font-black text-[#0F172A]">24/7</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">Risk Monitoring</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0F172A]">15+</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">Hazard Types</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0F172A]">AI</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">Risk Engine</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative border-8 border-white">
              <img 
                src="/hero-image.jpg" 
                alt="Emergency response team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center space-x-3 border border-slate-100">
              <div className="w-4 h-4 rounded-full bg-[#EA580C] animate-pulse"></div>
              <span className="font-semibold text-slate-800">AI risk monitoring active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Advisory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-red-600 font-bold flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                ⚠ Active Risk Advisory
              </span>
              <span className="bg-white text-xs font-bold px-2 py-0.5 rounded text-slate-500 border border-slate-200">AI RISK ASSESSMENT</span>
            </div>
            <p className="text-red-900 font-medium">Heavy rainfall can increase flood and landslide risk in vulnerable areas. Check your location risk and keep your emergency kit ready.</p>
          </div>
          <Link to="/alerts" className="shrink-0 px-4 py-2 bg-white text-red-600 text-sm font-bold rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
            View Details
          </Link>
        </div>
      </section>

      {/* How it helps */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-4">How DisasterGuard AI helps</h2>
            <p className="text-lg text-slate-600">From early risk assessment to emergency preparedness, DisasterGuard AI helps people understand hazards and respond faster.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Get Prepared</h3>
              <p className="text-slate-600 mb-6 min-h-[80px]">Build your emergency kit, prepare your family and learn what to do before, during and after a disaster.</p>
              <Link to="/preparedness" className="text-blue-600 font-bold group-hover:text-blue-700 flex items-center">
                Prepare Now <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
            
            <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Emergency Response</h3>
              <p className="text-slate-600 mb-6 min-h-[80px]">Find emergency services, shelters and response resources available for your area.</p>
              <Link to="/response" className="text-green-600 font-bold group-hover:text-green-700 flex items-center">
                View Response <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
            
            <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Early Warning & Monitoring</h3>
              <p className="text-slate-600 mb-6 min-h-[80px]">Monitor location-based disaster risks and receive alerts for hazards relevant to your area.</p>
              <Link to="/dashboard" className="text-orange-600 font-bold group-hover:text-orange-700 flex items-center">
                Check Risk <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Hazards Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A]">Monitor the hazards that matter to you</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Flood", status: "Risk Available", color: "blue" },
            { name: "Landslide", status: "Risk Available", color: "amber" },
            { name: "Cyclone", status: "Monitoring", color: "indigo" },
            { name: "Heatwave", status: "Risk Available", color: "red" },
            { name: "Heavy Rainfall", status: "Monitoring", color: "cyan" },
            { name: "Forest Fire", status: "Preparedness", color: "orange" },
            { name: "Drought", status: "Risk Available", color: "yellow" },
            { name: "Earthquake", status: "Preparedness", color: "stone" },
          ].map((hazard, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-full bg-${hazard.color}-100 flex items-center justify-center`}>
                  <div className={`w-3 h-3 rounded-full bg-${hazard.color}-500`}></div>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-500`}>{hazard.status}</span>
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-1">{hazard.name}</h3>
              <p className="text-sm text-slate-500 mb-4">Location-specific risk assessment and alerts.</p>
              <Link to="/dashboard" className="text-sm font-semibold text-[#EA580C] hover:text-orange-700">View Risk &rarr;</Link>
            </div>
          ))}
        </div>
      </section>

      {/* How the AI works */}
      <section className="bg-[#0F172A] text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">From location to early warning</h2>
            <p className="text-lg text-slate-400">DisasterGuard AI combines location information, environmental conditions, historical disaster information and hazard-specific models to assess risk.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start relative">
            <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-slate-800 z-0"></div>
            
            {[
              { num: "01", title: "Your Location" },
              { num: "02", title: "Hazard Detection" },
              { num: "03", title: "Weather Data" },
              { num: "04", title: "AI Risk Assessment" },
              { num: "05", title: "Early Warning" }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center mb-8 md:mb-0 group w-full">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-sm border-4 border-[#0F172A] text-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                  {step.num}
                </div>
                <div className="mt-4 text-center">
                  <h4 className="font-semibold text-sm uppercase tracking-wider">{step.title}</h4>
                </div>
                {idx < 4 && <div className="md:hidden w-0.5 h-8 bg-slate-800 my-2"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Helplines */}
      <section className="bg-slate-900 py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-4">Emergency Helplines</h2>
            <p className="text-slate-400">Keep emergency numbers accessible and contact the appropriate service during a real emergency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="tel:112" className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-[#EA580C] transition-colors flex items-center justify-between group">
              <div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-[#EA580C]">National Emergency</h3>
                <div className="text-3xl font-black text-slate-300">112</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
            </a>
            <a href="tel:108" className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-[#EA580C] transition-colors flex items-center justify-between group">
              <div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-[#EA580C]">Ambulance / Medical</h3>
                <div className="text-3xl font-black text-slate-300">108</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </div>
            </a>
            <a href="tel:1078" className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-[#EA580C] transition-colors flex items-center justify-between group">
              <div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-[#EA580C]">Disaster Management</h3>
                <div className="text-3xl font-black text-slate-300">1078</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-24 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-[#0F172A] mb-6">Be ready before disaster strikes.</h2>
          <p className="text-xl text-slate-600 mb-10">Check your location risk, prepare your family and know what to do when it matters.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/dashboard" className="px-8 py-4 bg-[#EA580C] text-white font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-lg">
              Check My Risk
            </Link>
            <Link to="/preparedness" className="px-8 py-4 bg-[#0F172A] text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
              Get Prepared
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] pt-16 pb-8 border-t-4 border-[#EA580C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-white font-bold text-2xl mb-2">
                <svg className="w-8 h-8 text-[#EA580C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <span>DisasterGuard AI</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm">Location-Based Multi-Hazard Early Warning & Preparedness System</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-300">
              <Link to="/alerts" className="hover:text-white transition-colors">Alerts</Link>
              <Link to="/preparedness" className="hover:text-white transition-colors">Preparedness</Link>
              <Link to="/map" className="hover:text-white transition-colors">Risk Map</Link>
              <Link to="/response" className="hover:text-white transition-colors">Response</Link>
              <a href="tel:112" className="hover:text-white transition-colors">Helplines</a>
              <Link to="/" className="hover:text-white transition-colors">About</Link>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 font-medium">DisasterGuard AI — Stay informed. Stay prepared. Stay safe.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
