const express = require('express');
const { createEntry, getEntries, getSummary, deleteEntry } = require('../controllers/energyController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createEntry);
router.get('/', verifyToken, getEntries);
router.get('/summary', verifyToken, getSummary);
router.delete('/:id', verifyToken, deleteEntry);

module.exports = router;
