const express = require('express');
const CarbonProject = require('../models/CarbonProject');
const EnergyEntry = require('../models/EnergyEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/insights — AI-style insight cards
router.get('/', auth, async (req, res) => {
    try {
        const projects = await CarbonProject.find({ userId: req.user.id });
        const energyData = await EnergyEntry.find({ userId: req.user.id });

        const totalCredits = projects.reduce((s, p) => s + p.credits, 0);
        const totalEmissions = energyData.reduce((s, e) => s + e.carbon, 0);

        // Generate contextual insights
        const insights = [];

        // Carbon offset vs emissions
        const totalCo2 = projects.reduce((s, p) => s + p.finalCo2, 0);
        const netCarbon = totalCo2 - totalEmissions;
        insights.push({
            id: 'net-carbon',
            title: 'Net Carbon Position',
            value: `${netCarbon > 0 ? '+' : ''}${netCarbon.toFixed(1)} kg CO₂`,
            description: netCarbon > 0
                ? 'Your carbon projects offset more CO₂ than your energy emissions. Great job!'
                : 'Your energy emissions still exceed your carbon offsets. Consider adding more projects.',
            type: netCarbon > 0 ? 'positive' : 'warning',
            icon: 'leaf',
        });

        // Top emitter category
        if (energyData.length > 0) {
            const totals = {
                Electricity: energyData.reduce((s, e) => s + e.electricity * 0.82, 0),
                Fuel: energyData.reduce((s, e) => s + e.fuel * 2.31, 0),
                Water: energyData.reduce((s, e) => s + (e.water / 1000) * 0.36, 0),
            };
            const topCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
            insights.push({
                id: 'top-emitter',
                title: 'Top Emission Source',
                value: topCategory[0],
                description: `${topCategory[0]} accounts for ${topCategory[1].toFixed(1)} kg CO₂ — your largest emission source. Focus reduction efforts here.`,
                type: 'info',
                icon: 'zap',
            });
        }

        // Project performance
        if (projects.length > 0) {
            const bestProject = projects.sort((a, b) => b.credits - a.credits)[0];
            insights.push({
                id: 'best-project',
                title: 'Top Performing Project',
                value: bestProject.name,
                description: `"${bestProject.name}" generated ${bestProject.credits} carbon credits with a ${bestProject.survivalRate}% survival rate.`,
                type: 'positive',
                icon: 'trophy',
            });

            const avgSurvival = projects.reduce((s, p) => s + p.survivalRate, 0) / projects.length;
            insights.push({
                id: 'survival-benchmark',
                title: 'Survival Rate Benchmark',
                value: `${avgSurvival.toFixed(1)}%`,
                description: avgSurvival >= 80
                    ? 'Your average survival rate is excellent. This indicates strong project management.'
                    : 'Consider improving planting techniques to boost survival rates above 80%.',
                type: avgSurvival >= 80 ? 'positive' : 'warning',
                icon: 'heart',
            });
        }

        // Reduction suggestions
        insights.push({
            id: 'reduction-tip',
            title: 'Reduction Opportunity',
            value: 'Energy Efficiency',
            description: 'Switching to LED lighting and optimizing HVAC systems can reduce electricity emissions by up to 30%.',
            type: 'tip',
            icon: 'lightbulb',
        });

        insights.push({
            id: 'compliance-score',
            title: 'Sustainability Score',
            value: Math.min(100, Math.round((totalCredits / Math.max(totalEmissions, 1)) * 100)) + '/100',
            description: 'Your sustainability score measures carbon credits earned relative to total emissions. Aim for 100+.',
            type: 'info',
            icon: 'target',
        });

        res.json(insights);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
