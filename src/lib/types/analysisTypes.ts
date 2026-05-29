export interface IdentityAgentOutput {
    identity_reliability: number;
    document_coherence: number;
    timeline_consistency: number;
    risk_flags: string[];
    evidence: string[];
    confidence: number;
    uncertainty_factors: string[];
    missing_information: string[];
    evidence_strength: number;
}

export interface FinancialAgentOutput {
    financial_stability: number;
    income_reliability: number;
    migration_resilience: number;
    risk_factors: string[];
    evidence: string[];
    confidence: number;
    uncertainty_factors: string[];
    missing_information: string[];
    evidence_strength: number;
}

export interface FraudAgentOutput {
    fraud_risk: number;
    contradiction_score: number;
    risk_patterns: { pattern: string; severity: number; confidence: number; evidence: string[] }[];
    contradictions: { type: string; description: string; severity: number; confidence: number; supporting_evidence: string[] }[];
    confidence: number;
    uncertainty_factors: string[];
    missing_information: string[];
    evidence_strength: number;
}

export interface CountryAgentOutput {
    country_transferability: number;
    economic_adaptability: number;
    destination_alignment: number;
    country_risks: string[];
    country_strengths: string[];
    affordability_index: number;
    profession_portability: number;
    migration_realism: number;
    remote_work_compatibility: number;
    confidence: number;
    uncertainty_factors: string[];
    missing_information: string[];
    evidence_strength: number;
}

export interface BehavioralAgentOutput {
    behavioral_consistency: number;
    narrative_stability: number;
    interaction_reliability: number;
    stability_signals: string[];
    risk_signals: string[];
    consistency_patterns: string[];
    confidence: number;
    uncertainty_factors: string[];
    missing_information: string[];
    evidence_strength: number;
}

export interface AnalysisIntegrity {
    evidence_quality: number;
    reasoning_stability: number;
    contradiction_severity: number;
    uncertainty_level: number;
}

export interface DossierAnalysis {
    financial_identity_profile: {
        profile_type: string;
        overall_integrity_level: string;
        cross_border_readiness: string;
        financial_resilience_level: string;
        trust_assessment: string;
    };
    behavioral_summary: {
        overall_stability: string;
        consistency_observations: string[];
        interaction_strengths: string[];
        interaction_risks: string[];
    };
    financial_pathway_summary: {
        top_improvement_priorities: string[];
        highest_impact_changes: string[];
        recommended_next_steps: string[];
        long_term_strengthening_areas: string[];
    };
    score_explanation: {
        score_increase_factors: string[];
        score_decrease_factors: string[];
        most_influential_factors: string[];
    };
    strengths: {
        title: string;
        description: string;
        confidence: number;
    }[];
    risks: {
        title: string;
        description: string;
        severity: number;
        confidence: number;
    }[];
    uncertainty_analysis: {
        high_uncertainty_areas: string[];
        missing_information: string[];
        recommended_additional_evidence: string[];
    };
    cross_border_analysis: {
        migration_readiness: number;
        economic_adaptability: number;
        destination_alignment: number;
        cross_border_strengths: string[];
        cross_border_risks: string[];
    };
    evidence_summary: {
        strongest_evidence: string[];
        weakest_evidence: string[];
        evidence_quality: number;
    };
    recommendations: {
        high_impact_actions: {
            title: string;
            description: string;
            expected_impact: number;
            confidence: number;
            priority: 'high' | 'medium' | 'low';
        }[];
        documentation_improvements: string[];
        financial_stability_improvements: string[];
        cross_border_readiness_improvements: string[];
        trust_profile_improvements: string[];
        missing_evidence_recommendations: string[];
        risk_reduction_actions: {
            risk: string;
            recommended_action: string;
            expected_risk_reduction: number;
        }[];
    };
}

export interface FinalSynthesisOutput {
    financial_identity_profile: {
        profile_type: string;
        overall_integrity_level: string;
        trust_assessment: string;
        professional_stability: string;
    };
    aggregated_strengths: string[];
    aggregated_risks: string[];
    aggregated_uncertainties: string[];
    cross_border_summary: {
        migration_readiness: number;
        economic_adaptability: number;
        transferability_feasibility: string;
    };
    behavioral_summary: {
        interaction_stability_score: number;
        narrative_consistency: string;
    };
    evidence_summary: {
        primary_evidence_sources: string[];
        evidence_gap_count: number;
    };
    score_explanation: {
        top_positive_drivers: string[];
        top_negative_drivers: string[];
    };
    recommendation_summary: string[];
    overall_confidence: number;
    analysis_integrity: AnalysisIntegrity;
    dossier_markdown: string;
    summary_statement: string;
    
    // Legacy mapping support
    major_strengths: string[];
    major_risks: string[];
    uncertainties: string[];
    missing_information: string[];
    uncertainty_analysis: {
        overall_uncertainty: number;
        high_uncertainty_areas: string[];
        moderate_uncertainty_areas: string[];
        low_uncertainty_areas: string[];
        missing_critical_information: string[];
        weak_evidence_areas: string[];
        strong_evidence_areas: string[];
    };
    dossier: string;
    summaryStatement: string;
    level: string;
    reasonCodes: any[];
    dossier_analysis: DossierAnalysis;
    agent_summary?: {
        identity: IdentityAgentOutput;
        financial: FinancialAgentOutput;
        fraud: FraudAgentOutput;
        country: CountryAgentOutput;
        behavioral: BehavioralAgentOutput;
    };
    score?: number;
    analysis_status?: 'success' | 'limited_confidence' | 'unreliable';
    score_breakdown?: any;
}
