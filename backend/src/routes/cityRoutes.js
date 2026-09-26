const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/:cityId', locationController.getCity);
router.get('/:cityId/relief-camps', locationController.getReliefCampsByCity);

module.exports = router;
