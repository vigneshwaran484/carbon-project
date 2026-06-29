const mongoose = require('mongoose');

const energyLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Project Details
    projectName:      { type: String, default: '' },
    organizationName: { type: String, default: '' },
    facilityName:     { type: String, default: '' },
    industryType:     { type: String, default: '' },
    reportingMonth:   { type: String, default: '' },
    reportingYear:    { type: String, default: '' },
    remarks:          { type: String, default: '' },

    // Energy Consumption
    electricity:     { type: Number, default: 0 }, // kWh
    diesel:          { type: Number, default: 0 }, // Litres
    petrol:          { type: Number, default: 0 }, // Litres
    lpg:             { type: Number, default: 0 }, // kg
    naturalGas:      { type: Number, default: 0 }, // m³
    coal:            { type: Number, default: 0 }, // kg
    renewableEnergy: { type: Number, default: 0 }, // kWh generated

    // Water Consumption
    freshWater:     { type: Number, default: 0 }, // Litres
    recycledWater:  { type: Number, default: 0 }, // Litres
    rainwaterHarvested: { type: Number, default: 0 }, // Litres

    // Raw Materials
    steel:     { type: Number, default: 0 }, // kg
    cement:    { type: Number, default: 0 }, // kg
    aluminium: { type: Number, default: 0 }, // kg
    plastic:   { type: Number, default: 0 }, // kg
    glass:     { type: Number, default: 0 }, // kg
    wood:      { type: Number, default: 0 }, // kg

    // Waste Generation
    organicWaste:   { type: Number, default: 0 }, // kg
    plasticWaste:   { type: Number, default: 0 }, // kg
    metalWaste:     { type: Number, default: 0 }, // kg
    hazardousWaste: { type: Number, default: 0 }, // kg
    recycledWaste:  { type: Number, default: 0 }, // kg

    // Carbon Offset Activities
    treesPlanted:           { type: Number, default: 0 },
    carbonOffsetPurchased:  { type: Number, default: 0 }, // kg CO₂e
    solarEnergyGenerated:   { type: Number, default: 0 }, // kWh
    windEnergyUsed:         { type: Number, default: 0 }, // kWh

}, { timestamps: true });

module.exports = mongoose.model('EnergyLog', energyLogSchema);
