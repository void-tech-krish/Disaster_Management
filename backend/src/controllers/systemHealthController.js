const healthModel = require('../models/systemHealthModel');
const healthService = require('../services/systemHealthService');

const getSystemSummary = async (req, res, next) => {
  try {
    // Perform live active probing
    const { overallStatus, degradedReasons } = await healthService.runAllChecks();
    
    const services = await healthModel.getHealthChecks();
    const data_sources = await healthModel.getDataSources();
    const events = await healthModel.getEvents(10);
    
    // Check if any critical data source is stale/unavailable
    const staleSources = data_sources.filter(ds => ds.freshness_status === 'STALE' || ds.status === 'UNAVAILABLE');
    if (staleSources.length > 0 && overallStatus !== 'OUTAGE') {
      overallStatus = 'DEGRADED';
      degradedReasons.push(`${staleSources.length} data source(s) are stale or offline.`);
    }

    res.status(200).json({
      status: 'success',
      data: {
        overall_status: overallStatus,
        checked_at: new Date(),
        degraded_reasons: degradedReasons,
        services,
        data_sources,
        events
      }
    });
  } catch (err) {
    next(err);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const events = await healthModel.getEvents(100);
    res.status(200).json({ status: 'success', data: { events } });
  } catch (err) { next(err); }
};

const getDataSources = async (req, res, next) => {
  try {
    const data_sources = await healthModel.getDataSources();
    res.status(200).json({ status: 'success', data: { data_sources } });
  } catch (err) { next(err); }
};

module.exports = {
  getSystemSummary,
  getEvents,
  getDataSources
};
