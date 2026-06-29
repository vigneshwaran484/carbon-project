const CarbonProject = require('../models/CarbonProject');
const User = require('../models/User');
const calculateCarbonCredits = require('../utils/carbonCalculator');

// POST /api/projects
exports.createProject = async (req, res) => {
    try {
        const { name, location, area, biomassFactor, survivalRate } = req.body;

        if (!name || !location || !area || !biomassFactor || !survivalRate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const calc = calculateCarbonCredits(
            parseFloat(area),
            parseFloat(biomassFactor),
            parseFloat(survivalRate)
        );

        const project = await CarbonProject.create({
            userId: req.user.id,
            name,
            location,
            area: parseFloat(area),
            biomassFactor: parseFloat(biomassFactor),
            survivalRate: parseFloat(survivalRate),
            ...calc,
        });

        // Update user totals
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { totalCarbonOffset: calc.finalCo2, points: calc.credits },
        });

        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await CarbonProject.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
    try {
        const project = await CarbonProject.findOne({ _id: req.params.id, userId: req.user.id });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
    try {
        const project = await CarbonProject.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (project) {
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { totalCarbonOffset: -project.finalCo2, points: -project.credits },
            });
        }
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
