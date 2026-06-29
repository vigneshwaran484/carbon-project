const express = require('express');
const { createProject, getProjects, getProjectById, deleteProject } = require('../controllers/projectController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createProject);
router.get('/', verifyToken, getProjects);
router.get('/:id', verifyToken, getProjectById);
router.delete('/:id', verifyToken, deleteProject);

module.exports = router;
