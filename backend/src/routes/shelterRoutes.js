const express = require('express');
const router = express.Router();
const shelterController = require('../controllers/shelterController');

router.get('/nearby', shelterController.getNearbyShelters);

module.exports = router;
