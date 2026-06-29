const mongoose = require('mongoose');

const documentAnalysisSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedDocument', required: true },
    extractedData: {
        electricity: { value: Number, unit: String, sourcePage: String, confidence: Number, explanation: String },
        fuel: { value: Number, unit: String, sourcePage: String, confidence: Number, explanation: String },
        water: { value: Number, unit: String, sourcePage: String, confidence: Number, explanation: String },
        waste: { value: Number, unit: String, sourcePage: String, confidence: Number, explanation: String },
        rawMaterials: { value: Number, unit: String, sourcePage: String, confidence: Number, explanation: String },
    },
    ignoredFields: [{
        field: String,
        reason: String
    }],
    overallConfidence: { type: Number, required: true },
    aiExplanation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DocumentAnalysis', documentAnalysisSchema);
