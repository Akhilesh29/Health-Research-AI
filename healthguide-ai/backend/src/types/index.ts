import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface SymptomCheckInput {
  symptoms: string[];
  age?: number;
  gender?: string;
  severity?: string;
  duration?: string;
}

export interface AIAnalysisResult {
  summary: string;
  possibleConditions: Array<{
    name: string;
    likelihood: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
  urgencyLevel: 'low' | 'moderate' | 'high' | 'emergency';
  urgencyExplanation: string;
  disclaimer: string;
  whenToSeeDoctor: string[];
  selfCareTips: string[];
}
