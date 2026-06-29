const CarbonProject = require('../models/CarbonProject');
const EnergyEntry = require('../models/EnergyEntry');

// GET /api/dashboard/overview
exports.getOverview = async (req, res) => {
    try {
        const projects = await CarbonProject.find({ userId: req.user.id });
        const energyEntries = await EnergyEntry.find({ userId: req.user.id });

        const totalCredits = projects.reduce((s, p) => s + p.credits, 0);
        const totalCo2Offset = projects.reduce((s, p) => s + p.finalCo2, 0);
        const totalEmissions = energyEntries.reduce((s, e) => s + e.carbon, 0);

        // Energy summary
        const energySummary = {
            totalElectricity: parseFloat(energyEntries.reduce((s, e) => s + e.electricity, 0).toFixed(2)),
            totalFuel: parseFloat(energyEntries.reduce((s, e) => s + e.fuel, 0).toFixed(2)),
            totalWater: parseFloat(energyEntries.reduce((s, e) => s + e.water, 0).toFixed(2)),
            totalCarbon: parseFloat(totalEmissions.toFixed(2)),
        };

        // Credits over time (by project creation date)
        const creditsOverTime = projects
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((p) => ({
                name: p.name,
                date: p.createdAt,
                credits: p.credits,
                co2: p.finalCo2,
            }));

        // Project contribution (pie chart)
        const projectContribution = projects.map((p) => ({
            name: p.name,
            credits: p.credits,
        }));

        // Monthly energy data for chart
        const monthlyEnergy = energyEntries
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((e) => ({
                date: e.createdAt,
                electricity: e.electricity,
                fuel: e.fuel,
                water: e.water,
                carbon: e.carbon,
            }));

        res.json({
            totalCredits,
            totalCo2Offset: parseFloat(totalCo2Offset.toFixed(2)),
            totalEmissions: parseFloat(totalEmissions.toFixed(2)),
            projectCount: projects.length,
            energyEntries: energyEntries.length,
            energySummary,
            creditsOverTime,
            projectContribution,
            monthlyEnergy,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
