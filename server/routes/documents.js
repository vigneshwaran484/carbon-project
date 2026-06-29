const express = require('express');
const router = express.Router();
const multer = require('multer');
const protect = require('../middleware/auth');
const documentController = require('../controllers/documentController');

// Multer config (memory storage for Buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max size
});

router.post('/upload', protect, upload.single('file'), documentController.uploadDocument);
router.get('/history', protect, documentController.getHistory);
router.delete('/:id', protect, documentController.deleteDocument);

module.exports = router;
