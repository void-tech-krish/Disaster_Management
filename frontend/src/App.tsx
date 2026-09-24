import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import RiskMapPage from './pages/RiskMapPage';
import Alerts from './pages/Alerts';
import Preparedness from './pages/Preparedness';
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
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { socket } from './services/socket';
import api from './services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
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
    <nav className="bg-darkslate shadow-md border-b border-gray-800 sticky top-0 z-40">
      <div className="p-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-xl font-bold text-warning tracking-wide flex items-center">
          <Link to="/" onClick={closeMenu}>DisasterGuard AI</Link>
          <div className="hidden md:flex space-x-4 ml-6 pl-6 border-l border-gray-700">
            <Link to="/" className="text-sm font-normal text-gray-300 hover:text-white">{t('navbar.dashboard')}</Link>
            <Link to="/map" className="text-sm font-normal text-gray-300 hover:text-white">{t('navbar.risk_map')}</Link>
            <Link to="/offline" className="text-sm font-normal text-danger hover:text-red-400 font-bold">Emergency</Link>
            <Link to="/preparedness" className="text-sm font-normal text-gray-300 hover:text-white">{t('navbar.preparedness')}</Link>
            {user && (user.role === 'Admin' || user.role === 'Authority') && (
              <Link to="/authority" className="text-sm font-normal text-warning hover:text-yellow-400">{t('navbar.authority')}</Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          {user && (
            <Link to="/notifications" className="relative mr-4 text-gray-300 hover:text-white" onClick={closeMenu}>
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          <button onClick={toggleMenu} className="text-gray-300 focus:outline-none focus:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className="hidden md:flex space-x-4 items-center">
          {user && (
            <Link to="/notifications" className="relative mr-4 text-gray-300 hover:text-white transition-colors" title={t('navbar.notifications')}>
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-charcoal border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none h-8"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
          </select>
          
          {user ? (
            <>
              <span className="text-sm text-gray-300">{t('navbar.welcome')}, {user.name}</span>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition-colors">{t('navbar.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">{t('navbar.login')}</Link>
              <Link to="/register" className="bg-warning text-darkslate px-4 py-1.5 rounded text-sm font-bold hover:bg-yellow-500 transition-colors">{t('navbar.register')}</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-charcoal border-t border-gray-800 p-4 space-y-3">
          <Link to="/" onClick={closeMenu} className="block text-gray-300 py-2 border-b border-gray-800">{t('navbar.dashboard')}</Link>
          <Link to="/map" onClick={closeMenu} className="block text-gray-300 py-2 border-b border-gray-800">{t('navbar.risk_map')}</Link>
          <Link to="/offline" onClick={closeMenu} className="block text-danger font-bold py-2 border-b border-gray-800">Emergency Hub</Link>
          <Link to="/preparedness" onClick={closeMenu} className="block text-gray-300 py-2 border-b border-gray-800">{t('navbar.preparedness')}</Link>
          
          <div className="pt-2">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full bg-darkslate border border-gray-600 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none mb-4"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {user ? (
            <div className="pt-2 flex flex-col gap-3">
              <span className="text-sm text-gray-400">{user.name} ({user.role})</span>
              <button onClick={() => { handleLogout(); closeMenu(); }} className="w-full bg-gray-700 py-2 rounded text-sm">Logout</button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={closeMenu} className="flex-1 text-center bg-gray-700 py-2 rounded text-sm">Login</Link>
              <Link to="/register" onClick={closeMenu} className="flex-1 text-center bg-warning text-darkslate font-bold py-2 rounded text-sm">Register</Link>
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
      <div className="min-h-screen bg-charcoal text-white">
        <ConnectionStatus />
        <Navbar />
        <Toaster position="top-right" />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/map" element={<RiskMapPage />} />
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
