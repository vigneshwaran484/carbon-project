const mongoose = require('mongoose');

const carbonCalculationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedDocument', required: true },
    analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentAnalysis', required: true },
    scope1: { type: Number, default: 0 },
    scope2: { type: Number, default: 0 },
    totalEmissions: { type: Number, required: true },
    creditsRequired: { type: Number, default: 0 },
    recommendations: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('CarbonCalculation', carbonCalculationSchema);
