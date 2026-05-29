import { DashboardData } from '../../types';

export interface HistoryEntry {
    id: string;
    timestamp: number;
    score: number;
    level: string;
    confidence: number;
    fullName: string;
    profileType: string;
    strengths: string[];
    risks: string[];
    migrationReadiness?: number;
    data: DashboardData; // Store the full data for detailed comparison if needed
}

export interface ComparisonResult {
    previous: HistoryEntry;
    current: HistoryEntry;
    scoreDiff: number;
    confidenceDiff: number;
    improvementAreas: string[];
    risksReduced: string[];
    newStrengths: string[];
    newRisks: string[];
}
