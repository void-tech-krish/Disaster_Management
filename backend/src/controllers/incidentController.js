const incidentModel = require('../models/incidentModel');
const { getSocketIO } = require('../services/notification.service');
const { createAuditLog } = require('../services/audit.service');

const getIncidents = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      severity: req.query.severity
    };
    const incidents = await incidentModel.getAllIncidents(filters);
    res.status(200).json({ status: 'success', data: { incidents } });
  } catch (err) { next(err); }
};

const getIncident = async (req, res, next) => {
  try {
    const incident = await incidentModel.getIncidentById(req.params.id);
    if (!incident) return res.status(404).json({ status: 'fail', message: 'Incident not found' });
    res.status(200).json({ status: 'success', data: { incident } });
  } catch (err) { next(err); }
};

const createIncident = async (req, res, next) => {
  try {
    const incident = await incidentModel.createIncident(req.body, req.user.id);
    
    // Emit socket event
    const io = getSocketIO();
    if (io) io.emit('incident:created', incident);
    
    await createAuditLog({
      actor: { id: req.user.id, role: req.user.role },
      action: 'INCIDENT_CREATED',
      entityType: 'INCIDENT',
      entityId: incident.id.toString(),
      description: `Incident created: ${incident.incident_code}`,
      newValues: incident,
      req
    });

    res.status(201).json({ status: 'success', data: { incident } });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ status: 'fail', message: 'Status required' });
    
    const incident = await incidentModel.updateIncidentStatus(req.params.id, status, req.user.id);
    
    const io = getSocketIO();
    if (io) io.emit('incident:updated', incident);
    
    await createAuditLog({
      actor: { id: req.user.id, role: req.user.role },
      action: 'INCIDENT_STATUS_CHANGED',
      entityType: 'INCIDENT',
      entityId: incident.id.toString(),
      description: `Incident status changed to ${status}`,
      newValues: { status },
      req
    });

    res.status(200).json({ status: 'success', data: { incident } });
  } catch (err) { next(err); }
};

const getTimeline = async (req, res, next) => {
  try {
    const timeline = await incidentModel.getTimeline(req.params.id);
    res.status(200).json({ status: 'success', data: { timeline } });
  } catch (err) { next(err); }
};

const addTimelineEvent = async (req, res, next) => {
  try {
    const event = await incidentModel.addTimelineEvent(req.params.id, req.body, req.user.id);
    const io = getSocketIO();
    if (io) io.emit('incident:timeline_updated', { incident_id: req.params.id });
    res.status(201).json({ status: 'success', data: { event } });
  } catch (err) { next(err); }
};

const updateImpact = async (req, res, next) => {
  try {
    const incident = await incidentModel.updateImpact(req.params.id, req.body);
    const io = getSocketIO();
    if (io) io.emit('incident:updated', incident);

    await createAuditLog({
      actor: { id: req.user.id, role: req.user.role },
      action: 'INCIDENT_UPDATED',
      entityType: 'INCIDENT',
      entityId: incident.id.toString(),
      description: `Incident impact updated`,
      newValues: req.body,
      req
    });

    res.status(200).json({ status: 'success', data: { incident } });
  } catch (err) { next(err); }
};

module.exports = {
  getIncidents,
  getIncident,
  createIncident,
  updateStatus,
  getTimeline,
  addTimelineEvent,
  updateImpact
};
