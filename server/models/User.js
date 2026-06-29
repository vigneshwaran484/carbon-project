const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    organization: { type: String },
    orgType: { type: String },
    role: { type: String, enum: ['individual', 'organization'], default: 'individual' },
    points: { type: Number, default: 0 },
    totalCarbonOffset: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
