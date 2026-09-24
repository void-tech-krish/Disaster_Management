const { pool } = require('../config/database');

const getLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const filters = [];
    const values = [];
    let queryIdx = 1;

    // Build parameterized filters safely
    if (req.query.action) {
      filters.push(`action = $${queryIdx++}`);
      values.push(req.query.action);
    }
    if (req.query.entity_type) {
      filters.push(`entity_type = $${queryIdx++}`);
      values.push(req.query.entity_type);
    }
    if (req.query.status) {
      filters.push(`status = $${queryIdx++}`);
      values.push(req.query.status);
    }
    if (req.query.actor_type) {
      filters.push(`actor_type = $${queryIdx++}`);
      values.push(req.query.actor_type);
    }

    let whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*) FROM audit_logs ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count);

    values.push(limit);
    const limitIdx = queryIdx++;
    values.push(offset);
    const offsetIdx = queryIdx++;

    const logRes = await pool.query(`
      SELECT 
        al.id, al.action, al.entity_type, al.entity_id, al.description,
        al.status, al.created_at, al.actor_type, al.user_id,
        u.name as actor_name, u.email as actor_email, al.request_id
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `, values);

    res.status(200).json({
      status: 'success',
      data: {
        logs: logRes.rows,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) }
      }
    });
  } catch (err) { next(err); }
};

const getLogDetails = async (req, res, next) => {
  try {
    const logId = req.params.id;
    const resLog = await pool.query(`
      SELECT al.*, u.name as actor_name, u.email as actor_email 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.id = $1
    `, [logId]);

    if (resLog.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Audit log not found' });
    }

    res.status(200).json({ status: 'success', data: { log: resLog.rows[0] } });
  } catch (err) { next(err); }
};

const getSummary = async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_events,
        SUM(CASE WHEN action LIKE 'AUTH_%' THEN 1 ELSE 0 END) as security_events,
        SUM(CASE WHEN action LIKE 'USER_%' THEN 1 ELSE 0 END) as admin_events,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_events,
        SUM(CASE WHEN status = 'DENIED' THEN 1 ELSE 0 END) as denied_events
      FROM audit_logs
    `);
    res.status(200).json({ status: 'success', data: { summary: stats.rows[0] } });
  } catch (err) { next(err); }
};

module.exports = {
  getLogs,
  getLogDetails,
  getSummary
};
