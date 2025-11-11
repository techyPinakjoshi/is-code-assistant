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
  usage: {
    queriesToday: number;
    maxQueries: number | typeof Infinity;
  };
};
