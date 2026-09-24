const Resource = require('../models/resourceModel');
const notificationService = require('../services/notification.service');

const getAllResources = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      resource_type: req.query.resource_type
    };
    const resources = await Resource.getResources(filters);
    res.json({ success: true, data: { resources } });
  } catch (err) {
    next(err);
  }
};

const getResource = async (req, res, next) => {
  try {
    const resource = await Resource.getResourceById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: { resource } });
  } catch (err) {
    next(err);
  }
};

const createResource = async (req, res, next) => {
  try {
    const resource = await Resource.createResource(req.body);
    res.status(201).json({ success: true, data: { resource } });
  } catch (err) {
    next(err);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resource = await Resource.updateResource(req.params.id, req.body, userId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: { resource } });
  } catch (err) {
    next(err);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resource = await Resource.deleteResource(req.params.id, userId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: { resource } });
  } catch (err) {
    next(err);
  }
};

const assignResource = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await Resource.assignResource(req.params.id, req.body, userId);
    
    // Task 7 integration: Socket.IO and Notification
    // Create an alert data payload to trigger dispatch
    const alertData = {
      location_id: req.body.location_id || 1, // fallback to a default location if incident has no loc
      hazard_type: 'ALL', 
      severity: 'MODERATE',
      title: 'RESOURCE UPDATE',
      message: `${result.assignment.assigned_quantity} unit(s) of Resource #${req.params.id} deployed.`,
      source_type: 'AUTHORITY_DASHBOARD',
      notification_type: 'SYSTEM_NOTIFICATION'
    };
    
    // Dispatch to authority preferences or general broadcast (depending on user setup)
    // The notificationService will push real-time socket events via `io.to('user_X')` 
    // if we pass a pref object with user_id. Here we broadcast a basic alert for the assigned user.
    await notificationService.dispatchNotification({ user_id: userId, channels: { in_app: true } }, alertData);
    
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await Resource.getResourceHistory(req.params.id);
    res.json({ success: true, data: { history } });
  } catch (err) {
    next(err);
  }
};

const getNearby = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Missing latitude or longitude' });
    }
    const resources = await Resource.getNearbyResources(latitude, longitude, radius || 25);
    res.json({ success: true, data: { resources } });
  } catch (err) {
    next(err);
  }
};

const getShortages = async (req, res, next) => {
  try {
    // Basic calculation for shortages: check global required vs available
    // For demo purposes, we define a static required threshold
    const required = {
      'AMBULANCE': 20,
      'RESCUE_TEAM': 15,
      'WATER': 10000,
      'MEDICAL_KIT': 5000,
      'FOOD': 10000
    };
    
    const resources = await Resource.getResources();
    const available = resources.reduce((acc, r) => {
      acc[r.resource_type] = (acc[r.resource_type] || 0) + r.available_quantity;
      return acc;
    }, {});
    
    const shortages = [];
    for (const [type, reqQty] of Object.entries(required)) {
      const avail = available[type] || 0;
      if (avail < reqQty) {
        shortages.push({
          resource_type: type,
          required: reqQty,
          available: avail,
          shortage: reqQty - avail
        });
      }
    }
    
    res.json({ success: true, data: { shortages } });
  } catch (err) {
    next(err);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const { location_id, latitude, longitude, risk_level, hazard_type, population } = req.query;
    
    // AI-Assisted Recommendation Logic
    const pop = parseInt(population) || 10000;
    const recommendations = [];
    let reason = '';

    // Rules engine
    if (risk_level === 'CRITICAL') {
      recommendations.push({ resource_type: 'RESCUE_TEAM', recommended_quantity: Math.ceil(pop / 5000) });
      recommendations.push({ resource_type: 'AMBULANCE', recommended_quantity: Math.ceil(pop / 2000) });
      recommendations.push({ resource_type: 'WATER', recommended_quantity: pop * 2 }); // 2L per person
      recommendations.push({ resource_type: 'FOOD', recommended_quantity: pop });
      reason = `Critical risk detected. Large population (${pop}) at risk requires immediate deployment.`;
    } else if (risk_level === 'HIGH') {
      recommendations.push({ resource_type: 'RESCUE_TEAM', recommended_quantity: Math.ceil(pop / 10000) });
      recommendations.push({ resource_type: 'MEDICAL_KIT', recommended_quantity: Math.ceil(pop / 500) });
      recommendations.push({ resource_type: 'WATER', recommended_quantity: Math.ceil(pop / 2) });
      reason = `High risk detected. Preparedness required for population ${pop}.`;
    }

    if (hazard_type === 'FLOOD') {
      recommendations.push({ resource_type: 'RESCUE_BOAT', recommended_quantity: Math.ceil(pop / 5000) });
      reason += ' Flood risk requires specialized water rescue equipment.';
    } else if (hazard_type === 'FIRE') {
      recommendations.push({ resource_type: 'FIREFIGHTING_EQUIPMENT', recommended_quantity: 5 });
      reason += ' High fire risk requires specialized equipment.';
    }
    
    // Calculate shortages based on nearby resources
    if (latitude && longitude) {
      const nearby = await Resource.getNearbyResources(latitude, longitude, 50); // 50km
      
      const nearbyAvailable = nearby.reduce((acc, r) => {
        acc[r.resource_type] = (acc[r.resource_type] || 0) + r.available_quantity;
        return acc;
      }, {});

      // Add shortage indicators
      recommendations.forEach(rec => {
        const avail = nearbyAvailable[rec.resource_type] || 0;
        rec.nearby_available = avail;
        rec.shortage = avail < rec.recommended_quantity ? rec.recommended_quantity - avail : 0;
      });
      reason += ' Nearby resources analyzed within 50km.';
    }

    res.json({ success: true, data: { location_id, risk_level, hazard_type, recommendations, reason } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  assignResource,
  getHistory,
  getNearby,
  getShortages,
  getRecommendations
};
