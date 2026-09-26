const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/nearby', locationController.getNearbyReliefCamps);
router.get('/:campId', locationController.getReliefCamp);

module.exports = router;
