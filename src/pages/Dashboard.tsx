import React, { useState, useMemo } from 'react';
import { 
    Globe, 
    FileText, 
    Download,
    Mail,
    
    ShieldCheck,
    Lock,
    ArrowLeft,
    TrendingUp,
    BarChart3,
    ArrowRightCircle,
    Building2,
    Fingerprint,
    CreditCard,
    Home,
    Check,
    AlertTriangle,
    ShieldAlert,
    Activity,
    ChevronUp,
    ChevronDown,
    Brain,
    DollarSign,
    Shield,
    PlusCircle,
    Zap,
    History,
    Clock
} from 'lucide-react';
import RealmSwitcher from '../components/RealmSwitcher';
import type { DashboardProps, SimulationResult, DashboardData, HistoryEntry } from '../types';
import { generateDossierPDF } from '../lib/pdfGenerator';
import { getHistory, compareEntries } from '../lib/historyUtils';
import { storage } from '../lib/storage';
import ConfirmModal from '../components/ConfirmModal';
import AdminRegistry from '../components/AdminRegistry';

const SOPHISTICATED_DEMO_DATA: DashboardData = {
    score: 842,
    level: "Excellent",
    confidence: 0.99,
    summaryStatement: "High-Fidelity Signal identified. Verified professional evidence confirms exceptional cross-border resilience.",
    status: "Verified Professional Evidence",
    fullName: "Alexander V. Gerasymenko",
    countryContext: {
        countryName: "USA (Chicago, IL)",
        medianIncomePPP: 141600,
        costOfLivingIndex: 82.4,
        inflation: 3.2,
        unemployment: 4.1
    },
    underwritingPillars: {
        purchasingPowerEquivalence: 11800,
        stabilityScore: 98,
        inflationDefenseFactor: 'Positive',
        transferabilityIndex: 92
    },
    livePPPMultiplier: 2.14,
    realTimeInflationOffset: 10.0,
    breakdown: {
        identityScore: 99,
        incomeScore: 94,
        paymentScore: 100,
        savingsScore: 88,
        housingScore: 95,
        crossBorderScore: 97
    },
    useCases: {
        renting: { score: 98, label: 'High Availability' },
        loan: { score: 95, label: 'Preferred+' },
        auto: { score: 96, label: 'Elite' },
        banking: { score: 99, label: 'Professional' }
    },
    strengths: [
        "Exceptional Cross-Border Economic Resilience",
        "Senior AI Systems Architecture expertise",
        "Macro-Contextual Validation of income sequence"
    ],
    weaknesses: ["None Detected"],
    documentAnalysis: [
        { 
            documentType: "Passport (UA)", 
            trustLevel: 1, 
            status: 'Verified', 
            notes: 'Biometric verification successful.' 
        },
        { 
            documentType: "Bank Statements (Raiffeisen)", 
            trustLevel: 0.98, 
            status: 'Verified', 
            notes: '144/144 payment sequence integrity confirmed.',
            statementPeriod: 'Oct 2025 - March 2026',
            monthlyNetIncome: 5500,
            totalInflow: 33000,
            endingBalance: 12500,
            consistencyScore: 0.96
        }
    ],
    recommendations: [
        { text: "Initiate Tier-1 Credit Onboarding in Illinois.", predictedGain: 5 }
    ],
    reasonCodes: [
        { label: "Inflation Outperformer (+10% Growth)", impact: "Positive" },
        { label: "Sequence Integrity Verified (144 pts)", impact: "Positive" },
        { label: "High-Demand AI Architecture Role", impact: "Positive" }
    ],
    partnerOffers: [],
    dossier: `
## Master Financial Dossier: Alexander V. Gerasymenko
**Ref: DOSSIER-2026-XQ7Z-SUPER**
`,
    dossier_analysis: {
        financial_identity_profile: {
            profile_type: "Global Mobile Professional",
            overall_integrity_level: "Professional Standard",
            cross_border_readiness: "Optimized / Immediate",
            financial_resilience_level: "High",
            trust_assessment: "Verified Professional Anchor"
        },
        behavioral_summary: {
            overall_stability: "Subject exhibits high narrative stability across financial claim points.",
            consistency_observations: ["Consistent income representation", "Logical timeline progression"],
            interaction_strengths: ["High response coherence", "Evidence-backed claims"],
            interaction_risks: []
        },
        score_explanation: {
            score_increase_factors: ["Senior AI Systems Architecture role", "Macro-Contextual Validation of income", "100% Sequence Integrity"],
            score_decrease_factors: ["Informal sector exposure (Limited)", "Recent cross-border transition"],
            most_influential_factors: ["Income PPP Multiplier (2.14x)", "Professional Tenure"]
        },
        strengths: [
            { title: "Macro-Contextual Outperformance", description: "Outperforming origin-market inflation by 10% consistently.", confidence: 0.98 },
            { title: "Verifiable Service History", description: "144 points of successful utility and rental sequence data.", confidence: 0.99 }
        ],
        risks: [
            { title: "Jurisdictional Anchor Volatility", description: "Origin country economic instability may impact remote asset liquidity.", severity: 30, confidence: 0.85 }
        ],
        uncertainty_analysis: {
            high_uncertainty_areas: ["Off-shore digital assets valuation"],
            missing_information: ["Tax returns for 2023 jurisdiction"],
            recommended_additional_evidence: ["Consolidated tax transcript", "Employment verification letter"]
        },
        cross_border_analysis: {
            migration_readiness: 95,
            economic_adaptability: 98,
            destination_alignment: 92,
            cross_border_strengths: ["High-demand engineering skillset", "Currency hedge established"],
            cross_border_risks: ["Regulatory lag in destination country"]
        },
        evidence_summary: {
            strongest_evidence: ["Bank statements (Raiffeisen)", "Biometric Passport"],
            weakest_evidence: ["Self-reported secondary assets"],
            evidence_quality: 97
        },
        financial_pathway_summary: {
            top_improvement_priorities: ["Consolidate documentation", "Increase liquid savings", "Establish target territory presence"],
            highest_impact_changes: ["Official employment verification", "Savings buffer expansion"],
            recommended_next_steps: ["Unlock detailed pathway", "Connect additional evidence"],
            long_term_strengthening_areas: ["Investment portfolio transparency"]
        },
        recommendations: {
            high_impact_actions: [
                { title: "Official Verification", description: "Request a verification letter from your primary firm to strengthen your profile.", expected_impact: 45, confidence: 0.98, priority: 'high' },
                { title: "Savings Moat Expansion", description: "Increase liquid reserves to maximize international resilience.", expected_impact: 25, confidence: 0.95, priority: 'medium' }
            ],
            documentation_improvements: ["Apostilled degree certificates", "Utility bills in target territory"],
            financial_stability_improvements: ["Diversify income streams", "Maintain current spending floor"],
            cross_border_readiness_improvements: ["Pre-open local banking node", "Verify local tax residency requirements"],
            trust_profile_improvements: ["Establish linked LinkedIn identity", "Professional peer endorsements"],
            missing_evidence_recommendations: ["Full 2024 tax transcript"],
            risk_reduction_actions: [
                { risk: "Jurisdictional Anchor", recommended_action: "Transfer assets to multi-currency institutional account.", expected_risk_reduction: 15 }
            ]
        }
    },
    generatedAt: Date.now(),
    shareId: "demo_secure_dossier_001"
};

// --- Reusable UI Components ---

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-3xl border border-brand-border shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`px-8 py-6 border-b border-brand-border bg-slate-50/50 ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-8 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={`text-[10px] font-bold text-brand-gray uppercase tracking-widest ${className}`}>
    {children}
  </h3>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'positive' | 'negative' | 'warning' | 'info'; className?: string }> = ({ children, variant = 'default', className = "" }) => {
    const colors = {
        default: 'bg-slate-100 text-brand-gray border border-brand-border',
        positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        negative: 'bg-red-50 text-red-700 border border-red-200',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200',
        info: 'bg-brand-blue text-white shadow-sm',
    }
    return <span className={`px-3 py-1 text-[9px] font-bold rounded-full uppercase tracking-widest ${colors[variant]} ${className}`}>{children}</span>;
};

const PillarCard: React.FC<{ label: string, value: string | number, sublabel?: string, icon: React.ReactNode, variant?: 'default' | 'positive' | 'negative' }> = ({ label, value, sublabel, icon, variant = 'default' }) => (
    <Card className={`p-8 border-brand-border shadow-sm hover:shadow-md transition-all ${
        variant === 'positive' ? 'bg-emerald-50/30' : variant === 'negative' ? 'bg-red-50/30' : 'bg-white'
    }`}>
        <div className="flex flex-col h-full justify-between gap-6">
            <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-gray shadow-sm border border-brand-border`}>
                    {icon}
                </div>
                {variant !== 'default' && (
                  <div className={`w-2 h-2 rounded-full ${variant === 'positive' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                )}
            </div>
            <div>
                <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-brand-dark tracking-tight">{value}</p>
                    {sublabel && <p className="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest">{sublabel}</p>}
                </div>
            </div>
        </div>
    </Card>
);

// --- Alpha Build View (Legacy) ---
const AlphaBuildView: React.FC<{ data: any }> = ({ data }) => {
    const [lenderView, setLenderView] = useState(false);
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            <div className="flex justify-center">
                <div className="inline-flex bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                    <button 
                        onClick={() => setLenderView(false)}
                        className={`px-8 py-3 text-[10px] font-semibold uppercase tracking-apple-label rounded-xl transition-all ${!lenderView ? 'bg-cyber-teal text-white shadow-xl shadow-cyber-teal/20' : 'text-white/40 hover:text-white'}`}
                    >
                        Consumer Node
                    </button>
                    <button 
                        onClick={() => setLenderView(true)}
                        className={`px-8 py-3 text-[10px] font-semibold uppercase tracking-apple-label rounded-xl transition-all ${lenderView ? 'bg-cyber-magenta text-white shadow-xl shadow-cyber-magenta/20' : 'text-white/40 hover:text-white'}`}
                    >
                        Lender Node
                    </button>
                </div>
            </div>
            
            <Card className="p-12 border-none shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    <div className="flex-shrink-0 relative">
                        <Gauge score={data.score} size={240} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-[10px] font-semibold text-cyber-silver/40 uppercase tracking-apple-label mb-1">Index</p>
                            <p className="text-3xl font-bold text-white tracking-apple-tight leading-none italic">{data.score}</p>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 text-white border border-white/10 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-teal animate-pulse shadow-[0_0_8px_rgba(20,160,152,0.8)]"></span>
                            <span className="text-[10px] font-semibold uppercase tracking-apple-label">{lenderView ? 'Anonymized Application' : 'Legacy Alpha Component'}</span>
                        </div>
                        <h2 className="text-5xl font-bold text-white tracking-apple-tight leading-[1.1] uppercase italic">
                            {lenderView ? 'Evidence Node Analysis' : 'Independent Integrity Dossier'}
                        </h2>
                        <p className="text-xl text-cyber-silver/60 font-medium leading-relaxed max-w-xl italic">
                            {lenderView ? 'This is how financial institutions see your alternative credit report.' : data.summaryStatement}
                        </p>
                        <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                            <Badge variant="positive" className="py-2 px-6">{data.level} Risk Profile</Badge>
                            <Badge variant="info" className="py-2 px-6">Confidence: {(data.confidence * 100).toFixed(0)}%</Badge>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <Card className="p-10">
                    <CardHeader><CardTitle>Underwriting Pillars</CardTitle></CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {data.reasonCodes.map((reason: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                                <span className="text-sm font-semibold text-white italic">"{reason.label}"</span>
                                <Badge variant={reason.impact === 'Positive' ? 'positive' : reason.impact === 'Negative' ? 'negative' : 'default'}>
                                    {reason.impact}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="p-10">
                    <CardHeader><CardTitle>Institutional Readiness</CardTitle></CardHeader>
                    <CardContent className="space-y-4 pt-6 text-center">
                        {data.partnerOffers.length > 0 ? (
                            data.partnerOffers.map((offer: any) => (
                                <div key={offer.id} className="p-6 bg-cyber-teal/10 border border-cyber-teal/20 rounded-2xl text-left group hover:scale-[1.02] transition-all">
                                    <p className="font-bold text-white uppercase tracking-apple-tight text-sm italic">{offer.providerName}</p>
                                    <p className="text-xs font-semibold text-cyber-silver mt-2 italic leading-tight">"{offer.title}"</p>
                                </div>
                            ))
                        ) : (
                                <div className="p-8 bg-white/5 rounded-2xl text-cyber-silver/40 italic text-sm border border-white/5 font-semibold uppercase tracking-apple-label">
                                    No offers compatible with current scoring node.
                                </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// --- Dashboard Sub-components ---

const Gauge: React.FC<{ score: number, size?: number, label?: string }> = ({ score, size = 180, label = "Integrity Index" }) => {
    const r = (size / 2) - 10;
    const circumference = 2 * Math.PI * r;
    const percentage = Math.max(0, Math.min(100, ((score - 300) / (850 - 300)) * 100));
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = (s: number) => {
        if (s < 580) return '#CB2D6F'; // cyber-magenta
        if (s < 670) return '#f59e0b'; // amber
        return '#14A098'; // cyber-teal
    };

    return (
        <div className="relative flex items-center justify-center font-sans" style={{width: size, height: size}}>
            <svg className="transform -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="8" className="stroke-white/5" />
                <circle
                    cx={size/2}
                    cy={size/2}
                    r={r}
                    fill="none"
                    strokeWidth="8"
                    stroke={getColor(score)}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-[1200ms] ease-in-out drop-shadow-[0_0_8px_rgba(20,160,152,0.4)]"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white tracking-apple-tight tabular-nums">{Math.round(score)}</span>
                <span className="text-[9px] font-semibold text-cyber-silver uppercase tracking-apple-label mt-1">{label}</span>
            </div>
        </div>
    );
};

const ScoreBar: React.FC<{ label: string, score: number, icon?: React.ReactNode }> = ({ label, score, icon }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2.5">
                    {icon && <span className="text-brand-gray">{icon}</span>}
                    <span className="text-[10px] font-semibold text-brand-dark uppercase tracking-apple-label">{label}</span>
                </div>
                <span className="text-sm font-bold text-brand-dark">{score}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-brand-success transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
};

const formatDossier = (text: string) => {
    if (!text) return '';
    // v34.22 (P1 SECURITY): the dossier text is AI-generated from user-uploaded
    // documents — it is UNTRUSTED. Escape all HTML first so an attacker cannot
    // inject <script>/markup via a payer name or memo field, THEN apply our own
    // markdown-ish formatting. (Also: raw innerHTML needs `class`, not `className`.)
    const escapeHtml = (s: string) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    return escapeHtml(text)
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-brand-dark mt-8 mb-4 uppercase tracking-tight">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black text-brand-dark mt-10 mb-6 uppercase tracking-tighter border-b border-brand-border pb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-brand-blue mt-12 mb-8 uppercase tracking-widest">$1</h1>')
        .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-2">$1</li>')
        .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 list-none flex items-start gap-2"><span class="text-brand-blue">•</span> $1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-brand-dark">$1</strong>')
        .replace(/\n/g, '<br />');
};

// --- Breadcrumbs component ---
const Breadcrumbs: React.FC<{ activeTab: Tab; onNavigate: (tab: Tab) => void; onHome: () => void }> = ({ activeTab, onNavigate, onHome }) => {
    const tabLabels: Record<Tab, string> = {
        overview: 'Dossier Home',
        breakdown: 'Risk Analysis',
        report: 'Verification Report',
        ai_dossier: 'Profile Detail',
        pathway: 'Financial Pathway',
        dossier: 'Evidence Details',
        simulator: 'Analysis Engine',
        share: 'Partner Delivery',
        history: 'Update History'
    };

    return (
        <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-brand-gray/40 mb-8 border-b border-brand-border pb-4">
            <button onClick={onHome} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors font-bold tracking-widest text-[9px]">← Home</button>
            <span>/</span>
            <button onClick={() => onNavigate('overview')} className="hover:text-brand-blue cursor-pointer transition-colors uppercase font-bold tracking-widest">My Dossier</button>
            <span>/</span>
            <span className="text-brand-blue italic font-bold">{tabLabels[activeTab]}</span>
        </nav>
    );
};

// --- Main Dashboard Component ---

type Tab = 'overview' | 'breakdown' | 'report' | 'ai_dossier' | 'dossier' | 'simulator' | 'share' | 'pathway' | 'history';

const PaywallOverlay: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-cyber-petrol/60 backdrop-blur-xl rounded-[3rem] border border-white/5 p-8 text-center">
        <div className="max-w-sm space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-brand-blue text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
                <Zap className="w-8 h-8" />
            </div>
            <div className="space-y-4">
                <div className="inline-flex px-3 py-1 bg-amber-400 text-brand-dark text-[8px] font-black uppercase tracking-widest rounded-full mb-2">BETA EXCLUSIVE</div>
                <h3 className="text-3xl font-bold text-white tracking-apple-tight">Unlock Analysis</h3>
                <p className="text-sm text-cyber-silver font-semibold uppercase tracking-apple-label leading-relaxed">
                    Full AI Financial Identity Reports are currently available <span className="text-amber-400">free for beta users</span>.
                </p>
            </div>
            <button 
                onClick={onUnlock}
                className="w-full py-6 bg-brand-blue text-white text-[11px] font-semibold uppercase tracking-apple-label rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-brand-blue/20"
            >
                Claim Free Beta Access
            </button>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ userId, data: propData, profile, referralCode, isPaid, plan, onReset, onLogout, onGoToPricing, onExitToLanding, isAdmin, onChangePassword }) => {
  const rawData = useMemo(() => propData || profile?.scores || SOPHISTICATED_DEMO_DATA, [propData, profile]);

  // NORMALIZATION LAYER — guarantees all fields the render path touches always exist.
  // Reports built from agent outputs (or fallbacks) may be missing nested objects/arrays;
  // without this, a single undefined access blanks the whole dashboard.
  const data = useMemo(() => {
    const d: any = { ...(rawData || {}) };
    // Scalars
    d.score = d.score ?? 0;
    d.level = d.level || 'Assessed';
    d.confidence = d.confidence ?? 0;
    d.fullName = d.fullName || d.full_name || 'Verified Applicant';
    d.summaryStatement = d.summaryStatement || d.summary_statement || 'Financial profile generated from available data.';
    d.status = d.status || 'Active Analysis';
    d.destinationCountryFit = d.destinationCountryFit || null; // no fake 'Optimal' default — render decides honestly
    d.origin_country = d.origin_country || 'Origin Country';
    // Arrays
    d.reasonCodes = Array.isArray(d.reasonCodes) ? d.reasonCodes : [];
    d.partnerOffers = Array.isArray(d.partnerOffers) ? d.partnerOffers : [];
    d.rationalWarnings = Array.isArray(d.rationalWarnings) ? d.rationalWarnings : [];
    d.recommendations = Array.isArray(d.recommendations) ? d.recommendations : [];
    if (d.dossier_analysis?.uncertainty_analysis?.high_uncertainty_areas) {
      d.dossier_analysis.uncertainty_analysis.high_uncertainty_areas = d.dossier_analysis.uncertainty_analysis.high_uncertainty_areas.filter((x: any) => !/confidence\/uncertainty mismatch requires review/i.test(String(x)));
    }
    d.improvements = Array.isArray(d.improvements) ? d.improvements : undefined; // keep undefined so fallback chain works
    d.documentAnalysis = Array.isArray(d.documentAnalysis) ? d.documentAnalysis : [];
    d.aggregated_strengths = Array.isArray(d.aggregated_strengths) ? d.aggregated_strengths : [];
    d.aggregated_risks = Array.isArray(d.aggregated_risks) ? d.aggregated_risks : [];
    d.strengths = Array.isArray(d.strengths) ? d.strengths : [];
    d.risks = Array.isArray(d.risks) ? d.risks : [];
    // Nested objects
    d.countryContext = d.countryContext || { countryName: d.origin_country, medianIncomePPP: 0, costOfLivingIndex: 0, inflation: 0, unemployment: 0 };
    d.breakdown = d.breakdown || {};
    d.useCases = d.useCases || {};
    d.country_analysis = d.country_analysis || {};
    d.financial_verified = d.financial_verified || {};
    return d;
  }, [rawData]);

  // Honesty gate (#5): when the deterministic reconciliation flags a CONTRADICTION,
  // the profile must NOT wear green "verified" / positive integrity labels. The
  // reconciliation card already tells the real story; these gates stop the rest of
  // the page from contradicting it.
  const isContradicted = (data as any)?.reconciliation?.income_status === 'contradicted';
  const contradictionPenalty = Number((data as any)?.dossier_analysis?.score_breakdown?.contradiction_penalty ?? (data as any)?.score_breakdown?.contradiction_penalty ?? 0);
  const hasConsistencyConcern = isContradicted || contradictionPenalty > 0;

  // #3: evidence_quality can arrive malformed (e.g. a tiny float rendered as "0000000000004").
  // Normalize deterministically to a bounded 0–100 integer for display.
  const evidenceQualityPct = (() => {
    const q = Number((data as any)?.dossier_analysis?.evidence_summary?.evidence_quality);
    if (!Number.isFinite(q)) return 0;
    const scaled = q > 0 && q <= 1 ? q * 100 : q;
    return Math.round(Math.max(0, Math.min(100, scaled)));
  })();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);   // v34.15: styled confirm for New Assessment
  const [linkCopied, setLinkCopied] = useState(false);       // v34.16: Copy Link feedback
  const [linkPublishError, setLinkPublishError] = useState(false); // v34.24: server publish failed
  const [revokeConfirm, setRevokeConfirm] = useState(false); // v34.18: Revoke Link confirm
  const [linkRevoked, setLinkRevoked] = useState(false);     // v34.18: Revoke Link feedback
  const [revokeError, setRevokeError] = useState(false);       // v34.25-safe: strict revoke failure feedback
  const [showRegistry, setShowRegistry] = useState(false);   // v34.20: admin traction panel
  const [pdfError, setPdfError] = useState(false);           // v34.15: styled notice instead of alert()
  const isAlphaBuildView = false;
  
  // Simulator State
  const [simField, setSimField] = useState('personal_income_ppp');
  const [simValue, setSimValue] = useState<number | ''>('');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [compareEntryId, setCompareEntryId] = useState<string | null>(null);
  
  const historyList = useMemo(() => getHistory(), [activeTab, propData]);
  

  
  const handleRunSimulation = async () => {
      if (simField && simValue !== '') {
          setIsSimulating(true);
          setSimResult(null);
          
          // Local simulation logic to avoid external errors and show immediate impact
          setTimeout(() => {
              let scoreDiff = 0;
              let reason = "";
              const val = Number(simValue);

              switch (simField) {
                  case 'personal_income_ppp':
                      scoreDiff = val > (data.underwritingPillars?.purchasingPowerEquivalence || 5000) ? 15 : -10;
                      reason = `Adjusting net domestic purchasing power to $${val.toLocaleString()} significantly recalibrates your international integrity ceiling.`;
                      break;
                  case 'liquid_savings_months':
                      scoreDiff = val >= 6 ? 25 : (val >= 3 ? 10 : -5);
                      reason = `A reservoir of ${val} months of liquidity establishes a robust 'stability moat' against cross-border volatile transitions.`;
                      break;
                  case 'rent_to_income_ratio':
                      scoreDiff = val <= 25 ? 20 : (val <= 33 ? 5 : -15);
                      reason = `Maintaining a ${val}% rent-to-income ratio is a high-fidelity signal of fiscal discipline recognized by US institutional lenders.`;
                      break;
                  case 'years_of_financial_history':
                      scoreDiff = val >= 10 ? 30 : (val >= 5 ? 15 : 5);
                      reason = `A ${val}-year financial arc provides the depth of signal needed for high-confidence institutional underwriting.`;
                      break;
                  default:
                      scoreDiff = 0;
                      reason = "Simulation complete. No significant delta identified for this variable.";
              }

              const predictedScore = Math.min(900, Math.max(300, (data.score || 700) + scoreDiff));
              
              setSimResult({
                  predictedScore,
                  reasoning: reason
              });
              setIsSimulating(false);
          }, 1500);
      }
  };

  const handleDownloadPDF = async () => {
      setIsDownloading(true);
      try {
          await generateDossierPDF(data);
      } catch (error) {
          console.error("PDF Generation failed:", error);
          setPdfError(true); // v34.15: styled notice instead of alert()
      } finally {
          setIsDownloading(false);
      }
  };

  const renderTabContent = () => {
    switch (activeTab) {
        case 'breakdown':
            return (
                <div className="space-y-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {!isPaid && <PaywallOverlay onUnlock={onGoToPricing} />}
                    <div className={!isPaid ? 'blur-2xl pointer-events-none select-none overflow-hidden h-[600px]' : ''}>
                        <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className="flex items-center gap-2 text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4 hover:text-brand-dark transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Back to Overview
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <Card>
                                <CardHeader><CardTitle>Risk Analytics Decomposition</CardTitle></CardHeader>
                                <CardContent className="space-y-8">
                                    <ScoreBar 
                                        label="Identity Reliability" 
                                        score={data.breakdown?.identityScore || 0} 
                                        icon={<Fingerprint className="w-4 h-4" />}
                                    />
                                    <ScoreBar 
                                        label="Financial Stability" 
                                        score={data.breakdown?.incomeScore || 0} 
                                        icon={<CreditCard className="w-4 h-4" />}
                                    />
                                    <ScoreBar 
                                        label="Cross-Border Transferability" 
                                        score={data.breakdown?.crossBorderScore || 0} 
                                        icon={<Globe className="w-4 h-4" />}
                                    />
                                    <ScoreBar 
                                        label="Migration Resilience" 
                                        score={data.breakdown?.housingScore || 0} 
                                        icon={<Home className="w-4 h-4" />}
                                    />
                                    <ScoreBar 
                                        label="Behavioral Consistency" 
                                        score={data.breakdown?.paymentScore || 0} 
                                        icon={<ShieldCheck className="w-4 h-4" />}
                                    />
                                    <ScoreBar 
                                        label="Fraud & Document Integrity" 
                                        score={data.breakdown?.fraudIntegrityScore ?? 0} 
                                        icon={<ShieldCheck className="w-4 h-4" />}
                                    />

                                    {data.rationalWarnings && data.rationalWarnings.length > 0 && (
                                        <div className="mt-8 space-y-3">
                                            <p className="text-[9px] font-bold text-brand-gray/50 uppercase tracking-widest">Procedural Risk Adjustments</p>
                                            {data.rationalWarnings.map((warning, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                                                    <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                                    <p className="text-[10px] font-medium text-amber-800 leading-tight italic">{warning}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {data.score_breakdown && (
                                        <div className="mt-8 pt-8 border-t border-brand-border space-y-4">
                                            <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest">Weighted Risk Scoring Logic</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] text-brand-gray/60 uppercase font-black">Base Score</p>
                                                    <p className="text-sm font-black text-brand-dark">{data.score_breakdown?.base_score}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] text-brand-gray/60 uppercase font-black">Adjusted Integrity</p>
                                                    <p className="text-sm font-black text-brand-dark">{data.score_breakdown?.final_adjusted_score}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-brand-gray/80 font-medium italic">Contradiction Penalty</span>
                                                    <span className="text-red-600 font-bold">-{data.score_breakdown?.contradiction_penalty}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-brand-gray/80 font-medium italic">Confidence Modifier</span>
                                                    <span className="text-brand-dark font-bold">-{data.score_breakdown?.confidence_adjustment}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-brand-gray/80 font-medium italic">Evidence Delta</span>
                                                    <span className={data.score_breakdown?.evidence_adjustment >= 0 ? 'text-brand-success font-bold' : 'text-red-600 font-bold'}>
                                                        {data.score_breakdown?.evidence_adjustment >= 0 ? '+' : ''}{data.score_breakdown?.evidence_adjustment}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {data.uncertaintyAnalysis && (
                                        <div className="mt-10 pt-10 border-t border-brand-border space-y-6">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest">Confidence & Uncertainty Engine</p>
                                                <Badge variant={data.uncertaintyAnalysis?.overall_uncertainty > 50 ? 'warning' : 'info'}>
                                                    Uncertainty: {data.uncertaintyAnalysis?.overall_uncertainty}%
                                                </Badge>
                                            </div>
                                            
                                            {data.uncertaintyAnalysis?.high_uncertainty_areas.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Evidence Gaps / High Uncertainty</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.uncertaintyAnalysis?.high_uncertainty_areas.map((area, i) => (
                                                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-[9px] font-bold rounded border border-red-100">{area}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {data.uncertaintyAnalysis?.missing_critical_information.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[8px] font-bold text-brand-gray uppercase tracking-widest">Missing Critical Information</p>
                                                    <ul className="text-[10px] space-y-1">
                                                        {data.uncertaintyAnalysis?.missing_critical_information.map((item, i) => (
                                                            <li key={i} className="flex items-center gap-2 text-brand-dark/70">
                                                                <span className="w-1 h-1 bg-brand-gray/30 rounded-full"></span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="p-4 bg-slate-50 rounded-xl border border-brand-border">
                                                <p className="text-[8px] font-bold text-brand-gray uppercase tracking-widest mb-2">Verification Note</p>
                                                <p className="text-[10px] font-medium text-brand-gray italic leading-relaxed">
                                                    {isContradicted
                                                        ? "This profile has an unresolved contradiction between declared and documented income. Verification is incomplete pending reconciliation."
                                                        : data.confidence < 0.6
                                                        ? "CAUTION: This analysis contains significant reasoning limitations due to evidence gaps. Complete certainty cannot be established at this stage."
                                                        : (data.uncertaintyAnalysis?.overall_uncertainty ?? 100) <= 25
                                                        ? "Documented evidence supports this profile with moderate-to-high analysis confidence."
                                                        : "Documented evidence supports parts of this profile, but material uncertainty remains and should be reviewed before a decision."
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="space-y-8">
                                <Card className="bg-emerald-50/20 border-emerald-100">
                                    <CardHeader className="bg-emerald-50/50 border-emerald-100"><CardTitle className="text-emerald-700">Verification Strengths</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        {(data.strengths || []).map((s, i) => (
                                            <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-emerald-100 group shadow-sm">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                                <p className="text-sm font-semibold text-brand-dark italic leading-tight pt-0.5">{s}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {(data.weaknesses || []).length > 0 && (
                                    <Card className="bg-red-50/20 border-red-100">
                                        <CardHeader className="bg-red-50/50 border-red-100"><CardTitle className="text-red-700">Identified Vulnerabilities</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            {(data.weaknesses || []).map((w, i) => (
                                                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-red-100 group shadow-sm">
                                                    <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-brand-dark italic leading-tight pt-0.5">{w}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'report':
            return (
                 <div className="max-w-4xl mx-auto space-y-6 relative animate-in zoom-in-95 duration-700">
                    {!isPaid && <PaywallOverlay onUnlock={onGoToPricing} />}
                    <div className={!isPaid ? 'blur-2xl pointer-events-none select-none overflow-hidden h-[800px]' : ''}>
                        <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className="flex items-center gap-2 text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4 hover:text-brand-dark transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Back to Overview
                        </button>
                        <Card className="border-brand-border shadow-2xl bg-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[120px] -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[120px] -ml-32 -mb-32"></div>

                            <CardHeader className="flex flex-row justify-between items-center p-12 border-b border-brand-border bg-slate-50/50 relative z-10">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center text-white shadow-xl">
                                        <FileText className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <Badge variant="negative" className="mb-2">Confidential &bull; Financial Evidence Service</Badge>
                                        <h2 className="text-4xl font-bold text-brand-dark tracking-tight leading-none">Financial Evidence Dossier</h2>
                                        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mt-2 px-2 py-0.5 bg-slate-100 rounded inline-block">Ref: DG-Z7-PRO-2026-XQ</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-1">Issue Context</p>
                                    <p className="text-lg font-bold text-brand-dark">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-12 space-y-16 relative z-10">
                                <div className="prose prose-slate max-w-none p-10 rounded-3xl bg-slate-50 border border-brand-border shadow-inner" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <div dangerouslySetInnerHTML={{ __html: formatDossier(data.dossier) }} />
                                </div>
                                
                                <section className="space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-brand-border"></div>
                                        <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest px-4">Audit Benchmark Alpha</span>
                                        <div className="h-px flex-1 bg-brand-border"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="p-10 bg-brand-blue text-white rounded-3xl border border-brand-blue relative overflow-hidden group shadow-lg">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <ShieldCheck className="w-32 h-32 text-white" />
                                            </div>
                                            <div className="relative z-10 space-y-6">
                                                <Badge variant="info" className={`shadow-none ${isContradicted || data.score < 500 ? 'bg-white text-amber-600' : data.score < 650 ? 'bg-white text-brand-gray' : 'bg-white text-brand-blue'}`}>{isContradicted || data.score < 500 ? 'Provisional — Needs Review' : data.score < 650 ? 'Partially Documented' : 'Established Evidence Profile'}</Badge>
                                                <h4 className="text-2xl font-bold leading-tight">{isContradicted ? 'Documented income does not support the declared profile.' : data.score < 500 ? 'Profile requires additional evidence before a confident assessment.' : data.score < 650 ? 'Profile is partially documented and may require additional evidence.' : 'Cross-border financial evidence has been assessed with substantial supporting documentation.'}</h4>
                                                <p className="text-xs text-white/70 leading-relaxed font-medium">{isContradicted || data.score < 500 ? 'This assessment reflects gaps between declared and documented financials. It is not a prime credit certification.' : data.score < 650 ? 'Verification is partial. Additional documentation would be required before a confident decision.' : 'This assessment summarizes documented financial evidence and does not certify equivalence to any US credit tier.'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div>
                                                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2">Equivalent Tier</p>
                                                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div><p className="text-sm font-bold text-brand-dark uppercase tracking-wide">TransferScore {data.score} / 1000 — {data.level}</p></div><p className="text-[11px] text-brand-gray font-medium mt-1.5 ml-6">Proprietary cross-border financial evidence score. Not equivalent to FICO or a credit bureau score.</p>
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-brand-border">
                                                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2">Internal Assessment</p>
                                                <p className="text-xs font-semibold text-brand-dark leading-relaxed italic">
                                                    "{`Persona.Credit provides cross-border income contextualisation. TransferScore ${data.score} / 1000 is a proprietary evidence score and is not a credit bureau score.`}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </CardContent>

                            <div className="p-10 border-t border-brand-border bg-slate-50/50 flex flex-col sm:flex-row gap-6 justify-between items-center relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">✓</div>
                                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">Authentication Validation: SUCCESS</p>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading}
                                        className="px-8 py-4 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-brand-blue/30 flex items-center gap-3 active:scale-95"
                                    >
                                        <Download className="w-4 h-4" />
                                        {isDownloading ? 'Archiving..' : 'Download Dossier Archive'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            );
        case 'ai_dossier':
            return (
                <div className="max-w-5xl mx-auto space-y-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {!isPaid && <PaywallOverlay onUnlock={onGoToPricing} />}
                    <div className={!isPaid ? 'blur-2xl pointer-events-none select-none overflow-hidden h-[800px]' : ''}>
                        <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                        
                        {/* Header: Identity Dossier Profile */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div>
                                <h1 className="text-4xl font-black text-brand-dark tracking-tighter uppercase italic leading-none mb-2">Global Financial Identity</h1>
                                <p className="text-xs font-bold text-brand-gray uppercase tracking-widest px-2 py-1 bg-slate-100 rounded inline-block">Security Reference: DG-INS-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                            </div>
                            <div className="flex flex-col items-end gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-brand-gray/50 uppercase tracking-widest mb-1">Identity Verification</p>
                                    <Badge variant={String((data as any).identity_document_status || '') === 'passed' ? 'positive' : 'warning'} className="text-lg py-1 px-4">{(data as any).identity_verification_status || 'Identity verification pending'}</Badge>
                                </div>
                                <button 
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm hover:shadow-md hover:bg-brand-blue/90 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Download className="w-3 h-3" />
                                    {isDownloading ? 'Exporting..' : 'Export PDF'}
                                </button>
                            </div>
                        </div>

                        {data.dossier_analysis ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left Column: Identity Profile & Cross-Border */}
                                <div className="lg:col-span-1 space-y-10">
                                    <Card className="bg-slate-50 border-brand-border">
                                        <CardHeader><CardTitle>Identity Signature Profile</CardTitle></CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b border-brand-border pb-3">
                                                    <span className="text-[10px] text-brand-gray/60 uppercase font-black">Profile Type</span>
                                                    <span className="text-xs font-bold text-brand-dark text-right">{data.dossier_analysis?.financial_identity_profile.profile_type}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-brand-border pb-3">
                                                    <span className="text-[10px] text-brand-gray/60 uppercase font-black">Cross-Border Readiness</span>
                                                    <span className="text-xs font-bold text-brand-blue text-right">{data.dossier_analysis?.financial_identity_profile.cross_border_readiness}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-brand-border pb-3">
                                                    <span className="text-[10px] text-brand-gray/60 uppercase font-black">Resilience Level</span>
                                                    <span className="text-xs font-bold text-brand-dark text-right">{isContradicted ? 'Contested · pending reconciliation' : data.dossier_analysis?.financial_identity_profile.financial_resilience_level}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-brand-gray/60 uppercase font-black">Trust Assessment</span>
                                                    <span className={`text-xs font-bold text-right ${isContradicted ? 'text-amber-600' : 'text-brand-success'}`}>{isContradicted ? 'Unverified — declared income contradicted by documents' : data.dossier_analysis?.financial_identity_profile.trust_assessment}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-brand-blue text-white border-none shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <Globe className="w-48 h-48" />
                                        </div>
                                        <CardHeader className="bg-white/10 border-white/5"><CardTitle className="text-white/80">Cross-Border Vector</CardTitle></CardHeader>
                                        <CardContent className="space-y-8 relative z-10">
                                            <div className="space-y-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center text-[10px] text-white/70 uppercase font-black">
                                                        <span>Migration Readiness</span>
                                                        <span>{data.dossier_analysis?.cross_border_analysis.migration_readiness}%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${data.dossier_analysis?.cross_border_analysis.migration_readiness}%` }} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center text-[10px] text-white/70 uppercase font-black">
                                                        <span>Economic Adaptability</span>
                                                        <span>{data.dossier_analysis?.cross_border_analysis.economic_adaptability}%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${data.dossier_analysis?.cross_border_analysis.economic_adaptability}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Global Strengths</p>
                                                <ul className="text-[10px] space-y-2">
                                                    {data.dossier_analysis?.cross_border_analysis?.cross_border_strengths?.map((str: string, i: number) => (
                                                        <li key={i} className="flex gap-2 items-start">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1 flex-shrink-0" />
                                                            <span className="font-medium italic leading-tight">{str}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Main Column: Strengths & Risks */}
                                <div className="lg:col-span-2 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-3">
                                                <ShieldCheck className="w-4 h-4 text-brand-success" />
                                                Core Profile Strengths
                                            </p>
                                            <div className="space-y-4">
                                                {data.dossier_analysis?.strengths.map((s: any, i: number) => (
                                                    <div key={i} className="p-6 bg-white border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="text-sm font-black text-brand-dark uppercase">{s.title}</h4>
                                                            <span className="text-[9px] font-bold text-brand-success uppercase">{(s.confidence * 100).toFixed(0)}% Confidence</span>
                                                        </div>
                                                        <p className="text-xs text-brand-gray/80 font-medium leading-relaxed italic">"{s.description}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-3">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                Integrity Risks & Adjustments
                                            </p>
                                            <div className="space-y-4">
                                                {data.dossier_analysis?.risks.map((r: any, i: number) => (
                                                    <div key={i} className="p-6 bg-slate-50 border border-brand-border rounded-2xl shadow-sm group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="text-sm font-black text-brand-dark uppercase">{r.title}</h4>
                                                            <Badge variant={r.severity > 50 ? 'negative' : 'warning'}>{r.severity}% Sev</Badge>
                                                        </div>
                                                        <p className="text-xs text-brand-gray/80 font-medium leading-relaxed italic">"{r.description}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <Card className="bg-slate-50 border-brand-border">
                                            <CardHeader className="bg-slate-100/50"><CardTitle>Behavioral Intelligence Analysis</CardTitle></CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-brand-border shadow-sm">
                                                    <div>
                                                        <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest">Interaction Stability</p>
                                                        <p className="text-xl font-black text-brand-dark">{data.behavioral_analysis?.behavioral_consistency || 85}%</p>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full border-4 border-brand-blue/10 border-t-brand-blue flex items-center justify-center">
                                                        <Activity className="w-5 h-5 text-brand-blue" />
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest">Stability Signals</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(data.behavioral_analysis?.stability_signals || []).map((s, i) => (
                                                            <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded border border-emerald-100">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-white rounded-xl border border-brand-border italic">
                                                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2">Behavioral Observation</p>
                                                    <p className="text-xs font-semibold text-brand-dark leading-relaxed italic">
                                                        "{data.dossier_analysis?.behavioral_summary?.overall_stability || "Subject exhibits high narrative stability across financial claim points."}"
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-slate-50 border-brand-border">
                                            <CardHeader className="bg-slate-100/50"><CardTitle>Consistency Patterns</CardTitle></CardHeader>
                                            <CardContent className="space-y-4">
                                                {(data.behavioral_analysis?.consistency_patterns || (hasConsistencyConcern ? ["Material consistency or evidence conflict requires review"] : ["No consistency issues detected in provided data"])).map((pattern, i) => (
                                                    <div key={i} className="flex gap-3 items-center text-xs text-brand-dark font-black italic p-3 bg-white border border-brand-border rounded-xl">
                                                        <div className={`w-5 h-5 flex items-center justify-center rounded-full border ${hasConsistencyConcern ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'}`}>
                                                            {hasConsistencyConcern ? <AlertTriangle className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                                                        </div>
                                                        {pattern}
                                                    </div>
                                                ))}
                                                {data.behavioral_analysis?.risk_signals && data.behavioral_analysis?.risk_signals.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Risk Anomalies</p>
                                                        {data.behavioral_analysis?.risk_signals.map((risk, i) => (
                                                            <div key={i} className="flex gap-2 items-center text-[10px] text-red-600 font-bold italic">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                {risk}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="border-brand-border shadow-sm">
                                        <CardHeader><CardTitle>Explainability: Score Evolution Drivers</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <p className="text-[9px] font-black text-brand-success uppercase tracking-widest">Positive Catalysts</p>
                                                        <ul className="space-y-3">
                                                            {data.dossier_analysis?.score_explanation?.score_increase_factors?.map((f: string, i: number) => (
                                                                <li key={i} className="flex gap-3 items-center text-xs text-brand-dark font-black italic">
                                                                    <div className="w-5 h-5 flex items-center justify-center bg-brand-success/10 text-brand-success rounded-full border border-brand-success/20">
                                                                        <TrendingUp className="w-2.5 h-2.5" />
                                                                    </div>
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Pressure Factors</p>
                                                        <ul className="space-y-3">
                                                            {data.dossier_analysis?.score_explanation?.score_decrease_factors?.map((f: string, i: number) => (
                                                                <li key={i} className="flex gap-3 items-center text-xs text-brand-dark font-black italic">
                                                                    <div className="w-5 h-5 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100">
                                                                        <ChevronDown className="w-2.5 h-2.5" />
                                                                    </div>
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="p-8 bg-slate-50 rounded-2xl border border-brand-border flex flex-col justify-center gap-6">
                                                    <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest text-center">Primary Underwriting Weights</p>
                                                    <div className="space-y-4">
                                                        {data.dossier_analysis?.score_explanation?.most_influential_factors?.map((f: string, i: number) => (
                                                            <div key={i} className="px-4 py-3 bg-white border border-brand-border rounded-xl text-center shadow-sm">
                                                                <p className="text-xs font-black text-brand-dark uppercase tracking-tight">{f}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-[9px] text-brand-gray/60 font-medium text-center italic">These factors represent 60% of total score variance.</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {((data.dossier_analysis?.uncertainty_analysis?.high_uncertainty_areas?.length || 0) > 0 ||
                                          (data.dossier_analysis?.uncertainty_analysis?.recommended_additional_evidence?.length || 0) > 0) && (
                                        <Card className="bg-amber-50/20 border-amber-100">
                                            <CardHeader className="bg-amber-50/50 border-amber-100"><CardTitle className="text-amber-800">Uncertainty Remediation</CardTitle></CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Logic Gaps Identified</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.dossier_analysis?.uncertainty_analysis?.high_uncertainty_areas?.map((a: string, i: number) => (
                                                            <span key={i} className="px-2 py-1 bg-white text-amber-700 text-[9px] font-bold rounded border border-amber-200">{a}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {(data.dossier_analysis?.uncertainty_analysis?.recommended_additional_evidence?.length || 0) > 0 && (
                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Evidence Recommendations</p>
                                                    <ul className="text-xs space-y-2">
                                                        {data.dossier_analysis?.uncertainty_analysis?.recommended_additional_evidence?.map((e: string, i: number) => (
                                                            <li key={i} className="flex gap-3 items-center text-brand-dark/80 font-bold italic">
                                                                <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
                                                                {e}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                        )}

                                        <Card>
                                            <CardHeader><CardTitle>Evidence Quality Metrics</CardTitle></CardHeader>
                                            <CardContent className="space-y-8">
                                                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-full w-32 h-32 mx-auto border-4 border-brand-blue/10">
                                                    <span className="text-3xl font-black text-brand-dark leading-none">{evidenceQualityPct}%</span>
                                                    <span className="text-[9px] font-black text-brand-gray uppercase mt-1">Fidelity</span>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[9px] font-black text-brand-success uppercase tracking-widest mb-2">Prime Evidence Nodes</p>
                                                        <ul className="text-[10px] space-y-1.5">
                                                            {data.dossier_analysis?.evidence_summary?.strongest_evidence?.map((e: string, i: number) => (
                                                                <li key={i} className="flex items-center gap-2 font-black text-brand-dark italic">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                                                                    {e}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-brand-blue text-white border-none shadow-xl overflow-hidden relative group cursor-pointer" onClick={() => setActiveTab('pathway')}>
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <TrendingUp className="w-48 h-48" />
                                            </div>
                                            <CardHeader className="bg-white/10 border-white/5">
                                                <CardTitle className="text-white">Forward Growth Assets</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6 relative z-10">
                                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                                                    AI has identified {data.dossier_analysis?.recommendations?.high_impact_actions?.length} high-impact actions to optimize your international economic identity.
                                                </p>
                                                <div className="space-y-2">
                                                    {data.dossier_analysis?.financial_pathway_summary?.top_improvement_priorities?.slice(0, 2).map((p, i) => (
                                                        <div key={i} className="flex gap-2 items-center text-[9px] font-black uppercase text-white">
                                                            <div className="w-1 h-1 bg-cyber-teal rounded-full" />
                                                            {p}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="w-full py-4 mt-2 bg-white text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all group-hover:bg-cyan-400 group-hover:text-brand-dark flex items-center justify-center gap-2">
                                                    Recommended Next Steps 
                                                    <ArrowRightCircle className="w-4 h-4" />
                                                </button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-20 text-center space-y-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-brand-gray animate-pulse">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark uppercase tracking-widest">Generating AI Dossier..</h3>
                                <p className="text-sm text-brand-gray max-w-sm mx-auto italic font-medium">Re-calculating institutional weights and evidence fidelity signals.</p>
                            </div>
                        )}

                        <div className="pt-20 border-t border-brand-border flex justify-between items-center text-[10px] font-black text-brand-gray/30 uppercase tracking-widest">
                            <p>© 2026 Persona.Credit</p>
                            <p>ENCRYPTION: AES-256-GCM-INSTITUTIONAL</p>
                        </div>
                    </div>
                </div>
            );
        case 'pathway':
            return (
                <div className="max-w-5xl mx-auto space-y-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {!isPaid && <PaywallOverlay onUnlock={onGoToPricing} />}
                    <div className={!isPaid ? 'blur-2xl pointer-events-none select-none overflow-hidden h-[800px]' : ''}>
                        <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div>
                                <h1 className="text-4xl font-black text-brand-dark tracking-tighter uppercase italic leading-none mb-2">Financial Improvement Pathway</h1>
                                <p className="text-xs font-bold text-brand-gray uppercase tracking-widest px-2 py-1 bg-slate-100 rounded inline-block">AI Driven Recommendations & Growth Strategy</p>
                            </div>
                        </div>

                        {data.dossier_analysis?.recommendations ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left Column: Priorities & High Impact */}
                                <div className="lg:col-span-1 space-y-10">
                                    <Card className="bg-brand-blue text-white border-none shadow-xl overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <TrendingUp className="w-48 h-48" />
                                        </div>
                                        <CardHeader className="bg-white/10 border-white/5">
                                            <CardTitle className="text-white">Top Improvement Priorities</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6 relative z-10">
                                            <div className="space-y-4">
                                                {data.dossier_analysis?.financial_pathway_summary?.top_improvement_priorities?.map((p: string, i: number) => (
                                                    <div key={i} className="flex gap-3 items-start">
                                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white font-bold text-[10px]">{i+1}</div>
                                                        <p className="text-xs font-bold leading-relaxed">{p}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-6 border-t border-white/10">
                                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Highest Impact Changes</p>
                                                <ul className="space-y-3">
                                                    {data.dossier_analysis?.financial_pathway_summary?.highest_impact_changes?.map((c: string, i: number) => (
                                                        <li key={i} className="flex gap-2 items-center text-[11px] font-bold">
                                                            <Zap className="w-3 h-3 text-emerald-400" />
                                                            {c}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-50 border-brand-border">
                                        <CardHeader><CardTitle>Documentation Support</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            {data.dossier_analysis?.recommendations?.documentation_improvements?.map((item: string, i: number) => (
                                                <div key={i} className="p-4 bg-white border border-brand-border rounded-xl shadow-sm flex items-start gap-3">
                                                    <PlusCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                                                    <p className="text-xs font-bold text-brand-dark leading-tight">{item}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Main Column: High Impact Actions & Risk Reduction */}
                                <div className="lg:col-span-2 space-y-12">
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-3">
                                            <Brain className="w-4 h-4 text-brand-blue" />
                                            High-Impact Growth Actions
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {data.dossier_analysis?.recommendations?.high_impact_actions?.map((action: any, i: number) => (
                                                <div key={i} className="p-6 bg-white border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                                    <div className={`absolute top-0 right-0 w-1.5 h-full ${action.priority === 'high' ? 'bg-red-500' : 'bg-brand-blue'}`}></div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <Badge variant={action.priority === 'high' ? 'negative' : 'info'}>{(action.priority || 'normal').toUpperCase()} PRIORITY</Badge>
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-brand-gray uppercase">Predicting</p>
                                                            <p className="text-sm font-black text-brand-success">+{action.expected_impact} pts</p>
                                                        </div>
                                                    </div>
                                                    <h4 className="text-sm font-black text-brand-dark uppercase mb-2">{action.title}</h4>
                                                    <p className="text-xs text-brand-gray/80 font-medium leading-relaxed italic mb-4">"{action.description}"</p>
                                                    <div className="flex items-center gap-2">
                                                        <BarChart3 className="w-3 h-3 text-brand-gray/40" />
                                                        <p className="text-[9px] font-bold text-brand-gray/40 uppercase">Confidence: {(action.confidence * 100).toFixed(0)}%</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <Card className="bg-slate-50 border-brand-border">
                                            <CardHeader className="bg-slate-100/50"><CardTitle>Stability & Readiness</CardTitle></CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="space-y-4">
                                                    <p className="text-[9px] font-black text-brand-dark uppercase tracking-widest">Financial Stability</p>
                                                    {data.dossier_analysis?.recommendations?.financial_stability_improvements?.map((item: string, i: number) => (
                                                        <div key={i} className="flex gap-3 items-center text-xs text-brand-dark font-black italic p-3 bg-white border border-brand-border rounded-xl">
                                                            <div className="w-5 h-5 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                                                <Check className="w-2.5 h-2.5" />
                                                            </div>
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[9px] font-black text-brand-dark uppercase tracking-widest">Cross-Border Readiness</p>
                                                    {data.dossier_analysis?.recommendations?.cross_border_readiness_improvements?.map((item: string, i: number) => (
                                                        <div key={i} className="flex gap-3 items-center text-xs text-brand-dark font-black italic p-3 bg-white border border-brand-border rounded-xl">
                                                            <div className="w-5 h-5 flex items-center justify-center bg-brand-blue/5 text-brand-blue rounded-full border border-brand-blue/10">
                                                                <Globe className="w-2.5 h-2.5" />
                                                            </div>
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-red-50/10 border-red-100">
                                            <CardHeader className="bg-red-50/50 border-red-100"><CardTitle className="text-red-700">Risk Reduction Strategy</CardTitle></CardHeader>
                                            <CardContent className="space-y-6">
                                                {data.dossier_analysis?.recommendations?.risk_reduction_actions?.map((item: any, i: number) => (
                                                    <div key={i} className="space-y-3 p-4 bg-white border border-red-50 rounded-2xl shadow-sm">
                                                        <div className="flex justify-between items-start">
                                                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Risk: {item.risk}</p>
                                                            <Badge variant="negative">-{item.expected_risk_reduction}% Risk</Badge>
                                                        </div>
                                                        <p className="text-xs font-bold text-brand-dark italic">"{item.recommended_action}"</p>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="border-brand-border border-dashed">
                                        <CardContent className="p-8 text-center space-y-4">
                                            <p className="text-xs font-black text-brand-dark uppercase tracking-widest">Next Steps Execution</p>
                                            <div className="flex flex-wrap justify-center gap-4">
                                                {data.dossier_analysis?.financial_pathway_summary?.recommended_next_steps?.map((step: string, i: number) => (
                                                    <Badge key={i} variant="info" className="py-2 px-4 text-[10px] font-bold">{step}</Badge>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-brand-gray font-medium italic pt-4 leading-relaxed">
                                                Subject is advised to maintain current financial architecture while incrementally implementing these growth nodes.<br/>
                                                <span className="font-bold">Recommendations are projections based on AI analysis of historical evidence and macro-trends. No financial guarantee is implied.</span>
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="p-20 text-center space-y-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-brand-gray animate-pulse">
                                    <Brain className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark uppercase tracking-widest">Recalculating Pathway..</h3>
                                <p className="text-sm text-brand-gray max-w-sm mx-auto italic font-medium">Analyzing evidence nodes to generate intelligent growth vectors.</p>
                            </div>
                        )}

                        <div className="pt-20 border-t border-brand-border flex justify-between items-center text-[10px] font-black text-brand-gray/30 uppercase tracking-widest">
                            <p>© 2026 Persona.Credit</p>
                            <p>STABILITY MODE: ENABLED</p>
                        </div>
                    </div>
                </div>
            );
        case 'dossier':
            return (
                <div className="max-w-4xl mx-auto space-y-10 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {!isPaid && <PaywallOverlay onUnlock={onGoToPricing} />}
                    <div className={!isPaid ? 'blur-2xl pointer-events-none select-none overflow-hidden h-[600px]' : ''}>
                        <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <button 
                                    onClick={() => setActiveTab('overview')}
                                    className="flex items-center gap-2 text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4 hover:text-brand-dark transition-colors"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Back to Overview
                                </button>
                                <h2 className="text-2xl font-bold text-brand-dark tracking-tight">{isContradicted ? 'Evidence Detail' : 'Verified Evidence Detail'}</h2>
                                <p className="text-xs text-brand-gray font-medium mt-1">Professional analysis of cross-border financial documentation.</p>
                            </div>
                            <Badge variant={isContradicted ? 'warning' : 'info'}>{isContradicted ? 'AI Analysis Node' : 'AI Verified Node'}</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {data.documentAnalysis.map((doc, i) => {
                                 const isIrrelevant = (doc.documentType || '').toLowerCase().includes('irrelevant') || (doc.status || '').toLowerCase().includes('failed');
                                 return (
                                     <Card key={i} className={`group transition-all hover:shadow-lg hover:border-brand-blue ${isIrrelevant ? 'opacity-40 grayscale pointer-events-none' : ''} border-brand-border shadow-sm`}>
                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-110 duration-500 ${isIrrelevant ? 'bg-slate-50 border-brand-border text-brand-gray/30' : 'bg-brand-blue/5 border-brand-blue/10 text-brand-blue'}`}>
                                                        <FileText className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-brand-dark tracking-tight uppercase">{doc.documentType}</h3>
                                                        <p className="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest mt-1 px-1.5 py-0.5 bg-slate-50 rounded inline-block">Ref: DG-VAL-{(i+1)*1042}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={isIrrelevant ? 'negative' : 'positive'}>{doc.status}</Badge>
                                            </div>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-brand-border">
                                                <div className="flex-1 space-y-4">
                                                    <div className="p-4 bg-slate-50 rounded-xl border border-brand-border italic">
                                                        <p className="text-sm text-brand-dark font-medium leading-relaxed">"{doc.notes || 'Verification successful: No structural anomalies detected in evidence packet.'}"</p>
                                                    </div>
                                                    
                                                    {doc.statementPeriod && (
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                                                            <div>
                                                                <p className="text-[9px] font-bold text-brand-gray/40 uppercase tracking-widest mb-1">Audit Period</p>
                                                                <p className="text-[11px] font-bold text-brand-dark uppercase">{doc.statementPeriod}</p>
                                                            </div>
                                                            {doc.totalInflow && (
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-brand-gray/40 uppercase tracking-widest mb-1">Gross Inflow</p>
                                                                    <p className="text-[11px] font-bold text-brand-blue uppercase">${doc.totalInflow.toLocaleString()}</p>
                                                                </div>
                                                            )}
                                                            {doc.endingBalance && (
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-brand-gray/40 uppercase tracking-widest mb-1">Spot Balance</p>
                                                                    <p className="text-[11px] font-bold text-brand-dark uppercase">${doc.endingBalance.toLocaleString()}</p>
                                                                </div>
                                                            )}
                                                            {doc.consistencyScore !== undefined && (
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-brand-gray/40 uppercase tracking-widest mb-1">Consistency</p>
                                                                    <p className="text-[11px] font-bold text-emerald-600 uppercase">{(doc.consistencyScore * 100).toFixed(0)}%</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center justify-center p-4 min-w-[120px] bg-brand-blue/5 rounded-2xl border border-brand-blue/10 group-hover:bg-brand-blue group-hover:border-brand-blue transition-all group-hover:text-white">
                                                    <span className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-1 group-hover:text-white/70">Fidelity</span>
                                                    <span className="text-2xl font-bold italic">{(doc.trustLevel * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                     </Card>
                                 )
                            })}
                        </div>
                    </div>
                </div>
            );
        case 'share':
            return (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                    <button
                        onClick={() => setActiveTab('overview')}
                        className="flex items-center gap-2 text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4 hover:text-brand-dark transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Overview
                    </button>

                    <div className="text-center space-y-3 pt-6">
                        <div className="w-16 h-16 bg-brand-blue text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-dark tracking-tight">Share Your Report</h2>
                        <p className="text-sm text-brand-gray font-medium max-w-sm mx-auto leading-relaxed">
                            Download your verification dossier as a PDF and send it directly to your landlord, bank, or lender.
                        </p>
                    </div>

                    <Card className="p-8 space-y-6 bg-white border border-brand-border rounded-3xl shadow-sm">
                        {/* Download PDF */}
                        <div className="flex items-center gap-4 p-5 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl">
                            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-brand-dark">Download PDF Report</p>
                                <p className="text-[10px] text-brand-gray mt-0.5">A formatted dossier you can email, print, or attach to your application.</p>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                className="px-5 py-2.5 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-blue/90 transition-all shrink-0"
                            >
                                Export PDF
                            </button>
                        </div>

                        {/* v34.6: Email to lender — opens the user's mail client with a prefilled
                            message; the exported PDF is attached by the user (no email backend). */}
                        <div className="flex items-center gap-4 p-5 bg-white border border-brand-border rounded-2xl">
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-brand-dark">Email to Lender</p>
                                <p className="text-[10px] text-brand-gray mt-0.5">Opens your mail app with a ready-to-send message. Attach the exported PDF before sending. Use Copy Link separately for a secure online report.</p>
                            </div>
                            <button
                                onClick={() => {
                                    // v34.25-safe: email drafting never publishes a report link in
                                    // the background. Copy Link is the sole verified online-sharing path.
                                    const subject = encodeURIComponent(`Persona.Credit Verification Report — ${data.fullName || 'Applicant'} (${data.shareId || ''})`);
                                    const body = encodeURIComponent(`Hello,\n\nPlease find attached my Persona.Credit cross-border financial verification report.\n\nApplicant: ${data.fullName || '—'}\nReport ID: ${data.shareId || '—'}\nTransferScore: ${data.score || '—'} / 1000\nVerified monthly income (USD): ${data.reconciliation?.verified_monthly_usd ? '$' + Number(data.reconciliation.verified_monthly_usd).toLocaleString() + '/mo' : 'see report'}\n\nPlease attach the exported PDF report before sending. To share a secure online report separately, use the Copy Link button in Persona.Credit.\n\nBest regards,\n${data.fullName || ''}`);
                                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                }}
                                className="px-5 py-2.5 bg-white border-2 border-brand-blue text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-blue/5 transition-all shrink-0"
                            >
                                Email to Lender
                            </button>
                            {/* v34.16: Copy Link — mail-client-independent sharing path. Clipboard
                                write goes FIRST (still inside the user gesture); publish runs in
                                the background. */}
                            {data.shareId && (
                                <button
                                    onClick={() => {
                                        const reportLink = `${window.location.origin}/report/${data.shareId}`;
                                        // Clipboard write stays synchronous (browser gesture rule).
                                        navigator.clipboard.writeText(reportLink).catch((err) => console.warn('Clipboard write failed:', err));
                                        setLinkRevoked(false);
                                        setLinkPublishError(false);
                                        setLinkCopied(false);
                                        // v34.24 (P1): only claim success once the SERVER confirms the
                                        // share record is published — otherwise the recipient would open
                                        // a dead link. On failure, surface a retry instead of "Copied ✓".
                                        storage.setStrict(`pc:share:${data.shareId}`, { ...data, ownerEmail: userId })
                                            .then(() => {
                                                setLinkCopied(true);
                                                setTimeout(() => setLinkCopied(false), 2500);
                                            })
                                            .catch((err) => {
                                                console.warn('Share record publish failed:', err);
                                                setLinkPublishError(true);
                                            });
                                    }}
                                    className={`px-5 py-2.5 border-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shrink-0 ${linkPublishError ? 'border-red-400 text-red-600 bg-red-50' : linkCopied ? 'border-brand-success text-brand-success bg-brand-success/5' : 'border-brand-border text-brand-dark bg-white hover:bg-slate-50'}`}
                                >
                                    {linkPublishError ? 'Publish failed — retry' : linkCopied ? 'Copied ✓' : 'Copy Link'}
                                </button>
                            )}
                        </div>
                        {/* v34.18: revoke the published link (right to change your mind).
                            Copy Link publishes it again on demand. */}
                        {data.shareId && (
                            <div className="flex items-center justify-end px-1">
                                {linkRevoked ? (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Link revoked — Copy Link publishes it again</span>
                                ) : (
                                    <button
                                        onClick={() => setRevokeConfirm(true)}
                                        className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 underline underline-offset-4 transition-colors"
                                    >
                                        Revoke shared link
                                    </button>
                                )}
                            </div>
                        )}
                        {revokeConfirm && (
                            <ConfirmModal
                                title="Revoke Shared Link?"
                                message="Anyone holding the current link will see 'Report Unavailable' instead of your report. You can publish the same link again anytime with Copy Link."
                                confirmLabel="Revoke"
                                cancelLabel="Keep Link"
                                danger
                                onConfirm={() => {
                                    setRevokeError(false);
                                    storage.deleteStrict(`pc:share:${data.shareId}`)
                                        .then(() => {
                                            setLinkRevoked(true);
                                            setRevokeConfirm(false);
                                        })
                                        .catch((err) => {
                                            console.warn('Revoke failed:', err);
                                            setLinkRevoked(false);
                                            setRevokeError(true);
                                            setRevokeConfirm(false);
                                        });
                                }}
                                onClose={() => setRevokeConfirm(false)}
                            />
                        )}
                        {revokeError && (
                            <div className="flex items-center justify-end px-1">
                                <button
                                    onClick={() => { setRevokeError(false); setRevokeConfirm(true); }}
                                    className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 underline underline-offset-4 transition-colors"
                                >
                                    Revoke failed — retry
                                </button>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-gray">How to share with a lender</p>
                            {[
                                'Export the PDF using the button above.',
                                'Email it to your landlord, property manager, or bank officer.',
                                'You can reference your Report ID: ' + (data.shareId || 'See your report header'),
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                                    <p className="text-[11px] text-brand-gray leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>

                        {/* Honest disclaimer */}
                        <div className="bg-slate-50 border border-brand-border rounded-xl p-4">
                            <p className="text-[10px] text-brand-gray leading-relaxed">
                                <span className="font-bold text-brand-dark">Note:</span> This report is generated by Persona.Credit AI analysis.
                                It does not constitute an official credit bureau record. It is an explanatory document to help lenders
                                understand your cross-border financial profile.
                            </p>
                        </div>
                    </Card>
                </div>
            );

        case 'simulator':
            return (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className="flex items-center gap-2 text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4 hover:text-brand-dark transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Overview
                    </button>
                    <div className="text-center space-y-4">
                        <Badge variant="info">Predictive Processing</Badge>
                        <h2 className="text-3xl font-bold text-brand-dark tracking-tight">Analysis Engine</h2>
                        <p className="text-sm text-brand-gray font-medium max-w-lg mx-auto leading-relaxed">Adjust your financial variables to see potential impacts on your global identity score.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                        <Card className="h-fit">
                            <CardHeader><CardTitle>Simulation Environment</CardTitle></CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-2">Evidence Variable</label>
                                    <select 
                                        value={simField} 
                                        onChange={(e) => setSimField(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-brand-border rounded-xl text-[11px] font-bold text-brand-dark uppercase tracking-widest focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="personal_income_ppp">Net Annual Income (PPP)</option>
                                        <option value="liquid_savings_months">Liquid Savings (Months)</option>
                                        <option value="rent_to_income_ratio">Rent/Income Ratio</option>
                                        <option value="years_of_financial_history">Credit Evolution (Years)</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-2">Simulation Constant</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 75000"
                                        value={simValue} 
                                        onChange={(e) => setSimValue(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full p-4 bg-slate-50 border border-brand-border rounded-xl text-[11px] font-bold text-brand-dark placeholder:text-brand-gray/30 focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none"
                                    />
                                </div>

                                <button 
                                    onClick={handleRunSimulation}
                                    disabled={isSimulating || simValue === ''}
                                    className="w-full py-5 bg-brand-blue text-white text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-brand-blue/90"
                                >
                                    {isSimulating ? 'Recalculating Logic..' : 'Run Simulation'}
                                </button>
                            </CardContent>
                        </Card>

                        <div className="space-y-8">
                            <Card className="relative overflow-hidden group min-h-[320px] flex flex-col justify-center border-brand-border">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                                <CardContent className="text-center space-y-6 relative z-10">
                                    {!simResult ? (
                                        <div className="py-12 space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 border border-brand-border rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                                <Activity className="w-6 h-6 text-brand-gray/30" />
                                            </div>
                                            <p className="text-[10px] font-bold text-brand-gray/40 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">Initialize environment variables to calculate predictive output.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in zoom-in-95 duration-500 w-full">
                                            <div>
                                                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-4">Projected Dossier Score</p>
                                                <div className="text-7xl font-bold text-brand-dark tracking-tight">
                                                    {simResult.predictedScore}
                                                </div>
                                                <div className={`inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${simResult.predictedScore >= (data.score || 0) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                    {simResult.predictedScore >= (data.score || 0) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                    {Math.abs(simResult.predictedScore - (data.score || 0))} Point Variance
                                                </div>
                                            </div>
                                            <div className="p-6 bg-slate-50 border border-brand-border rounded-2xl text-left">
                                                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-3">Verification Reasoning</p>
                                                <p className="text-xs text-brand-dark font-medium leading-relaxed italic">"{simResult.reasoning}"</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="p-8 bg-brand-blue/5 border border-brand-blue/10 rounded-3xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-brand-dark uppercase tracking-widest italic leading-none">Underwriting Logic</h4>
                                </div>
                                <p className="text-xs text-brand-gray font-medium leading-relaxed italic">The Persona.Credit uses data weights from US benchmarks and origin country PPP indices to project cross-border reliability. Results are probabilistic indicators.</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'overview':
      default:
        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                
                {isAdmin && (
                    <Card className="bg-red-50 border-red-200 p-8 border-dashed shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-red-900 uppercase tracking-tight italic">Admin Control Node</h2>
                                    <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mt-1">Authorized Access: Full System Visibility & Record Management</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <button onClick={() => setShowRegistry(true)} className="px-5 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-md active:scale-95">User Registry</button>
                                {/* v34.22 audit: not implemented yet — shown as visually non-interactive, no dead buttons */}
                                <button disabled title="Coming in a later release" className="px-5 py-2 bg-white text-red-300 border border-red-100 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-not-allowed opacity-60">Manual Override</button>
                                <button disabled title="Coming in a later release" className="px-5 py-2 bg-white text-red-300 border border-red-100 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-not-allowed opacity-60">Service Health</button>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.pppContextOnly ? (
                        <PillarCard
                            label="Verified Income"
                            value={data.reconciliation?.verified_monthly_usd > 0 ? `$${Math.round(data.reconciliation.verified_monthly_usd).toLocaleString()}` : '—'}
                            sublabel="documented /mo (USD)"
                            icon={<DollarSign className="w-5 h-5" />}
                            variant={isContradicted ? 'negative' : 'default'}
                        />
                    ) : (
                        <PillarCard
                            label="Purchasing Power"
                            value={`$${(data.underwritingPillars?.purchasingPowerEquivalence || 0).toLocaleString()}`}
                            sublabel="equiv. (origin PPP)"
                            icon={<DollarSign className="w-5 h-5" />}
                        />
                    )}
                    <PillarCard 
                        label="Stability Index" 
                        value={`${data.underwritingPillars?.stabilityScore || 0}%`} 
                        sublabel="fidelity" 
                        icon={<Activity className="w-5 h-5" />}
                        variant={data.underwritingPillars?.stabilityScore && data.underwritingPillars.stabilityScore > 80 ? 'positive' : 'default'}
                    />
                    <PillarCard 
                        label="Inflation Defense" 
                        value={data.underwritingPillars?.inflationDefenseFactor || 'Neutral'} 
                        icon={<Shield className="w-5 h-5" />}
                        variant={data.underwritingPillars?.inflationDefenseFactor === 'Positive' ? 'positive' : data.underwritingPillars?.inflationDefenseFactor === 'Negative' ? 'negative' : 'default'}
                    />
                    <PillarCard 
                        label="Transferability" 
                        value={`${data.underwritingPillars?.transferabilityIndex || 0}%`} 
                        sublabel="mobility" 
                        icon={<Globe className="w-5 h-5" />}
                    />
                </div>

                {data.geo?.already_in_destination && (
                    <Card className="border-brand-border shadow-sm" >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-5 h-5 text-brand-blue" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-1">Geography — Already Resident</p>
                                    <p className="text-sm font-bold text-brand-dark m-0">Applicant is already established in {data.geo.destination_country || 'the destination country'}.</p>
                                    <p className="text-xs text-brand-gray leading-relaxed mt-1 mb-0">This dossier is framed for a current resident, not a prospective mover. Signals: {(data.geo.signals || []).join('; ') || 'destination footprint detected'}.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {data.reconciliation && (() => {
                    const rec = data.reconciliation;
                    const statusMap: Record<string, { label: string; bg: string; fg: string }> = {
                        verified:     { label: 'Document-Verified', bg: '#ECFDF5', fg: '#047857' },
                        partial:      { label: 'Partially Verified', bg: '#FEFCE8', fg: '#A16207' },
                        declared:     { label: 'Declared (unverified)', bg: '#FFF7ED', fg: '#C2410C' },
                        contradicted: { label: 'Contradicted', bg: '#FEF2F2', fg: '#B91C1C' },
                        unverified:   { label: 'No income evidence', bg: '#F8FAFC', fg: '#64748B' },
                    };
                    const s = statusMap[rec.income_status] || statusMap.unverified;
                    const fmt = (n: number) => `$${Math.round(n || 0).toLocaleString()}`;
                    return (
                        <Card className="border-brand-border shadow-sm">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest m-0">Income Reconciliation — Declared vs Verified</p>
                                    <span style={{ background: s.bg, color: s.fg }} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-1">Declared by applicant</p>
                                        <p className="text-2xl font-bold text-brand-dark m-0">{rec.declared_monthly_usd > 0 ? fmt(rec.declared_monthly_usd) : '—'}<span className="text-xs text-brand-gray font-medium">{rec.declared_monthly_usd > 0 ? '/mo' : ''}</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-1">Verified by documents</p>
                                        <p className="text-2xl font-bold m-0" style={{ color: rec.verified_monthly_usd > 0 ? '#047857' : '#94A3B8' }}>{rec.verified_monthly_usd > 0 ? fmt(rec.verified_monthly_usd) : '—'}<span className="text-xs text-brand-gray font-medium">{rec.verified_monthly_usd > 0 ? '/mo' : ''}</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-1">Gap</p>
                                        <p className="text-2xl font-bold m-0" style={{ color: rec.discrepancy_pct == null ? '#94A3B8' : (rec.discrepancy_pct < -15 ? '#B91C1C' : '#475569') }}>{rec.discrepancy_pct == null ? '—' : `${rec.discrepancy_pct > 0 ? '+' : ''}${rec.discrepancy_pct}%`}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-brand-dark/70 leading-relaxed mt-6 mb-0 italic">{rec.explanation}</p>
                                {rec.savings_source === 'statement_balance' && (
                                    <p className="text-xs text-brand-dark/60 leading-relaxed mt-2 mb-0">Savings buffer taken from the statement ending balance (no declared figure — docs-first).</p>
                                )}
                                {rec.savings_source === 'self_declared_unverified' && (
                                    <p className="text-xs font-semibold mt-2 mb-0" style={{ color: '#B45309' }}>Savings figure is self-declared and unverified — no supporting statement.</p>
                                )}
                                {rec.name_mismatch && (
                                    <p className="text-xs font-bold mt-3 mb-0" style={{ color: '#B91C1C' }}>⚠ Name on documents does not match the applicant name on file.</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })()}

                {data.countryBenchmarkAvailable === false ? (
                    <Card className="bg-white border-brand-border p-8 text-brand-dark shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 border border-brand-border rounded-xl flex items-center justify-center flex-shrink-0">
                                <Globe className="w-6 h-6 text-brand-gray" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-1">Country Benchmark</p>
                                <p className="text-lg font-bold text-brand-dark m-0">Country benchmark unavailable</p>
                                <p className="text-xs text-brand-gray mt-1 mb-0">More country profiles are being added continuously. No default PPP or inflation values were used.</p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-brand-border p-8 text-brand-dark flex items-center justify-between group overflow-hidden relative shadow-sm">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000"></div>
                             <div className="relative z-10">
                                <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-1">{data.pppContextOnly ? 'PPP — Origin Context Only' : 'Live PPP Multiplier'}</p>
                                <p className={`text-3xl font-bold tracking-tight ${data.pppContextOnly ? 'text-brand-gray' : 'text-brand-blue'}`}>{data.livePPPMultiplier !== undefined && data.livePPPMultiplier !== null && data.livePPPMultiplier !== '' ? `x${data.livePPPMultiplier}` : 'PPP data unavailable'}</p>
                                {data.pppContextOnly && <p className="text-[9px] text-brand-gray/70 mt-1 font-medium normal-case tracking-normal">Origin purchasing power — not US repayment capacity. Underwriting uses documented USD income.</p>}
                             </div>
                             <div className="relative z-10 w-12 h-12 bg-slate-50 border border-brand-border rounded-xl flex items-center justify-center">
                                <Globe className="w-6 h-6 text-brand-blue" />
                             </div>
                        </Card>
                        <Card className="bg-white border-brand-border p-8 text-brand-dark flex items-center justify-between group overflow-hidden relative shadow-sm">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000"></div>
                             <div className="relative z-10">
                                <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-1">Inflation Offset</p>
                                <p className="text-3xl font-bold tracking-tight text-brand-blue">{Number(data.realTimeInflationOffset) > 0 ? '+' : ''}{data.realTimeInflationOffset}%</p>
                             </div>
                             <div className="relative z-10 w-12 h-12 bg-slate-50 border border-brand-border rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-brand-blue" />
                             </div>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <Card className="border-brand-border shadow-md relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-blue"></div>
                        <CardContent className="p-10">
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between items-start">
                                    <Badge variant="info" className="w-fit">Executive Summary</Badge>
                                    <Badge variant={isContradicted ? 'warning' : 'positive'} className="flex items-center gap-1.5 px-3 py-1 text-[8px] font-bold uppercase tracking-widest shadow-sm">
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isContradicted ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                        {isContradicted ? 'Contested' : 'Assessed'}: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </Badge>
                                </div>
                                <p className="text-xl font-bold leading-relaxed text-brand-dark">"{data.summaryStatement}"</p>
                                <div className="flex items-center gap-6 pt-6 border-t border-brand-border">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">Evidence Fidelity</p>
                                        <p className="text-sm font-bold text-brand-dark italic">{(data.confidence * 100).toFixed(0)}% Confidence</p>
                                    </div>
                                    <div className="w-px h-8 bg-brand-border"></div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">Protocol Sync</p>
                                        <Badge variant="positive" className="mt-1">Active Node</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-brand-border shadow-md">
                        <CardHeader><CardTitle>Market Readiness</CardTitle></CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-brand-border shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border flex items-center justify-center shadow-sm">
                                        <Globe className="w-6 h-6 text-brand-blue" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">Target Territory</p>
                                        <p className="font-bold text-brand-dark">{data.destination_country || data.geo?.destination_country || 'Destination'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Fit Signal</p>
                                    <p className={`text-lg font-bold uppercase tracking-tight ${isContradicted || data.score < 500 ? 'text-amber-600' : 'text-emerald-600'}`}>{isContradicted ? 'Contested' : data.score < 500 ? 'Pending Evidence' : (data.destinationCountryFit || 'Assessed')}</p>
                                </div>
                            </div>

                            {(['renting', 'loan', 'auto', 'banking'] as const).some(uc => data.useCases?.[uc]?.label || Number(data.useCases?.[uc]?.score) > 0) && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {(['renting', 'loan', 'auto', 'banking'] as const).map(uc => (
                                    <div key={uc} className="flex flex-col p-4 rounded-xl bg-white border border-brand-border text-center transition-all hover:shadow-md group">
                                        <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mb-2 group-hover:text-brand-blue transition-colors">{uc}</p>
                                        <p className="text-[10px] font-bold text-brand-dark uppercase truncate leading-none">{data.useCases?.[uc]?.label || 'TBD'}</p>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-brand-blue transition-all duration-1000 shadow-sm" style={{ width: `${data.useCases?.[uc]?.score || 0}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── ORIGINAL DOCUMENT DATA & INTERPRETATION ── */}
                {data.country_analysis?.raw_data_table && (
                    <Card className="border-brand-border shadow-md">
                        <CardHeader>
                            <CardTitle>Original Document Data & Interpretation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <p className="text-[11px] text-brand-gray leading-relaxed">
                                Direct figures from your origin-country documents, translated into USD and
                                explained against {data.origin_country || 'origin-country'} economic data — the
                                view a lender sees to assess you fairly.
                            </p>
                            <div className="overflow-hidden rounded-xl border border-brand-border">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-brand-gray">Original Figure</th>
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-brand-gray">Translation & Context</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(() => {
                                            const rdt = data.country_analysis.raw_data_table;
                                            const rows = [];
                                            if (rdt.monthly_income_original) rows.push(
                                                <tr key="inc">
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="text-[13px] font-black text-brand-dark">{rdt.monthly_income_original}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-wide text-brand-gray mt-0.5">Monthly Income</p>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="text-[12px] font-bold text-brand-blue">{rdt.monthly_income_usd || '—'}</p>
                                                        {!data.pppContextOnly && rdt.ppp_equivalent_usd && <p className="text-[10px] text-brand-gray mt-1">{rdt.ppp_equivalent_usd}</p>}
                                                    </td>
                                                </tr>
                                            );
                                            if (rdt.income_percentile_label) rows.push(
                                                <tr key="pct">
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="text-[12px] font-bold text-brand-dark">{rdt.income_percentile_label}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-wide text-brand-gray mt-0.5">National Standing</p>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="text-[11px] text-brand-gray leading-relaxed">{rdt.income_vs_national_median || '—'}</p>
                                                    </td>
                                                </tr>
                                            );
                                            if (rdt.income_vs_sector_median) rows.push(
                                                <tr key="sec">
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="text-[12px] font-bold text-brand-dark">Profession Benchmark</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-wide text-brand-gray mt-0.5">vs Sector Median</p>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="text-[11px] text-brand-gray leading-relaxed">{rdt.income_vs_sector_median}</p>
                                                        {rdt.sector_benchmark_note && <p className="text-[10px] text-brand-gray/70 italic mt-1">{rdt.sector_benchmark_note}</p>}
                                                    </td>
                                                </tr>
                                            );
                                            if (rdt.document_institution || rdt.document_period) rows.push(
                                                <tr key="doc">
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="text-[12px] font-bold text-brand-dark">{rdt.document_institution || 'Document'}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-wide text-brand-gray mt-0.5">Source Institution</p>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="text-[11px] text-brand-gray">{rdt.document_period || '—'}</p>
                                                        {rdt.income_pattern && <p className="text-[10px] text-brand-gray/70 mt-1">{rdt.income_pattern}</p>}
                                                    </td>
                                                </tr>
                                            );
                                            return rows;
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                            {data.country_analysis.origin_income_context && (
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray mb-2">In Origin-Country Context</p>
                                    <p className="text-[12px] text-brand-dark leading-relaxed">{data.country_analysis.origin_income_context}</p>
                                </div>
                            )}
                            {data.country_analysis.income_transfer_narrative && (
                                <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-2">What This Means For A Lender</p>
                                    <p className="text-[12px] text-brand-dark leading-relaxed font-medium">{data.country_analysis.income_transfer_narrative}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── INCOME AUDIT — WHICH CREDITS COUNTED (v34.4 deterministic engine) ── */}
                {(data.document_extractions || []).some((d: any) => d.is_usable && d.income_audit?.engine === 'deterministic') && (
                    <Card className="border-brand-border shadow-md">
                        <CardHeader>
                            <CardTitle>Income Audit — Which Credits Counted</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <p className="text-[11px] text-brand-gray leading-relaxed">
                                Every incoming credit from your statements, classified by deterministic rules —
                                not model judgement. This is the exact basis of the verified income figure.
                            </p>
                            {(data.document_extractions || [])
                                .filter((d: any) => d.is_usable && d.income_audit?.engine === 'deterministic')
                                .map((d: any, di: number) => {
                                    const audit = d.income_audit;
                                    const cur = d.currency_code || '';
                                    const fmtAmt = (n: number) => `${cur} ${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                                    const REASON_LABEL: Record<string, string> = {
                                        self_transfer_marker: 'Self-transfer (own accounts)',
                                        sender_is_applicant: 'Sender matches applicant',
                                        own_company: "Applicant's own company",
                                        bank_interest: 'Bank interest (not income)',
                                    };
                                    return (
                                        <div key={di} className="space-y-3">
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <p className="text-[12px] font-bold text-brand-dark m-0">{d.issuing_institution || 'Document'}{d.period_covered ? ` — ${d.period_covered}` : ''}</p>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1">Deterministic engine</span>
                                            </div>
                                            <div className="overflow-x-auto rounded-xl border border-brand-border">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50">
                                                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-gray">Date</th>
                                                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-gray">Payer</th>
                                                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-gray text-right">Amount</th>
                                                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-gray">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(audit.counted || []).map((t: any, i: number) => (
                                                            <tr key={`c${i}`} className="border-t border-brand-border">
                                                                <td className="px-3 py-2 text-[11px] text-brand-gray whitespace-nowrap">{t.date || '—'}</td>
                                                                <td className="px-3 py-2 text-[11px] text-brand-dark">{t.counterparty}</td>
                                                                <td className="px-3 py-2 text-[11px] font-semibold text-brand-dark text-right whitespace-nowrap">{fmtAmt(t.amount)}</td>
                                                                <td className="px-3 py-2 text-[10px] font-bold text-emerald-700 whitespace-nowrap">Counted</td>
                                                            </tr>
                                                        ))}
                                                        {(audit.excluded || []).map((t: any, i: number) => (
                                                            <tr key={`e${i}`} className="border-t border-brand-border bg-slate-50/60">
                                                                <td className="px-3 py-2 text-[11px] text-brand-gray whitespace-nowrap">{t.date || '—'}</td>
                                                                <td className="px-3 py-2 text-[11px] text-brand-gray line-through decoration-slate-300">{t.counterparty}</td>
                                                                <td className="px-3 py-2 text-[11px] text-brand-gray text-right whitespace-nowrap">{fmtAmt(t.amount)}</td>
                                                                <td className="px-3 py-2 text-[10px] font-bold text-amber-700 whitespace-nowrap">Excluded — {REASON_LABEL[t.reason] || t.reason || 'rule'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="text-[11px] text-brand-gray">
                                                Counted {audit.counted_count} credit(s) totalling <span className="font-semibold text-brand-dark">{fmtAmt(audit.counted_total)}</span> over {audit.period_months_used} month(s) → <span className="font-semibold text-brand-dark">{fmtAmt(Math.round((audit.counted_total || 0) / (audit.period_months_used || 1)))}/mo</span>{audit.excluded_count > 0 ? `; excluded ${audit.excluded_count} non-income credit(s).` : '; nothing excluded.'}
                                            </p>
                                        </div>
                                    );
                                })}
                        </CardContent>
                    </Card>
                )}

                {/* ── OBLIGATIONS AUDIT — WHICH DEBITS COUNTED (v34.10 deterministic engine) ── */}
                {(data.document_extractions || []).some((d: any) => d.is_usable && d.obligations_audit?.engine === 'deterministic') && (
                    <Card className="border-brand-border shadow-md">
                        <CardHeader>
                            <CardTitle>Obligations Audit — Which Debits Counted</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <p className="text-[11px] text-brand-gray leading-relaxed">
                                Every outgoing debit from your statements, classified by deterministic rules —
                                not model judgement. This is the exact basis of the monthly obligations figure.
                            </p>
                            {(data.document_extractions || [])
                                .filter((d: any) => d.is_usable && d.obligations_audit?.engine === 'deterministic')
                                .map((d: any, di: number) => {
                                    const audit = d.obligations_audit;
                                    const cur = d.currency_code || '';
                                    const fmtAmt = (n: number) => `${cur} ${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                                    const OBL_REASON_LABEL: Record<string, string> = {
                                        rent_housing: 'Rent / housing',
                                        utilities: 'Utilities',
                                        loan_or_credit: 'Loan / credit card',
                                        insurance: 'Insurance',
                                        tuition: 'Tuition',
                                        recurring_payment: 'Recurring contractual payment',
                                        ordinary_merchant_purchase: 'Excluded: ordinary merchant purchase',
                                        own_transfer: 'Own-account transfer (not spending)',
                                        one_off_or_discretionary: 'One-off / discretionary',
                                    };
                                    return (
                                        <div key={di} className="space-y-3">
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <p className="text-[12px] font-bold text-brand-dark m-0">{d.issuing_institution || 'Document'}{d.period_covered ? ` — ${d.period_covered}` : ''}</p>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1">Deterministic engine</span>
                                            </div>
                                            <div className="overflow-x-auto rounded-xl border border-brand-border">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50">
                                                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-gray">Date</th>
                                                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-gray">Payee</th>
                                                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-gray text-right">Amount</th>
                                                            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-brand-gray">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(audit.counted || []).map((t: any, i: number) => (
                                                            <tr key={`c${i}`} className="border-t border-brand-border">
                                                                <td className="px-3 py-2 text-[11px] text-brand-gray whitespace-nowrap">{t.date || '—'}</td>
                                                                <td className="px-3 py-2 text-[11px] text-brand-dark">{t.counterparty}</td>
                                                                <td className="px-3 py-2 text-[11px] font-semibold text-brand-dark text-right whitespace-nowrap">{fmtAmt(t.amount)}</td>
                                                                <td className="px-3 py-2 text-[10px] font-bold text-emerald-700 whitespace-nowrap">Counted — {OBL_REASON_LABEL[t.reason] || t.reason || 'obligation'}</td>
                                                            </tr>
                                                        ))}
                                                        {(audit.excluded || []).map((t: any, i: number) => (
                                                            <tr key={`e${i}`} className="border-t border-brand-border bg-slate-50/60">
                                                                <td className="px-3 py-2 text-[11px] text-brand-gray whitespace-nowrap">{t.date || '—'}</td>
                                                                <td className="px-3 py-2 text-[11px] text-brand-gray line-through decoration-slate-300">{t.counterparty}</td>
                                                                <td className="px-3 py-2 text-[11px] text-brand-gray text-right whitespace-nowrap">{fmtAmt(t.amount)}</td>
                                                                <td className="px-3 py-2 text-[10px] font-bold text-amber-700 whitespace-nowrap">Excluded — {OBL_REASON_LABEL[t.reason] || t.reason || 'rule'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="text-[11px] text-brand-gray">
                                                Counted {audit.counted_count} debit(s) totalling <span className="font-semibold text-brand-dark">{fmtAmt(audit.counted_total)}</span> over {audit.period_months_used} month(s) → <span className="font-semibold text-brand-dark">{fmtAmt(Math.round((audit.counted_total || 0) / (audit.period_months_used || 1)))}/mo</span>{audit.excluded_count > 0 ? `; excluded ${audit.excluded_count} debit(s) as non-obligations.` : '; nothing excluded.'}
                                            </p>
                                        </div>
                                    );
                                })}
                        </CardContent>
                    </Card>
                )}

                {/* ── FINANCIAL CULTURE CONTEXT ── */}
                {data.country_analysis?.financial_culture_context && (
                    <Card className="border-brand-border shadow-md">
                        <CardHeader>
                            <CardTitle>Financial Culture Context — {data.origin_country || 'Origin Country'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-[11px] text-brand-gray leading-relaxed">
                                How money is managed in your origin country — so a lender does not misread
                                locally-normal financial behaviour as risk.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray mb-2">How Finances Work Here</p>
                                <p className="text-[12px] text-brand-dark leading-relaxed">{data.country_analysis.financial_culture_context}</p>
                            </div>
                            {Array.isArray(data.country_analysis.cultural_asset_notes) && data.country_analysis.cultural_asset_notes.length > 0 && (
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray mb-2 ml-1">Locally-Normal Assets & Behaviours</p>
                                    <div className="space-y-2">
                                        {data.country_analysis.cultural_asset_notes.map((note: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2 bg-white border border-brand-border rounded-lg p-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                                                <p className="text-[11px] text-brand-dark leading-relaxed">{note}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {(data.country_analysis.cash_economy_note || data.country_analysis.debt_culture_note) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.country_analysis.cash_economy_note && (
                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray mb-1.5">On Cash Usage</p>
                                            <p className="text-[11px] text-brand-dark leading-relaxed">{data.country_analysis.cash_economy_note}</p>
                                        </div>
                                    )}
                                    {data.country_analysis.debt_culture_note && (
                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-gray mb-1.5">On Debt & Credit</p>
                                            <p className="text-[11px] text-brand-dark leading-relaxed">{data.country_analysis.debt_culture_note}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {data.country_analysis.lender_cultural_guidance && (
                                <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-2">Guidance For The Lender</p>
                                    <p className="text-[12px] text-brand-dark leading-relaxed font-medium">{data.country_analysis.lender_cultural_guidance}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {((data.improvements || (data.recommendations || []).map(r => r.text)).filter(Boolean).length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1">Recommended Next Steps</h4>
                        <div className="space-y-3">
                            {(data.improvements || (data.recommendations || []).map(r => r.text)).slice(0, 3).map((text, i) => (
                                <div key={i} className="group flex items-center justify-between p-6 bg-white border border-brand-border rounded-xl hover:border-brand-blue transition-all hover:bg-slate-50 duration-300 cursor-default shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-brand-blue/20 group-hover:bg-brand-blue transition-colors"></div>
                                        <p className="text-sm font-semibold text-brand-dark group-hover:text-brand-blue transition-colors">"{text}"</p>
                                    </div>
                                    <div className="text-[10px] font-bold text-brand-blue tracking-widest uppercase shadow-sm bg-brand-blue/5 px-2 py-1 rounded-md">+15 pts</div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => setActiveTab('pathway')}
                            className="w-full py-5 bg-brand-blue/5 text-brand-blue border border-brand-blue/10 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm mt-4 group"
                        >
                            Explore Detailed AI Financial Pathway
                            <ArrowRightCircle className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
                )}
            </div>
        );
      case 'history':
        return (
            <div className="max-w-5xl mx-auto space-y-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} onHome={onExitToLanding} />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-brand-dark tracking-tighter uppercase italic leading-none mb-2">History</h2>
                        <p className="text-xs font-bold text-brand-gray uppercase tracking-widest">Your past assessments — every run is kept, nothing is overwritten</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* History List */}
                    <div className={`space-y-6 ${compareEntryId ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
                        {historyList.length === 0 ? (
                            <Card className="p-12 text-center border-brand-border bg-white">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-border">
                                    <History className="w-8 h-8 text-brand-gray/30" />
                                </div>
                                <h3 className="text-lg font-bold text-brand-dark uppercase tracking-tight">No History Found</h3>
                                <p className="text-sm text-brand-gray mt-2">Your analysis events will appear here as you verify your dossier.</p>
                            </Card>
                        ) : (
                            historyList.map((entry) => (
                                <Card 
                                    key={entry.id} 
                                    className={`transition-all border-brand-border cursor-pointer hover:border-brand-blue ${compareEntryId === entry.id ? 'border-brand-blue ring-2 ring-brand-blue/10 bg-brand-blue/5' : 'bg-white'}`}
                                    onClick={() => setCompareEntryId(entry.id === compareEntryId ? null : entry.id)}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-brand-gray" />
                                                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">
                                                    {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <Badge variant="info">{entry.level}</Badge>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-2xl font-black text-brand-dark leading-none">{entry.score}</p>
                                                <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mt-1">TransferScore</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-brand-blue">{(entry.confidence * 100).toFixed(0)}% Confidence</p>
                                                <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mt-1">{entry.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Comparison View */}
                    {compareEntryId && (
                        <div className="lg:col-span-8 animate-in slide-in-from-right-4 fade-in duration-500">
                            {(() => {
                                const entry = historyList.find(e => e.id === compareEntryId);
                                if (!entry) return null;
                                
                                // Current data entry for comparison
                                const currentEntry: HistoryEntry = {
                                    id: 'current',
                                    timestamp: Date.now(),
                                    score: data.score,
                                    level: data.level,
                                    confidence: data.confidence,
                                    fullName: data.fullName || '',
                                    profileType: data.dossier_analysis?.financial_identity_profile?.profile_type || '',
                                    strengths: (data.dossier_analysis?.strengths || []).map(s => s.title),
                                    risks: (data.dossier_analysis?.risks || []).map(r => r.title),
                                    data: data
                                };

                                const comparison = compareEntries(entry, currentEntry);

                                return (
                                    <Card className="border-brand-border bg-white shadow-2xl overflow-hidden min-h-[600px]">
                                        <CardHeader className="bg-slate-50 border-b border-brand-border p-8 flex flex-row justify-between items-center space-y-0">
                                            <div>
                                                <CardTitle className="text-brand-dark uppercase tracking-tight">Timeline Delta Analysis</CardTitle>
                                                <p className="text-xs text-brand-gray font-medium">Comparing against analysis from {new Date(entry.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setCompareEntryId(null); }} className="text-brand-gray hover:text-brand-dark uppercase text-[10px] font-bold tracking-widest transition-colors mb-4 inline-block">Close Compare</button>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-12">
                                            {/* Score Delta */}
                                            <div className="grid grid-cols-3 gap-8 items-center text-center">
                                                <div className="space-y-2">
                                                    <p className="text-3xl font-black text-brand-gray/40">{entry.score}</p>
                                                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">Base Score</p>
                                                </div>
                                                <div className="flex flex-col items-center justify-center p-6 bg-brand-blue/5 rounded-full border border-brand-blue/10">
                                                    <div className={`text-4xl font-black ${comparison.scoreDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {comparison.scoreDiff > 0 ? `+${comparison.scoreDiff}` : comparison.scoreDiff}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mt-1">Growth Index</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-3xl font-black text-brand-dark">{currentEntry.score}</p>
                                                    <p className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">Current Terminal</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Positive deltas */}
                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Integrity Improvements</h4>
                                                    <ul className="space-y-3">
                                                        {comparison.improvementAreas.map((area, i) => (
                                                            <li key={i} className="flex gap-2 items-center text-xs font-bold text-brand-dark">
                                                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                                                {area}
                                                            </li>
                                                        ))}
                                                        {comparison.risksReduced.map((risk, i) => (
                                                            <li key={i} className="flex gap-2 items-center text-xs font-bold text-brand-dark">
                                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                                Mitigated Risk: {risk}
                                                            </li>
                                                        ))}
                                                        {comparison.newStrengths.map((str, i) => (
                                                            <li key={i} className="flex gap-2 items-center text-xs font-bold text-brand-dark">
                                                                <PlusCircle className="w-3.5 h-3.5 text-brand-blue" />
                                                                New Evidence Node: {str}
                                                            </li>
                                                        ))}
                                                        {comparison.improvementAreas.length === 0 && comparison.risksReduced.length === 0 && comparison.newStrengths.length === 0 && (
                                                            <li className="text-xs text-brand-gray font-medium italic">No positive deltas identified.</li>
                                                        )}
                                                    </ul>
                                                </div>

                                                {/* Warning deltas */}
                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest border-l-2 border-amber-600 pl-3">Detected Drifts</h4>
                                                    <ul className="space-y-3">
                                                        {comparison.newRisks.map((risk, i) => (
                                                            <li key={i} className="flex gap-2 items-center text-xs font-bold text-brand-dark">
                                                                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                                New Risk Signal: {risk}
                                                            </li>
                                                        ))}
                                                        {comparison.scoreDiff < 0 && (
                                                            <li className="flex gap-2 items-center text-xs font-bold text-brand-dark">
                                                                <ChevronDown className="w-3.5 h-3.5 text-red-500" />
                                                                Fidelity Regression Detected
                                                            </li>
                                                        )}
                                                        {comparison.newRisks.length === 0 && comparison.scoreDiff >= 0 && (
                                                            <li className="text-xs text-brand-gray font-medium italic">Protocol stable. No negative drifts identified.</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-slate-50 border border-brand-border rounded-2xl">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <Brain className="w-5 h-5 text-brand-blue" />
                                                    <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Evolving Narrative Assessment</p>
                                                </div>
                                                <p className="text-xs text-brand-dark/80 font-bold leading-relaxed italic">
                                                    {comparison.scoreDiff > 20 
                                                        ? "Exceptional profile velocity. The subject is successfully demonstrating superior socio-economic resilience patterns through higher evidence fidelity."
                                                        : comparison.scoreDiff > 0
                                                        ? "Consistent positive momentum. The integrity dossier is strengthening as evidence nodes converge towards Prime thresholds."
                                                        : "The financial identity narrative remains stable across analysis cycles, maintaining institutional consistency."
                                                    }
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-dark selection:bg-brand-blue/15 selection:text-brand-dark">
      {confirmReset && (
        <ConfirmModal
          title="Start a New Assessment?"
          message="You'll fill a fresh form and run a new analysis. Your current report stays available until the new one completes, and every past assessment is kept in History."
          confirmLabel="Start New"
          cancelLabel="Cancel"
          onConfirm={onReset}
          onClose={() => setConfirmReset(false)}
        />
      )}
      {pdfError && (
        <ConfirmModal
          title="PDF Export Failed"
          message="The PDF could not be generated. Please try again; if the problem persists, use the web report link instead."
          confirmLabel="OK"
          onClose={() => setPdfError(false)}
        />
      )}
      {showRegistry && <AdminRegistry onClose={() => setShowRegistry(false)} />}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 flex justify-between items-center gap-3 text-nowrap">
            <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={onExitToLanding} title="Back to home (you stay signed in)">
                <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight m-0 leading-none text-brand-dark">Persona.Credit</h1>
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mt-0.5 m-0">{plan ? `${plan} Node` : 'Terminal Dashboard'}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 md:gap-6 overflow-x-auto no-scrollbar">
                {userId && (
                    <span className="hidden md:inline text-[10px] font-bold text-brand-gray tracking-widest" title="Signed in account">{userId}</span>
                )}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-400/10 text-amber-600 rounded-full border border-amber-400/20">
                    <Zap className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Beta Access Unlocked</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-brand-blue/5 text-brand-blue rounded-full border border-brand-blue/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Cloud Sync Active</span>
                </div>
                <div className="h-4 w-px bg-brand-border"></div>
                <button
                    onClick={() => setConfirmReset(true)}
                    className="px-6 py-2.5 bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg hover:opacity-90 active:scale-95"
                >
                    New Assessment
                </button>
                {activeTab === 'overview' && (
                    <button 
                        onClick={() => setActiveTab('ai_dossier')}
                        className="px-6 py-2.5 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-brand-blue/30 active:scale-95"
                    >
                        Generate Full Dossier
                    </button>
                )}
                {onChangePassword && (
                    <button onClick={onChangePassword} className="bg-slate-100 hover:bg-slate-200 text-brand-dark text-[10px] font-bold px-6 py-2.5 rounded-lg uppercase tracking-widest transition-all border border-brand-border">Account</button>
                )}
                <button onClick={onLogout} className="bg-slate-100 hover:bg-slate-200 text-brand-dark text-[10px] font-bold px-6 py-2.5 rounded-lg uppercase tracking-widest transition-all border border-brand-border">Sign Out</button>
            </div>
        </div>
      </header>

      {(() => {
        const summary: any = (data as any)?.agent_summary || (data as any)?.analysis?.agent_summary;
        const entries: [string, any][] = summary ? Object.entries(summary) : [];
        const failed = entries.filter(([, a]) => a && a._agent_failed);
        if (failed.length === 0) return null;
        const first = failed[0][1];
        const anyRateLimited = failed.some(([, a]) => a && a._rate_limited);
        const reason = first?._error_reason || 'No reason returned by API.';
        return (
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-6">
            <div style={{
              border: '1px solid #FECACA', background: '#FEF2F2', borderRadius: '12px',
              padding: '16px 20px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B91C1C', marginBottom: '8px' }}>
                ⚠ AI AGENTS FAILED — {failed.length}/{entries.length} ({failed.map(([n]) => n).join(', ')})
              </div>
              <div style={{ fontSize: '13px', color: '#7F1D1D', lineHeight: 1.7 }}>
                <div>Failure type: <strong>{anyRateLimited ? 'rate-limit / quota / credits' : 'API error'}</strong></div>
                <div style={{ wordBreak: 'break-word' }}>Reason: {reason}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '10px' }}>
                This score and all $0 / 0% values are the result of every agent returning a fallback. Fix the key/billing, then click “New Assessment”.
              </div>
            </div>
          </div>
        );
      })()}

      {(() => {
        const rec: any = (data as any)?.reconciliation;
        if (!rec || !rec.is_provisional) return null;
        const contradicted = rec.income_status === 'contradicted';
        const bg = contradicted ? '#FEF2F2' : '#FFFBEB';
        const border = contradicted ? '#FECACA' : '#FDE68A';
        const fg = contradicted ? '#B91C1C' : '#92400E';
        return (
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-6">
            <div style={{ border: `1px solid ${border}`, background: bg, borderRadius: '12px', padding: '14px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: fg, marginBottom: '4px' }}>
                {contradicted ? '⚠ Contradiction detected — declared vs documented income' : '◷ Provisional dossier — based on unverified claims'}
              </div>
              <div style={{ fontSize: '13px', color: fg, lineHeight: 1.6 }}>{rec.explanation}</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>
                {contradicted
                  ? 'Upload a bank statement that matches your declared income to clear this flag.'
                  : 'Upload a bank statement to convert declared figures into document-verified income and raise your standing.'}
              </div>
            </div>
          </div>
        );
      })()}

      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
        {isAlphaBuildView ? (
            <AlphaBuildView data={data} />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Static Sidebar */}
          <div className="lg:col-span-3 space-y-10">
            <div className="text-center space-y-8">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">Verification Profile</p>
                        <h3 className="text-xl font-bold text-brand-dark tracking-tight leading-none">{data.fullName || 'Verified Client'}</h3>
                        <p className="text-[8px] font-bold text-brand-gray/40 uppercase tracking-widest mt-1">UID: {userId}</p>
                    </div>

                <div className="inline-flex items-center justify-center">
                    <Gauge score={data.score} size={220} />
                </div>
                
                <div className="space-y-4 text-center">
                    {referralCode && (
                        <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
                            <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest flex items-center justify-center gap-1.5 leading-none">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Institutional Partner Verified
                            </p>
                            <p className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Ref: {referralCode}</p>
                        </div>
                    )}
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">Protocol Tier</p>
                        <p className="text-2xl font-bold text-brand-blue italic leading-none">{data.level}</p>
                    </div>
                </div>

                <div className="pt-8 border-t border-brand-border space-y-8">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest text-left pl-1">Node Navigation</p>
                        <div className="flex flex-col gap-1.5">
                             {[
                                 { id: 'overview', label: 'Terminal Home', icon: Globe, sub: 'Identity Overview' },
                                 { id: 'breakdown', label: 'Risk Analysis', icon: BarChart3, sub: 'Pillar decomposition' },
                                 { id: 'ai_dossier', label: 'AI Dossier Engine', icon: Shield, sub: 'Strategic AI Report' },
                                 { id: 'report', label: 'Audit report', icon: FileText, sub: 'Institutional Dossier' },
                                 { id: 'dossier', label: 'Evidence Packet', icon: ShieldCheck, sub: 'Verified evidence vault' },
                                 { id: 'simulator', label: 'Underwriting Engine', icon: TrendingUp, sub: 'Simulate score impact' },
                                 { id: 'history', label: 'History', icon: Clock, sub: 'Past assessments' },
                                 { id: 'share', label: 'Direct Delivery', icon: Mail, sub: 'Secure institutional issue' }
                             ].map(item => (
                                 <button 
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all group ${
                                        activeTab === item.id
                                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-[1.02]'
                                        : 'text-brand-gray hover:bg-white hover:shadow-sm border border-transparent hover:border-brand-border'
                                    }`}
                                 >
                                    <item.icon className={`w-4 h-4 shrink-0 ${activeTab === item.id ? 'text-white' : 'text-brand-gray/40 group-hover:text-brand-blue'} transition-colors`} />
                                    <div className="text-left">
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === item.id ? 'text-white' : 'text-brand-dark'}`}>
                                            {item.label}
                                        </p>
                                        <p className={`text-[8px] font-medium leading-tight mt-0.5 ${activeTab === item.id ? 'text-white/70' : 'text-brand-gray/50'}`}>
                                            {item.sub}
                                        </p>
                                    </div>
                                 </button>
                             ))}
                             
                             <div className="pt-4 mt-4 border-t border-brand-border space-y-2">
                                <button 
                                    onClick={onExitToLanding}
                                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-brand-gray hover:bg-white hover:text-brand-dark transition-all border border-transparent hover:border-brand-border shadow-sm group"
                                >
                                    <ArrowRightCircle className="w-4 h-4 text-brand-gray/40 group-hover:text-brand-blue" />
                                    <span>Return to Hub</span>
                                </button>
                                <button 
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-brand-gray hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 group"
                                >
                                    <Lock className="w-4 h-4 text-brand-gray/40 group-hover:text-red-500" />
                                    <span>Secure Exit</span>
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-brand-border text-center space-y-3 shadow-sm">
                <div className="w-10 h-10 bg-brand-blue/5 rounded-xl flex items-center justify-center mx-auto border border-brand-blue/10 text-brand-blue">
                    <Shield className="w-5 h-5" />
                </div>
                <h5 className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">High Trust Mode</h5>
                <p className="text-[10px] text-brand-gray font-medium leading-relaxed italic">Verification protocol active.</p>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="lg:col-span-9">
            {(data.status || '').toLowerCase().includes('action') && (
                <div className="mb-8 p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex items-center gap-6">
                     <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                     </div>
                     <div>
                        <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-apple-label">Incomplete Verification</h4>
                        <p className="text-xs text-amber-700/80 mt-1 font-medium italic">Certain documents require manual re-submission for 100% trust confidence.</p>
                     </div>
                </div>
            )}
            
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                {renderTabContent()}
            </div>
          </div>
        </div>
        )}
      </main>
      
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-brand-border bg-transparent">
          <div className="flex flex-col md:flex-row justify-between items-center px-4 gap-6">
              <div className="flex flex-col items-start gap-3">
                  <p className="text-[10px] font-bold text-brand-gray/60 uppercase tracking-widest">&copy; 2026 Persona.Credit &bull; Cross-Border Financial Verification</p>
                  <p className="text-[10px] font-bold text-brand-gray/30 uppercase tracking-widest">
                    Inquiry: <a href="mailto:compliance@persona.credit" className="text-brand-blue hover:underline">compliance@persona.credit</a>
                  </p>
              </div>
              <RealmSwitcher />
          </div>
      </footer>
    </div>
  );
};

export default Dashboard;
