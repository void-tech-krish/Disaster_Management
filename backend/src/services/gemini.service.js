const { GoogleGenerativeAI } = require('@google/generative-ai');

const systemInstruction = `You are DisasterGuard AI, an emergency preparedness and disaster-risk explanation assistant.
Use ONLY information supplied in the backend context.
Never invent:
- weather values
- risk scores
- official warnings
- shelter availability
- emergency contacts
- disaster events
- model outputs
Do not modify numerical risk predictions.
Do not claim to predict earthquakes.
Do not present AI-generated information as an official government warning.
Clearly distinguish:
1. Weather information
2. AI/ML risk assessment
3. Official warning
4. Demonstration data
If information is missing, explicitly say that it is unavailable.
Provide concise, practical and location-aware explanations.
The AI explains backend data; it does not replace the underlying weather API, ML models, official warning systems, or route algorithms.`;

const getModel = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing Gemini API Key");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
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
    const prompt = `Context:\n${JSON.stringify(context, null, 2)}\n\nPlease explain the current risk assessment. Include what the model assessed, which supplied factors are relevant, what the assessment means, practical preparedness actions, and limitations. Remember to say 'Factors contributing to the model assessment include...'`;
    const result = await model.generateContent(prompt);
    return result.response.text();
};

const explainWhatIf = async (context, scenario) => {
    const model = getModel();
    const prompt = `Context:\n${JSON.stringify(context, null, 2)}\nScenario applied:\n${JSON.stringify(scenario, null, 2)}\n\nPlease explain the impact of this scenario based on the supplied new risk result. Remember you are not calculating the numerical risk, only explaining the result provided.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
};

module.exports = {
    generateAIResponse,
    explainRisk,
    explainWhatIf
};
