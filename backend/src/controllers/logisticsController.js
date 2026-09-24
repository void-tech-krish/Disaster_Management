const db = require('../config/database');

exports.getRequests = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM resource_requests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logistics requests' });
    }
};

exports.createRequest = async (req, res) => {
    const { resource_type, requested_quantity, location_id, priority, justification } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO resource_requests 
            (resource_type, requested_quantity, location_id, priority, justification, status) 
            VALUES ($1, $2, $3, $4, $5, 'SUBMITTED') RETURNING *`,
            [resource_type, requested_quantity, location_id, priority, justification]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create request' });
    }
};

exports.approveRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            `UPDATE resource_requests SET status = 'APPROVED', approved_at = NOW() WHERE id = $1 RETURNING *`,
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve request' });
    }
};

exports.assignResource = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            `UPDATE resource_requests SET status = 'ASSIGNED' WHERE id = $1 RETURNING *`,
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to assign resource' });
    }
};
