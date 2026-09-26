const geminiService = require('../services/gemini.service');

const chat = async (req, res) => {
    try {
        const { message, context } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        
        const answer = await geminiService.generateAIResponse(context || {}, message);
        res.json({ success: true, answer, source: 'gemini' });
    } catch (error) {
        console.error('Gemini chat error:', error.message);
        res.status(503).json({ success: false, message: 'AI service temporarily unavailable.' });
    }
};

const explainRisk = async (req, res) => {
    try {
        const context = req.body;
        if (!context || !context.hazard) {
            return res.status(400).json({ success: false, message: 'Hazard context is required' });
        }
        
        const explanation = await geminiService.explainRisk(context);
        res.json({ success: true, hazard: context.hazard, explanation, source: 'gemini' });
    } catch (error) {
        console.error('Gemini explain risk error:', error.message);
        res.status(503).json({ success: false, message: 'AI service temporarily unavailable.' });
    }
};

const whatIf = async (req, res) => {
    try {
        const { scenario, ...context } = req.body;
        if (!scenario || !context.newRiskResult) {
            return res.status(400).json({ success: false, message: 'Scenario and newRiskResult are required' });
        }
        
        const explanation = await geminiService.explainWhatIf(context, scenario);
        res.json({ success: true, explanation, source: 'gemini' });
    } catch (error) {
        console.error('Gemini what-if error:', error.message);
        res.status(503).json({ success: false, message: 'AI service temporarily unavailable.' });
    }
};

module.exports = {
    chat,
    explainRisk,
    whatIf
};
