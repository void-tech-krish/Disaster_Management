const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/', locationController.getStates);
router.get('/:stateId/cities', locationController.getCitiesByState);

module.exports = router;
