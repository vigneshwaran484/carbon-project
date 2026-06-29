const express = require('express');
const { getOverview } = require('../controllers/dashboardController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/overview', verifyToken, getOverview);

module.exports = router;
