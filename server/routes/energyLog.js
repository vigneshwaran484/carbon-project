const express = require('express');
const { createLog, getLogs, deleteLog } = require('../controllers/energyLogController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/',     verifyToken, createLog);
router.get('/',      verifyToken, getLogs);
router.delete('/:id', verifyToken, deleteLog);

module.exports = router;
