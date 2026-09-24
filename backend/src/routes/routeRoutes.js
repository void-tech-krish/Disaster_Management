const express = require('express');
const router = express.Router();

// Mock Routing logic for Phase 2
router.post('/', (req, res, next) => {
  try {
    const { start, destination } = req.body;

    // We will generate two mock routes for demonstration
    // Route 1: Shortest Route (Higher Risk)
    const shortestRoute = {
      id: 'route_shortest',
      name: 'Shortest Route',
      distance: '8.2 km',
      time: '18 min',
      risk_exposure: 'HIGH',
      affected_zones: ['Flood Zone A'],
      polyline: [
        [20.59, 78.96],
        [20.60, 78.98],
        [20.62, 79.01]
      ]
    };

    // Route 2: Safer Route (Longer, Lower Risk)
    const saferRoute = {
      id: 'route_safer',
      name: 'Safer Route',
      distance: '10.1 km',
      time: '23 min',
      risk_exposure: 'LOW',
      affected_zones: [],
      polyline: [
        [20.59, 78.96],
        [20.57, 78.97],
        [20.58, 79.00],
        [20.62, 79.01]
      ]
    };

    res.status(200).json({
      status: 'success',
      data: {
        routes: [shortestRoute, saferRoute],
        message: 'Lower assessed disaster-risk exposure found.'
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
