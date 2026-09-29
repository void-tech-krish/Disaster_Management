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

const getModelInstance = (modelName) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing Gemini API Key");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
        generationConfig: {
            temperature: 0.3,
        }
    });
};

const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), ms))
    ]);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isTransientError = (error) => {
    const msg = error.message || '';
    if (msg.includes('timed out')) return true;
    if (msg.includes('[503') || msg.includes('[429') || msg.includes('[500') || msg.includes('[408')) return true;
    if (msg.includes('[400') || msg.includes('[401') || msg.includes('[403') || msg.includes('[404')) return false;
    return true;
};

const extractErrorStatus = (error) => {
    const msg = error.message || '';
    const match = msg.match(/\[(\d{3})\s/);
    if (match) return match[1];
    if (msg.includes('timed out')) return 'TIMEOUT';
    return 'UNKNOWN';
};

const executeGeminiPrompt = async (prompt) => {
    const primaryModelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const fallbackModelName = "gemini-3.5-flash-lite";
    const maxRetries = 3;
    let lastError;
    
    console.log(`[GEMINI] Primary model: ${primaryModelName}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const model = getModelInstance(primaryModelName);
            const result = await withTimeout(model.generateContent(prompt), 10000);
            return result.response.text();
        } catch (error) {
            lastError = error;
            const status = extractErrorStatus(error);
            console.log(`[GEMINI] Primary attempt ${attempt} failed: ${status}`);
            
            if (!isTransientError(error)) {
                throw error; // Permanent error
            }
            
            if (attempt < maxRetries) {
                console.log(`[GEMINI] Retrying primary model`);
                const baseDelay = Math.pow(2, attempt - 1) * 1000;
                const jitter = Math.random() * 500;
                await delay(baseDelay + jitter);
            }
        }
    }
    
    console.log(`[GEMINI] Falling back to ${fallbackModelName}`);
    try {
        const fallbackModel = getModelInstance(fallbackModelName);
        const result = await withTimeout(fallbackModel.generateContent(prompt), 10000);
        console.log(`[GEMINI] Fallback succeeded`);
        return result.response.text();
    } catch (fallbackError) {
        throw lastError; // Throw original primary error if fallback fails
    }
};

const generateAIResponse = async (context, userMessage) => {
    const prompt = `Context:\n${JSON.stringify(context, null, 2)}\n\nUser Message: ${userMessage}`;
    return await executeGeminiPrompt(prompt);
};

const explainRisk = async (context) => {
    const prompt = `Context:\n${JSON.stringify(context, null, 2)}\n\nPlease explain the current risk assessment. Include what the model assessed, which supplied factors are relevant, what the assessment means, practical preparedness actions, and limitations. Remember to say 'These factors contributed to the model's risk assessment.'`;
    return await executeGeminiPrompt(prompt);
};

const explainWhatIf = async (context, scenario) => {
    const prompt = `Context:\n${JSON.stringify(context, null, 2)}\nScenario applied:\n${JSON.stringify(scenario, null, 2)}\n\nPlease explain the scenario using the supplied model/risk information. Do not invent a new risk score unless provided in the context.`;
    return await executeGeminiPrompt(prompt);
};

module.exports = {
    generateAIResponse,
    explainRisk,
    explainWhatIf
};
