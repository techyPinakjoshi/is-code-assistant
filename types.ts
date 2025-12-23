
export type Category = 'Buildings' | 'Roads' | 'Dams' | 'Water Tanks' | 'Material Testing' | 'Structural Audits' | 'Bridges & Culverts' | 'Pipelines & Drainage' | 'Electrical Systems' | 'Fire Safety' | 'Earthquake Resistance' | 'Wind Load Analysis';

export type PlanId = 'free' | 'pro' | 'business' | 'enterprise';

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  priceAmount: number;
  pricePeriod: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
};

export type User = {
  name: string;
  email: string;
  planId: PlanId;
  planName: string;
  planExpiry?: string; 
  joinedAt?: string; // Added to track signup date
  usage: {
    queriesToday: number;
    maxQueries: number | typeof Infinity;
  };
};

// Dashboard Types
export interface KPI {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical' | 'neutral';
  trend?: string;
}

export interface TaskUpdateLog {
    id: string;
    date: string;
    comment: string;
    photo_base64?: string;
    quantity_added?: number;
    user_name?: string;
}

export interface WBSTask {
  id: string;
  name: string;
  phase: string; // e.g., Structural, Finishing
  startDate: string;
  endDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  progress: number; // Percentage 0-100
  dependencies?: string[];
  
  // IS Code Compliance
  is_code_reference: string; // e.g., "IS 456:2000"
  compliance_check: 'Compliant' | 'Non-Compliant' | 'Pending Review';

  // Quantitative Tracking
  quantity_unit?: string; // e.g., 'm3', 'sqft', 'nos'
  total_quantity?: number; // Estimated total
  executed_quantity?: number; // Actual done
  
  updates?: TaskUpdateLog[];
}

export interface BOQItem {
  item_id: string;
  description: string;
  unit: string;
  estimated_qty: number;
  rate?: number; // Estimated rate
  amount?: number; // Total amount
  location_reference: string;
  is_code_measurement: string; // e.g. "IS 1200 Part 1"
  notes?: string;
}

export interface MEPItem {
    system: 'Plumbing' | 'Electrical' | 'HVAC' | 'Fire';
    description: string;
    is_code: string; // e.g., IS 1172, IS 732
    status: 'Design' | 'Installed' | 'Tested';
}

export interface SafetyItem {
    item: string;
    is_code: string; // e.g., IS 3696
    status: 'Compliant' | 'Missing' | 'N/A';
}

export interface CameraRecommendation {
    id: string;
    location: string;
    type: 'Dome' | 'Bullet' | 'PTZ' | '360';
    reason: string;
    coverage_area: string;
}

export interface ThreeDAnalysisData {
    structure_description: string;
    estimated_height: string;
    key_volumes: string[];
    camera_recommendations: CameraRecommendation[];
    questions_to_ask: string[]; // Questions AI needs to ask user for better 3D accuracy
}

export interface DashboardData {
  project_summary: {
    title: string;
    description: string;
    type: string;
    location?: string;
    total_budget?: string; // e.g., "₹12.5 Cr"
    cost_variance?: string; // e.g., "+2%"
    safety_score?: number; // 0-100
  };
  plan_base64?: string; // Added to persist the 2D plan image
  kpis: KPI[];
  wbs: WBSTask[];
  boq_items: BOQItem[];
  mep_checklist?: MEPItem[]; // New MEP section
  safety_checklist?: SafetyItem[]; // New Safety section
  risk_log?: string[];
  three_d_analysis?: ThreeDAnalysisData; 
}

// Chat Types
export interface ProjectChatResponse {
  responseText: string;
  updatedDashboard?: DashboardData;
}

// Storage Types
export interface SavedProject {
    id: string;
    userId?: string;
    name: string;
    date: string;
    lastModified?: string; // Added to track save time
    data: DashboardData;
}

export interface SavedChat {
    id: string;
    userId?: string;
    query: string;
    response: string;
    date: string;
}

// Monitoring Types
export interface MonitoringKPIs {
    overall_progress_percent: number;
    schedule_variance_days: number;
    cost_risk_level: string;
    safety_incidents_today: number;
}

export interface MonitoringIssue {
    issue_id: string;
    related_task_id: string;
    type: string;
    severity: string;
    description: string;
    suggested_action: string;
}

export interface MonitoringDashboardData {
    dashboard_state: {
        project_id: string;
        last_update: string;
        kpis: MonitoringKPIs;
        views: any;
        widgets: {
            gantt_summary: any[];
            boq_status: any[];
            issue_log: MonitoringIssue[];
            photo_evidence: any[];
        };
    };
    new_issues: MonitoringIssue[];
    events_processed: any[];
    client_report_snippet: string;
}
