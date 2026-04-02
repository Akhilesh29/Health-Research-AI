export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PossibleCondition {
  name: string;
  likelihood: 'low' | 'medium' | 'high';
  description: string;
}

export interface AIAnalysis {
  summary: string;
  possibleConditions: PossibleCondition[];
  recommendations: string[];
  urgencyLevel: 'low' | 'moderate' | 'high' | 'emergency';
  urgencyExplanation: string;
  disclaimer: string;
  whenToSeeDoctor: string[];
  selfCareTips: string[];
}

export interface SymptomCheck {
  id: string;
  userId: string;
  symptoms: string[];
  age?: number;
  gender?: string;
  severity?: string;
  duration?: string;
  analysis: AIAnalysis;
  urgencyLevel: string;
  createdAt: string;
}

export interface SymptomCheckInput {
  symptoms: string[];
  age?: number;
  gender?: string;
  severity?: string;
  duration?: string;
}

export interface PaginatedChecks {
  checks: SymptomCheck[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Stats {
  total: number;
  urgencyBreakdown: Record<string, number>;
  recentChecks: Array<{
    id: string;
    symptoms: string[];
    urgencyLevel: string;
    createdAt: string;
  }>;
}

export interface NearbyCarePlace {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  openInMapsUrl: string;
}

export interface NearbyCareResponse {
  careType: 'doctor' | 'hospital' | 'emergency';
  center: { lat: number; lng: number };
  count: number;
  places: NearbyCarePlace[];
}
