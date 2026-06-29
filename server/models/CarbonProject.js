const mongoose = require('mongoose');

const carbonProjectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    area: { type: Number, required: true },
    biomassFactor: { type: Number, required: true },
    survivalRate: { type: Number, required: true },
    biomass: { type: Number, required: true },
    carbon: { type: Number, required: true },
    co2: { type: Number, required: true },
    adjustedCo2: { type: Number, required: true },
    finalCo2: { type: Number, required: true },
    credits: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('CarbonProject', carbonProjectSchema);
