import type { IdentityAgentOutput, FinancialAgentOutput, FraudAgentOutput, CountryAgentOutput, BehavioralAgentOutput, AnalysisIntegrity, DossierAnalysis, FinalSynthesisOutput } from './lib/types/analysisTypes';
import type { HistoryEntry, ComparisonResult } from './lib/types/historyTypes';
export type { IdentityAgentOutput, FinancialAgentOutput, FraudAgentOutput, CountryAgentOutput, BehavioralAgentOutput, AnalysisIntegrity, DossierAnalysis, FinalSynthesisOutput, HistoryEntry, ComparisonResult };

export interface FieldOption {
    id: string;
    label: string;
}

export interface RepeaterItemSchema {
    fields: Field[];
}

export interface Field {
    id:string;
    label: string;
    type: 'text' | 'date' | 'country' | 'email' | 'phone' | 'textarea' | 'file' | 'number' | 'select' | 'toggle' | 'repeater' | 'checkbox';
    required?: boolean;
    required_if?: Record<string, any>;
    accept?: string[];
    multiple?: boolean;
    min?: number;
    max?: number;
    step?: number;
    options?: FieldOption[];
    item_schema?: RepeaterItemSchema;
    tooltip?: string;
    datalistId?: string;
    forensicScan?: boolean;
    subLabel?: string;
    placeholder?: string;
}

export interface Section {
    id: string;
    title: string;
    description?: string;
    fields: Field[];
    variant?: 'origin' | 'us';
}

export interface FormSchema {
    title: string;
    language: string;
    sections: Section[];
}

export interface FileData {
    id: string;
    file: File;
    validationStatus?: 'validating' | 'valid' | 'invalid' | 'error';
    validationReason?: string;
}

export interface RepeaterItem {
    id:string;
    [key: string]: any;
}

export type RepeaterData = RepeaterItem[];

export interface FormData {
    [key: string]: any;
}

export interface ValidationErrors {
    [key: string]: string;
}

// --- User Dashboard Types ---

export interface CountryContext {
    countryName: string;
    medianIncomePPP: number;
    costOfLivingIndex: number;
    inflation: number;
    unemployment: number;
}

export interface ReasonCode {
    label: string;
    impact: 'Positive' | 'Negative' | 'Neutral';
}

export interface AnalyzedDocument {
    documentType: string;
    trustLevel: number;
    status: string;
    notes: string;
    statementPeriod?: string;
    monthlyNetIncome?: number;
    totalInflow?: number;
    endingBalance?: number;
    consistencyScore?: number;
}

export interface Recommendation {
    text: string;
    predictedGain: number;
}

export interface UseCaseAssessment {
    score: number;
    label: string;
}

export interface ScoreBreakdownExtended {
    identityScore: number;
    incomeScore: number;
    paymentScore: number;
    savingsScore: number;
    housingScore: number;
    crossBorderScore: number;
}

export interface UseCases {
    renting: UseCaseAssessment;
    loan: UseCaseAssessment;
    auto: UseCaseAssessment;
    banking: UseCaseAssessment;
}

export interface PartnerOffer {
    id: string;
    providerId: string;
    providerName: string; // Denormalized for easy display
    title: string;
    description: string;
    minTransferScore: number;
    minConfidence: number;
    regions: string[];
    status: 'draft' | 'published' | 'archived';
    hasApplied: boolean;
}

export interface SimulationResult {
    predictedScore: number;
    reasoning: string;
}

export interface UnderwritingPillars {
    purchasingPowerEquivalence: number;
    stabilityScore: number;
    inflationDefenseFactor: 'Positive' | 'Neutral' | 'Negative';
    transferabilityIndex: number;
}

export interface ScoringAnalysis {
    identity_reliability: number;
    financial_stability: number;
    migration_resilience: number;
    fraud_risk: number;
    behavioral_consistency: number;
    country_transferability: number;
    confidence: number;
    strengths: string[];
    risks: string[];
    missing_information: string[];
    evidence: {
        category: string;
        claim: string;
        supporting_evidence: string[];
        source: string;
        confidence: number;
    }[];
    evidence_quality: {
        overall_quality: number;
        missing_critical_evidence: string[];
        weak_evidence_areas: string[];
        strong_evidence_areas: string[];
    };
    fraud_risk_score: number;
    contradiction_score: number;
    overall_integrity_risk: number;
    contradictions: {
        type: string;
        description: string;
        severity: number;
        confidence: number;
        supporting_evidence: string[];
    }[];
    risk_patterns: {
        pattern: string;
        severity: number;
        confidence: number;
        evidence: string[];
    }[];
    plausibility_analysis: {
        overall_plausibility: number;
        weakest_areas: string[];
        strongest_areas: string[];
    };
    country_analysis: {
        origin_country_risk: number;
        destination_country_alignment: number;
        cross_border_transferability: number;
        economic_adaptability: number;
        country_risk_factors: string[];
        country_strengths: string[];
        country_concerns: string[];
    };
    score_breakdown?: {
        base_score: number;
        contradiction_penalty: number;
        confidence_adjustment: number;
        evidence_adjustment: number;
        final_adjusted_score: number;
    };
    dossier_analysis?: DossierAnalysis;
}

export interface DashboardData {
    score: number;
    level: string;
    confidence: number;
    summaryStatement: string;
    status: string;
    countryContext: CountryContext;
    underwritingPillars?: UnderwritingPillars;
    reasonCodes: ReasonCode[];
    documentAnalysis: AnalyzedDocument[];
    recommendations: Recommendation[];
    partnerOffers: PartnerOffer[];
    dossier: string;
    analysis?: ScoringAnalysis;
    dossier_analysis?: DossierAnalysis;
    score_breakdown?: {
        base_score: number;
        contradiction_penalty: number;
        confidence_adjustment: number;
        evidence_adjustment: number;
        final_adjusted_score: number;
    };
    uncertaintyAnalysis?: {
        overall_uncertainty: number;
        high_uncertainty_areas: string[];
        moderate_uncertainty_areas: string[];
        low_uncertainty_areas: string[];
        missing_critical_information: string[];
        weak_evidence_areas: string[];
        strong_evidence_areas: string[];
    };
    behavioral_analysis?: {
        behavioral_consistency: number;
        narrative_stability: number;
        interaction_reliability: number;
        stability_signals: string[];
        risk_signals: string[];
        consistency_patterns: string[];
        confidence: number;
    };
    // New pivot fields
    destinationCountryFit?: string;
    breakdown?: ScoreBreakdownExtended;
    useCases?: UseCases;
    strengths?: string[];
    weaknesses?: string[];
    improvements?: string[];
    reportSummary?: string;
    rationalWarnings?: string[];
    // Live Oracle Indicators
    realTimeInflationOffset?: number;
    livePPPMultiplier?: number;
    generatedAt?: number;
    shareId?: string;
    fullName?: string;
    analysis_status?: 'success' | 'limited_confidence' | 'unreliable';
    reason?: string;
    missing_critical_information?: string[];
    safe_partial_analysis?: any;
    // Lender report data (Module 4)
    document_extractions?: any[];
    document_summary?: any;
    country_analysis?: {
        origin_income_percentile?: number | null;
        origin_income_context?: string | null;
        destination_income_equivalent_usd?: number | null;
        income_transfer_narrative?: string | null;
        sector_demand_in_destination?: string | null;
        currency_risk?: number | null;
        country_transferability?: number | null;
    };
    financial_verified?: {
        verified_monthly_income_local?: number | null;
        verified_currency?: string | null;
        verified_income_usd_estimate?: number | null;
        income_context_in_origin?: string | null;
        document_coverage_months?: number | null;
        documents_analysed?: number | null;
    };
    verification_purpose?: string | null;
    employment_type?: string | null;
    origin_country?: string | null;
    destination_country?: string | null;
}

export interface AffiliateData {
    referralCode: string;
    totalSales: number;
    unpaidCommission: number;
    referralEarnings: {
        id: string;
        timestamp: number;
        amount: number;
        subjectUid: string;
    }[];
}

export interface UserDossier {
  uid: string;
  personalInfo: {
    fullName: string;
    email: string;
    originCountry: string;
    passportBrief?: string;
  };
  economicContext: FormData;
  scores: DashboardData;
  affiliate?: AffiliateData;
  referredBy?: string;
  issuedReports: {
    reportId: string;
    providerId: string;
    issuedAt: string;
    status: 'pending' | 'viewed' | 'approved';
  }[];
}

export interface DashboardProps {
  userId: string;
  data: DashboardData;
  profile?: UserDossier;
  referralCode?: string | null;
  isPaid: boolean;
  plan: 'standard' | 'membership' | null;
  onReset: () => void;
  onLogout: () => void;
  onGoToPartner: () => void;
  onGoToPricing: () => void;
  onExitToLanding: () => void;
  onShareDossier: (offerId: string, providerId: string) => void;
  onGoToHelp: () => void;
  isAdmin?: boolean;
}


// --- Service Provider Types ---

export interface ProviderUser {
    email: string;
    password?: string; // Hashed in real life
    providerId: string;
}

export interface Provider {
    id: string;
    formData: ProviderFormData;
    kybData: ProviderDashboardData | null;
}

export interface Applicant {
    id: string; // The user's email
    offerTitle: string;
    score: number;
    dossier: string;
}

export interface ProviderFormData {
    email: string;
    legalName: string;
    country: string;
    websiteUrl: string;
    category: 'Lender' | 'Real Estate' | 'Auto' | 'Other';
    contactName: string;
    minScore: string;
    documents: FileData[];
}

export interface Offer {
    id: string;
    providerId: string;
    title: string;
    description: string;
    minTransferScore: number;
    minConfidence: number;
    regions: string[];
    status: 'draft' | 'published' | 'archived';
}

export interface ComplianceLogEntry {
    id: string;
    check: string;
    result: string;
    source: string;
    timestamp: string;
}

export interface TrustHeatmap {
    docs: number;
    registry: number;
    webPresence: number;
    reviews: number;
}

export interface ProviderDashboardData {
    companyName: string;
    tier: 'A' | 'B' | 'C';
    kybConfidence: number;
    trustHeatmap: TrustHeatmap;
    complianceLog: ComplianceLogEntry[];
}

export interface ProviderDashboardPageProps {
  data: ProviderDashboardData;
  formData: ProviderFormData;
  offers: Offer[];
  applicants: Applicant[];
  onOfferAction: (action: 'create' | 'update' | 'delete', offer: Offer) => void;
  onLogout: () => void;
}


// --- Auth Page Props ---
export interface AuthPageProps {
  mode: 'user' | 'provider';
  title: string;
  onLogin: (email: string, pass: string) => { success: boolean, message: string };
  onSignUp: (email: string, pass: string) => { success: boolean, message: string };
  onBack?: () => void;
}

// --- Help Center Types ---
export interface SupportTicket {
    id: string;
    userId: string | null; // Can be null if not logged in
    subject: string;
    message: string;
    timestamp: number;
    status: 'open' | 'closed';
}

export interface HelpCenterPageProps {
    onContactSupport: (subject: string, message: string) => Promise<boolean>;
    onBack: () => void;
    isLoggedIn: boolean;
}

export interface DestinationCountry {
    id: string;
    name: string;
    flag: string;
    trustFactors: string[];
    rentalExpectations: string;
    bankingExpectations: string;
    depositCulture: string;
    incomeProofExpectations: string;
}

export interface ShareLink {
    id: string;
    userId: string;
    expiresAt: number;
    reportData: DashboardData;
}
