const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    energyLogId:   { type: mongoose.Schema.Types.ObjectId, ref: 'EnergyLog', required: true },

    sustainabilityScore:  { type: Number, default: 0 },
    confidenceScore:      { type: Number, default: 0 },
    aiSummary:            { type: String, default: '' },
    majorEmissionSources: { type: [String], default: [] },
    recommendations:      { type: [String], default: [] },
    estimatedReduction:   { type: Number, default: 0 },  // kg CO₂e potential saving
    estimatedCredits:     { type: Number, default: 0 },  // additional credits possible

}, { timestamps: true });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
