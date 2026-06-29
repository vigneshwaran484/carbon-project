const express = require('express');
const { chat } = require('../controllers/ecobotController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, chat);

module.exports = router;
