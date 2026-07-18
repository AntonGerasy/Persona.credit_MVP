import { DashboardData, HistoryEntry, ComparisonResult } from '../types';
import { storage } from './storage';
import { getSession } from './session';

const HISTORY_KEY = 'transferscore_history';

// v34.14: history is no longer device-local only. Each entry is ALSO written to
// KV under pc:history:{email}:{timestamp} (the /api/kv rules from v34.13 already
// authorize exactly this prefix per user). localStorage stays as the synchronous
// read cache so Dashboard's getHistory() keeps working unchanged; hydrateHistory()
// merges KV entries into that cache on login.

const kvHistoryPrefix = (): string | null => {
    const s = getSession();
    return s && s.kind === 'user' ? `pc:history:${s.email}:` : null;
};

// Fire-and-forget KV write of one history entry (non-fatal on failure).
const pushHistoryToKV = (entry: HistoryEntry): void => {
    const prefix = kvHistoryPrefix();
    if (!prefix) return;
    storage.set(`${prefix}${entry.timestamp}`, entry).catch((err) => {
        console.warn('History KV push failed (local history retained):', err);
    });
};

// Merge KV history into the localStorage cache. Fetches ONLY entries whose
// timestamps are not already cached (usually 0-2 network calls).
export const hydrateHistory = async (): Promise<void> => {
    const prefix = kvHistoryPrefix();
    if (!prefix) return;
    try {
        const keys = await storage.keys(prefix);
        if (!Array.isArray(keys) || keys.length === 0) return;
        const local = getHistory();
        const localTs = new Set(local.map((e) => e.timestamp));
        const missing = keys
            .map((k) => ({ key: k, ts: Number(k.slice(prefix.length)) }))
            .filter((x) => Number.isFinite(x.ts) && !localTs.has(x.ts))
            .sort((a, b) => b.ts - a.ts)
            .slice(0, 20);
        if (missing.length === 0) return;
        const fetched = await Promise.all(missing.map((x) => storage.get(x.key).catch(() => null)));
        const merged = [
            ...fetched.filter((e): e is HistoryEntry => !!e && typeof e === 'object' && typeof (e as any).timestamp === 'number'),
            ...local,
        ]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
    } catch (err) {
        console.warn('History hydrate from KV failed (local history retained):', err);
    }
};

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
        pushHistoryToKV(newEntry); // v34.14: cross-device persistence
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
