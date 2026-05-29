import { Type } from '@google/genai';

export const behavioralSchema = {
    type: Type.OBJECT,
    properties: {
        behavioral_consistency: { type: Type.NUMBER },
        narrative_stability: { type: Type.NUMBER },
        interaction_reliability: { type: Type.NUMBER },
        stability_signals: { type: Type.ARRAY, items: { type: Type.STRING } },
        risk_signals: { type: Type.ARRAY, items: { type: Type.STRING } },
        consistency_patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
        confidence: { type: Type.NUMBER },
        uncertainty_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing_information: { type: Type.ARRAY, items: { type: Type.STRING } },
        evidence_strength: { type: Type.NUMBER }
    },
    required: ["behavioral_consistency", "narrative_stability", "interaction_reliability", "stability_signals", "risk_signals", "consistency_patterns", "confidence", "uncertainty_factors", "missing_information", "evidence_strength"]
};

export const behavioralPromptBase = `AGENT 5 — Behavioral Consistency Analyst.
Evaluate the internal narrative stability and interaction logic.
Focus on: Claim volatility, response coherence, and logic stability.`;
