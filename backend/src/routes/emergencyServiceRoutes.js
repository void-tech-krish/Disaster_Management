const express = require('express');
const router = express.Router();
const emergencyServicesController = require('../controllers/emergencyServicesController');

router.get('/', emergencyServicesController.getNearbyServices);
router.get('/types', emergencyServicesController.getServiceTypes);

module.exports = router;
