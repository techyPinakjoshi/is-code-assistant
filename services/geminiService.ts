import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { DashboardData, MonitoringDashboardData, ProjectChatResponse } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const textModel = 'gemini-3-pro-preview';
const visionModel = 'gemini-2.5-flash';

const systemInstruction = `You are an expert civil engineer specializing in Indian Standard (IS) codes for construction. Your purpose is to provide detailed, accurate, and practical information on construction processes, material specifications, testing procedures, and auditing codes for various civil engineering structures in India.

When a user asks a question:
1.  You must answer based on the relevant and latest IS codes.
2.  Cite the specific IS code numbers (e.g., IS 456:2000, IS 800:2007) whenever possible and relevant.
3.  Format your answers clearly using Markdown. Use headings, bold text, bullet points, and tables for better readability and structure.
4.  Provide practical explanations that a site engineer or student could easily understand.
5.  If a question is ambiguous, ask for clarification or provide the most common interpretation.
6.  If the user asks to perform an action related to an available tool, you must use that tool.`;

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


/**
 * Handles errors from the Gemini API and returns a user-friendly Error object.
 * @param error The error caught from the API call.
 * @returns An Error object with a user-friendly message.
 */
const handleGeminiError = (error: unknown): Error => {
    console.error("Gemini API Error:", error);

    let message = "An unknown error occurred while communicating with the AI service. Please check your connection and try again.";

    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Check for specific error messages from the SDK
        if (errorMessage.includes('api key not valid')) {
            message = "The provided API key is invalid or has expired. Please ensure it is configured correctly in your environment.";
        } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
            message = "You have exceeded your API request quota. Please check your plan and billing details, or try again later.";
        } else if (errorMessage.includes('400 bad request')) {
            message = "The request was malformed. This could be due to an invalid file format, a file that is too large, or a problem with the prompt.";
        } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
            message = "The AI service is currently experiencing issues or is temporarily unavailable. Please try again in a few moments.";
        } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
            message = "The request was blocked due to safety settings. Please modify your input and try again.";
        } else {
             // Use the original error message if it's not one of the caught cases but still an Error instance
            message = error.message;
        }
    }

    return new Error(message);
};


export const getConstructionInfo = async (query: string): Promise<string> => {
    try {
        const config: GenerateContentParameters['config'] = {
            systemInstruction: systemInstruction,
            temperature: 0.5,
        };
        
        const response = await ai.models.generateContent({
            model: textModel,
            contents: query,
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

export const analyzeProgress = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: prompt,
        };
        
        const response = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [textPart, imagePart] },
            config: {
                systemInstruction: 'You are an expert civil engineer analyzing a construction site photo. Your task is to provide a concise, professional progress report based on the image and any provided context.',
            }
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

export const analyzeBoq = async (prompt: string, fileBase64: string, mimeType: string): Promise<string> => {
    try {
        const filePart = {
            inlineData: {
                data: fileBase64,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: prompt,
        };
        
        const response = await ai.models.generateContent({
            model: visionModel, // 'gemini-2.5-flash'
            contents: { parts: [textPart, filePart] },
            config: {
                systemInstruction: 'You are an expert quantity surveyor specializing in Indian construction projects. Your purpose is to analyze Bill of Quantities (BOQ) documents with high accuracy.',
            }
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

export const generateProjectDashboard = async (fileBase64: string, mimeType: string): Promise<DashboardData> => {
    try {
        const filePart = {
            inlineData: {
                data: fileBase64,
                mimeType: mimeType,
            },
        };

        const dashboardPrompt = `You are an expert construction project planner and AI product assistant for an app called “IS Code Assistant”.
Your task is to help create a smart, user-friendly, and highly detailed construction progress dashboard when a user uploads project files.

### 1. Inputs you will receive
The user is uploading a 2D design drawing (PDF or Image).

Always:
1. Parse and interpret the 2D design to understand:
   - Project type (building, road, bridge, industrial, etc.)
   - Main components (floors, structural elements, rooms/zones, key activities).
2. Infer a **draft BOQ** from the design using standard construction breakdown: excavation, foundations, superstructure, finishes, services, etc.

### 2. Project plan generation logic
1. Break the project into a **work breakdown structure (WBS)**.
2. Estimate for each activity: Start/end (relative), Dependencies.
3. Propose a **Gantt-style plan**.

### 3. BOQ generation logic
1. Identify major elements.
2. Generate a **draft BOQ** with Item code, Unit, Estimated Qty.

### 4. Output Format
Return a single valid JSON object. Do not include markdown code blocks (like \`\`\`json). The structure must be exactly:

{
  "project_summary": {
    "title": "Project Title inferred from file",
    "description": "Brief description...",
    "type": "Residential/Commercial/Infrastructure",
    "location": ""
  },
  "kpis": [
     { "label": "Overall Progress", "value": "0%", "status": "neutral" },
     { "label": "Planned Duration", "value": "X Months", "status": "neutral" }
  ],
  "wbs": [
    {
      "id": "T1",
      "name": "Site Clearing",
      "phase": "Mobilization",
      "startDate": "2024-01-01",
      "endDate": "2024-01-10",
      "status": "Not Started",
      "progress": 0
    }
    ... more tasks
  ],
  "boq_items": [
    {
      "item_id": "B1",
      "description": "Earthwork in excavation",
      "unit": "cum",
      "estimated_qty": 500,
      "location_reference": "Foundation",
      "notes": "AI Estimate"
    }
    ... more items
  ],
  "risk_log": ["Risk 1", "Risk 2"]
}
`;

        const response = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [{ text: "Analyze this plan and generate the dashboard JSON." }, filePart] },
            config: {
                systemInstruction: dashboardPrompt,
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("Received an empty response from the API.");
        }
        
        // Parse JSON
        try {
            return JSON.parse(text) as DashboardData;
        } catch (e) {
            console.error("Failed to parse JSON", text);
            throw new Error("AI returned invalid data structure. Please try again.");
        }

    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateDashboardWithProgressImage = async (currentDashboard: DashboardData, imageBase64: string, mimeType: string): Promise<DashboardData> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const prompt = `
        You are an expert AI site engineer.
        
        Input 1: Current Project WBS/Schedule (JSON):
        ${JSON.stringify(currentDashboard.wbs)}

        Input 2: Site Photo (Attached)

        Task:
        1. Analyze the site photo to determine the progress of visible tasks.
        2. Update the 'progress' percentage (0-100) and 'status' ('Not Started', 'In Progress', 'Completed', 'Delayed') of the matching tasks in the WBS.
        3. Recalculate the "Overall Progress" KPI in the project summary based on these new task percentages.
        
        Output:
        Return the ENTIRE 'DashboardData' JSON object with the updated WBS and KPIs.
        Preserve all other data (BOQ, Summary, etc.) exactly as is.
        `;

        const response = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [{ text: prompt }, imagePart] },
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");

        try {
            return JSON.parse(text) as DashboardData;
        } catch (e) {
            throw new Error("AI failed to return valid JSON for progress update.");
        }

    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateDashboardViaChat = async (currentDashboard: DashboardData, userMessage: string): Promise<ProjectChatResponse> => {
    try {
        const prompt = `
        You are an intelligent Construction Project Assistant integrated into a Project Dashboard.
        
        ### Context:
        Current Project Data (JSON): ${JSON.stringify(currentDashboard)}
        
        ### User Request:
        "${userMessage}"

        ### Your CORE Responsibilities:
        1. **Location Check**: If the 'project_summary.location' field is empty or generic, you MUST ask the user for the specific project location (City/State) in your response BEFORE applying major engineering changes. This is crucial for determining the applicable local codes (e.g., wind speed, seismic zone).
        
        2. **IS Code Compliance**: You must strictly adhere to Indian Standard (IS) Codes.
           - If the user asks to change a quantity, schedule, or material specification, verify if it complies with relevant codes (e.g., IS 456 for concrete, IS 800 for steel).
           - **Violations**: If a user's request violates a code (e.g., "Remove curing time", "Use M10 grade for structural columns"), you must REFUSE the change in the JSON, explain the violation in the text, and SUGGEST the compliant alternative.
           - **Approvals**: If the change is compliant, explicitly state "Aligned with IS [Code Number]" in your response.

        3. **Data Modification**: 
           - Only return an 'updatedDashboard' object if the request is safe, compliant, and specific.
           - If you need more info (location, soil type, building class), ask for it in 'responseText' and return 'updatedDashboard': null.

        ### Output Format:
        Return a single JSON object (no markdown):
        {
            "responseText": "Your conversational response here. Be professional. Cite IS codes. If asking for location, be clear.",
            "updatedDashboard": { ... } // ONLY include this field if you actually modified the data. If no changes, omit or set to null.
        }
        `;

        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");

        try {
            return JSON.parse(text) as ProjectChatResponse;
        } catch (e) {
            throw new Error("Invalid JSON from AI Chat");
        }

    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const updateMonitoringDashboard = async (currentState: any, newEvents: any): Promise<MonitoringDashboardData> => {
    try {
        const inputPrompt = `
        Current Dashboard State (if any): ${JSON.stringify(currentState || {})}
        
        New Site Events/Detections: ${JSON.stringify(newEvents)}
        
        Based on these new events, update the dashboard state, KPIs, widgets, and generate a client report snippet.
        Return ONLY valid JSON matching the schema defined in the system prompt.
        `;

        const response = await ai.models.generateContent({
            model: textModel, // Text model is sufficient for processing JSON logic
            contents: inputPrompt,
            config: {
                systemInstruction: monitoringSystemPrompt,
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");

        try {
            return JSON.parse(text) as MonitoringDashboardData;
        } catch (e) {
            throw new Error("Invalid JSON from AI");
        }
    } catch (error) {
        throw handleGeminiError(error);
    }
};

export const generateMarketingPrompt = async (description: string): Promise<string> => {
    try {
        const prompt = `You are an expert creative director and prompt engineer. Your task is to generate a highly detailed, professional, and creative prompt for an AI image generator (like Midjourney, DALL-E 3, or Stable Diffusion) based on the user's description.

User Description: "${description}"

Output ONLY the prompt text.`;

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
