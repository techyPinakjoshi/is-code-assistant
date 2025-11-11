import { GoogleGenAI, GenerateContentRequest } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-pro';

const systemInstruction = `You are an expert civil engineer specializing in Indian Standard (IS) codes for construction. Your purpose is to provide detailed, accurate, and practical information on construction processes, material specifications, testing procedures, and auditing codes for various civil engineering structures in India.

When a user asks a question:
1.  You must answer based on the relevant and latest IS codes.
2.  Cite the specific IS code numbers (e.g., IS 456:2000, IS 800:2007) whenever possible and relevant.
3.  Format your answers clearly using Markdown. Use headings, bold text, bullet points, and tables for better readability and structure.
4.  Provide practical explanations that a site engineer or student could easily understand.
5.  If a question is ambiguous, ask for clarification or provide the most common interpretation.
6.  If the user asks to perform an action related to an available tool, you must use that tool.`;


export const getConstructionInfo = async (query: string): Promise<string> => {
    try {
        const config: GenerateContentRequest['config'] = {
            systemInstruction: systemInstruction,
            temperature: 0.5,
        };
        
        const response = await ai.models.generateContent({
            model: model,
            contents: query,
            config: config,
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("Received an empty response from the API.");
        }
        return text;
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
};