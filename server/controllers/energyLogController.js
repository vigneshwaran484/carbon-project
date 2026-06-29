const Groq = require('groq-sdk');
const EnergyLog = require('../models/EnergyLog');
const EnergyCalc = require('../models/EnergyCalc');
const AIAnalysis = require('../models/AIAnalysis');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Emission Factors ────────────────────────────────────────────────────────
const EF = {
    electricity: 0.82,   // kg CO₂/kWh
    diesel:      2.68,   // kg CO₂/L
    petrol:      2.31,   // kg CO₂/L
    lpg:         1.51,   // kg CO₂/kg
    naturalGas:  2.04,   // kg CO₂/m³
    coal:        2.42,   // kg CO₂/kg
    steel:       1.85,   // kg CO₂/kg
    cement:      0.83,   // kg CO₂/kg
    aluminium:   8.24,   // kg CO₂/kg
    plastic:     2.53,   // kg CO₂/kg
    glass:       0.85,   // kg CO₂/kg
    wood:        0.46,   // kg CO₂/kg
    organicWaste:   0.58,  // kg CO₂/kg
    plasticWaste:   2.53,  // kg CO₂/kg
    metalWaste:     1.85,  // kg CO₂/kg
    hazardousWaste: 3.50,  // kg CO₂/kg
    freshWater:     0.36,  // kg CO₂/kL (so divide litres by 1000)
    treePerYear:    21.77, // kg CO₂ absorbed per tree per year
    solarOffset:    0.82,  // kg CO₂/kWh avoided
    windOffset:     0.82,  // kg CO₂/kWh avoided
};

function n(val) { return parseFloat(val) || 0; }

function calcEmissions(d) {
    const scope1 = (
        n(d.diesel)      * EF.diesel +
        n(d.petrol)      * EF.petrol +
        n(d.lpg)         * EF.lpg +
        n(d.naturalGas)  * EF.naturalGas +
        n(d.coal)        * EF.coal +
        n(d.organicWaste)   * EF.organicWaste +
        n(d.plasticWaste)   * EF.plasticWaste +
        n(d.metalWaste)     * EF.metalWaste +
        n(d.hazardousWaste) * EF.hazardousWaste
    );

    const scope2 = n(d.electricity) * EF.electricity;

    const scope3 = (
        n(d.steel)     * EF.steel +
        n(d.cement)    * EF.cement +
        n(d.aluminium) * EF.aluminium +
        n(d.plastic)   * EF.plastic +
        n(d.glass)     * EF.glass +
        n(d.wood)      * EF.wood +
        (n(d.freshWater) / 1000) * EF.freshWater
    );

    const totalFootprint = scope1 + scope2 + scope3;

    const carbonOffset = (
        n(d.treesPlanted)          * EF.treePerYear +
        n(d.carbonOffsetPurchased)                 +
        n(d.solarEnergyGenerated)  * EF.solarOffset +
        n(d.windEnergyUsed)        * EF.windOffset  +
        n(d.renewableEnergy)       * EF.solarOffset
    );

    const netEmissions  = Math.max(0, totalFootprint - carbonOffset);
    const carbonCredits = parseFloat((netEmissions / 1000).toFixed(4));

    return {
        scope1:         parseFloat(scope1.toFixed(2)),
        scope2:         parseFloat(scope2.toFixed(2)),
        scope3:         parseFloat(scope3.toFixed(2)),
        totalFootprint: parseFloat(totalFootprint.toFixed(2)),
        carbonOffset:   parseFloat(carbonOffset.toFixed(2)),
        netEmissions:   parseFloat(netEmissions.toFixed(2)),
        carbonCredits,
    };
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────
async function getAIAnalysis(data, calc) {
    const prompt = `You are a Carbon Intelligence AI for the Carbonil Pasumai platform. 
Analyze this energy and emissions data and return ONLY valid JSON (no markdown, no extra text):

Input Data:
- Electricity: ${n(data.electricity)} kWh
- Diesel: ${n(data.diesel)} L, Petrol: ${n(data.petrol)} L, LPG: ${n(data.lpg)} kg
- Natural Gas: ${n(data.naturalGas)} m³, Coal: ${n(data.coal)} kg
- Renewable Generated: ${n(data.renewableEnergy)} kWh
- Fresh Water: ${n(data.freshWater)} L
- Steel: ${n(data.steel)} kg, Cement: ${n(data.cement)} kg, Aluminium: ${n(data.aluminium)} kg
- Plastic: ${n(data.plastic)} kg, Glass: ${n(data.glass)} kg, Wood: ${n(data.wood)} kg
- Organic Waste: ${n(data.organicWaste)} kg, Plastic Waste: ${n(data.plasticWaste)} kg
- Metal Waste: ${n(data.metalWaste)} kg, Hazardous Waste: ${n(data.hazardousWaste)} kg
- Trees Planted: ${n(data.treesPlanted)}, Solar: ${n(data.solarEnergyGenerated)} kWh, Wind: ${n(data.windEnergyUsed)} kWh

Calculated Results:
- Scope 1: ${calc.scope1} kg CO₂e
- Scope 2: ${calc.scope2} kg CO₂e
- Scope 3: ${calc.scope3} kg CO₂e
- Total Footprint: ${calc.totalFootprint} kg CO₂e
- Carbon Offset: ${calc.carbonOffset} kg CO₂e
- Net Emissions: ${calc.netEmissions} kg CO₂e
- Carbon Credits: ${calc.carbonCredits}

Return this exact JSON schema:
{
  "sustainabilityScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "aiSummary": "<2-3 sentence professional summary>",
  "majorEmissionSources": ["<source 1>", "<source 2>", "<source 3>"],
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>",
    "<actionable recommendation 4>",
    "<actionable recommendation 5>"
  ],
  "estimatedReduction": <kg CO₂e potentially reducible>,
  "estimatedCredits": <additional carbon credits achievable>
}`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0]?.message?.content || '{}');
}

// ─── POST /api/energy-log ─────────────────────────────────────────────────────
exports.createLog = async (req, res) => {
    try {
        const data = req.body;

        // 1. Save EnergyLog
        const log = await EnergyLog.create({ userId: req.user.id, ...data });

        // 2. Calculate carbon
        const calc = calcEmissions(data);

        // 3. Save EnergyCalc
        const savedCalc = await EnergyCalc.create({
            userId: req.user.id,
            energyLogId: log._id,
            ...calc,
            emissionFactorsUsed: EF,
        });

        // 4. AI Analysis
        let aiResult = {
            sustainabilityScore: 50,
            confidenceScore: 70,
            aiSummary: 'Analysis unavailable at this time.',
            majorEmissionSources: [],
            recommendations: [],
            estimatedReduction: 0,
            estimatedCredits: 0,
        };
        try {
            aiResult = await getAIAnalysis(data, calc);
        } catch (aiErr) {
            console.warn('AI analysis failed (non-fatal):', aiErr.message);
        }

        // 5. Save AIAnalysis
        const savedAI = await AIAnalysis.create({
            userId: req.user.id,
            energyLogId: log._id,
            ...aiResult,
        });

        res.status(201).json({
            log,
            calculation: savedCalc,
            aiAnalysis: savedAI,
        });
    } catch (err) {
        console.error('EnergyLog create error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// ─── GET /api/energy-log ──────────────────────────────────────────────────────
exports.getLogs = async (req, res) => {
    try {
        const logs = await EnergyLog.find({ userId: req.user.id }).sort({ createdAt: -1 });

        const result = await Promise.all(logs.map(async (log) => {
            const calc = await EnergyCalc.findOne({ energyLogId: log._id });
            const ai   = await AIAnalysis.findOne({ energyLogId: log._id });
            return { log, calculation: calc, aiAnalysis: ai };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── DELETE /api/energy-log/:id ───────────────────────────────────────────────
exports.deleteLog = async (req, res) => {
    try {
        const log = await EnergyLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (log) {
            await EnergyCalc.deleteMany({ energyLogId: log._id });
            await AIAnalysis.deleteMany({ energyLogId: log._id });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
