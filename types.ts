
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

export interface WBSTask {
  id: string;
  name: string;
  phase: string;
  startDate: string;
  endDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  progress: number;
  dependencies?: string[];
}

export interface BOQItem {
  item_id: string;
  description: string;
  unit: string;
  estimated_qty: number;
  location_reference: string;
  notes?: string;
}

export interface DashboardData {
  project_summary: {
    title: string;
    description: string;
    type: string;
    location?: string;
  };
  plan_base64?: string; // Added to persist the 2D plan image
  kpis: KPI[];
  wbs: WBSTask[];
  boq_items: BOQItem[];
  risk_log?: string[];
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