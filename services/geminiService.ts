
import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { DashboardData, MonitoringDashboardData, ProjectChatResponse, ThreeDAnalysisData } from "../types";
import { supabase } from "../lib/supabaseClient";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const textModel = 'gemini-3-pro-preview';
const visionModel = 'gemini-3-flash-preview';
const embeddingModel = 'text-embedding-004';

const systemInstruction = `You are an expert civil engineer specializing in Indian Standard (IS) codes and BOQ (Bill of Quantities) extraction for construction. Your purpose is to provide detailed, accurate, and practical information on construction processes, material specifications, testing procedures, and auditing codes for various civil engineering structures in India.

[CORE DIRECTIVE: CITATION MODE]
You are a Professional Engineering Assistant. You generally DO NOT guess.
1. **Mandatory Citation**: Every engineering claim MUST be backed by an IS Code or NBC 2016 clause.
   - *Correct*: "Concrete cover should be 20mm (IS 456, Cl. 26.4.2)."
   - *Incorrect*: "Use 20mm cover."
2. **Uncertainty**: If you cannot find the specific text in your knowledge base, you must say: "I cannot find a specific clause for this in the standard codes."
3. **Safety Warning**: For structural advice, append: "⚠️ *Consult a licensed structural engineer.*"

[BOQ EXTRACTION DIRECTIVE]
When analyzing 2D plans or tender documents:
1. Accurately identify materials, dimensions, and specifications.
2. Group items by WBS (Work Breakdown Structure) phases (e.g., Substructure, Superstructure, MEP).
3. Reference IS 1200 for measurement principles wherever applicable.

[GENERAL RULES]
1. Answer based on relevant and latest IS codes.
2. Format answers clearly using Markdown (headings, bold text, bullet points).
3. If a question is ambiguous, ask for clarification.

[VISUALIZATION RULE: DASHBOARD MODE]
When the user asks for a status, summary, or comparison, DO NOT write paragraphs. You must generate a "Mini-Dashboard" using Markdown.
1. **Summary Cards**: Use bold headers for key metrics.
   * **Total Cost**: ₹45,00,000
   * **Status**: ⚠️ Delayed
2. **Data Tables**: ALWAYS use tables for lists, BoQs, or schedules.
   | Item | Qty | Rate | Amount |
   | :--- | :--- | :--- | :--- |
   | ... | ... | ... | ... |
3. **Charts**: Use Mermaid.js syntax for timelines (Gantt) or flows if complex logic is required.

[INTERACTION RULE: SUGGEST NEXT STEPS]
At the end of EVERY response, you must provide 3 "One-Click" follow-up options for the user. Format them as a numbered list with a specific emoji.`;

const monitoringSystemPrompt = `You are an AI construction progress and site monitoring assistant for a SaaS platform.
Your role is to analyze live site data (photos, videos, sensor or manual updates) and drive a real-time project dashboard and auto-generated reports for stakeholders.`;

const handleGeminiError = (error: unknown): Error => {
    console.error("Gemini API Error:", error);
    let message = "An unknown error occurred while communicating with the AI service. Please check your connection and try again.";
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key not valid')) {
            message = "The provided API key is invalid or has expired.";
        } else if (errorMessage.includes('quota')) {
            message = "You have exceeded your API request quota.";
        } else {
            message = error.message;
        }
    }
    return new Error(message);
};

// --- RAG IMPLEMENTATION ---

async function getEmbedding(text: string): Promise<number[]> {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const result = await ai.models.embedContent({
        model: embeddingModel,
        content: text,
    });
    return result.embedding.values;
}

async function searchKnowledgeBase(query: string): Promise<string | null> {
    try {
        const embedding = await getEmbedding(query);
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.7,
            match_count: 3
        });

        if (error) return null;

        if (documents && documents.length > 0) {
            return documents.map((doc: any) => 
                `[Source: ${doc.metadata?.code || 'IS Code'} Clause ${doc.metadata?.clause || ''}]\n${doc.content}`
            ).join("\n\n");
        }
        return null;
    } catch (e) {
        return null;
    }
}

export const addToKnowledgeBase = async (code: string, clause: string, text: string): Promise<void> => {
    try {
        const embedding = await getEmbedding(text);
        const { error } = await supabase.from('documents').insert({
            content: text,
            metadata: { code, clause },
            embedding
        });
        if (error) throw new Error(error.message);
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const getConstructionInfo = async (query: string): Promise<string> => {
    try {
        const relevantContext = await searchKnowledgeBase(query);
        let instruction = systemInstruction;

        if (relevantContext) {
            instruction += `\n\n[RETRIEVED KNOWLEDGE - USE THIS SOURCE OF TRUTH]\n${relevantContext}\n\nStrictly prioritize the above context over your general training data.`;
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: textModel,
            contents: query,
            config: {
                systemInstruction: instruction,
                temperature: 0.3,
            },
        });
        
        return response.text || "Empty response";
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const analyzeProgress = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { data: imageBase64, mimeType } }
                ]
            },
            config: {
                systemInstruction: 'You are an expert civil engineer analyzing a construction site photo. Provide a concise, professional progress report.',
            }
        });
        return response.text || "Empty response";
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const analyzeBoq = async (prompt: string, fileBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { data: fileBase64, mimeType } }
                ]
            },
            config: { systemInstruction: 'You are an expert quantity surveyor specializing in Indian construction projects.' }
        });
        return response.text || "Empty response";
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const generateProjectDashboard = async (fileBase64: string, mimeType: string): Promise<DashboardData> => {
     try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: {
                parts: [
                    { text: "Analyze this plan/tender and generate the ULTIMATE IS CODE COMPLIANT DASHBOARD." },
                    { inlineData: { data: fileBase64, mimeType } }
                ]
            },
            config: {
                systemInstruction: `Analyze 2D plans for structural elements (IS 456, IS 800), finishing, MEP, and safety. Return valid JSON.`,
                responseMimeType: 'application/json'
            }
        });
        return JSON.parse(response.text || '{}') as DashboardData;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateDashboardWithProgressImage = async (currentDashboard: DashboardData, imageBase64: string, mimeType: string): Promise<DashboardData> => {
     try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const prompt = `Update progress based on photo. Current: ${JSON.stringify(currentDashboard.wbs)}`;
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { data: imageBase64, mimeType } }
                ]
            },
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}') as DashboardData;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const generate3DAndCameraPlan = async (fileBase64: string, mimeType: string): Promise<ThreeDAnalysisData> => {
     try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: {
                parts: [
                    { text: "Analyze plan for 3D heights and camera placements." },
                    { inlineData: { data: fileBase64, mimeType } }
                ]
            },
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}') as ThreeDAnalysisData;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateDashboardViaChat = async (currentDashboard: DashboardData, userMessage: string): Promise<ProjectChatResponse> => {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const prompt = `Context: ${JSON.stringify(currentDashboard)}. Request: "${userMessage}". Return JSON.`;
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}') as ProjectChatResponse;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateMonitoringDashboard = async (currentState: any, newEvents: any): Promise<MonitoringDashboardData> => {
    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const inputPrompt = `Current: ${JSON.stringify(currentState || {})}. Events: ${JSON.stringify(newEvents)}`;
        const response = await ai.models.generateContent({
            model: textModel,
            contents: inputPrompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}') as MonitoringDashboardData;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const generateMarketingPrompt = async (description: string): Promise<string> => {
     try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `Generate a detailed AI image prompt for: "${description}"`,
            config: { temperature: 0.7 },
        });
        return response.text || '';
    } catch (error) {
        throw handleGeminiError(error);
    }
};
