
import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { DashboardData, MonitoringDashboardData, ProjectChatResponse, ThreeDAnalysisData } from "../types";
import { supabase } from "../src/lib/supabaseClient";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const textModel = 'gemini-3-pro-preview';
const visionModel = 'gemini-2.5-flash';
const embeddingModel = 'text-embedding-004';

const systemInstruction = `You are an expert civil engineer specializing in Indian Standard (IS) codes for construction. Your purpose is to provide detailed, accurate, and practical information on construction processes, material specifications, testing procedures, and auditing codes for various civil engineering structures in India.

[CORE DIRECTIVE: CITATION MODE]
You are an Engineering Assistant. You generally DO NOT guess.
1. **Mandatory Citation**: Every engineering claim MUST be backed by an IS Code or NBC 2016 clause.
   - *Correct*: "Concrete cover should be 20mm (IS 456, Cl. 26.4.2)."
   - *Incorrect*: "Use 20mm cover."
2. **Uncertainty**: If you cannot find the specific text in your knowledge base, you must say: "I cannot find a specific clause for this in the standard codes."
3. **Safety Warning**: For structural advice, append: "⚠️ *Consult a licensed structural engineer.*"

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
At the end of EVERY response, you must provide 3 "One-Click" follow-up options for the user. Format them as a numbered list with a specific emoji.
Example format:
---
**👉 What would you like to do next?**
1. 🔍 **Deep Dive**: "Explain the specific clause in detail."
2. 📝 **Draft Report**: "Create a summary email of this finding."
3. ✅ **Verify**: "Check this against the NBC 2016 safety standards."`;

// ... [Keep existing monitoringSystemPrompt variable] ...
const monitoringSystemPrompt = `You are an AI construction progress and site monitoring assistant for a SaaS platform.
Your role is to analyze live site data (photos, videos, sensor or manual updates) and drive a real-time project dashboard and auto-generated reports for stakeholders.

1. Inputs you may receive
You will be given one or more of:
Project context: name, location, baseline schedule, WBS, and BOQ.
BIM/2D reference info: activity IDs, element types, and planned quantities.
Live data streams: Time-stamped site photos or video frame metadata from fixed cameras, 360° cameras, drones, or mobiles.
Optional IoT / sensor summaries: equipment usage, environmental data, worker presence.
Manual text updates from engineers or supervisors.

You will not process raw pixels yourself; instead you will receive structured detections from a vision/IoT layer, such as:
{
  "timestamp": "2025-11-27T10:30:00Z",
  "source": "tower_cam_01",
  "detections": [
    {
      "element_type": "RCC_slab",
      "location": "Level_3_Zone_B",
      "status": "concrete_poured",
      "confidence": 0.94
    }
  ]
}

2. Your core tasks
For every new batch of detections and project context, you must:
Map detections to project structure
Link each detection to WBS task(s) and BOQ item(s).
If mapping is ambiguous, infer the most likely match and clearly mark it as “AI-assumed, verify”.

Update live progress
Convert detections into progress deltas: % complete per task (micro level) and % complete per BOQ item.
Recalculate overall % progress vs baseline, days ahead/behind schedule, and key risk flags.

Maintain a live dashboard state
Represent the entire dashboard as a JSON object, including:
Top KPIs: overall_progress_percent, schedule_variance_days, cost_risk_level, safety_incidents_today.
Views: project_overview, phase_view, micro_view.
Widgets: gantt_summary, boq_status, issue_log, photo_evidence.

3. Live monitoring & anomaly detection
Detect issues and anomalies (no new detections, out-of-sequence work, gaps).
Summarize issues as structured entries.
Track safety & compliance (helmet check, unsafe zones).

4. Auto-generated reports for clients
On each update, you must generate a short, client-friendly report snippet in addition to the JSON.
Structure: Executive summary, Key progress highlights, Delays/risks.

5. Output format
Always respond with a single JSON object containing at least:
{
  "dashboard_state": {
    "project_id": "...",
    "last_update": "...",
    "kpis": { ... },
    "views": { ... },
    "widgets": { ... }
  },
  "new_issues": [ ... ],
  "events_processed": [ ... ],
  "client_report_snippet": "..."
}
Use stable IDs. Clearly label approximations. Never output UI code; only data structures.`;


const handleGeminiError = (error: unknown): Error => {
    console.error("Gemini API Error:", error);
    // ... [Keep existing error handling logic] ...
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

// 1. Generate Embedding
async function getEmbedding(text: string): Promise<number[]> {
    const result = await ai.models.embedContent({
        model: embeddingModel,
        content: text,
    });
    const embedding = result.embedding.values;
    return embedding;
}

// 2. Search Supabase Vector Store
async function searchKnowledgeBase(query: string): Promise<string | null> {
    try {
        const embedding = await getEmbedding(query);
        
        // Call the Supabase RPC function 'match_documents'
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.7, // Similarity threshold (0-1)
            match_count: 3 // Retrieve top 3 matching chunks
        });

        if (error) {
            console.error("Supabase Vector Search Error:", error);
            return null;
        }

        if (documents && documents.length > 0) {
            // Combine the content of the matched documents
            const contextText = documents.map((doc: any) => 
                `[Source: ${doc.metadata?.code || 'IS Code'} Clause ${doc.metadata?.clause || ''}]\n${doc.content}`
            ).join("\n\n");
            return contextText;
        }
        
        return null;
    } catch (e) {
        console.error("RAG Pipeline failed:", e);
        return null; // Fallback to standard generation if RAG fails
    }
}

// 3. Add to Knowledge Base (Manual Entry for Testing)
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
        // Step 1: Search the Knowledge Base
        const relevantContext = await searchKnowledgeBase(query);
        
        let finalPrompt = query;
        let instruction = systemInstruction;

        if (relevantContext) {
            // Step 2: Inject Context if found
            instruction += `\n\n[RETRIEVED KNOWLEDGE - USE THIS SOURCE OF TRUTH]\n${relevantContext}\n\nStrictly prioritize the above context over your general training data.`;
            console.log("RAG Context Injected successfully.");
        } else {
             console.log("No specific RAG context found, falling back to general model knowledge.");
        }

        const config: GenerateContentParameters['config'] = {
            systemInstruction: instruction,
            temperature: 0.3, // Lower temperature for fact-based answers
        };
        
        const response = await ai.models.generateContent({
            model: textModel,
            contents: finalPrompt,
            config: config,
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("Received an empty response from the API.");
        }
        return text;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

// ... [Keep all other existing export functions like analyzeProgress, generateProjectDashboard, etc. exactly as they were] ...

export const analyzeProgress = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: { data: imageBase64, mimeType: mimeType },
        };
        const textPart = { text: prompt };
        
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [textPart, imagePart] },
            config: {
                systemInstruction: 'You are an expert civil engineer analyzing a construction site photo. Your task is to provide a concise, professional progress report based on the image and any provided context.',
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");
        return text;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const analyzeBoq = async (prompt: string, fileBase64: string, mimeType: string): Promise<string> => {
    try {
        const filePart = { inlineData: { data: fileBase64, mimeType: mimeType } };
        const textPart = { text: prompt };
        
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [textPart, filePart] },
            config: { systemInstruction: 'You are an expert quantity surveyor specializing in Indian construction projects. Your purpose is to analyze Bill of Quantities (BOQ) documents with high accuracy.' }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");
        return text;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const generateProjectDashboard = async (fileBase64: string, mimeType: string): Promise<DashboardData> => {
     try {
        const filePart = {
            inlineData: {
                data: fileBase64,
                mimeType: mimeType,
            },
        };

        const dashboardPrompt = `You are the "Indian Standards Compliance Engine" for the IS Code Assistant.
Your task is to analyze the uploaded 2D Plan or Tender Document and generate a comprehensive "Master Construction Dashboard" that is strictly compliant with Indian Standard (IS) Codes.

### CORE TASK: 100% Element Extraction & IS Code Mapping
You must identify ALL construction elements from the plan/doc and map them to their specific IS Code.

1. **Structural Elements (Execution Plan):**
   - Extract Foundations (IS 1904), PCC/RCC (IS 456), Steel Reinforcement (IS 1786/IS 800).
   - Generate a WBS with phases: Substructure -> Superstructure.
   - *Mandatory Field*: 'is_code_reference' for every task (e.g., "IS 456:2000 Cl 26").

2. **Finishing Schedule:**
   - Flooring (IS 1443/IS 302), Painting (IS 2395), Plastering (IS 1661).
   - Add these as WBS tasks or BOQ items.

3. **MEP Services (Checklist):**
   - Plumbing (IS 1172/IS 2065), Electrical wiring (IS 732), HVAC.
   - Create a specific 'mep_checklist'.

4. **Safety & Compliance (Checklist):**
   - Scaffolding (IS 3696), PPE (IS 2925), Fire Safety (NBC 2016 Part 4).
   - Create a 'safety_checklist'.

5. **BOQ Auto-Generation:**
   - Estimate quantities for Concrete (m3), Steel (kg), Brickwork (m3).
   - *Mandatory Field*: 'is_code_measurement' (e.g., "IS 1200 Part 2").
   
6. **Costing & Rates:**
   - Estimate a 'rate' (in INR) for each BOQ item based on current Indian market standards.
   - Calculate 'amount' = estimated_qty * rate.
   - Calculate 'total_budget' as the sum of all amounts.

### Output JSON Format
Return a single valid JSON object.

{
  "project_summary": {
    "title": "Project Title",
    "description": "Scope...",
    "type": "Residential/Commercial",
    "location": "City, India",
    "total_budget": "₹12,50,000",
    "cost_variance": "0%",
    "safety_score": 98
  },
  "kpis": [
     { "label": "Structural Progress", "value": "0%", "status": "neutral" },
     { "label": "Safety Compliance", "value": "100%", "status": "good" }
  ],
  "wbs": [
    {
      "id": "T1",
      "name": "Excavation for Foundation",
      "phase": "Substructure",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "status": "Not Started",
      "progress": 0,
      "quantity_unit": "cum", 
      "total_quantity": 500,
      "executed_quantity": 0,
      "is_code_reference": "IS 3764:1992",
      "compliance_check": "Compliant"
    }
  ],
  "boq_items": [
    {
      "item_id": "B1",
      "description": "M25 Grade Concrete",
      "unit": "cum",
      "estimated_qty": 150,
      "rate": 6500,
      "amount": 975000,
      "location_reference": "Columns",
      "is_code_measurement": "IS 1200 Part 2",
      "notes": "IS 456 compliant mix"
    }
  ],
  "mep_checklist": [
     { "system": "Plumbing", "description": "Water Supply Layout", "is_code": "IS 2065", "status": "Design" },
     { "system": "Electrical", "description": "Conduit Layout", "is_code": "IS 732", "status": "Design" }
  ],
  "safety_checklist": [
     { "item": "Perimeter Hoarding", "is_code": "IS 3764", "status": "Missing" }
  ],
  "risk_log": ["Check Soil Bearing Capacity (IS 1904)"]
}
`;

        const response = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [{ text: "Analyze this plan/tender and generate the ULTIMATE IS CODE COMPLIANT DASHBOARD." }, filePart] },
            config: {
                systemInstruction: dashboardPrompt,
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(text) as DashboardData;

    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateDashboardWithProgressImage = async (currentDashboard: DashboardData, imageBase64: string, mimeType: string): Promise<DashboardData> => {
     try {
        const imagePart = { inlineData: { data: imageBase64, mimeType: mimeType } };
        const prompt = `
        You are an expert AI site engineer.
        Input 1: Current Project WBS/Schedule (JSON): ${JSON.stringify(currentDashboard.wbs)}
        Input 2: Site Photo (Attached)
        Task:
        1. Analyze the site photo to determine the progress of visible tasks.
        2. Update 'progress' %, 'status', and 'executed_quantity'.
        3. Recalculate KPIs.
        Output: Return the ENTIRE 'DashboardData' JSON object.
        `;
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [{ text: prompt }, imagePart] },
            config: { responseMimeType: 'application/json' }
        });
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(text) as DashboardData;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const generate3DAndCameraPlan = async (fileBase64: string, mimeType: string): Promise<ThreeDAnalysisData> => {
     try {
        const imagePart = { inlineData: { data: fileBase64, mimeType: mimeType } };
        const prompt = `
        You are an expert Construction Technology specialist. Analyze this 2D Floor Plan.
        Task 1: 3D Structure Inference (Heights, Volumes).
        Task 2: AI Monitoring Camera Placement (Location, Type, Reason).
        Task 3: Identify Missing Info questions.
        Output JSON format matching ThreeDAnalysisData type.
        `;
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [{ text: prompt }, imagePart] },
            config: { responseMimeType: 'application/json' }
        });
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(text) as ThreeDAnalysisData;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateDashboardViaChat = async (currentDashboard: DashboardData, userMessage: string): Promise<ProjectChatResponse> => {
    try {
        const prompt = `
        You are an intelligent Construction Project Assistant.
        Context: ${JSON.stringify(currentDashboard)}
        Request: "${userMessage}"
        Responsibilities:
        1. Check Location.
        2. Strict IS Code Compliance Check (IS 456, IS 800, etc.).
        3. Data Modification (update quantities, dates).
        Output JSON: { "responseText": "...", "updatedDashboard": { ... } }
        `;
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(text) as ProjectChatResponse;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateMonitoringDashboard = async (currentState: any, newEvents: any): Promise<MonitoringDashboardData> => {
    try {
        const inputPrompt = `
        Current Dashboard State: ${JSON.stringify(currentState || {})}
        New Events: ${JSON.stringify(newEvents)}
        Update dashboard state, KPIs, widgets, and generate report.
        Return JSON.
        `;
        const response = await ai.models.generateContent({
            model: textModel,
            contents: inputPrompt,
            config: { systemInstruction: monitoringSystemPrompt, responseMimeType: 'application/json' }
        });
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(text) as MonitoringDashboardData;
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const generateMarketingPrompt = async (description: string): Promise<string> => {
     try {
        const prompt = `Generate a detailed AI image prompt for: "${description}"`;
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: { temperature: 0.7 },
        });
        return response.text || '';
    } catch (error) {
        throw handleGeminiError(error);
    }
};
