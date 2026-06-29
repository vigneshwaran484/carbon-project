const express = require('express');
const CarbonProject = require('../models/CarbonProject');
const EnergyEntry = require('../models/EnergyEntry');
const User = require('../models/User');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');

const router = express.Router();

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYYXTTMVAI1Eqg8frkfAptgiXIDWhFRx5WHxmVObiBNGfHEzy_Yfk3SBlZZEfyR9vbZw/exec';

// Helper: Send email via Google Apps Script (bypasses Railway SMTP blocks)
async function sendEmailViaAppsScript(mailOptions) {
    const fileBuffer = mailOptions.attachments && mailOptions.attachments[0]
        ? fs.readFileSync(mailOptions.attachments[0].path)
        : null;

    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            filename: mailOptions.attachments && mailOptions.attachments[0] ? mailOptions.attachments[0].filename : '',
            pdfBase64: fileBuffer ? fileBuffer.toString('base64') : ''
        })
    });
    const data = await response.json();
    if (data.status !== 'success') throw new Error(data.message || 'Apps Script email failed');
    return data;
}

// GET /api/reports — comprehensive report data
router.get('/', auth, async (req, res) => {
    try {
        const projects = await CarbonProject.find({ userId: req.user.id }).sort({ createdAt: -1 });
        const energyData = await EnergyEntry.find({ userId: req.user.id }).sort({ createdAt: -1 });

        const totalCredits = projects.reduce((sum, p) => sum + p.credits, 0);
        const totalCo2Offset = projects.reduce((sum, p) => sum + p.finalCo2, 0);
        const totalEmissions = energyData.reduce((sum, e) => sum + e.carbon, 0);

        const energySummary = {
            totalElectricity: energyData.reduce((s, e) => s + e.electricity, 0),
            totalFuel: energyData.reduce((s, e) => s + e.fuel, 0),
            totalWater: energyData.reduce((s, e) => s + e.water, 0),
            totalEmissions,
            entries: energyData.length,
        };

        const projectSummary = {
            totalProjects: projects.length,
            totalCredits,
            totalCo2Offset: parseFloat(totalCo2Offset.toFixed(2)),
            totalArea: projects.reduce((s, p) => s + p.area, 0),
            avgSurvivalRate: projects.length
                ? parseFloat((projects.reduce((s, p) => s + p.survivalRate, 0) / projects.length).toFixed(1))
                : 0,
        };

        // Monthly trends
        const monthlyTrends = energyData.map((e) => ({
            month: new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            emission: e.carbon,
            electricity: e.electricity,
            fuel: e.fuel,
        }));

        res.json({
            energySummary,
            projectSummary,
            monthlyTrends,
            projects,
            energyData,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/reports/email/legacy — THE OLD METHOD (No PDF, No AI, Just simple HTML)
router.post('/email/legacy', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findById(req.user.id);
        const targetEmail = email || user.email;

        if (!targetEmail) {
            return res.status(400).json({ message: 'No email address provided.' });
        }

        const projects = await CarbonProject.find({ userId: req.user.id });
        const energyData = await EnergyEntry.find({ userId: req.user.id });

        const totalCredits = projects.reduce((s, p) => s + p.credits, 0);
        const totalEmissions = energyData.reduce((s, e) => s + e.carbon, 0);

        const mailOptions = {
            to: targetEmail,
            subject: 'Carbonil Pasumai - Carbon Assessment Report (Summary)',
            html: `
                <div style="font-family: sans-serif; color: #1a1f35; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #10b981; padding: 24px; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Carbon Assessment Report</h1>
                    </div>
                    <div style="padding: 24px;">
                        <p>Dear <b>${user.name}</b>,</p>
                        <p>Here is your current carbon summary from Carbonil Pasumai:</p>
                        <ul>
                            <li><b>Total Carbon Emissions:</b> ${totalEmissions.toFixed(2)} kg CO2e</li>
                            <li><b>Total Carbon Credits:</b> ${totalCredits} Credits</li>
                        </ul>
                        <p>Thank you for using our platform.</p>
                        <p>Regards,<br/>Carbonil Pasumai Team</p>
                    </div>
                </div>
            `
        };

        try {
            await sendEmailViaAppsScript(mailOptions);
        } catch (emailErr) {
            console.error('Legacy email error:', emailErr.message);
        }
        res.json({ message: 'Legacy report processed successfully.' });
    } catch (err) {
        console.error('Legacy Email Error:', err);
        res.status(500).json({ message: 'Failed to send legacy email.' });
    }
});

// POST /api/reports/email — THE NEW AI PDF METHOD
router.post('/email', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findById(req.user.id);
        const targetEmail = email || user.email;

        if (!targetEmail) {
            return res.status(400).json({ message: 'No email address provided.' });
        }

        const projects = await CarbonProject.find({ userId: req.user.id });
        const energyData = await EnergyEntry.find({ userId: req.user.id });

        const totalCredits = projects.reduce((s, p) => s + p.credits, 0);
        const totalCo2Offset = projects.reduce((s, p) => s + p.finalCo2, 0);
        const totalEmissions = energyData.reduce((s, e) => s + e.carbon, 0);

        const energySummary = {
            totalElectricity: energyData.reduce((s, e) => s + e.electricity, 0),
            totalFuel: energyData.reduce((s, e) => s + e.fuel, 0),
            totalWater: energyData.reduce((s, e) => s + e.water, 0),
            totalEmissions,
            entries: energyData.length
        };
        const projectSummary = {
            totalProjects: projects.length,
            totalCredits,
            totalCo2Offset,
            totalArea: projects.reduce((s, p) => s + (p.area || 0), 0),
            avgSurvivalRate: projects.length
                ? parseFloat((projects.reduce((s, p) => s + (p.survivalRate || 0), 0) / projects.length).toFixed(1))
                : 0
        };
        const monthlyTrends = energyData.map((e) => ({
            month: new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            emission: e.carbon
        }));

        let generatePDFReport;
        try {
            // Lazy load to prevent server crash if packages are missing on startup
            const pdfGen = require('../utils/pdfGenerator');
            generatePDFReport = pdfGen.generatePDFReport;
        } catch (moduleErr) {
            console.error("PDF Generator module missing dependencies:", moduleErr);
            return res.status(500).json({ 
                message: 'PDF generation failed. Required modules (pdfkit, groq-sdk, uuid) are not installed. Run npm install in the server directory.' 
            });
        }

        // 1. Generate PDF
        const { filePath, reportId, aiAnalysis } = await generatePDFReport(user, energySummary, projectSummary, monthlyTrends);

        // 2. Prepare Email Options
        const mailOptions = {
            to: targetEmail,
            subject: 'Carbonil Pasumai – AI Carbon Assessment Report',
            html: `
                <div style="font-family: sans-serif; color: #1a1f35; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #10b981; padding: 24px; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">AI Carbon Assessment Report</h1>
                    </div>
                    <div style="padding: 24px;">
                        <p>Dear <b>${user.name}</b>,</p>
                        <p>Your AI-generated Carbon Assessment Report has been successfully prepared.</p>
                        
                        <p>The attached report includes:</p>
                        <ul>
                            <li>Carbon Footprint Analysis</li>
                            <li>AI Sustainability Insights</li>
                            <li>Emission Breakdown</li>
                            <li>Carbon Credit Estimation</li>
                            <li>ESG Readiness</li>
                        </ul>

                        <p>Thank you for using Carbonil Pasumai 2.0.</p>
                        <p>Regards,<br/>Carbonil Pasumai Team</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `${reportId}.pdf`,
                    path: filePath,
                    contentType: 'application/pdf'
                }
            ]
        };

        // 3. Send Email via Google Apps Script
        let emailStatus = 'Sent';
        try {
            await sendEmailViaAppsScript(mailOptions);
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr.message);
            emailStatus = 'Failed';
        }

        // 4. Save to DB
        const newReport = new Report({
            reportId,
            userId: req.user.id,
            organization: user.name,
            carbonScore: Math.min(100, Math.round((totalCredits / Math.max(totalEmissions, 1)) * 100)),
            totalEmissions,
            carbonCredits: totalCredits,
            aiSummary: aiAnalysis,
            pdfFilePath: filePath,
            emailStatus: emailStatus,
            reportStatus: 'Completed',
            emailTimestamp: new Date()
        });
        await newReport.save();

        res.json({ message: 'Report generated and sent successfully.', reportId });
    } catch (err) {
        console.error('Report Generation Error:', err);
        res.status(500).json({ message: 'Failed to generate and send report: ' + err.message });
    }
});

// POST /api/reports/:id/email — EMAIL EXISTING REPORT
router.post('/:id/email', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findById(req.user.id);
        const targetEmail = email || user.email;

        if (!targetEmail) {
            return res.status(400).json({ message: 'No email address provided.' });
        }

        const report = await Report.findOne({ reportId: req.params.id, userId: req.user.id });
        if (!report) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        if (!fs.existsSync(report.pdfFilePath)) {
            return res.status(404).json({ message: 'PDF file for this report could not be found on the server.' });
        }

        const mailOptions = {
            to: targetEmail,
            subject: 'Carbonil Pasumai – AI Carbon Assessment Report',
            html: `
                <div style="font-family: sans-serif; color: #1a1f35; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #10b981; padding: 24px; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">AI Carbon Assessment Report</h1>
                    </div>
                    <div style="padding: 24px;">
                        <p>Dear <b>${user.name}</b>,</p>
                        <p>Please find attached your AI-generated Carbon Assessment Report.</p>
                        
                        <p>The attached report includes:</p>
                        <ul>
                            <li>Carbon Footprint Analysis</li>
                            <li>AI Sustainability Insights</li>
                            <li>Emission Breakdown</li>
                            <li>Carbon Credit Estimation</li>
                            <li>ESG Readiness</li>
                        </ul>

                        <p>Thank you for using Carbonil Pasumai 2.0.</p>
                        <p>Regards,<br/>Carbonil Pasumai Team</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `${report.reportId}.pdf`,
                    path: report.pdfFilePath,
                    contentType: 'application/pdf'
                }
            ]
        };

        let emailStatus = 'Sent';
        try {
            await sendEmailViaAppsScript(mailOptions);
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr.message);
            emailStatus = 'Failed';
        }
        
        // Update email status
        report.emailStatus = emailStatus;
        report.emailTimestamp = new Date();
        await report.save();
        
        res.json({ message: 'Email processing complete.', status: emailStatus });
    } catch (err) {
        console.error('Email Existing Report Error:', err);
        res.status(500).json({ message: err.message || 'Failed to email report.' });
    }
});

// GET /api/reports/history — fetch all reports
router.get('/history', auth, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch report history.' });
    }
});

// GET /api/reports/stats — summary stats for the reports center
router.get('/stats', auth, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user.id });
        const totalReports = reports.length;
        const emailedReports = reports.filter(r => r.emailStatus === 'Sent').length;
        const avgScore = totalReports > 0
            ? Math.round(reports.reduce((s, r) => s + (r.carbonScore || 0), 0) / totalReports)
            : 0;
        const latestReport = reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

        res.json({
            totalReports,
            emailedReports,
            avgScore,
            latestStatus: latestReport ? latestReport.reportStatus : 'N/A',
            latestDate: latestReport ? latestReport.createdAt : null,
            latestReportId: latestReport ? latestReport.reportId : null,
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stats.' });
    }
});

// GET /api/reports/download/:id — download PDF
router.get('/download/:id', auth, async (req, res) => {
    try {
        const report = await Report.findOne({ reportId: req.params.id, userId: req.user.id });
        if (!report) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        if (fs.existsSync(report.pdfFilePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${report.reportId}.pdf`);
            const fileStream = fs.createReadStream(report.pdfFilePath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ message: 'PDF file not found on server.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to download report.' });
    }
});

// DELETE /api/reports/:id — delete a report record
router.delete('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findOneAndDelete({ reportId: req.params.id, userId: req.user.id });
        if (!report) {
            return res.status(404).json({ message: 'Report not found.' });
        }
        // Optionally delete the PDF file too
        if (report.pdfFilePath && fs.existsSync(report.pdfFilePath)) {
            fs.unlinkSync(report.pdfFilePath);
        }
        res.json({ message: 'Report deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete report.' });
    }
});

module.exports = router;
