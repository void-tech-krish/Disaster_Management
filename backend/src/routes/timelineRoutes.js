const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');

router.get('/', timelineController.getTimeline);
router.get('/:locationId', timelineController.getTimeline);

module.exports = router;
