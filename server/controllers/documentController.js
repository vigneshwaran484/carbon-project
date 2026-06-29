const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const UploadedDocument = require('../models/UploadedDocument');
const DocumentAnalysis = require('../models/DocumentAnalysis');
const CarbonCalculation = require('../models/CarbonCalculation');
const EnergyEntry = require('../models/EnergyEntry');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a highly intelligent Carbon Document Processing AI. 
Your job is to read raw text from utility bills, invoices, CSVs, and Excel sheets, and extract exactly the carbon-related metrics requested, ignoring everything else.

Return ONLY a valid JSON object (NO markdown formatting, NO extra text).
Schema requirements:
{
  "extractedData": {
    "electricity": { "value": number, "unit": "string", "sourcePage": "string", "confidence": number, "explanation": "string" },
    "fuel": { "value": number, "unit": "string", "sourcePage": "string", "confidence": number, "explanation": "string" },
    "water": { "value": number, "unit": "string", "sourcePage": "string", "confidence": number, "explanation": "string" },
    "waste": { "value": number, "unit": "string", "sourcePage": "string", "confidence": number, "explanation": "string" },
    "rawMaterials": { "value": number, "unit": "string", "sourcePage": "string", "confidence": number, "explanation": "string" }
  },
  "ignoredFields": [
    { "field": "string", "reason": "string" }
  ],
  "overallConfidence": number,
  "aiExplanation": "string",
  "calculation": {
    "scope1": number,
    "scope2": number,
    "totalEmissions": number,
    "creditsRequired": number,
    "recommendations": ["string", "string"]
  }
}

Important Rules:
1. If a value is not found, set its value to 0, unit to "", and explanation to "Not found in document".
2. Convert all electricity to kWh, fuel to Litres, water to kL if possible.
3. IgnoredFields should contain at least 2-3 examples of irrelevant data (like GST number, address, terms) you found and ignored.
4. overallConfidence should be a percentage (0-100).
5. For calculations, roughly estimate: Electricity (kWh) * 0.82 = Scope 2. Fuel (L) * 2.31 = Scope 1. Total Emissions = Scope 1 + Scope 2 + (Water * 0.36). creditsRequired = Total / 1000.
`;

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileBuffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const filename = req.file.originalname;

        // 1. Save Original Document
        const uploadedDoc = await UploadedDocument.create({
            userId: req.user.id,
            originalName: filename,
            filename: `${Date.now()}_${filename}`,
            mimetype,
            size: req.file.size,
            fileData: fileBuffer,
            status: 'Processing'
        });

        // 2. Extract Text
        let rawText = '';
        if (mimetype === 'application/pdf') {
            const pdfData = await pdfParse(fileBuffer);
            rawText = pdfData.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            mimetype === 'application/vnd.ms-excel' ||
            mimetype === 'text/csv'
        ) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(fileBuffer);
            const rows = [];
            workbook.eachSheet((sheet) => {
                sheet.eachRow((row) => {
                    rows.push(row.values.slice(1).join('\t'));
                });
            });
            rawText = rows.join('\n');
        } else {
            rawText = fileBuffer.toString('utf-8'); // Fallback text
        }

        // Limit text length to avoid token limits
        rawText = rawText.substring(0, 15000);

        // 3. AI Analysis
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Here is the document text to analyze:\n\n${rawText}` }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const aiResponseRaw = chatCompletion.choices[0]?.message?.content;
        let aiResult;
        try {
            aiResult = JSON.parse(aiResponseRaw);
        } catch (e) {
            throw new Error('AI returned invalid JSON');
        }

        // 4. Save Analysis
        const analysis = await DocumentAnalysis.create({
            userId: req.user.id,
            documentId: uploadedDoc._id,
            extractedData: aiResult.extractedData,
            ignoredFields: aiResult.ignoredFields || [],
            overallConfidence: aiResult.overallConfidence || 0,
            aiExplanation: aiResult.aiExplanation || ''
        });

        // 5. Save Calculation
        const calc = await CarbonCalculation.create({
            userId: req.user.id,
            documentId: uploadedDoc._id,
            analysisId: analysis._id,
            scope1: aiResult.calculation?.scope1 || 0,
            scope2: aiResult.calculation?.scope2 || 0,
            totalEmissions: aiResult.calculation?.totalEmissions || 0,
            creditsRequired: aiResult.calculation?.creditsRequired || 0,
            recommendations: aiResult.calculation?.recommendations || []
        });

        // 6. Update Dashboard automatically (Create Energy Entry)
        await EnergyEntry.create({
            userId: req.user.id,
            electricity: aiResult.extractedData.electricity.value || 0,
            fuel: aiResult.extractedData.fuel.value || 0,
            water: aiResult.extractedData.water.value || 0,
        });

        // Update document status
        uploadedDoc.status = 'Analyzed';
        await uploadedDoc.save();

        res.json({
            message: 'Document analyzed successfully',
            document: uploadedDoc,
            analysis,
            calculation: calc
        });

    } catch (error) {
        console.error('Document Upload Error:', error);
        res.status(500).json({ message: 'Failed to process document: ' + error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const docs = await UploadedDocument.find({ userId: req.user.id })
            .select('-fileData') // Exclude binary data for listing
            .sort({ createdAt: -1 });
        
        const history = await Promise.all(docs.map(async (doc) => {
            const analysis = await DocumentAnalysis.findOne({ documentId: doc._id });
            const calc = await CarbonCalculation.findOne({ documentId: doc._id });
            return {
                document: doc,
                analysis,
                calculation: calc
            };
        }));
        
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const doc = await UploadedDocument.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (doc) {
            await DocumentAnalysis.deleteMany({ documentId: doc._id });
            await CarbonCalculation.deleteMany({ documentId: doc._id });
        }
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete document' });
    }
};
