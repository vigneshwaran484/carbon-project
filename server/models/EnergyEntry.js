const mongoose = require('mongoose');

const energyEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    electricity: { type: Number, required: true, default: 0 },
    fuel: { type: Number, required: true, default: 0 },
    water: { type: Number, required: true, default: 0 },
    carbon: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate carbon emission before save
energyEntrySchema.pre('save', async function () {
    const ELECTRICITY_FACTOR = 0.82;  // kg CO2 per kWh
    const FUEL_FACTOR = 2.31;         // kg CO2 per litre
    const WATER_FACTOR = 0.36;        // kg CO2 per kL

    this.carbon = parseFloat(
        (this.electricity * ELECTRICITY_FACTOR +
            this.fuel * FUEL_FACTOR +
            (this.water / 1000) * WATER_FACTOR).toFixed(2)
    );
});

module.exports = mongoose.model('EnergyEntry', energyEntrySchema);
