import { DashboardData, HistoryEntry, ComparisonResult } from '../types';

const HISTORY_KEY = 'transferscore_history';

export const saveToHistory = (data: DashboardData) => {
    try {
        const history = getHistory();
        const newEntry: HistoryEntry = {
            id: data.shareId || Math.random().toString(36).substring(2, 11),
            timestamp: data.generatedAt || Date.now(),
            score: data.score,
            level: data.level,
            confidence: data.confidence,
            fullName: data.fullName || 'Verified Applicant',
            profileType: data.dossier_analysis?.financial_identity_profile?.profile_type || 'General',
            strengths: (data.dossier_analysis?.strengths || []).map(s => s.title),
            risks: (data.dossier_analysis?.risks || []).map(r => r.title),
            migrationReadiness: data.dossier_analysis?.cross_border_analysis?.migration_readiness,
            data: data
        };

        // Don't save if the last entry is the same (based on timestamp or shareId)
        if (history.length > 0 && (history[0].id === newEntry.id || history[0].timestamp === newEntry.timestamp)) {
            return history;
        }

        const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep last 20 entries
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    } catch (e) {
        console.error('Failed to save to history:', e);
        return [];
    }
};

export const getHistory = (): HistoryEntry[] => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        if (!historyJson) return [];
        return JSON.parse(historyJson);
    } catch (e) {
        console.error('Failed to load history:', e);
        return [];
    }
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};

export const compareEntries = (previous: HistoryEntry, current: HistoryEntry): ComparisonResult => {
    const scoreDiff = current.score - previous.score;
    const confidenceDiff = current.confidence - previous.confidence;

    const improvementAreas: string[] = [];
    if (scoreDiff > 0) improvementAreas.push('Overall Score Integrity');
    if (confidenceDiff > 0) improvementAreas.push('Data Precision & Confidence');
    
    // Risks reduced
    const risksReduced = previous.risks.filter(r => !current.risks.includes(r));
    
    // New strengths
    const newStrengths = current.strengths.filter(s => !previous.strengths.includes(s));
    
    // New risks
    const newRisks = current.risks.filter(r => !previous.risks.includes(r));

    return {
        previous,
        current,
        scoreDiff,
        confidenceDiff,
        improvementAreas,
        risksReduced,
        newStrengths,
        newRisks
    };
};
