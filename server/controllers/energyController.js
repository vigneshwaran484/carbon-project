const EnergyEntry = require('../models/EnergyEntry');

// POST /api/energy
exports.createEntry = async (req, res) => {
    try {
        const { electricity, fuel, water } = req.body;
        console.log('Creating energy entry for user:', req.user.id);
        console.log('Payload:', { electricity, fuel, water });

        const entry = new EnergyEntry({
            userId: req.user.id,
            electricity: parseFloat(electricity) || 0,
            fuel: parseFloat(fuel) || 0,
            water: parseFloat(water) || 0,
        });

        await entry.save();
        console.log('Energy entry saved:', entry._id);
        res.status(201).json(entry);
    } catch (err) {
        console.error('Error creating energy entry:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// GET /api/energy
exports.getEntries = async (req, res) => {
    try {
        const entries = await EnergyEntry.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/energy/summary
exports.getSummary = async (req, res) => {
    try {
        const entries = await EnergyEntry.find({ userId: req.user.id });
        const totalElectricity = entries.reduce((s, e) => s + e.electricity, 0);
        const totalFuel = entries.reduce((s, e) => s + e.fuel, 0);
        const totalWater = entries.reduce((s, e) => s + e.water, 0);
        const totalCarbon = entries.reduce((s, e) => s + e.carbon, 0);

        res.json({
            totalElectricity: parseFloat(totalElectricity.toFixed(2)),
            totalFuel: parseFloat(totalFuel.toFixed(2)),
            totalWater: parseFloat(totalWater.toFixed(2)),
            totalCarbon: parseFloat(totalCarbon.toFixed(2)),
            entries: entries.length,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/energy/:id
exports.deleteEntry = async (req, res) => {
    try {
        await EnergyEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
