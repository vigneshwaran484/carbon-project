const mongoose = require('mongoose');

const energyCalcSchema = new mongoose.Schema({
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    energyLogId:  { type: mongoose.Schema.Types.ObjectId, ref: 'EnergyLog', required: true },

    scope1:         { type: Number, default: 0 },  // kg CO₂e — direct emissions
    scope2:         { type: Number, default: 0 },  // kg CO₂e — electricity
    scope3:         { type: Number, default: 0 },  // kg CO₂e — materials & waste
    totalFootprint: { type: Number, default: 0 },  // kg CO₂e total
    carbonOffset:   { type: Number, default: 0 },  // kg CO₂e offset
    netEmissions:   { type: Number, default: 0 },  // kg CO₂e net
    carbonCredits:  { type: Number, default: 0 },  // credits

    emissionFactorsUsed: { type: Object, default: {} },

}, { timestamps: true });

module.exports = mongoose.model('EnergyCalc', energyCalcSchema);
