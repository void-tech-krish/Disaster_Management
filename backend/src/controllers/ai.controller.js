const geminiService = require('../services/gemini.service');
const mlService = require('../services/ml.service');

const MAX_MESSAGE_LENGTH = 1000;

const chat = async (req, res) => {
    try {
        const { message, context } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ success: false, message: 'Message too long' });
        }
        
        const reply = await geminiService.generateAIResponse(context || {}, message);
        res.json({ success: true, reply, source: 'gemini' });
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
        const { scenario, location, hazard, current_risk, ...context } = req.body;
        if (!scenario || !hazard) {
            return res.status(400).json({ success: false, message: 'Scenario and hazard are required' });
        }

        let newRiskResult = context.newRiskResult;
        
        if (!newRiskResult) {
            // Need to call ML endpoint
            // Map scenario data to locationData properties expected by ML Service
            const locData = { ...context, ...scenario, location };
            
            if (hazard === 'flood') newRiskResult = await mlService.getFloodRisk(locData);
            else if (hazard === 'landslide') newRiskResult = await mlService.getLandslideRisk(locData);
            else if (hazard === 'heatwave') newRiskResult = await mlService.getHeatwaveRisk(locData);
            else if (hazard === 'drought') newRiskResult = await mlService.getDroughtRisk(locData);
        }

        const fullContext = {
            location, hazard, current_risk, newRiskResult, ...context
        };
        
        const explanation = await geminiService.explainWhatIf(fullContext, scenario);
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
