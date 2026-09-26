const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());

// Production CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' && process.env.CLIENT_URL 
    ? process.env.CLIENT_URL 
    : '*', // Allow all in dev if no URL set
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const requestIdMiddleware = require('./middleware/requestId');
app.use(requestIdMiddleware);

// General Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 reqs per window for general API
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } }
});
app.use(limiter);

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, // max 20 login/register attempts per IP
  message: { success: false, error: { code: 'AUTH_RATE_LIMIT', message: 'Too many authentication attempts' } }
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authLimiter, authRoutes);
const riskRoutes = require('./routes/riskRoutes');
const locationRoutes = require('./routes/locationRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'DisasterGuard AI API is running' });
});
app.use('/api/risk', riskRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/states', require('./routes/stateRoutes'));
app.use('/api/cities', require('./routes/cityRoutes'));
app.use('/api/relief-camps', require('./routes/reliefCampRoutes'));
app.use('/api/alerts', alertRoutes);
app.use('/api/simulate', require('./routes/simulationRoutes'));
app.use('/api/authority', require('./routes/authorityRoutes'));
app.use('/api/shelters', require('./routes/shelterRoutes'));
app.use('/api/safe-route', require('./routes/routeRoutes'));
app.use('/api/timeline', require('./routes/timelineRoutes'));
app.use('/api/data-sources', require('./routes/dataSourceRoutes'));
app.use('/api/emergency-services', require('./routes/emergencyServiceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/audit', require('./routes/auditRoutes').router);
app.use('/api/system-health', require('./routes/systemHealthRoutes'));
app.use('/api/map', require('./routes/mapRoutes'));
app.use('/api/responses', require('./routes/responseRoutes'));
app.use('/api/response-intelligence', require('./routes/responseIntelligenceRoutes'));
app.use('/api/communications', require('./routes/communicationRoutes'));
app.use('/api/communications', require('./routes/communicationRoutes'));
app.use('/api/cross-hazard', require('./routes/crossHazardRoutes'));
app.use('/api/recovery', require('./routes/recoveryRoutes'));
app.use('/api/community-reports', require('./routes/communityReportRoutes'));
app.use('/api/evacuation', require('./routes/evacuationRoutes'));
app.use('/api/logistics', require('./routes/logisticsRoutes'));
app.use('/api/command-center', require('./routes/commandCenterRoutes'));
app.use('/api/weather', require('./routes/weather.routes'));

app.use('/api/ai', require('./routes/ai.routes'));
// TODO: Import and use actual routes (locations, hazards, etc.)

// Error handling middleware
app.use(errorHandler);

module.exports = app;
