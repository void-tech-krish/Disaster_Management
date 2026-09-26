const { GoogleGenerativeAI } = require('@google/generative-ai');

const systemInstruction = `You are DisasterGuard AI, an emergency preparedness assistant.

Provide clear, calm, factual disaster preparedness information.

Use only the risk, weather, alert, route, shelter, and other context supplied by the DisasterGuard platform.

Do not invent warnings, shelters, emergency numbers, risk scores, weather conditions, or official announcements.

Do not claim that an earthquake can be predicted.

Do not guarantee that a person or location is safe.

Clearly distinguish AI-generated risk assessments from official warnings.

For immediate emergencies, advise the user to follow verified local emergency authorities and official alerts.

Keep answers concise and actionable.`;

const getModel = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing Gemini API Key");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    return genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
        generationConfig: {
            temperature: 0.3,
        }
    });
};

const generateAIResponse = async (context, userMessage) => {
    const model = getModel();
    const prompt = `Context:\n${JSON.stringify(context, null, 2)}\n\nUser Message: ${userMessage}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
};

const explainRisk = async (context) => {
    const model = getModel();
    const prompt = `Context:\n${JSON.stringify(context, null, 2)}\n\nPlease explain the current risk assessment. Include what the model assessed, which supplied factors are relevant, what the assessment means, practical preparedness actions, and limitations. Remember to say 'These factors contributed to the model's risk assessment.'`;
    const result = await model.generateContent(prompt);
    return result.response.text();
};

const explainWhatIf = async (context, scenario) => {
    const model = getModel();
    const prompt = `Context:\n${JSON.stringify(context, null, 2)}\nScenario applied:\n${JSON.stringify(scenario, null, 2)}\n\nPlease explain the scenario using the supplied model/risk information. Do not invent a new risk score unless provided in the context.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
};

module.exports = {
    generateAIResponse,
    explainRisk,
    explainWhatIf
};
