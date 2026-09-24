const { pool } = require('../config/database');
const axios = require('axios');
const healthModel = require('../models/systemHealthModel');
const { getSocketIO } = require('./notification.service');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const checkDatabase = async () => {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    await healthModel.updateHealthCheck('Database (PostgreSQL)', 'HEALTHY', latency, null);
    await healthModel.logEvent('SERVICE_RECOVERED', 'Database (PostgreSQL)', 'INFO', 'Database connection successful');
    return { status: 'HEALTHY' };
  } catch (err) {
    await healthModel.updateHealthCheck('Database (PostgreSQL)', 'UNAVAILABLE', Date.now() - start, err.message);
    await healthModel.logEvent('SERVICE_DOWN', 'Database (PostgreSQL)', 'CRITICAL', 'Database connection failed');
    return { status: 'UNAVAILABLE' };
  }
};

const checkMLService = async () => {
  const start = Date.now();
  try {
    const res = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3000 });
    const latency = Date.now() - start;
    await healthModel.updateHealthCheck('ML Service (FastAPI)', 'HEALTHY', latency, null, res.data.version || '1.0.0');
    await healthModel.logEvent('SERVICE_RECOVERED', 'ML Service (FastAPI)', 'INFO', 'ML Service is online');
    return { status: 'HEALTHY', data: res.data };
  } catch (err) {
    await healthModel.updateHealthCheck('ML Service (FastAPI)', 'UNAVAILABLE', Date.now() - start, err.message);
    await healthModel.logEvent('SERVICE_DOWN', 'ML Service (FastAPI)', 'CRITICAL', 'ML Service is unreachable');
    return { status: 'UNAVAILABLE' };
  }
};

const checkSocketIO = async () => {
  const io = getSocketIO();
  if (io) {
    await healthModel.updateHealthCheck('Socket.IO', 'HEALTHY', 0, null);
    await healthModel.logEvent('SERVICE_RECOVERED', 'Socket.IO', 'INFO', 'WebSocket server is running');
    return { status: 'HEALTHY' };
  } else {
    await healthModel.updateHealthCheck('Socket.IO', 'DEGRADED', 0, 'Socket.IO instance not found');
    await healthModel.logEvent('SERVICE_DOWN', 'Socket.IO', 'WARNING', 'WebSocket server is offline');
    return { status: 'DEGRADED' };
  }
};

const checkDataSources = async () => {
  // Mock check for weather data feed
  const weatherStale = Math.random() > 0.8; // 20% chance of being stale for simulation
  if (weatherStale) {
    await healthModel.updateDataSource('Global Weather API', 'Multi', 'LIVE DATA', 'HEALTHY', 'STALE', null, 'Last update > 6 hours');
    await healthModel.logEvent('DATA_STALE', 'Global Weather API', 'WARNING', 'Weather data feed is stale');
  } else {
    await healthModel.updateDataSource('Global Weather API', 'Multi', 'LIVE DATA', 'HEALTHY', 'FRESH', null, null);
    await healthModel.logEvent('DATA_RECOVERED', 'Global Weather API', 'INFO', 'Weather data feed is fresh');
  }

  // Official warning feed
  await healthModel.updateDataSource('NDMA Alert Feed', 'Multi', 'OFFICIAL DATA', 'HEALTHY', 'FRESH', null, null);
};

const runAllChecks = async () => {
  const [db, ml, sock] = await Promise.all([
    checkDatabase(),
    checkMLService(),
    checkSocketIO(),
    checkDataSources()
  ]);

  let overallStatus = 'OPERATIONAL';
  let degradedReasons = [];

  if (db.status === 'UNAVAILABLE') {
    overallStatus = 'OUTAGE';
    degradedReasons.push('Database is unavailable');
  } else if (ml.status === 'UNAVAILABLE' || sock.status !== 'HEALTHY') {
    overallStatus = 'DEGRADED';
    if (ml.status === 'UNAVAILABLE') degradedReasons.push('ML Service is unavailable');
    if (sock.status !== 'HEALTHY') degradedReasons.push('Socket.IO is degraded');
  }

  return { overallStatus, degradedReasons };
};

module.exports = {
  runAllChecks
};
