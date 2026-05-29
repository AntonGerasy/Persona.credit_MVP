import { Type } from '@google/genai';

export const globalAntiHallucinationRules = `
STRICT ANTI-HALLUCINATION RULES:
1. Reason ONLY from provided data context.
2. If evidence is missing, state "Evidence Missing" — do NOT infer or guess.
3. Never invent passport numbers, bank balances, or transaction IDs.
4. Use institutional, analytical language.
5. Return STRICT JSON. No markdown. No conversational text.
`;

export const sanitizeJsonResponse = (text: string): string => {
    let sanitized = text.trim();
    if (sanitized.includes('```')) {
        const match = sanitized.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) sanitized = match[1];
    }
    const firstBrace = sanitized.indexOf('{');
    const lastBrace = sanitized.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        sanitized = sanitized.substring(firstBrace, lastBrace + 1);
    }
    return sanitized;
};

export const validateAgentResponse = (data: any, schema: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    if (!schema || !schema.required) return true;

    for (const field of schema.required) {
        if (data[field] === undefined) return false;
    }

    if (schema.properties) {
        for (const [key, value] of Object.entries(schema.properties)) {
            const propSchema = value as any;
            const actualValue = data[key];
            
            if (actualValue !== undefined) {
                if (propSchema.type === Type.NUMBER && typeof actualValue !== 'number') return false;
                if (propSchema.type === Type.STRING && typeof actualValue !== 'string') return false;
                if (propSchema.type === Type.BOOLEAN && typeof actualValue !== 'boolean') return false;
                if (propSchema.type === Type.ARRAY && !Array.isArray(actualValue)) return false;
            }
        }
    }
    return true;
};

export const getSafeFallback = (schema: any): any => {
    const fallback: any = {
        analysis_status: 'partial_failure',
        confidence: 0.1,
        missing_information: ["Reliable intelligence stream interrupted"],
        error_recovery_used: true,
        evidence_strength: 10
    };

    if (schema && schema.properties) {
        for (const [key, value] of Object.entries(schema.properties)) {
            const propSchema = value as any;
            if (fallback[key] !== undefined) continue;

            if (propSchema.type === Type.NUMBER) fallback[key] = 30;
            else if (propSchema.type === Type.STRING) fallback[key] = "Data Unavailable";
            else if (propSchema.type === Type.ARRAY) fallback[key] = [];
            else if (propSchema.type === Type.OBJECT) fallback[key] = {};
            else if (propSchema.type === Type.BOOLEAN) fallback[key] = false;
        }
    }
    return fallback;
};
