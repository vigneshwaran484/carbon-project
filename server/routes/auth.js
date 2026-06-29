const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
