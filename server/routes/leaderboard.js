const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, getLeaderboard);

module.exports = router;
