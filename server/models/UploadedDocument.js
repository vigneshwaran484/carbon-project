const mongoose = require('mongoose');

const uploadedDocumentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    fileData: { type: Buffer, required: true }, // Store the original file binary
    status: { type: String, enum: ['Processing', 'Analyzed', 'Failed'], default: 'Processing' }
}, { timestamps: true });

module.exports = mongoose.model('UploadedDocument', uploadedDocumentSchema);
