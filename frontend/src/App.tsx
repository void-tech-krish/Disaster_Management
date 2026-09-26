import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import RiskMapPage from './pages/RiskMapPage';
import Alerts from './pages/Alerts';
import Preparedness from './pages/Preparedness';
import Weather from './pages/Weather';
import AuthorityDashboard from './pages/AuthorityDashboard';
import LocationDetails from './pages/LocationDetails';
import Shelters from './pages/Shelters';
import SafeRoute from './pages/SafeRoute';
import Simulator from './pages/Simulator';
import Notifications from './pages/Notifications';
import Resources from './pages/Resources';
import PostDisaster from './pages/PostDisaster';
import IncidentDetails from './pages/IncidentDetails';
import SystemHealth from './pages/SystemHealth';
import AuditLogs from './pages/AuditLogs';
import EmergencyServices from './pages/EmergencyServices';
import DataSources from './pages/DataSources';
import OfflineEmergency from './pages/OfflineEmergency';
import Communications from './pages/Communications';
import Emergency from './pages/Emergency';
import ResponseDetails from './pages/ResponseDetails';
import RecoveryDashboard from './pages/RecoveryDashboard';
import CitizenReport from './pages/CitizenReport';
import MyReports from './pages/MyReports';
import AuthorityCommunityReports from './pages/AuthorityCommunityReports';
import PublicSituation from './pages/PublicSituation';
import EvacuationDashboard from './pages/Evacuation/EvacuationDashboard';
import EvacuationDetails from './pages/Evacuation/EvacuationDetails';
import EvacuationSimulator from './pages/Evacuation/EvacuationSimulator';
import LogisticsDashboard from './pages/LogisticsDashboard';
import CommandCenter from './pages/CommandCenter';
import Showcase from './pages/Showcase';
import ConnectionStatus from './components/PWA/ConnectionStatus';
import AIAssistant from './components/AI/AIAssistant';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { socket } from './services/socket';
import api from './services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count')
        .then(res => setUnreadCount(res.data.data.unreadCount))
        .catch(console.error);

      const handleNotificationCount = () => {
        setUnreadCount(prev => prev + 1);
      };
      
      socket.on('new_notification', handleNotificationCount);
      return () => {
        socket.off('new_notification', handleNotificationCount);
      };
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" onClick={closeMenu} className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-[#EA580C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span className="font-extrabold text-xl text-[#0F172A] tracking-tight">DisasterGuard AI</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/alerts" className="text-sm font-semibold text-slate-600 hover:text-[#0F172A] transition-colors">Alerts</Link>
            <Link to="/preparedness" className="text-sm font-semibold text-slate-600 hover:text-[#0F172A] transition-colors">Preparedness</Link>
            <Link to="/map" className="text-sm font-semibold text-slate-600 hover:text-[#0F172A] transition-colors">Risk Map</Link>
            <Link to="/weather" className="text-sm font-semibold text-slate-600 hover:text-[#0F172A] transition-colors">Weather</Link>
            <Link to="/response/general" className="text-sm font-semibold text-slate-600 hover:text-[#0F172A] transition-colors">Response</Link>
            <a href="#helplines" className="text-sm font-semibold text-slate-600 hover:text-[#0F172A] transition-colors">Helplines</a>
            
            <Link to="/emergency" className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center">
              🚨 Emergency
            </Link>

            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
                <Link to="/dashboard" className="text-sm font-bold text-[#EA580C]">Dashboard</Link>
                <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-[#0F172A]">Logout</button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-[#0F172A]">Log In</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-slate-600 hover:text-[#0F172A] p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-lg absolute w-full">
          <Link to="/alerts" onClick={closeMenu} className="block text-slate-700 font-semibold py-2">Alerts</Link>
          <Link to="/preparedness" onClick={closeMenu} className="block text-slate-700 font-semibold py-2">Preparedness</Link>
          <Link to="/map" onClick={closeMenu} className="block text-slate-700 font-semibold py-2">Risk Map</Link>
          <Link to="/weather" onClick={closeMenu} className="block text-slate-700 font-semibold py-2">Weather</Link>
          <Link to="/response/general" onClick={closeMenu} className="block text-slate-700 font-semibold py-2">Response</Link>
          <a href="#helplines" onClick={closeMenu} className="block text-slate-700 font-semibold py-2">Helplines</a>
          
          <Link to="/emergency" onClick={closeMenu} className="block text-center w-full bg-red-600 text-white font-bold py-3 rounded-lg shadow-sm">
            🚨 Emergency
          </Link>
          
          {user ? (
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <Link to="/dashboard" onClick={closeMenu} className="font-bold text-[#EA580C]">Dashboard</Link>
              <button onClick={() => { handleLogout(); closeMenu(); }} className="font-semibold text-slate-500">Logout</button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100">
              <Link to="/login" onClick={closeMenu} className="block text-center w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-lg">Log In</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

const MainApp = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('join_room', `user_${user.id}`);

      const handleNotification = (data: any) => {
        const title = `${data.severity} ${data.hazard_type} ALERT`;
        if (data.severity === 'CRITICAL') {
          toast.error(`${title}\n${data.message}`, { duration: 10000 });
        } else if (data.severity === 'HIGH') {
          toast(`${title}\n${data.message}`, { duration: 6000, icon: '⚠️', style: { background: '#f59e0b', color: '#fff' } });
        } else {
          toast.success(`${title}\n${data.message}`, { duration: 5000 });
        }
      };

      socket.on('new_notification', handleNotification);

      return () => {
        socket.off('new_notification', handleNotification);
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-dg-bg text-dg-text">
        <ConnectionStatus />
        <Navbar />
        <Toaster position="top-right" />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/map" element={<RiskMapPage />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/preparedness" element={<Preparedness />} />
            <Route path="/authority" element={<AuthorityDashboard />} />
            <Route path="/location/:id" element={<LocationDetails />} />
            <Route path="/shelters" element={<Shelters />} />
            <Route path="/safe-route" element={<SafeRoute />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/emergency-services" element={<EmergencyServices />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/post-disaster" element={<PostDisaster />} />
            <Route path="/incidents/:id" element={<IncidentDetails />} />
            <Route path="/system-health" element={<SystemHealth />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/offline" element={<OfflineEmergency />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/response/:id" element={<ResponseDetails />} />
            <Route path="/recovery" element={<RecoveryDashboard />} />
            <Route path="/report" element={<CitizenReport />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/authority/community-reports" element={<AuthorityCommunityReports />} />
            <Route path="/public-situation" element={<PublicSituation />} />
            <Route path="/authority/evacuation" element={<EvacuationDashboard />} />
            <Route path="/authority/evacuation/:id" element={<EvacuationDetails />} />
            <Route path="/evacuation-simulator" element={<EvacuationSimulator />} />
            <Route path="/authority/logistics" element={<LogisticsDashboard />} />
            <Route path="/authority/command-center" element={<CommandCenter />} />
          </Routes>
        </main>
        <AIAssistant />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <MainApp />
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
