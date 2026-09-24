const { pool } = require('../config/database');
const { redactSensitiveData } = require('../utils/redaction.util');

/**
 * createAuditLog
 * @param {Object} actor - The user acting (id, role). If SYSTEM, pass { id: null, role: 'SYSTEM' }
 * @param {String} action - Action identifier (e.g. USER_ROLE_CHANGED, INCIDENT_CREATED)
 * @param {String} entityType - E.g. USER, INCIDENT, RESOURCE, SYSTEM
 * @param {String} entityId - The unique ID of the entity affected
 * @param {String} description - Human readable description
 * @param {Object} oldValues - Previous state payload (automatically redacted)
 * @param {Object} newValues - New state payload (automatically redacted)
 * @param {Object} req - The Express request object to extract IP, User-Agent, and Request ID
 * @param {String} status - SUCCESS, FAILED, DENIED
 * @param {String} failureReason - Reason if failed
 * @param {String} source - Source of the action (API, SOCKET, SYSTEM, etc.)
 */
const createAuditLog = async ({
  actor = { id: null, role: 'SYSTEM' },
  action,
  entityType = null,
  entityId = null,
  description = null,
  oldValues = null,
  newValues = null,
  req = null,
  status = 'SUCCESS',
  failureReason = null,
  source = 'API'
}) => {
  try {
    const redactedOld = redactSensitiveData(oldValues);
    const redactedNew = redactSensitiveData(newValues);
    
    // Privacy constraint: only log IP/User-Agent on auth events or denials, not on every operational read/write
    const isSecurityEvent = action.startsWith('AUTH_') || status === 'DENIED';
    const ipAddress = isSecurityEvent && req ? req.ip || req.connection.remoteAddress : null;
    const userAgent = isSecurityEvent && req ? req.get('User-Agent') : null;
    const requestId = req ? req.id : null;

    await pool.query(`
      INSERT INTO audit_logs (
        user_id, actor_type, action, entity_type, entity_id, description,
        old_values, new_values, ip_address, user_agent, request_id, source, status, failure_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      actor.id, actor.role, action, entityType, entityId, description,
      redactedOld, redactedNew, ipAddress, userAgent, requestId, source, status, failureReason
    ]);
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

module.exports = {
  createAuditLog
};
