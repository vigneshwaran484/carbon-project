const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: String,
        default: 'Unknown Organization'
    },
    reportingPeriod: {
        type: String,
        default: 'Annual'
    },
    carbonScore: {
        type: Number,
        default: 0
    },
    totalEmissions: {
        type: Number,
        default: 0
    },
    carbonCredits: {
        type: Number,
        default: 0
    },
    aiSummary: {
        type: String,
        default: ''
    },
    pdfFilePath: {
        type: String,
        required: true
    },
    emailStatus: {
        type: String,
        enum: ['Pending', 'Sent', 'Failed'],
        default: 'Pending'
    },
    reportStatus: {
        type: String,
        enum: ['Processing', 'Completed', 'Error'],
        default: 'Completed'
    },
    emailTimestamp: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
