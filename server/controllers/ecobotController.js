const Groq = require('groq-sdk');
const CarbonProject = require('../models/CarbonProject');
const EnergyEntry = require('../models/EnergyEntry');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are EcoBot, the AI sustainability assistant for the Carbonil Pasumai platform — a carbon credit calculation and sustainability SaaS dashboard.

Your expertise covers:
- Carbon credit calculation (formula: Credits = Area × BiomassFactor × 0.47 × 3.67 × (SurvivalRate/100) × 0.85)
- Scientific constants: 0.47 (carbon fraction of biomass), 3.67 (CO₂-to-Carbon molecular weight ratio), 0.85 (15% buffer deduction)
- Emission reduction strategies for electricity, fuel, waste, and water
- Sustainability best practices and climate compliance
- Environmental project management and reforestation

Personality:
- Friendly, knowledgeable, and encouraging
- Use emojis occasionally (🌿 🌍 ♻️ 📊 💡) but stay professional
- Give concise, actionable advice
- Reference the user's actual data when provided in context
- Format responses with markdown bold and line breaks for readability`;

// POST /api/ecobot
exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        // Gather user context
        const projects = await CarbonProject.find({ userId: req.user.id });
        const energyData = await EnergyEntry.find({ userId: req.user.id });

        const totalCredits = projects.reduce((s, p) => s + p.credits, 0);
        const totalEmissions = energyData.reduce((s, e) => s + e.carbon, 0);
        const totalCo2Offset = projects.reduce((s, p) => s + p.finalCo2, 0);

        let userContext = `\n\nUser's current data:`;
        userContext += `\n- Total Carbon Credits: ${totalCredits}`;
        userContext += `\n- Total CO₂ Offset: ${totalCo2Offset.toFixed(1)} kg`;
        userContext += `\n- Total Emissions: ${totalEmissions.toFixed(1)} kg CO₂`;
        userContext += `\n- Projects: ${projects.length}`;

        if (projects.length > 0) {
            userContext += `\n- Project list: ${projects.map(p => `"${p.name}" (${p.credits} credits, ${p.area}ha, ${p.survivalRate}% survival)`).join('; ')}`;
        }

        const messages = [{ role: 'system', content: SYSTEM_PROMPT + userContext }];

        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-10)) {
                messages.push({
                    role: msg.role === 'bot' ? 'assistant' : 'user',
                    content: msg.text,
                });
            }
        }

        messages.push({ role: 'user', content: message });

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_completion_tokens: 1024,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        res.json({ reply });
    } catch (err) {
        console.error('EcoBot error:', err.message);
        res.status(500).json({ message: 'AI service error. Please try again.' });
    }
};
