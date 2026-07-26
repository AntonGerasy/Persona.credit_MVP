import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Shield, ChevronLeft, AlertCircle } from 'lucide-react';
// GoogleGenAI is now server-side only (Vercel Functions in /api/)
// All AI calls go through fetch('/api/...') — API key never in browser bundle
import { Type } from '@google/genai';
// v34.13: bcrypt removed from the client — password hashing/verification is
// server-side only (/api/auth). The client holds an opaque session token.
import { authClient } from './lib/authClient';
import { getSession } from './lib/session';
import { formSchema, PROFESSIONAL_LOADING_MESSAGES, PROVIDER_LOADING_MESSAGES } from './constants';
import { calculateTransferScore } from './scoreEngine';
import { deriveDecisionStatus, deterministicIdentityReliability } from './lib/universalDecision';
import { db, storage } from './lib/storage';
import { getInitialFormData } from './lib/formUtils';
import { ExtractedDocument } from './lib/agents/documentExtractor';
// Agent schemas and prompts live server-side in api/run-agent.ts
// synthesis prompt/schema no longer imported — logic moved to api/synthesize.ts and inline agent aggregation
import { countries } from './countries';
import countryIntelligence from './countryRiskProfiles.json';
import { saveToHistory, hydrateHistory, clearHistory } from './lib/historyUtils';
import type { FormSchema, Section as SectionType, FormData, FileData, RepeaterData, ValidationErrors, DashboardData, RepeaterItem, ProviderFormData, ProviderDashboardData, Field, Offer, Provider, ProviderUser, PartnerOffer, Applicant, UserDossier } from './types';
import Section from './components/Section';
import ProgressBar from './components/ProgressBar';
import ResultCard from './components/ResultCard';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import ProviderOnboardingPage from './pages/provider/ProviderOnboardingPage';
import ProviderDashboardPage from './pages/provider/ProviderDashboardPage';
import HelpCenterPage from './pages/HelpCenterPage';
import PartnerDashboard from './pages/PartnerDashboard';
import PartnerLanding from './pages/PartnerLanding';
import PricingPage from './pages/PricingPage';
import ReportViewerPage from './pages/ReportViewerPage';

// v34.14: styled password-change modal (no window.prompt/confirm). Self-contained:
// talks to authClient directly; on success the server revokes every other session.
// v34.18: extended into an Account modal — adds a danger zone with permanent,
// password-confirmed account deletion (GDPR-style right to erasure).
function ChangePasswordModal({ onClose, onDeleted }: { onClose: () => void; onDeleted?: () => void }) {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [delOpen, setDelOpen] = useState(false);
    const [delPassword, setDelPassword] = useState('');
    const [delBusy, setDelBusy] = useState(false);
    const [delMsg, setDelMsg] = useState<string | null>(null);

    const submitDelete = async () => {
        setDelBusy(true);
        setDelMsg(null);
        const res = await authClient.deleteAccount(delPassword);
        setDelBusy(false);
        if (res.success) {
            if (onDeleted) onDeleted();
        } else {
            setDelMsg(res.message);
        }
    };

    const submit = async () => {
        if (next.length < 8) { setMsg({ ok: false, text: 'New password must be at least 8 characters.' }); return; }
        if (next !== confirm) { setMsg({ ok: false, text: 'New passwords do not match.' }); return; }
        setBusy(true);
        setMsg(null);
        const res = await authClient.changePassword(current, next);
        setBusy(false);
        setMsg({ ok: res.success, text: res.message });
        if (res.success) { setCurrent(''); setNext(''); setConfirm(''); }
    };

    const field = "w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40";
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/60 p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-black text-brand-dark uppercase tracking-widest mb-1">Account</h3>
                <p className="text-xs text-slate-500 mb-6">Change your password (all other signed-in devices are signed out automatically) or delete your account below.</p>
                <div className="space-y-4">
                    <input type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className={field} autoComplete="current-password" />
                    <input type="password" placeholder="New password (min 8 characters)" value={next} onChange={(e) => setNext(e.target.value)} className={field} autoComplete="new-password" />
                    <input type="password" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} autoComplete="new-password" />
                </div>
                {msg && (
                    <div className={`mt-4 text-xs font-bold rounded-lg px-4 py-3 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {msg.text}
                    </div>
                )}
                <div className="mt-6 flex gap-3">
                    <button onClick={submit} disabled={busy || !current || !next || !confirm}
                        className="flex-1 px-4 py-3 bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest text-[11px] disabled:opacity-40 hover:bg-brand-dark/90 transition-all">
                        {busy ? 'Updating…' : 'Update Password'}
                    </button>
                    <button onClick={onClose}
                        className="px-6 py-3 border border-brand-border rounded-xl font-bold uppercase tracking-widest text-[11px] text-brand-dark hover:bg-slate-50 transition-all">
                        {msg?.ok ? 'Done' : 'Cancel'}
                    </button>
                </div>
                {/* v34.18: danger zone — permanent account deletion */}
                <div className="mt-8 pt-6 border-t border-brand-border">
                    {!delOpen ? (
                        <button onClick={() => setDelOpen(true)}
                            className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 underline underline-offset-4 transition-colors">
                            Delete account permanently…
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-red-600 font-bold leading-relaxed">This permanently deletes your account, report, share link, and history. It cannot be undone. Enter your password to confirm.</p>
                            <input type="password" placeholder="Your password" value={delPassword} onChange={(e) => setDelPassword(e.target.value)} autoComplete="current-password"
                                className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-red-400/40" />
                            {delMsg && <div className="text-xs font-bold rounded-lg px-4 py-3 bg-red-50 text-red-600">{delMsg}</div>}
                            <div className="flex gap-3">
                                <button onClick={submitDelete} disabled={delBusy || !delPassword}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] disabled:opacity-40 hover:bg-red-700 transition-all">
                                    {delBusy ? 'Deleting…' : 'Delete My Account'}
                                </button>
                                <button onClick={() => { setDelOpen(false); setDelPassword(''); setDelMsg(null); }}
                                    className="px-6 py-3 border border-brand-border rounded-xl font-bold uppercase tracking-widest text-[11px] text-brand-dark hover:bg-slate-50 transition-all">
                                    Keep Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const App: React.FC = () => {
    const [userSession, setUserSession] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserDossier | null>(null);
    const [currentProviderUser, setCurrentProviderUser] = useState<ProviderUser | null>(null);
    type View = 'landing' | 'auth' | 'form' | 'dashboard' | 'providerOnboarding' | 'providerDashboard' | 'helpCenter' | 'report' | 'partner' | 'partnerLanding' | 'pricing';
    const [view, setView] = useState<View>('landing');
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPaid, setIsPaid] = useState(true); // MVP: all features open
    const [plan, setPlan] = useState<'standard' | 'membership' | null>(null);
    const [previousView, setPreviousView] = useState<View | null>(null);
    const [pendingPlan, setPendingPlan] = useState<'standard' | 'membership' | null>(null);
    const [showStartNewConfirm, setShowStartNewConfirm] = useState(false);

    const [authMode, setAuthMode] = useState<'user' | 'provider'>('user');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [reportToken, setReportToken] = useState<string | null>(null);
    const [showChangePassword, setShowChangePassword] = useState(false); // v34.14
    const [reportData, setReportData] = useState<DashboardData | null>(null);

    const [formData, setFormData] = useState<FormData>(getInitialFormData(formSchema));
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DashboardData | null>(null);
    const [saveMessage, setSaveMessage] = useState('');
    const [providerData, setProviderData] = useState<Provider | null>(null);
    const [referralCode, setReferralCode] = useState<string | null>(null);

    // --- UX: Non-Destructive Navigation (Auto-Save Security State) ---
    useEffect(() => {
        if (userSession) {
            const timer = setTimeout(() => {
                handleSaveProgress();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [formData, currentStep]);

    useEffect(() => {
        const initApp = async () => {
        // v34.13: session identity comes from the server-issued token (verified
        // below), not from a shared KV blob readable by everyone.

        // Check for report route — a public capability URL: the unguessable token
        // in the path is the credential, no login required.
        const path = window.location.pathname;
        if (path.startsWith('/report/')) {
            const token = path.replace('/report/', '');
            if (token) {
                setReportToken(token);
                let foundData: DashboardData | null = null;
                try {
                    const shared = await storage.get(`pc:share:${token}`);
                    if (shared && typeof shared === 'object') {
                        foundData = shared as DashboardData;
                    }
                } catch { /* fall through */ }
                
                // v34.18: the sample report renders ONLY for explicit demo tokens.
                // A real token that is missing/revoked shows "unavailable" instead
                // of another person's demo data.
                if (!foundData && token.startsWith('demo')) {
                    foundData = {
                        score: 842,
                        level: 'Excellent',
                        confidence: 0.98,
                        summaryStatement: "Subject shows highly disciplined financial behavior across multiple jurisdictions.",
                        fullName: "John Doe (Verification Demo)",
                        generatedAt: Date.now(),
                        countryContext: {
                            countryName: "United Kingdom",
                            inflation: 2.1,
                            costOfLivingIndex: 78,
                            unemployment: 4.2,
                            medianIncomePPP: 45000
                        }
                    } as any;
                }
                
                setReportData(foundData);
                setView('report');
                return;
            }
        }

        // Check for ref in URL
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            localStorage.setItem('dossier_ref', ref);
            setReferralCode(ref);
            // Clean up URL without reload
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            const storedRef = localStorage.getItem('dossier_ref');
            if (storedRef) setReferralCode(storedRef);
        }

        // Restore the session from the server-verified token. loginUser/loginProvider
        // set plan/isPaid internally; the admin flag comes from the verify response
        // (ADMIN_EMAIL env is re-evaluated server-side on every verify).
        const session = getSession();
        if (session) {
            const verified = await authClient.verify();
            if (verified.valid && verified.kind === 'user' && verified.email) {
                setIsAdmin(verified.role === 'admin');
                await loginUser(verified.email, { navigate: false }); // land on the landing page, session preserved
            } else if (verified.valid && verified.kind === 'provider' && verified.email) {
                await loginProvider(verified.email);
            }
            // invalid/expired token: authClient.verify() has already cleared it
        }
        };
        initApp()
            .catch(err => {
                console.error('App initialization error (non-fatal):', err);
            })
            .finally(() => {
                setIsInitializing(false);
            });
    }, []);

    // v34.8: `navigate:false` restores the session (result, form state) WITHOUT changing the
    // view — used by the init auto-login so a deploy/reload always opens the landing page
    // instead of force-pushing whoever-was-last-logged-in into their old dashboard (§9.5).
    // Explicit logins (password form) keep the default and navigate as before.
    const loginUser = async (email: string, opts: { navigate?: boolean } = {}) => {
        const navigate = opts.navigate !== false;
        const currentDB = await db.loadAsync();
        const userData = currentDB.users[email];
        setUserSession(email);
        setIsPaid(true); // MVP: all features open
        setPlan(userData?.plan || null);
        hydrateHistory().catch(() => { /* non-fatal: device-local history still works */ }); // v34.14
        
        if (userData?.dashboardResult) {
            setResult(userData.dashboardResult);
            // Simulate building a UserDossier
            setUserProfile({
                uid: email,
                personalInfo: {
                    fullName: userData.dashboardResult.fullName || 'Verified Client',
                    email: email,
                    originCountry: userData.formData?.country || 'Unknown'
                },
                economicContext: userData.formData || {},
                scores: userData.dashboardResult,
                issuedReports: []
            });
            if (navigate) setView('dashboard');
        } else {
            setFormData(userData?.formData || getInitialFormData(formSchema));
            setCurrentStep(userData?.currentStep || 0);
            setResult(null);
            setUserProfile(null);
            if (navigate) setView('form');
        }
    }
    
    const loginProvider = async (email: string) => {
        const currentDB = await db.loadAsync();
        const providerUser = currentDB.providerUsers[email];
        if (!providerUser) {
            console.error('Provider record not found for session:', email);
            return;
        }
        const provider = currentDB.providers[providerUser.providerId];
        setCurrentProviderUser(providerUser);
        setProviderData(provider);

        if (provider?.kybData) {
            setView('providerDashboard');
        } else {
            setView('providerOnboarding');
        }
    }


    const sections: SectionType[] = useMemo(() => (formSchema as FormSchema).sections, []);

    const processedSection = useMemo(() => {
        const currentSection = sections[currentStep];
        if (!currentSection) return null;
        
        return {
            ...currentSection,
            fields: currentSection.fields.map(field => {
                if (field.id === 'us_bank_statement' && formData['us_bank_name']) {
                    const bankId = formData['us_bank_name'];
                    const bankNameMap: Record<string, string> = {
                        'chase': 'Chase',
                        'boa': 'Bank of America',
                        'wells': 'Wells Fargo',
                        'citi': 'Citibank',
                        'capitalone': 'Capital One',
                        'other': 'bank'
                    };
                    const bankName = bankNameMap[bankId] || 'bank';
                    return {
                        ...field,
                        subLabel: `Please upload your latest ${bankName} statement.`
                    };
                }
                return field;
            })
        };
    }, [sections, currentStep, formData]);

    const missingEvidenceWarnings = useMemo(() => {
        const warnings: string[] = [];
        const check = (condition: boolean, proofId: string, label: string) => {
            const proof = formData[proofId];
            const hasProof = proof && (Array.isArray(proof) ? proof.length > 0 : true);
            if (condition && !hasProof) {
                warnings.push(label);
            }
        };

        const hasOriginStatements = formData['bank_statements_origin'];
        const hasOriginDocs = hasOriginStatements && Array.isArray(hasOriginStatements) && hasOriginStatements.length > 0;
        if (!hasOriginDocs) {
            warnings.push('Origin country bank statements (primary evidence — required for full analysis)');
        }
        check(formData['has_us_nexus'] === true, 'bank_statements_us', 'Destination country bank statements');
        
        return warnings;
    }, [formData]);

    const isFieldVisible = useCallback((field: any, currentFormData: FormData): boolean => {
        if (!field.required_if) {
            return true;
        }
        
        // Check if ANY of the conditions in required_if are met (OR logic for top level keys)
        return Object.entries(field.required_if).some(([dependencyId, requiredValue]) => {
            const actualValue = currentFormData[dependencyId];

            if (requiredValue === 'truthy') {
                return !!actualValue && actualValue !== 'none' && actualValue !== 'no';
            }

            if (typeof requiredValue === 'object' && requiredValue !== null && !Array.isArray(requiredValue)) {
                const reqObj = requiredValue as Record<string, any>;
                const operator = Object.keys(reqObj)[0];
                const operand = reqObj[operator];
                if (operator === '>') {
                    return Number(actualValue) > Number(operand);
                }
                if (operator === '!=') {
                    return actualValue !== operand;
                }
            }

            return actualValue === requiredValue;
        });
    }, []);

    const isFinalStage = currentStep === sections.length - 1;

    const allStepErrors = useMemo(() => {
        if (view !== 'form' || !isFinalStage) return [];
        
        const errorList: { step: number; label: string; fieldLabel: string }[] = [];
        sections.forEach((section, index) => {
            if (index === currentStep) return;
            
            section.fields.forEach(field => {
                if (!isFieldVisible(field, formData)) return;
                
                const value = formData[field.id];
                if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
                    errorList.push({ step: index, label: section.title, fieldLabel: field.label });
                }
                
                if (field.type === 'file') {
                    const files = value as FileData[] | undefined;
                    if (files && files.some(f => f.validationStatus === 'invalid')) {
                        errorList.push({ step: index, label: section.title, fieldLabel: field.label });
                    }
                }
            });
        });
        return errorList;
    }, [formData, isFinalStage, sections, isFieldVisible, currentStep, view]);

    const validateStep = (stepIndex = currentStep) => {
        const currentSection = sections[stepIndex];
        const newErrors: ValidationErrors = {};

        currentSection.fields.forEach(field => {
            if (!isFieldVisible(field, formData)) return;

            // --- Top-level field validation ---
            if (field.required) {
                const value = formData[field.id];
                if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    newErrors[field.id] = `${field.label} is required.`;
                }
            }
            if (field.id === 'dob' && formData[field.id]) {
                const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
                if (!dobRegex.test(formData[field.id] as string)) {
                    newErrors[field.id] = "Please use MM/DD/YYYY format.";
                }
            }

            if (field.type === 'checkbox' && field.required && !formData[field.id]) {
                newErrors[field.id] = `You must agree to ${(field.label || 'this').toLowerCase()}.`;
            }

            if (field.type === 'file') {
                const files = formData[field.id] as FileData[] | undefined;
                if (files && files.length > 0) {
                    if (files.some(f => f.validationStatus === 'validating')) {
                        newErrors[field.id] = 'File validation is in progress. Please wait.';
                    } else if (files.some(f => f.validationStatus === 'invalid')) {
                        const invalidFile = files.find(f => f.validationStatus === 'invalid');
                        newErrors[field.id] = invalidFile?.validationReason || 'One or more files are invalid. Please remove them or upload correct documents.';
                    }
                }
            }

            // --- Repeater field validation (FIXED) ---
            if (field.type === 'repeater' && field.item_schema) {
                const repeaterItems = formData[field.id] as RepeaterData | undefined;
                if (repeaterItems && repeaterItems.length > 0) {
                    for (const item of repeaterItems) {
                        for (const subField of field.item_schema.fields) {
                            if (subField.required) {
                                const value = item[subField.id];
                                if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                                    newErrors[field.id] = `A required field in one of the items is missing.`;
                                    break;
                                }
                            }
                            if (subField.type === 'file') {
                                const files = item[subField.id] as FileData[] | undefined;
                                if (files && files.some(f => f.validationStatus === 'invalid')) {
                                    newErrors[field.id] = `One of the items has an invalid file.`;
                                    break;
                                }
                                if (files && files.some(f => f.validationStatus === 'validating')) {
                                    newErrors[field.id] = `File validation is still in progress for one of the items.`;
                                    break;
                                }
                            }
                        }
                        if (newErrors[field.id]) break;
                    }
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleNext = () => {
        const currentSection = sections[currentStep];

        // --- Smart Validation: Stage 4 Origin Evidence Lock ---
        if (currentSection.id === 'financials_origin') {
            const originFiles = formData['bank_statements_origin'];
            const hasFiles = originFiles && (Array.isArray(originFiles) ? originFiles.length > 0 : true);
            if (!hasFiles) {
                setErrors(prev => ({ 
                    ...prev, 
                    'bank_statements_origin': 'BANKING EVIDENCE IS REQUIRED TO PROCEED.' 
                }));
                return;
            }
        }

        if (validateStep()) { 
            if (currentStep < sections.length - 1) {
                setCurrentStep(currentStep + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Auto-save progress on every step — prevents session loss on synthesis failure
                handleSaveProgress();
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let encoded = reader.result as string;
                encoded = encoded.substring(encoded.indexOf(',') + 1);
                resolve(encoded);
            };
            reader.onerror = error => reject(error);
        });

    const handleFileValidation = useCallback(async (file: File, field: Field): Promise<{ isValid: boolean; reason: string; qaFixtureAccepted?: boolean }> => {
        try {
            const base64Data = await fileToBase64(file);
            const isOriginTrack = field.id.includes('origin');

            const response = await fetch('/api/validate-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileBase64: base64Data,
                    mimeType: file.type || 'application/octet-stream',
                    fieldLabel: field.label,
                    fieldSubLabel: field.subLabel || '',
                    applicantName: formData['full_name'] || 'Unknown',
                    isOriginTrack,
                    qaFixtureMode: import.meta.env.VITE_QA_FIXTURE_MODE === 'true',
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                console.warn('validate-file error:', err);
                return { isValid: true, reason: 'Document accepted (scan service temporarily unavailable).' };
            }

            return response.json();
        } catch (error) {
            console.error('File validation error:', error);
            // Fail-open — don't block user from uploading
            return { isValid: true, reason: 'Document accepted (scan encountered an error — will be reviewed).' };
        }
    }, [formData]);
    
    const handleSaveProgress = () => {
        if (!userSession) return;
        try {
            const currentDB = db.load();
            const dataToSave = { ...formData };
            
            formSchema.sections.forEach(section => {
                section.fields.forEach(field => {
                    if (field.type === 'file' && dataToSave[field.id]) {
                        delete dataToSave[field.id];
                    }
                    if (field.type === 'repeater' && Array.isArray(dataToSave[field.id])) {
                        (dataToSave[field.id] as RepeaterData) = (dataToSave[field.id] as RepeaterData).map((item: RepeaterItem) => {
                            const newItem = { ...item };
                            field.item_schema?.fields.forEach(subField => {
                                if (subField.type === 'file' && newItem[subField.id]) {
                                    delete newItem[subField.id];
                                }
                            });
                            return newItem;
                        });
                    }
                });
            });

            currentDB.users[userSession] = {
                ...currentDB.users[userSession],
                formData: dataToSave,
                currentStep: currentStep
            };
            
            db.save(currentDB);
            setSaveMessage('Progress saved!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save progress", error);
            setSaveMessage('Could not save progress.');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const handleReset = async () => {
        if (userSession) {
            const currentDB = await db.loadAsync();
            if (currentDB.users[userSession]) {
                delete currentDB.users[userSession].formData;
                delete currentDB.users[userSession].currentStep;
                // v34.17 (FIX-2): the previous dashboardResult is KEPT — it stays
                // available (Continue to Dashboard, share links) until the new
                // assessment completes and overwrites it. History keeps everything.
                await db.saveAsync(currentDB);
            }
        }
        setFormData(getInitialFormData(formSchema));
        setCurrentStep(0);
        setErrors({});
        setResult(null);
        setProviderData(null);
        setView('form');
    };
    
    // --- Auth Handlers (v34.13: server-side auth via /api/auth) ---
    // Credentials are verified ONLY server-side; the hardcoded admin backdoor is
    // removed. Admin role is granted server-side to the ADMIN_EMAIL env account.
    const handleSignUp = async (email: string, pass: string): Promise<{ success: boolean, message: string }> => {
        const res = await authClient.signUp(email, pass);
        if (!res.success) return { success: false, message: res.message };
        setIsAdmin(res.role === 'admin');
        await loginUser(res.email); // res.email is the server-normalized (lowercase) address
        return { success: true, message: "" };
    };

    const handleLogin = async (email: string, pass: string): Promise<{ success: boolean, message: string }> => {
        const res = await authClient.logIn(email, pass);
        if (!res.success) return { success: false, message: res.message };
        setIsAdmin(res.role === 'admin');
        await loginUser(res.email);
        return { success: true, message: "" };
    };

    // v34.18: full local teardown after permanent account deletion
    const handleAccountDeleted = () => {
        setShowChangePassword(false);
        setUserSession(null);
        setUserProfile(null);
        setFormData(getInitialFormData(formSchema));
        setCurrentStep(0);
        setResult(null);
        setIsAdmin(false);
        setView('landing');
    };

    const handleLogout = async () => {
        // v34.24 (P0): clear this account's local history + device cache BEFORE the
        // token is dropped (clearHistory() reads the email from the live session),
        // so the next account on this device can never read the previous one's data.
        clearHistory();
        try { localStorage.removeItem('pc_cache_v2'); } catch { /* ignore */ }
        await authClient.logOut(); // deletes the server session and clears the local token
        setUserSession(null);
        setUserProfile(null);
        setFormData(getInitialFormData(formSchema));
        setCurrentStep(0);
        setResult(null);
        setIsAdmin(false);
        setView('landing');
    };
     // --- Provider Auth Handlers ---
    const handleProviderSignUp = async (email: string, pass: string): Promise<{ success: boolean, message: string }> => {
        const res = await authClient.providerSignUp(email, pass);
        if (!res.success) return { success: false, message: res.message };
        if (!res.providerId) return { success: false, message: "Provider registration failed. Please try again." };
        // Create the provider's app-data records under the server-issued providerId.
        const currentDB = await db.loadAsync();
        currentDB.providerUsers[res.email] = { email: res.email, providerId: res.providerId };
        currentDB.providers[res.providerId] = { id: res.providerId, formData: null, kybData: null };
        await db.saveAsync(currentDB);
        await loginProvider(res.email);
        return { success: true, message: "" };
    };

    const handleProviderLogin = async (email: string, pass: string): Promise<{ success: boolean, message: string }> => {
        const res = await authClient.providerLogIn(email, pass);
        if (!res.success) return { success: false, message: res.message };
        await loginProvider(res.email);
        return { success: true, message: "" };
    };
    
    const handleProviderLogout = async () => {
        await authClient.logOut();
        setCurrentProviderUser(null);
        setProviderData(null);
        setView('landing');
    };

    const handleProviderOnboardSubmit = async (data: ProviderFormData) => {
        if (!currentProviderUser) return;
        setIsLoading(true);

        try {
            const requestParts: any[] = [];
            
            const validFiles = (data.documents || []).filter(f => f.file instanceof File);

            if (validFiles.length > 0) {
                 for (const fileData of validFiles) {
                    const base64Data = await fileToBase64(fileData.file);
                    requestParts.push({
                        inlineData: { mimeType: fileData.file.type, data: base64Data },
                    });
                }
            }

            const kybSchema = {
                type: Type.OBJECT, properties: {
                    tier: { type: Type.STRING }, kybConfidence: { type: Type.NUMBER },
                    trustHeatmap: { type: Type.OBJECT, properties: { docs: { type: Type.NUMBER }, registry: { type: Type.NUMBER }, webPresence: { type: Type.NUMBER }, reviews: { type: Type.NUMBER } }, required: ["docs", "registry", "webPresence", "reviews"] },
                    complianceLog: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, check: { type: Type.STRING }, result: { type: Type.STRING }, source: { type: Type.STRING }, timestamp: { type: Type.STRING } }, required: ["id", "check", "result", "source", "timestamp"] } }
                }, required: ["tier", "kybConfidence", "trustHeatmap", "complianceLog"]
            };
// FIX: Replace incorrect backslash with backtick for template literal
            const prompt = `
                You are a KYB (Know Your Business) analyst for TransferScore.
                Analyze the provided business data. Use Google Search to verify the company's existence, registry status, web presence, and public sentiment.
                - Legal Name: ${data.legalName}
                - Country: ${data.country}
                - Website: ${data.websiteUrl}
                - Attached Docs: ${validFiles.length}
                
                Generate a structured JSON output based on your analysis.
                - kybConfidence: A score from 0.0 to 1.0. High if registry data, web presence, and positive reviews are found. Lower for discrepancies or lack of public data.
                - tier: 'A' for high confidence (>0.85), 'B' for medium (0.7-0.85), 'C' for low.
                - trustHeatmap: Rate each factor from 0.0 to 1.0.
                - complianceLog: Create a log of the checks you performed (e.g., "Official registry lookup").
            `;

            requestParts.unshift({ text: prompt });
            
            const kybResponse = await fetch('/api/run-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentName: 'ProviderKYB',
                    promptBase: prompt,
                    schema: kybSchema,
                    context: { legalName: data.legalName, parts: requestParts.slice(1) },
                }),
            });

            const kybResult = kybResponse.ok ? await kybResponse.json() : {};
            const finalKybData: ProviderDashboardData = { ...kybResult, companyName: data.legalName };

            const currentDB = db.load();
            const provider = currentDB.providers[currentProviderUser.providerId];
            provider.formData = data;
            provider.kybData = finalKybData;
            db.save(currentDB);
            setProviderData(provider);
            
            setView('providerDashboard');

        } catch (error) {
            console.error("KYB API Error", error);
            // In a real app, show an error message to the provider.
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOfferAction = async (action: 'create' | 'update' | 'delete', offer: Offer) => {
        if (!currentProviderUser) return;
        const currentDB = db.load();
        
        switch(action) {
            case 'create':
            case 'update':
                currentDB.offers[offer.id] = { ...offer, providerId: currentProviderUser.providerId };
                break;
            case 'delete':
                delete currentDB.offers[offer.id];
                break;
        }
        // v34.13: await the KV write BEFORE reloading — loginProvider re-reads from
        // KV, so a background save here would race it and show a stale offer list.
        await db.saveAsync(currentDB);
        await loginProvider(currentProviderUser.email);
    };

    const getApplicantsForProvider = (providerId: string): Applicant[] => {
        const currentDB = db.load();
        return currentDB.permissions
            .filter((p: any) => p.providerId === providerId)
            .map((p: any) => {
                // v34.13: providers can no longer read other users' records — the
                // applicant's data comes from the snapshot the user explicitly
                // shared inside the permission entry (see handleShareDossier).
                const snap = p.snapshot || {};
                const offer = currentDB.offers[p.offerId];
                return {
                    id: p.userId,
                    offerTitle: offer?.title || 'N/A',
                    dossier: snap.dossier || 'No dossier available.',
                    score: snap.score || 0,
                };
            });
    };


    const handleSubmit = async () => {
        if (!validateStep() || !userSession) return;
        
        setIsLoading(true);
        setResult(null);

        try {
            const textData: Partial<FormData> = {};

            // --- Core Evaluation Formulas (The Logic Check) ---
            // v34.4: strip thousands separators/spaces BEFORE Number() — "41,000" must never
            // silently become 41 (or NaN). Browsers with comma-decimal locales mangle number
            // inputs; parse defensively.
            const cleanNum = (v: any): number => {
                const n = Number(String(v ?? '').replace(/[,\s\u00A0']/g, ''));
                return isFinite(n) ? n : 0;
            };
            const monthlyIncome = cleanNum(formData['local_monthly_income']) || 1;
            const annIncomeUSD = cleanNum(formData['ann_income_usd']) || 0;
            const originDebts = cleanNum(formData['debts_total_origin']) || 0;
            const officialShareRaw = cleanNum(formData['official_income_share']);
            const officialShare = officialShareRaw > 0 ? Math.min(1, officialShareRaw) : 1;
            const tenure = cleanNum(formData['experience_years']) || 0;
            const liquidReserves = cleanNum(formData['liquid_reserves']) || 0;

            const localDTI = originDebts / (monthlyIncome || 1);
            const reserveMonths = liquidReserves / (annIncomeUSD / 12 || 1);
            
            // Formulaic Adjustments
            const rationalWarnings: string[] = [];

            // v34.12 — manual-input reduction: these formulaic warnings are only meaningful
            // when the underlying figure was actually declared. With optional inputs, an empty
            // field must not manufacture "High DTI" (debts / 1) or "no liquidity buffer".
            if (officialShare < 0.5) {
                rationalWarnings.push("Applicant reports that submitted documents cover only part of total income. Treat the evidence set as incomplete, not contradictory.");
            }
            if (tenure < 2) {
                rationalWarnings.push("Limited professional tenure in current sector.");
            }
            if (monthlyIncome > 1 && localDTI > 0.45) {
                rationalWarnings.push("High Debt-to-Income ratio detected in origin jurisdiction.");
            }
            if (annIncomeUSD > 0 && reserveMonths < 3) {
                rationalWarnings.push("Limited liquid reserves for cross-border transition.");
            }

            // Build textData for agents (non-file fields only)
            for (const [key, value] of Object.entries(formData)) {
                if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
                    textData[key] = `[${value.length} document(s) attached: ${(value as File[]).map(f => f.name).join(', ')}]`;
                } else if (Array.isArray(value) && value.length > 0 && 'file' in value[0]) {
                    const validFiles = (value as FileData[]).filter(f => f.validationStatus === 'valid');
                    textData[key] = `[${validFiles.length} document(s): ${validFiles.map(f => f.file.name).join(', ')}]`;
                } else {
                    textData[key] = value;
                }
            }
            
            const countryOfOrigin = formData['country_of_origin'] || 'Unknown';
            const destCountry = formData['target_jurisdiction'] || 'Unknown';

            const originIntelligence = Array.isArray(countryIntelligence) 
                ? (countryIntelligence as any[]).find(c => c.country === countryOfOrigin) || {}
                : {};
            const destIntelligence = Array.isArray(countryIntelligence) 
                ? (countryIntelligence as any[]).find(c => c.country === destCountry) || {}
                : {};

            // --- PHASE 0: DOCUMENT EXTRACTION ---
            // Run before any scoring agents. Each uploaded file is read independently.
            // Results become the primary evidence source for Financial, Identity, and Fraud agents.

            const runDocumentExtraction = async (): Promise<ExtractedDocument[]> => {
                const results: ExtractedDocument[] = [];

                // Form fields store uploads as FileData wrappers ({ file, validationStatus }),
                // NOT raw File objects. Unwrap to File and skip anything explicitly invalid,
                // otherwise extraction silently receives garbage and yields zero documents.
                type UploadEntry = { file: File; qaFixtureAccepted: boolean };
                const pickFiles = (key: string): UploadEntry[] => {
                    const raw = (formData[key] as any[]) || [];
                    return raw
                        .filter((item: any) => item && (item instanceof File || item.validationStatus !== 'invalid'))
                        .map((item: any) => ({
                            file: item instanceof File ? item : item?.file,
                            qaFixtureAccepted: item instanceof File ? false : item?.qaFixtureAccepted === true,
                        }))
                        .filter((item: any): item is UploadEntry => item.file instanceof File);
                };

                const allDocumentEntries: { key: string; label: string; files: UploadEntry[] }[] = [
                    { key: 'identity_document',       label: 'Identity Document', files: pickFiles('identity_document') },
                    { key: 'bank_statements_origin', label: 'Origin Country Bank Statement', files: pickFiles('bank_statements_origin') },
                    { key: 'bank_statements_us',     label: 'Destination Country Bank Statement', files: pickFiles('bank_statements_us') },
                    { key: 'asset_evidence',         label: 'Asset / Property Document', files: pickFiles('asset_evidence') },
                ];

                for (const entry of allDocumentEntries) {
                    if (!entry.files || entry.files.length === 0) continue;

                    for (const upload of entry.files) {
                        const file = upload.file;
                        try {
                            const base64Data = await fileToBase64(file);

                            const response = await fetch('/api/extract-document', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    fileBase64: base64Data,
                                    mimeType: file.type || 'application/octet-stream',
                                    fieldLabel: entry.label,
                                    applicantName: formData.full_name || 'Unknown',
                                    employerName: formData.employer_name || '',
                                    employmentType: formData.employment_type || '',
                                    originCountry: countryOfOrigin,
                                    destinationCountry: destCountry,
                                }),
                            });

                            if (!response.ok) {
                                console.warn(`extract-document failed for ${entry.label}: ${response.status}`);
                                continue;
                            }

                            const parsed = await response.json() as ExtractedDocument;
                            if (parsed && parsed.document_type) {
                                (parsed as any).source_file_name = file.name;
                                if (entry.key === 'identity_document' && upload.qaFixtureAccepted) {
                                    (parsed as any).qa_fixture = true;
                                    (parsed as any).is_usable = false;
                                    (parsed as any).verification_display_status = 'QA Fixture — accepted for pipeline testing; not identity-verified';
                                }
                                results.push(parsed);
                            }
                        } catch (err) {
                            console.warn(`Document extraction error for ${entry.label}:`, err);
                        }
                    }
                }

                return results;
            };

            const extractedDocuments = await runDocumentExtraction();

            // Build a summary of extracted document data for downstream agents
            const documentSummary = extractedDocuments.length > 0
                ? {
                    documents_extracted: extractedDocuments.length,
                    usable_documents: extractedDocuments.filter(d => d.is_usable).length,
                    extractions: extractedDocuments.map(d => ({
                        type: d.document_type,
                        institution: d.issuing_institution,
                        country: d.issuing_country,
                        period: d.period_covered,
                        period_months: d.period_months,
                        name_on_doc: d.account_holder_name,
                        name_match: d.account_holder_name_match,
                        currency: d.currency_code,
                        avg_monthly_inflow: d.average_monthly_inflow,
                        ending_balance: d.ending_balance,
                        income_regularity: d.income_regularity,
                        salary_detected: d.salary_deposits_detected,
                        monthly_obligations: d.estimated_monthly_obligations,
                        asset_type: d.asset_type,
                        asset_value: d.asset_estimated_value_local,
                        asset_ownership: d.asset_ownership_confirmed,
                        legibility: d.legibility_score,
                        authenticity_signals: d.authenticity_signals,
                        authenticity_concerns: d.authenticity_concerns,
                        is_usable: d.is_usable,
                        analyst_note: d.analyst_note,
                        // v34.4: deterministic income engine summary (full counted/excluded
                        // detail stays in document_extractions for the UI/PDF audit table).
                        income_engine: d.income_audit ? {
                            engine: d.income_audit.engine,
                            counted_count: d.income_audit.counted_count,
                            excluded_count: d.income_audit.excluded_count,
                            review_required_count: d.income_audit.review_required_count || 0,
                        } : undefined,
                        // v34.10: deterministic obligations engine summary (full counted/excluded
                        // detail stays in document_extractions for the UI/PDF audit table).
                        obligations_engine: d.obligations_audit ? {
                            engine: d.obligations_audit.engine,
                            counted_count: d.obligations_audit.counted_count,
                            excluded_count: d.obligations_audit.excluded_count,
                        } : undefined,
                    })),
                }
                : {
                    documents_extracted: 0,
                    usable_documents: 0,
                    extractions: [],
                    note: 'No documents uploaded. Analysis based on self-declared data only. Confidence will be low.',
                };

            // --- TRUE MULTI-AGENT ORCHESTRATION ---

            // --- PARALLEL AGENT ORCHESTRATION ---
            // ── HELPER: call a single agent ─────────────────────────────
            // staggerMs spaces out the start of each agent so we don't fire
            // all 6 requests in the same instant and trip the free-tier rate limit.
            const callAgent = async (agentName: string, context: any, staggerMs = 0): Promise<any> => {
                if (staggerMs > 0) await new Promise(r => setTimeout(r, staggerMs));
                try {
                    const resp = await fetch('/api/run-agent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ agentName, context }),
                    });
                    if (!resp.ok) {
                        console.warn(`[${agentName}] HTTP ${resp.status}`);
                        return null;
                    }
                    return await resp.json();
                } catch (err) {
                    console.warn(`[${agentName}] fetch error:`, err);
                    return null;
                }
            };

            // ── Build contexts ───────────────────────────────────────────
            // (Old currency-mixed `verifiedMonthlyInflow` removed — documented income is now
            //  computed per-currency below as `verifiedMonthlyUsd`, the single source of truth.)

            const idContext = {
                document_extractions: documentSummary,
                self_declared: {
                    full_name: formData.full_name,
                    dob: formData.dob,
                    country_of_origin: formData.country_of_origin,
                    citizenship: formData.citizenship,
                },
            };

            const finContext = {
                document_extractions: documentSummary,
                self_declared: {
                    employment: {
                        job_sector: formData.job_sector,
                        job_title_specific: formData.job_title_specific,
                        employment_type: formData.employment_type,
                        employer_name: formData.employer_name,
                        experience_years: formData.experience_years,
                    },
                    financials: {
                        ann_income_usd: formData.ann_income_usd,
                        local_monthly_income: formData.local_monthly_income,
                        local_currency: formData.local_currency,
                        liquid_reserves: formData.liquid_reserves,
                        debts_total_origin: formData.debts_total_origin,
                        delinq_history: formData.delinq_history,
                        official_income_share: formData.official_income_share,
                    },
                    country_context: { origin: countryOfOrigin, destination: destCountry },
                },
                origin_intelligence: originIntelligence,
            };

            // Product-specific underwriting lens — tailors narrative & recommendations to what the
            // recipient of THIS dossier actually evaluates. Domain knowledge centralized here.
            const PURPOSE_LENS: Record<string, { label: string; lens: string }> = {
                apartment_rental: { label: 'Apartment / Housing Rental', lens: 'Recipient is a landlord. Prioritize: monthly income comfortably covering rent (rule of thumb: income ≈ 3x monthly rent), recent and regular income, and deposit / first-month ability. Long credit history is secondary; horizon is short.' },
                personal_loan:    { label: 'Personal Loan', lens: 'Recipient is a lender. Prioritize: debt-to-income ratio, income stability, existing obligations, and repayment capacity over a short-to-medium term.' },
                auto_financing:   { label: 'Auto Financing', lens: 'The loan is secured by the vehicle. Prioritize: down-payment ability and stable income for fixed monthly payments. Shorter term; collateral reduces lender risk.' },
                credit_card:      { label: 'Credit Card', lens: 'Revolving credit, lower stakes per decision. Prioritize: baseline income and basic creditworthiness / identity. Tolerance for thin credit files is higher.' },
                mortgage:         { label: 'Mortgage', lens: 'The most stringent product. Prioritize: stable DOCUMENT-VERIFIED income over 2+ years, cash reserves (several months of payments), conservative debt ratios (~28/36 front/back-end), employment continuity, and down-payment capacity. Undocumented or irregular foreign income is the hardest to use here and must be flagged plainly.' },
                business_account: { label: 'Business / Bank Account', lens: 'Focus is KYC/AML, not income capacity. Prioritize: identity verification, legitimacy and source of funds, and transaction transparency.' },
                other:            { label: 'Financial Verification', lens: 'Provide a balanced cross-border financial picture for a general recipient.' },
            };
            const purposeInfo = PURPOSE_LENS[(formData.verification_purpose as string) || 'other'] || PURPOSE_LENS.other;

            // #4: For products where the obligation is paid in USD (rent, loans, mortgage), origin-country
            // PPP is NOT a US creditworthiness signal — the recipient lends/collects in USD against USD cash
            // flow. PPP stays as origin CONTEXT only; it must not headline or be listed as a strength here.
            const usdObligationProduct = ['apartment_rental', 'personal_loan', 'auto_financing', 'credit_card', 'mortgage']
                .includes((formData.verification_purpose as string) || '');

            // Normalized declared income with EXPLICIT units, so agents never confuse monthly vs annual.
            // ann_income_usd is an ANNUAL figure; local_monthly_income is MONTHLY in origin currency.
            const originRatePre = Number(originIntelligence?.currency_usd_rate_approx) || null;
            const declaredAnnualUsdNorm = annIncomeUSD > 0 ? Math.round(annIncomeUSD) : 0;
            const declaredMonthlyUsdNorm =
                annIncomeUSD > 0 ? Math.round(annIncomeUSD / 12)
                : (monthlyIncome > 1 && originRatePre ? Math.round(monthlyIncome / originRatePre) : 0);
            const declaredMonthlyLocalNorm = monthlyIncome > 1 ? monthlyIncome : null;

            // ── DOCUMENTED monthly income — computed BEFORE the agents so the Country
            // narrative can anchor on DOCUMENTED reality instead of the declared CLAIM.
            // Single source of truth: the reconciliation block below reuses these exact values.
            // GENERALIZATION (v34.1): must work for ANY origin country/currency, incl. countries
            // absent from countryRiskProfiles.json and curated entries with no rate (EUR/GBP/CAD…).
            // Rate resolution per document: USD → 1; curated origin rate; static approx FX table;
            // document's own model-estimated rate (last resort). NEVER divide currency X by
            // currency Y's rate — a doc with no resolvable rate is excluded, not garbled.
            const FX_APPROX_PER_USD: Record<string, number> = {
                // Approximate local-units-per-USD. Fallback ONLY (curated rate wins). Same
                // "approx" spirit as currency_usd_rate_approx in countryRiskProfiles.json.
                EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.5, CHF: 0.88, JPY: 155, CNY: 7.2,
                HKD: 7.8, SGD: 1.34, KRW: 1380, TWD: 32, THB: 36, VND: 25400, IDR: 16200,
                MYR: 4.7, PHP: 57, INR: 83.5, PKR: 278, BDT: 118, NPR: 133, LKR: 300,
                SYP: 13000, EGP: 48, LBP: 89500, IQD: 1310, IRR: 42000, AFN: 70, JOD: 0.71,
                ILS: 3.7, SAR: 3.75, AED: 3.67, QAR: 3.64, KWD: 0.31, TRY: 32.5,
                ETB: 57, KES: 129, NGN: 1580, GHS: 15, ZAR: 18.5, MAD: 10, DZD: 134, TND: 3.1,
                XOF: 600, XAF: 600, UAH: 41.5, RUB: 90, BYN: 3.3, MDL: 17.7, PLN: 4.0,
                RON: 4.6, HUF: 360, CZK: 23, RSD: 108, ALL: 93, BAM: 1.8, MKD: 57, GEL: 2.7,
                AMD: 388, AZN: 1.7, KZT: 450, UZS: 12600, KGS: 87, TJS: 10.9, MNT: 3450,
                MXN: 17.0, BRL: 5.0, COP: 4000, PEN: 3.7, CLP: 940, ARS: 900, DOP: 59,
                GTQ: 7.8, HNL: 24.7, HTG: 132, CUP: 24, VES: 36, SEK: 10.5, NOK: 10.6, DKK: 6.9, MMK: 2100, KHR: 4100, LAK: 21000,
            };
            const originCur = String(originIntelligence?.currency_code || '').toUpperCase();
            const rateForDoc = (d: any): number | null => {
                const cur = String(d?.currency_code || '').toUpperCase();
                if (cur === 'USD') return 1;
                if (cur && cur === originCur && originRatePre) return originRatePre; // curated origin rate
                if (cur && FX_APPROX_PER_USD[cur]) return FX_APPROX_PER_USD[cur];    // static approx table
                const est = Number(d?.usd_rate_estimate);                            // model estimate from the doc itself
                if (isFinite(est) && est > 0) return est;
                if (!cur && originRatePre) return originRatePre; // unknown currency on an origin-preferred doc
                return null; // no resolvable rate → exclude this doc, never mis-convert
            };
            const toUsdByCurrency = (amount: number, d: any): number | null => {
                if (!amount || amount <= 0) return null;
                const rate = rateForDoc(d);
                return rate ? amount / rate : null;
            };
            const usableInflowDocs = extractedDocuments.filter(
                (d: any) => d.is_usable && d.average_monthly_inflow > 0
            );
            const originInflowDocs = usableInflowDocs.filter(
                (d: any) =>
                    String(d.currency_code || '').toUpperCase() === originCur ||
                    String(d.issuing_country || '').toLowerCase() === String(countryOfOrigin || '').toLowerCase()
            );
            const basisDocs = originInflowDocs.length ? originInflowDocs : usableInflowDocs;
            const perDocUsd = basisDocs
                .map((d: any) => toUsdByCurrency(d.average_monthly_inflow, d))
                .filter((v: any): v is number => typeof v === 'number' && v > 0);
            const usableDocCurrency =
                basisDocs.find((d: any) => d.currency_code)?.currency_code ||
                originIntelligence?.currency_code || null;
            const verifiedMonthlyUsd = perDocUsd.length
                ? perDocUsd.reduce((s: number, v: number) => s + v, 0) / perDocUsd.length
                : 0;
            // Documented monthly figure in the origin (local) currency, for "monthly_income_original".
            // Only meaningful when all basis docs share ONE currency — averaging raw amounts across
            // mixed currencies (possible in the fallback branch) would be nonsense.
            const basisCurrencies = [...new Set(basisDocs.map((d: any) => String(d.currency_code || '').toUpperCase()).filter(Boolean))];
            const documentedMonthlyLocal = basisDocs.length && basisCurrencies.length <= 1
                ? Math.round(
                    basisDocs.reduce((s: number, d: any) => s + (Number(d.average_monthly_inflow) || 0), 0) /
                    basisDocs.length
                  )
                : null;
            const hasDocumentedIncome = verifiedMonthlyUsd > 0;

            // ── v34.12 MANUAL-INPUT REDUCTION phase 1: SAVINGS ─────────────────────────
            // Declared liquid reserves are optional. Docs-first: when absent, the statement's
            // ending balance stands in as the liquidity figure. A cash claim without documents
            // is carried but explicitly marked unverified. Max (not sum) across basis docs —
            // two statements of the same account must not double-count.
            const declaredReservesUsd = cleanNum(formData['liquid_reserves']) || 0;
            const docBalanceUsd = Math.round(Math.max(0, ...basisDocs
                .map((d: any) => toUsdByCurrency(Number(d.ending_balance) || 0, d))
                .filter((v: any): v is number => typeof v === 'number' && v > 0)));
            const savingsSource: string =
                declaredReservesUsd > 0 && docBalanceUsd > 0 ? 'declared_and_documented'
                : docBalanceUsd > 0 ? 'statement_balance'
                : declaredReservesUsd > 0 ? 'self_declared_unverified'
                : 'none';
            const liquidReservesEffectiveUsd = declaredReservesUsd > 0 ? declaredReservesUsd : docBalanceUsd;
            // finContext is declared above and consumed later (callAgent) — enrich in place so
            // the Financial agent sees the effective figure and its provenance, never a blank.
            (finContext as any).self_declared.financials.liquid_reserves_effective_usd = liquidReservesEffectiveUsd || null;
            (finContext as any).self_declared.financials.savings_source = savingsSource;

            // ── #9: Deterministic GEOGRAPHY signal ─────────────────────────────────────
            // Form answers + destination-issued documents can prove the applicant is ALREADY
            // RESIDING in the destination (not "planning to move"). Without this, the narrative
            // recommends nonsense like "establish a destination identity" to someone who has
            // lived there over a year and runs a local company. Computed deterministically.
            const monthsInDestination = Number(formData.years_in_destination) || 0;
            const hasDestinationNexus = !!formData.has_us_nexus;
            const destinationAddress = String(formData.current_local_address || '').trim();
            const normGeo = (s: any) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
            const destNorm = normGeo(destCountry);
            const originNorm = normGeo(countryOfOrigin);
            const destinationDocs = extractedDocuments.filter((d: any) => {
                if (!d.is_usable) return false;
                const iss = normGeo(d.issuing_country);
                if (!iss) return false;
                if (destNorm && iss.includes(destNorm)) return true;            // issued in destination
                return iss !== originNorm && String(d.currency_code || '').toUpperCase() === 'USD'; // USD doc, non-origin bank
            });
            const destinationDocCount = destinationDocs.length;
            const geoReasons: string[] = [];
            if (monthsInDestination >= 6) geoReasons.push(`Reports ${monthsInDestination} months in the destination country`);
            if (destinationDocCount > 0) geoReasons.push(`${destinationDocCount} destination-issued financial document(s) on file`);
            if (destinationAddress) geoReasons.push('Provided a current residential address in the destination country');
            if (hasDestinationNexus) geoReasons.push('Reports existing destination-country financial records');
            const alreadyInDestination =
                monthsInDestination >= 6 || destinationDocCount > 0 || (hasDestinationNexus && !!destinationAddress);
            const geoSignal = {
                already_in_destination: alreadyInDestination,
                months_in_destination: monthsInDestination,
                destination_doc_count: destinationDocCount,
                has_destination_address: !!destinationAddress,
                has_destination_nexus: hasDestinationNexus,
                origin_country: countryOfOrigin,
                destination_country: destCountry,
                signals: geoReasons,
            };

            // #8: documented-vs-declared income status, computed PRE-agent (same 0.60 ratio
            // threshold the deterministic reconciliation uses below) so the Behavioral agent
            // cannot rubber-stamp "declared income matches" when the documents contradict it.
            // v34.4: a declared figure 20x+ below DOCUMENTED income is an input typo
            // (browser number inputs eat "41,000" → 41), not a real claim. Zero it here —
            // the single pre-agent source — so agents never narrate a garbage "$2/mo declared".
            const declaredMonthlyUsdPreRaw = declaredMonthlyUsdNorm || 0;
            const declaredPreSuspect =
                verifiedMonthlyUsd > 0 && declaredMonthlyUsdPreRaw > 0 &&
                (verifiedMonthlyUsd / declaredMonthlyUsdPreRaw) > 20;
            const declaredMonthlyUsdPre = declaredPreSuspect ? 0 : declaredMonthlyUsdPreRaw;
            const declaredCoverageIsPartial = officialShare < 0.999;
            const incomeContradictedPre =
                !declaredCoverageIsPartial &&
                verifiedMonthlyUsd > 0 && declaredMonthlyUsdPre > 0 &&
                (verifiedMonthlyUsd / declaredMonthlyUsdPre) < 0.60;
            const incomeDiscrepancyPctPre =
                verifiedMonthlyUsd > 0 && declaredMonthlyUsdPre > 0
                    ? Math.round(((verifiedMonthlyUsd - declaredMonthlyUsdPre) / declaredMonthlyUsdPre) * 100)
                    : null;

            const fraudContext = {
                document_extractions: documentSummary,
                self_declared: {
                    declared_monthly_income_usd: declaredMonthlyUsdPre || null,
                    declared_input_suspect: declaredPreSuspect || undefined,
                    declared_annual_income_usd: declaredAnnualUsdNorm,
                    declared_monthly_local: declaredPreSuspect ? null : declaredMonthlyLocalNorm,
                    declared_currency: formData.local_currency,
                    employer: formData.employer_name,
                    name: formData.full_name,
                    origin: countryOfOrigin,
                },
            };

            const countryContext = {
                origin_country: countryOfOrigin,
                destination_country: destCountry,
                verification_purpose: purposeInfo.label,
                purpose_lens: purposeInfo.lens,
                ppp_context_only: usdObligationProduct,
                geo: geoSignal,
                origin_intelligence: originIntelligence,
                destination_intelligence: destIntelligence,
                applicant_financials: {
                    // DOCUMENTED income = the source of truth. Per-currency normalized, origin docs preferred.
                    has_documented_income: hasDocumentedIncome,
                    documented_monthly_income_usd: hasDocumentedIncome ? Math.round(verifiedMonthlyUsd) : null,
                    documented_monthly_income_local: documentedMonthlyLocal,
                    documented_currency: usableDocCurrency,
                    // DECLARED by the applicant — an UNVERIFIED claim. Never present as the income figure.
                    declared_monthly_income_usd_UNVERIFIED: declaredMonthlyUsdNorm,
                    declared_annual_income_usd_UNVERIFIED: declaredAnnualUsdNorm,
                    declared_monthly_income_local_UNVERIFIED: declaredMonthlyLocalNorm,
                    declared_currency: formData.local_currency,
                    job_sector: formData.job_sector,
                    job_title: formData.job_title_specific,
                    experience_years: formData.experience_years,
                    employment_type: formData.employment_type,
                },
            };

            const behContext = {
                employment_type: formData.employment_type,
                experience_years: formData.experience_years,
                job_sector: formData.job_sector,
                declared_income: declaredPreSuspect ? null : formData.local_monthly_income,
                declared_currency: formData.local_currency,
                has_documents: documentSummary.usable_documents > 0,
                doc_count: documentSummary.usable_documents,
                geo: geoSignal,
                documented_monthly_usd: hasDocumentedIncome ? Math.round(verifiedMonthlyUsd) : null,
                declared_monthly_usd: declaredMonthlyUsdPre || null,
                income_contradicted: incomeContradictedPre,
                income_discrepancy_pct: incomeDiscrepancyPctPre,
            };

            const cultureContext = {
                origin_country: countryOfOrigin,
                destination_country: destCountry,
                origin_intelligence: originIntelligence,
                applicant_financials: {
                    declared_monthly_income_usd: declaredMonthlyUsdPre || null,
                    declared_annual_income_usd: declaredAnnualUsdNorm,
                    liquid_reserves: formData.liquid_reserves,
                    liquid_reserves_effective_usd: liquidReservesEffectiveUsd || null,
                    savings_source: savingsSource,
                    debts_total_origin: formData.debts_total_origin,
                    official_income_share: formData.official_income_share,
                    job_sector: formData.job_sector,
                    has_documents: documentSummary.usable_documents > 0,
                },
            };

            // ── PARALLEL agent execution — staggered to respect rate limits ────
            // Each agent starts ~400ms after the previous one. Total spread ~2s,
            // keeping us under the free-tier burst limit while still running concurrently.
            const [idNode, finNode, fraudNode, countryNode, behNode, cultureNode] = await Promise.all([
                callAgent('Identity',  idContext,      0),
                callAgent('Financial', finContext,     400),
                callAgent('Fraud',     fraudContext,   800),
                callAgent('Country',   countryContext, 1200),
                callAgent('Behavioral',behContext,     1600),
                callAgent('Culture',   cultureContext, 2000),
            ]);

            // NORMALIZE CONFIDENCE SCALE: agents are prompted with "numbers are 0-100",
            // so they may return confidence as 0-100 (e.g. 39) while all downstream math
            // and display assume 0-1. Coerce any value >1 to the 0-1 range. Fallback
            // objects already use 0-1 (e.g. 0.3) and pass through unchanged.
            const toUnitConfidence = (v: any): number => {
                const n = Number(v);
                if (!isFinite(n)) return 0.5;
                return n > 1 ? Math.min(1, n / 100) : Math.max(0, n);
            };
            [idNode, finNode, fraudNode, countryNode, behNode, cultureNode].forEach((node: any) => {
                if (node && node.confidence != null) node.confidence = toUnitConfidence(node.confidence);
            });

            // A: DETERMINISTIC DOCUMENT FIELDS. The Country agent has no access to raw documents,
            // so it can only guess document_institution / document_period / income_pattern — in
            // practice it wrote "N/A — no income documents" while two documents sat in the report.
            // These facts already exist in extractedDocuments; overwrite the agent's guesses.
            if (countryNode && basisDocs.length > 0) {
                const rdtNode = (countryNode.raw_data_table = countryNode.raw_data_table || {});
                const institutions = [...new Set(basisDocs.map((d: any) => d.issuing_institution).filter((s: any) => s && s !== 'Unknown'))];
                if (institutions.length) rdtNode.document_institution = institutions.join('; ');
                const periods = [...new Set(basisDocs.map((d: any) => d.period_covered).filter(Boolean))];
                if (periods.length) rdtNode.document_period = periods.join('; ');
                const regularity = [...new Set(basisDocs.map((d: any) => d.income_regularity).filter(Boolean))].join('/');
                const sources = [...new Set(basisDocs.flatMap((d: any) => d.income_sources_detected || []))].slice(0, 3);
                if (regularity || sources.length) {
                    rdtNode.income_pattern = [regularity, sources.length ? `sources: ${sources.join(', ')}` : '']
                        .filter(Boolean).join(' — ');
                }
            }

            // Deterministic lender-safe post-processing. AI text is never allowed to
            // reintroduce unsourced market numbers or contradict known profession/sector data.
            const statedSector = String(formData.job_sector || '').trim();
            const statedProfession = String((formData as any).profession || (formData as any).job_title || '').trim();
            const stripUnsourcedBenchmarks = (value: any): string => {
                let text = String(value || '');
                text = text.replace(/(?:US|U\.S\.)\s+(?:national\s+)?median[^.]*\$[\d,]+[^.]*\.?/gi, '');
                text = text.replace(/(?:typical\s+)?salar(?:y|ies)\s+(?:range|ranging)[^.]*\$[\d,]+[^.]*\.?/gi, '');
                text = text.replace(/\$[\d,]+\s*(?:-|–|to)\s*\$[\d,]+\s*(?:annually|per year|\/year)?/gi, '');
                return text.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
            };
            if (countryNode) {
                const rdtNode = (countryNode.raw_data_table = countryNode.raw_data_table || {});
                if (statedSector || statedProfession) {
                    const label = statedSector || statedProfession;
                    rdtNode.income_vs_sector_median = `Sector stated: ${label} — verified sector benchmark unavailable`;
                    rdtNode.sector_benchmark_note = statedProfession
                        ? `Profession stated: ${statedProfession}. Destination demand should be reviewed using current external sources.`
                        : `Sector stated: ${statedSector}. Destination demand should be reviewed using current external sources.`;
                }
                countryNode.origin_income_context = stripUnsourcedBenchmarks(countryNode.origin_income_context);
                countryNode.income_transfer_narrative = stripUnsourcedBenchmarks(countryNode.income_transfer_narrative);
                countryNode.sector_demand_in_destination = stripUnsourcedBenchmarks(countryNode.sector_demand_in_destination);
                rdtNode.sector_benchmark_note = stripUnsourcedBenchmarks(rdtNode.sector_benchmark_note);

                // v34.35: unsourced percentile/median/demand claims are presentation-only noise.
                // Until a dated benchmark source exists, do not expose or score them.
                countryNode.origin_income_percentile = null;
                rdtNode.income_percentile_label = 'Not independently benchmarked';
                rdtNode.income_vs_national_median = 'No dated external benchmark attached';
                countryNode.sector_demand_in_destination = 'Destination-market demand was not independently benchmarked for this report.';
                countryNode.origin_income_context = 'Documented income is presented from the submitted evidence. Relative national standing was not independently benchmarked.';
                countryNode.income_transfer_narrative = 'Documented income and observed statement-based obligations are available for review. Destination affordability and lending thresholds were not independently benchmarked.';
            }

            // ============================================================
            // DETERMINISTIC INCOME RECONCILIATION — source of truth for score.
            // The LLM produces narrative; the NUMBERS here drive the score.
            // Core product rule: declared income only counts if a document backs it.
            // ============================================================
            const numOf = (v: any) => { const n = Number(typeof v === 'string' ? v.replace(/[,\s\u00A0']/g, '') : v); return isFinite(n) ? n : 0; };
            // currency_usd_rate_approx is "local units per 1 USD" (e.g. UAH 41.5 = $1) → USD = local / rate
            const originRate = numOf(originIntelligence?.currency_usd_rate_approx) || null;

            // Declared monthly income: reconcile in the document/local currency whenever possible.
            // USD is presentation only and must use the SAME FX snapshot as the verified amount.
            const declaredMonthlyLocal = numOf(formData.local_monthly_income);
            const reconciliationRate = basisDocs.length ? rateForDoc(basisDocs[0]) : originRate;
            let declaredMonthlyUsd = 0;
            if (declaredMonthlyLocal > 0 && documentedMonthlyLocal != null && reconciliationRate) {
                declaredMonthlyUsd = declaredMonthlyLocal / reconciliationRate;
            } else if (numOf(formData.ann_income_usd) > 0) {
                declaredMonthlyUsd = numOf(formData.ann_income_usd) / 12;
            } else if (declaredMonthlyLocal > 0 && originRate) {
                declaredMonthlyUsd = declaredMonthlyLocal / originRate;
            }

            // Documented monthly income in USD (verifiedMonthlyUsd) is the SINGLE SOURCE OF TRUTH,
            // computed ONCE above (before the agents) so the Country narrative and the score share it.
            // See the "DOCUMENTED monthly income" block earlier in this handler.

            const hasVerifiedIncome = verifiedMonthlyUsd > 0;
            const hasDeclaredIncome = declaredMonthlyUsd > 0;

            // Decide status + evidence factor
            let incomeStatus: 'verified' | 'partial' | 'declared' | 'contradicted' | 'unverified' = 'unverified';
            let incomeEvidenceFactor = 0.15;
            let discrepancyPct: number | null = null;

            if (hasVerifiedIncome && hasDeclaredIncome) {
                const canReconcileLocally = documentedMonthlyLocal != null && documentedMonthlyLocal > 0 && declaredMonthlyLocal > 0;
                const ratio = canReconcileLocally
                    ? documentedMonthlyLocal / declaredMonthlyLocal
                    : verifiedMonthlyUsd / declaredMonthlyUsd;
                discrepancyPct = Math.round((ratio - 1) * 100);
                if (ratio >= 0.85) { incomeStatus = 'verified'; incomeEvidenceFactor = 1.0; }      // docs confirm (or exceed) declared
                else if (declaredCoverageIsPartial) {
                    incomeStatus = 'partial';
                    // Incomplete evidence can support only the observed portion; it cannot disprove
                    // the remainder solely by omission.
                    incomeEvidenceFactor = Math.max(0.35, Math.min(0.80, ratio / Math.max(officialShare, 0.1)));
                }
                else if (ratio >= 0.60) { incomeStatus = 'partial'; incomeEvidenceFactor = 0.85; }  // docs somewhat below declared
                else { incomeStatus = 'contradicted'; incomeEvidenceFactor = 0.0; }                  // full-coverage evidence materially conflicts
            } else if (hasVerifiedIncome && !hasDeclaredIncome) {
                incomeStatus = 'verified'; incomeEvidenceFactor = 1.0;   // the document speaks for itself
            } else if (!hasVerifiedIncome && hasDeclaredIncome) {
                incomeStatus = 'declared'; incomeEvidenceFactor = 0.25;  // claim only, no backing
            } else {
                incomeStatus = 'unverified'; incomeEvidenceFactor = 0.15; // nothing to go on
            }

            // Name reconciliation (backlog #1, deterministic): any usable doc whose holder name doesn't match
            const nameMismatch = extractedDocuments.some(
                (d: any) => d.is_usable && d.account_holder_name_match === 'No match'
            );

            // One deterministic name verdict across every surface. LLM per-document labels
            // must not oscillate between Match and Partial match for the same normalized names.
            extractedDocuments.forEach((d: any) => {
                if (!d?.account_holder_name) return;
                const normalized = String(d.account_holder_name_match || '');
                if (!nameMismatch && normalized !== 'Cannot determine') d.account_holder_name_match = 'Match';
            });

            const isProvisional = incomeStatus !== 'verified' && incomeStatus !== 'partial';

            // v34.4: a declared figure 20x+ BELOW documents is almost certainly an input typo
            // (browser number inputs eat "41,000" → 41), not an honest under-declaration.
            // Don't punish — but flag it, and don't render an absurd "+84046%" gap as insight.
            const declaredInputSuspect =
                hasVerifiedIncome && hasDeclaredIncome && (verifiedMonthlyUsd / declaredMonthlyUsd) > 20;

            // Human-readable explanation (deterministic — never invents numbers)
            const fmtUsd = (n: number) => `$${Math.round(n).toLocaleString()}`;
            let reconciliationExplanation = '';
            if (incomeStatus === 'contradicted') {
                reconciliationExplanation = `Declared income (~${fmtUsd(declaredMonthlyUsd)}/mo) is significantly higher than documented income (~${fmtUsd(verifiedMonthlyUsd)}/mo, ${discrepancyPct}% difference). The gap is unexplained and lowers verified standing.`;
            } else if (incomeStatus === 'partial') {
                reconciliationExplanation = declaredCoverageIsPartial
                    ? `Submitted documents show ~${fmtUsd(verifiedMonthlyUsd)}/mo against a declared ~${fmtUsd(declaredMonthlyUsd)}/mo. The applicant reports that the evidence covers about ${Math.round(officialShare * 100)}% of total income, so the remaining gap is unverified rather than contradicted.`
                    : `Documents confirm ~${fmtUsd(verifiedMonthlyUsd)}/mo against a declared ~${fmtUsd(declaredMonthlyUsd)}/mo (${discrepancyPct}%). Partially verified.`;
            } else if (incomeStatus === 'verified') {
                reconciliationExplanation = declaredInputSuspect
                    ? `Documented income (~${fmtUsd(verifiedMonthlyUsd)}/mo) is verified by bank records. The declared figure (~${fmtUsd(declaredMonthlyUsd)}/mo) appears to be an input typo (e.g. a thousands separator was dropped) and was disregarded — re-enter it as digits only.`
                    : hasDeclaredIncome
                        ? `Documented income (~${fmtUsd(verifiedMonthlyUsd)}/mo) supports the declared figure. Income is document-verified.`
                        : `Documented income (~${fmtUsd(verifiedMonthlyUsd)}/mo) is verified by bank records. No self-declared figure was provided — the documents are the sole source (docs-only assessment).`;
            } else if (incomeStatus === 'declared') {
                reconciliationExplanation = `Income of ~${fmtUsd(declaredMonthlyUsd)}/mo is self-declared with no supporting document. Treated as a provisional claim until a bank statement is uploaded.`;
            } else {
                reconciliationExplanation = `No income figure was declared or documented. Upload a bank statement to establish verified income.`;
            }

            const reconciliation = {
                income_status: incomeStatus,
                // A typo'd declared figure must not paint "$2/mo vs $2,029 (+84046%)" on the
                // dashboard — null the declared side so surfaces render docs-only.
                declared_monthly_usd: declaredInputSuspect ? null : Math.round(declaredMonthlyUsd),
                verified_monthly_usd: Math.round(verifiedMonthlyUsd),
                discrepancy_pct: declaredInputSuspect ? null : discrepancyPct,
                declared_input_suspect: declaredInputSuspect,
                evidence_factor: incomeEvidenceFactor,
                declared_documentation_share: officialShare,
                evidence_coverage_partial: declaredCoverageIsPartial,
                is_provisional: isProvisional,
                has_usable_docs: (documentSummary.usable_documents || 0) > 0,
                // v34.12 — manual-input reduction: surfaces render provenance, not blanks.
                docs_only: hasVerifiedIncome && !hasDeclaredIncome,
                savings_source: savingsSource,
                liquid_reserves_effective_usd: liquidReservesEffectiveUsd || null,
                doc_currency: usableDocCurrency,
                reconciliation_currency: documentedMonthlyLocal != null && declaredMonthlyLocal > 0 ? usableDocCurrency : 'USD',
                declared_monthly_local: declaredMonthlyLocal || null,
                verified_monthly_local: documentedMonthlyLocal,
                fx_rate_local_per_usd: reconciliationRate || null,
                fx_rate_source: basisDocs.length ? 'document_currency_snapshot' : 'origin_profile_fallback',
                name_mismatch: nameMismatch,
                explanation: reconciliationExplanation,
            };

            // A contradiction must bite the score: force the contradiction channel.
            if (incomeStatus === 'contradicted' && fraudNode) {
                fraudNode.contradiction_score = Math.max(numOf(fraudNode.contradiction_score), 70);
            }
            if (nameMismatch && fraudNode) {
                fraudNode.contradiction_score = Math.max(numOf(fraudNode.contradiction_score), 60);
            }
            // v34.6: SYMMETRIC gate. When the deterministic reconciliation VERIFIES income (or
            // finds it partial) and the name matches, the LLM cannot impose a contradiction it
            // cannot substantiate — an agent spooked by e.g. "self-transfer excluded" wording must
            // not cost a clean profile 17+ points. Deterministic numbers are the source of truth
            // in BOTH directions.
            if (!nameMismatch && fraudNode && incomeStatus === 'verified') {
                // Only the income-reconciliation contradiction channel is cleared here.
                // Independent document-integrity findings remain represented by fraud_risk/evidence fields.
                fraudNode.contradiction_score = 0;
            } else if (!nameMismatch && fraudNode && incomeStatus === 'partial') {
                fraudNode.contradiction_score = Math.min(numOf(fraudNode.contradiction_score), 40);
            }

            // FINAL SYNTHESIS — Structured Aggregation Engine
            // synthesis is now called inline above — no separate function needed


            // Build parsedResult directly from agent outputs — no longer dependent on synthesis succeeding
            // Synthesis adds summary_statement and dossier_markdown only — everything else comes from agents
            const buildResultFromAgents = () => ({
                financial_identity_profile: {
                    profile_type: finNode.income_reliability > 65 ? 'Stable Income Profile' : 'Variable Income Profile',
                    overall_integrity_level: extractedDocuments.some((d: any) => d.is_usable)
                        ? (idNode.identity_reliability > 65 ? 'Verified' : 'Partially Verified')
                        : 'Not Verified',
                    trust_assessment: fraudNode.fraud_risk < 30 ? 'Low Risk' : fraudNode.fraud_risk < 60 ? 'Moderate Risk' : 'Elevated Risk',
                    professional_stability: finNode.financial_stability > 65 ? 'Stable' : 'Variable',
                },
                aggregated_strengths: [
                    ...(idNode.evidence || []).slice(0, 2),
                    ...(finNode.evidence || []).slice(0, 2),
                    ...(countryNode.strengths || []).slice(0, 2),
                ],
                aggregated_risks: [
                    ...(idNode.risk_flags || []).slice(0, 2),
                    ...(finNode.risk_factors || []).slice(0, 2),
                    ...(fraudNode.risk_patterns || []).slice(0, 1).map((r: any) => r.pattern || ''),
                ],
                aggregated_uncertainties: [
                    ...(idNode.missing_information || []).slice(0, 1),
                    ...(finNode.missing_information || []).slice(0, 1),
                ],
                cross_border_summary: {
                    migration_readiness: countryNode.migration_readiness ?? 50,
                    economic_adaptability: countryNode.economic_adaptability ?? 50,
                    transferability_feasibility: countryNode.income_transfer_narrative || 'Assessment based on available data.',
                },
                behavioral_summary: {
                    interaction_stability_score: behNode.behavioral_consistency ?? 50,
                    narrative_consistency: (behNode.positive_signals || []).join('. ') || 'Profile assessed.',
                },
                evidence_summary: {
                    primary_evidence_sources: documentSummary.extractions?.map((d: any) => `${d.type} — ${d.institution}`) || [],
                    evidence_gap_count: (idNode.missing_information?.length || 0) + (finNode.missing_information?.length || 0),
                },
                score_explanation: {
                    top_positive_drivers: (countryNode.strengths || []).slice(0, 3),
                    top_negative_drivers: (finNode.risk_factors || []).slice(0, 3),
                },
                recommendation_summary: [
                    'Upload 6 months of bank statements for higher confidence score.',
                    'Add employment contract or payslip to verify income source.',
                ],
                overall_confidence: parsedResult_confidence,
                analysis_integrity: {
                    evidence_quality: evidence_strength_prelim,
                    reasoning_stability: 70,
                    contradiction_severity: fraudNode.contradiction_score ?? 0,
                    uncertainty_level: Math.round((1 - parsedResult_confidence) * 100),
                },
                dossier_markdown: '',
                summary_statement: '',
            });

            // Calculate preliminary evidence strength before synthesis
            const agents_prelim = [idNode, finNode, fraudNode, countryNode, behNode];
            const evidence_strength_prelim = agents_prelim.reduce((acc, a) => acc + (a.evidence_strength ?? 50), 0) / agents_prelim.length;
            const parsedResult_confidence = Math.max(0.2,
                (idNode.confidence ?? 0.5) * 0.2 +
                (finNode.confidence ?? 0.5) * 0.3 +
                (fraudNode.confidence ?? 0.5) * 0.2 +
                (countryNode.confidence ?? 0.5) * 0.2 +
                (behNode.confidence ?? 0.1) * 0.1
            );

            // Build base result from agents (always succeeds)
            let parsedResult: any = buildResultFromAgents();

            // Try synthesis for summary_statement + dossier_markdown only (with tight timeout)
            try {
                const synthesisController = new AbortController();
                const synthesisTimeout = setTimeout(() => synthesisController.abort(), 8000); // 8s — stays under Hobby 10s limit

                const synthesisResponse = await fetch('/api/synthesize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: synthesisController.signal,
                    body: JSON.stringify({
                        // Only send minimal data — new synthesize.ts uses fin + country + id
                        fin: finNode,
                        country: countryNode,
                        id: idNode,
                        documentSummary,
                        purpose: purposeInfo.label,
                        purpose_lens: purposeInfo.lens,
                        reconciliation,
                        ppp_context_only: usdObligationProduct,
                        geo: geoSignal,
                    }),
                });
                clearTimeout(synthesisTimeout);

                if (synthesisResponse.ok) {
                    const synthesisData = await synthesisResponse.json();
                    if (synthesisData && typeof synthesisData === 'object' && !synthesisData.error) {
                        parsedResult.summary_statement = synthesisData.summary_statement || parsedResult.summary_statement;
                        if (synthesisData.top_strengths?.length) parsedResult.aggregated_strengths = synthesisData.top_strengths;
                        if (synthesisData.top_risks?.length) parsedResult.aggregated_risks = synthesisData.top_risks;
                    }
                }
            } catch (synthesisErr) {
                // Synthesis timeout or error — use agent-built result, which is already valid
                console.warn('[synthesis] timed out or failed, using agent-built result:', synthesisErr);
            }

            // Build summary_statement from agents if synthesis didn't provide one
            if (!parsedResult.summary_statement) {
                const verifiedIncome = finNode.verified_monthly_income_local
                    ? `${finNode.verified_currency || ''} ${finNode.verified_monthly_income_local?.toLocaleString()}/month`
                    : formData.local_monthly_income ? `${formData.local_currency || ''} ${formData.local_monthly_income}/month` : 'income not verified';
                parsedResult.summary_statement = `${formData.full_name || 'Applicant'} presents a ${(parsedResult.financial_identity_profile?.overall_integrity_level || 'assessed').toLowerCase()} financial profile from ${countryOfOrigin}. ` +
                    `Verified income: ${verifiedIncome}. ` +
                    `${countryNode.income_transfer_narrative || countryNode.origin_income_context || 'Cross-border profile assessed.'}`;
            }

            if (!parsedResult.dossier_markdown) {
                parsedResult.dossier_markdown = `## Financial Profile: ${formData.full_name || 'Applicant'}\n\n` +
                    `**Origin:** ${countryOfOrigin} → **Destination:** ${destCountry}\n\n` +
                    `**Income Context:** ${countryNode.origin_income_context || 'See agent analysis.'}\n\n` +
                    `**For the Lender:** ${countryNode.income_transfer_narrative || 'Profile based on available documents.'}\n\n` +
                    `**Strengths:** ${parsedResult.aggregated_strengths.slice(0, 3).join('; ')}\n\n` +
                    `**Considerations:** ${parsedResult.aggregated_risks.slice(0, 3).join('; ')}`;
            }

            const lenderSafeText = (value: string): string => String(value || '')
                .replace(/[^.]*median monthly income in the (?:US|United States)[^.]*\.?/gi, '')
                .replace(/moderate to good capacity for repayment/gi, 'documented income and observed obligations available for review')
                .replace(/moderate capacity for repayment/gi, 'documented income available for review')
                .replace(/existing obligations are unknown/gi, 'the complete liabilities picture is not established from the submitted evidence')
                .replace(/no information on existing obligations[^.]*\.?/gi, 'Statement-based recurring payments were observed; outstanding balances, contractual schedules, and exact DTI are not established.')
                .replace(/[^.]*\b(?:top \d+%|\d+(?:st|nd|rd|th) percentile|\d+x (?:monthly )?rent|median salar(?:y|ies)|middle-income bracket|\d+(?:st|nd|rd|th) decile)\b[^.]*\.?/gi, '')
                .replace(/\.\.+/g, '.')
                .replace(/\s{2,}/g, ' ')
                .trim();
            countryNode.income_transfer_narrative = lenderSafeText(countryNode.income_transfer_narrative || '');
            parsedResult.summary_statement = lenderSafeText(parsedResult.summary_statement || '');
            parsedResult.aggregated_strengths = (parsedResult.aggregated_strengths || []).map(lenderSafeText).filter(Boolean);
            parsedResult.aggregated_risks = (parsedResult.aggregated_risks || []).map(lenderSafeText).filter(Boolean);

            const humanizeBehavior = (value: string): string => {
                const banned = /\b(flag|contradiction score|income contradiction|field name|debug|internal|snake case)\b|_/i;
                const safeSentences = String(value || '')
                    .split(/[.!?]+/)
                    .map((sentence) => sentence.trim())
                    .filter(Boolean)
                    .filter((sentence) => !banned.test(sentence))
                    .map((sentence) => sentence
                        .replace(/\bhas documents\b/gi, 'Submitted documents are available')
                        .replace(/\bdeclared income consistent with documents\b/gi, 'Declared income is consistent with submitted documents')
                        .replace(/\bdeclared income consistent with docs\b/gi, 'Declared income is consistent with submitted documents'));
                return safeSentences.slice(0, 4)
                    .map((sentence) => `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}`)
                    .join('. ');
            };
            parsedResult.behavioral_summary.narrative_consistency = humanizeBehavior(parsedResult.behavioral_summary.narrative_consistency)
                || 'Behavioral observations are limited to the submitted evidence.';

            const obligationDocs = extractedDocuments.filter((d: any) => d.is_usable && Number(d.estimated_monthly_obligations) > 0);
            const observedObligationsLocal = obligationDocs.length
                ? Math.round(obligationDocs.reduce((sum: number, d: any) => sum + Number(d.estimated_monthly_obligations || 0), 0) / obligationDocs.length)
                : 0;
            const obligationCurrency = obligationDocs.find((d: any) => d.currency_code)?.currency_code || usableDocCurrency || '';
            const detectedLoanPayments = obligationDocs.flatMap((d: any) => d.obligations_audit?.counted || [])
                .filter((x: any) => x.reason === 'loan_or_credit');
            parsedResult.obligations_summary = {
                observed_monthly_average_local: observedObligationsLocal || null,
                currency: obligationCurrency || null,
                detected_loan_payment_count: detectedLoanPayments.length,
                complete_liability_schedule_available: false,
            };
            if (observedObligationsLocal > 0) {
                const grounded = `Observed statement-based obligations average approximately ${obligationCurrency} ${observedObligationsLocal.toLocaleString()}/month. The outstanding balances, full repayment schedules, and exact DTI are not established.`;
                parsedResult.aggregated_risks = (parsedResult.aggregated_risks || [])
                    .filter((r: string) => !/obligations are unknown|debt obligations are not detailed|complete liabilities picture/i.test(r));
                parsedResult.aggregated_risks.push(grounded);
                parsedResult.summary_statement = parsedResult.summary_statement
                    .replace(/existing obligations are unknown/gi, grounded)
                    .replace(/the complete liabilities picture is not established from the submitted evidence/gi, grounded);
            }

            parsedResult.agent_summary = {
                identity: idNode,
                financial: finNode,
                fraud: fraudNode,
                country: countryNode,
                behavioral: behNode,
            };

            // Attach document extraction data for lender report (Module 4)
            parsedResult.document_extractions = extractedDocuments;
            parsedResult.document_summary = documentSummary;

            // STRICT MAPPING: Transform Aggregation Output to UI-Compatible Format
            // This ensures the UI remains stable while the Synthesis Engine stays structural.
            
            // Map legacy top-level fields
            parsedResult.confidence = parsedResult.overall_confidence;
            parsedResult.strengths = parsedResult.aggregated_strengths || [];
            parsedResult.risks = parsedResult.aggregated_risks || [];
            parsedResult.major_strengths = parsedResult.aggregated_strengths || [];
            parsedResult.major_risks = parsedResult.aggregated_risks || [];
            parsedResult.uncertainties = parsedResult.aggregated_uncertainties || [];
            parsedResult.missing_information = parsedResult.aggregated_uncertainties || [];
            parsedResult.dossier = parsedResult.dossier_markdown;
            parsedResult.summaryStatement = parsedResult.summary_statement;
            
            // Reconstruct dossier_analysis for UI components
            parsedResult.dossier_analysis = {
                financial_identity_profile: {
                    profile_type: parsedResult.financial_identity_profile.profile_type,
                    overall_integrity_level: parsedResult.financial_identity_profile.overall_integrity_level,
                    cross_border_readiness: parsedResult.cross_border_summary.transferability_feasibility,
                    financial_resilience_level: parsedResult.financial_identity_profile.overall_integrity_level, // Proxy
                    trust_assessment: parsedResult.financial_identity_profile.trust_assessment
                },
                behavioral_summary: {
                    overall_stability: parsedResult.behavioral_summary.narrative_consistency,
                    consistency_observations: [parsedResult.behavioral_summary.narrative_consistency],
                    interaction_strengths: [],
                    interaction_risks: []
                },
                score_explanation: {
                    score_increase_factors: parsedResult.score_explanation.top_positive_drivers,
                    score_decrease_factors: parsedResult.score_explanation.top_negative_drivers,
                    most_influential_factors: [
                        ...(parsedResult.score_explanation.top_positive_drivers.slice(0, 1)),
                        ...(parsedResult.score_explanation.top_negative_drivers.slice(0, 1))
                    ]
                },
                strengths: parsedResult.aggregated_strengths.map((s: string) => ({ title: s, description: reconciliation.income_status === 'contradicted'
                        ? "Analytic strength (profile contested)."
                        : (extractedDocuments.some((d: any) => d.is_usable) ? "Evidence-supported analytical strength." : "Assessment observation based on currently available information."), confidence: parsedResult.overall_confidence })),
                risks: parsedResult.aggregated_risks.map((r: string) => ({ title: r, description: "Identified institutional risk factor.", severity: 50, confidence: parsedResult.overall_confidence })),
                uncertainty_analysis: {
                    high_uncertainty_areas: parsedResult.aggregated_uncertainties,
                    missing_information: parsedResult.aggregated_uncertainties,
                    recommended_additional_evidence: []
                },
                cross_border_analysis: {
                    migration_readiness: parsedResult.cross_border_summary.migration_readiness,
                    economic_adaptability: parsedResult.cross_border_summary.economic_adaptability,
                    destination_alignment: 50,
                    cross_border_strengths: [],
                    cross_border_risks: []
                },
                evidence_summary: {
                    strongest_evidence: parsedResult.evidence_summary.primary_evidence_sources,
                    weakest_evidence: [],
                    evidence_quality: parsedResult.analysis_integrity.evidence_quality
                },
                financial_pathway_summary: {
                    top_improvement_priorities: parsedResult.recommendation_summary.slice(0, 3),
                    highest_impact_changes: parsedResult.recommendation_summary.slice(0, 2),
                    recommended_next_steps: geoSignal.already_in_destination
                        ? ["Formalize destination income documentation", "Build local credit history"]
                        : ["Connect Global Accounts", "Establish Destination Identity"],
                    long_term_strengthening_areas: []
                },
                recommendations: {
                    high_impact_actions: parsedResult.recommendation_summary.map((r: string) => ({
                        title: r.split(':')[0] || 'Recommendation',
                        description: r,
                        expected_impact: 15,
                        confidence: parsedResult.overall_confidence,
                        priority: 'high'
                    })),
                    documentation_improvements: [],
                    financial_stability_improvements: [],
                    cross_border_readiness_improvements: [],
                    trust_profile_improvements: [],
                    missing_evidence_recommendations: [],
                    risk_reduction_actions: []
                }
            };

            // Construct uncertainty_analysis explicitly for DashboardData
            const confidencePctForUncertainty = Math.round(Math.max(0, Math.min(1, Number(parsedResult.overall_confidence) || 0.5)) * 100);
            const confidenceImpliedUncertainty = 100 - confidencePctForUncertainty;
            // Scoring uncertainty is deterministic. The model may explain evidence gaps, but
            // cannot independently choose a score-moving uncertainty percentage.
            const agentUncertainty = Math.max(0, Math.min(100, confidenceImpliedUncertainty));
            const confidenceUncertaintyMismatch: string[] = [];
            parsedResult.uncertainty_analysis = {
                overall_uncertainty: agentUncertainty,
                high_uncertainty_areas: [...parsedResult.aggregated_uncertainties, ...confidenceUncertaintyMismatch],
                moderate_uncertainty_areas: [],
                low_uncertainty_areas: [],
                missing_critical_information: parsedResult.aggregated_uncertainties,
                weak_evidence_areas: [],
                strong_evidence_areas: []
            };

            // --- Deterministic identity state before scoring ---
            // Universal rule: an LLM-proposed identity_reliability value never controls
            // a QA fixture. QA identity is a fixed state; production identity remains evidence-driven.
            const identityDocs = extractedDocuments.filter((d: any) => /identity/i.test(String(d.field_label || d.document_type || '')));
            const qaFixtureMode = import.meta.env.VITE_QA_FIXTURE_MODE === 'true';
            const qaSyntheticAccepted = qaFixtureMode && identityDocs.some((d: any) => d.qa_fixture === true);
            const identityUsable = identityDocs.some((d: any) => d.is_usable === true && d.qa_fixture !== true);
            const identityRejected = identityDocs.length > 0 && !identityUsable && !qaSyntheticAccepted;
            const deterministicIdentityScore = deterministicIdentityReliability({
                qaSyntheticAccepted,
                identityUsable,
                identityRejected,
                extractedReliability: idNode.identity_reliability,
            });
            idNode.identity_reliability = deterministicIdentityScore;

            // --- Deterministic Weighted Risk Scoring Engine (Hardened Frontend Module) ---
            const agents = [idNode, finNode, fraudNode, countryNode, behNode];
            const evidence_strength = agents.reduce((acc, agent) => acc + (agent.evidence_strength ?? 50), 0) / agents.length;
            const overall_uncertainty = parsedResult.uncertainty_analysis?.overall_uncertainty ?? 50;

            const scoringResult = calculateTransferScore({
                identity_reliability: deterministicIdentityScore,
                financial_stability: finNode.financial_stability ?? 50,
                migration_resilience: finNode.migration_resilience ?? 50,
                country_transferability: countryNode.country_transferability ?? 50,
                behavioral_consistency: behNode.behavioral_consistency ?? 50,
                fraud_risk: fraudNode.fraud_risk ?? 50,
                contradiction_score: fraudNode.contradiction_score ?? 0,
                overall_confidence: parsedResult.overall_confidence ?? 0.5,
                evidence_strength: evidence_strength,
                overall_uncertainty: overall_uncertainty,
                income_evidence_factor: incomeEvidenceFactor
            });
            parsedResult.identity_verification_status = qaSyntheticAccepted
                ? 'QA FIXTURE — synthetic identity accepted for sandbox pipeline testing only; not identity-verified'
                : identityUsable
                    ? 'Identity evidence submitted — automated checks passed'
                    : identityRejected
                        ? 'Identity evidence rejected — review or replacement required'
                        : 'Identity verification pending';
            parsedResult.identity_document_status = qaSyntheticAccepted ? 'qa_fixture' : identityUsable ? 'passed' : identityRejected ? 'failed' : 'missing';
            parsedResult.is_qa_fixture_assessment = qaSyntheticAccepted;
            if (qaSyntheticAccepted) {
                identityDocs.forEach((d: any) => {
                    if (d.qa_fixture === true) {
                        d.verification_display_status = 'QA Fixture — accepted for pipeline testing; not identity-verified';
                    }
                });
            }

            const economicBase = (
                (Number(finNode.financial_stability ?? 50) * incomeEvidenceFactor * 0.26) +
                (Number(finNode.migration_resilience ?? 50) * incomeEvidenceFactor * 0.14) +
                (Number(countryNode.country_transferability ?? 50) * 0.16) +
                (Number(behNode.behavioral_consistency ?? 50) * 0.10)
            ) / 0.66;
            parsedResult.economic_score = Math.round(Math.max(0, Math.min(100, economicBase)) * 10);
            parsedResult.economic_score_note = 'Financial and cross-border evidence only; identity verification is shown separately and remains required for real-world use.';
            const reviewRequiredCount = extractedDocuments.reduce((sum: number, d: any) => sum + Number(d.income_audit?.review_required_count || 0), 0);
            parsedResult.review_required_count = reviewRequiredCount;
            parsedResult.decision_status = deriveDecisionStatus({
                contradictionScore: Number(fraudNode.contradiction_score ?? 0),
                reviewRequiredCount,
                qaSyntheticAccepted,
                identityUsable,
            });

            // Map results to dossier
            parsedResult.score = scoringResult.finalScore;
            parsedResult.level = scoringResult.level;
            parsedResult.score_breakdown = scoringResult.breakdown;
            parsedResult.confidence = Math.max(0.1, Math.min(1, Number(parsedResult.overall_confidence) || 0.5));
            
            // Safety Mode Check
            let analysisStatus: 'success' | 'limited_confidence' | 'unreliable' = 'success';
            if (evidence_strength < 40 || overall_uncertainty > 65 || (fraudNode.contradiction_score ?? 0) > 60) {
                analysisStatus = 'limited_confidence';
            }
            parsedResult.analysis_status = analysisStatus;

            parsedResult.analysis = {
                identity_reliability: deterministicIdentityScore,
                financial_stability: finNode.financial_stability ?? 50,
                migration_resilience: finNode.migration_resilience ?? 50,
                fraud_risk: fraudNode.fraud_risk ?? 0,
                behavioral_consistency: behNode.behavioral_consistency ?? 50,
                country_transferability: countryNode.country_transferability ?? 50,
                confidence: parsedResult.confidence,
                strengths: parsedResult.major_strengths,
                risks: parsedResult.major_risks,
                missing_information: parsedResult.missing_information,
                evidence: [], 
                evidence_quality: { overall_quality: evidence_strength, missing_critical_evidence: [], weak_evidence_areas: [], strong_evidence_areas: [] },
                fraud_risk_score: fraudNode.fraud_risk ?? 0,
                contradiction_score: fraudNode.contradiction_score ?? 0,
                overall_integrity_risk: ((fraudNode.fraud_risk ?? 0) + (100 - deterministicIdentityScore)) / 2,
                contradictions: fraudNode.contradictions,
                risk_patterns: fraudNode.risk_patterns,
                plausibility_analysis: { overall_plausibility: 100 - overall_uncertainty, weakest_areas: [], strongest_areas: [] },
                country_analysis: {
                    origin_country_risk: 100 - (countryNode.country_transferability ?? 50),
                    destination_country_alignment: countryNode.destination_alignment,
                    cross_border_transferability: countryNode.country_transferability,
                    economic_adaptability: countryNode.economic_adaptability,
                    country_risk_factors: countryNode.risk_factors,
                    country_strengths: countryNode.strengths,
                    country_concerns: []
                }
            };

            // --- Real-time Partner Matching ---
            const currentDB = db.load();
            // FIX: Cast the result of Object.values to Offer[] because db.load() returns 'any'
            // and TypeScript cannot infer the correct type of currentDB.offers.
            const allOffers: Offer[] = Object.values(currentDB.offers) as Offer[];
            const allProviders: Record<string, Provider> = currentDB.providers;
            const userPermissions = currentDB.permissions.filter((p: any) => p.userId === userSession);


            const matchedOffers: PartnerOffer[] = allOffers
                .filter(offer => 
                    offer.status === 'published' &&
                    parsedResult.score >= offer.minTransferScore &&
                    parsedResult.confidence >= offer.minConfidence
                )
                .map(offer => ({
                    ...offer,
                    providerName: allProviders[offer.providerId]?.kybData?.companyName || 'Unknown Provider',
                    hasApplied: userPermissions.some((p: any) => p.offerId === offer.id),
                }));

            const finalResult: DashboardData = { 
                ...parsedResult, 
                partnerOffers: matchedOffers,
                fullName: formData.full_name || 'Verified Subject',
                score: scoringResult.finalScore,
                confidence: parsedResult.confidence,
                rationalWarnings: rationalWarnings,
                uncertaintyAnalysis: parsedResult.uncertainty_analysis,
                dossier_analysis: parsedResult.dossier_analysis,
                analysis: parsedResult,
                // Document extraction data for lender report
                document_extractions: extractedDocuments,
                document_summary: documentSummary,
                // Country intelligence for income contextualisation
                country_analysis: {
                    origin_income_percentile: countryNode.origin_income_percentile ?? null,
                    origin_income_context: countryNode.origin_income_context ?? null,
                    destination_income_equivalent_usd: countryNode.destination_income_equivalent_usd ?? null,
                    income_transfer_narrative: countryNode.income_transfer_narrative ?? null,
                    sector_demand_in_destination: countryNode.sector_demand_in_destination ?? null,
                    currency_risk: countryNode.currency_risk ?? null,
                    country_transferability: countryNode.country_transferability ?? null,
                    raw_data_table: countryNode.raw_data_table ?? null,
                    // Financial culture context (from dedicated Culture agent)
                    financial_culture_context: cultureNode?.financial_culture_context ?? null,
                    cultural_asset_notes: cultureNode?.cultural_asset_notes ?? null,
                    cash_economy_note: cultureNode?.cash_economy_note ?? null,
                    debt_culture_note: cultureNode?.debt_culture_note ?? null,
                    lender_cultural_guidance: cultureNode?.lender_cultural_guidance ?? null,
                },
                // Financial agent verified figures
                financial_verified: {
                    verified_monthly_income_local: finNode.verified_monthly_income_local ?? null,
                    verified_currency: finNode.verified_currency ?? null,
                    verified_income_usd_estimate: finNode.verified_income_usd_estimate ?? null,
                    income_context_in_origin: finNode.income_context_in_origin ?? null,
                    document_coverage_months: finNode.document_coverage_months ?? null,
                    documents_analysed: finNode.documents_analysed ?? null,
                },
                // Context fields
                verification_purpose: formData.verification_purpose || null,
                employment_type: formData.employment_type || null,
                origin_country: formData.country_of_origin || null,
                destination_country: formData.target_jurisdiction || null,
                breakdown: {
                    identityScore: idNode.identity_reliability ?? 50,
                    incomeScore: finNode.financial_stability ?? 50,
                    paymentScore: behNode.behavioral_consistency ?? 50,
                    savingsScore: finNode.financial_stability ?? 50,
                    housingScore: finNode.migration_resilience ?? 50,
                    crossBorderScore: countryNode.country_transferability ?? 50,
                    fraudIntegrityScore: identityUsable ? Math.max(0, 100 - Number(fraudNode.fraud_risk ?? 50)) : null
                }
            };
            (finalResult as any).identity_verification_status = parsedResult.identity_verification_status;
            (finalResult as any).identity_document_status = parsedResult.identity_document_status;
            (finalResult as any).is_qa_fixture_assessment = parsedResult.is_qa_fixture_assessment;
            (finalResult as any).economic_score = parsedResult.economic_score;
            (finalResult as any).economic_score_note = parsedResult.economic_score_note;

            // --- Terminal Home top cards (underwriting pillars + PPP/inflation widgets) ---
            // These were never wired into the agent pipeline, so they always showed $0/0%.
            // Derive them from agent outputs + the curated country economic profile.
            const originIntel: any = originIntelligence || {};
            const colVsUs: number | undefined = originIntel?.cost_of_living_index?.vs_us_average;
            const pppMultiplier = (typeof colVsUs === 'number' && colVsUs > 0) ? (100 / colVsUs) : null;
            const pppEquivUsd =
                countryNode.destination_income_equivalent_usd ??
                originIntel?.cost_of_living_index?.monthly_comfortable_living_usd_ppp ??
                finNode.verified_income_usd_estimate ??
                0;
            const currencyRisk: number =
                (typeof countryNode.currency_risk === 'number' ? countryNode.currency_risk : undefined) ??
                (typeof originIntel?.currency_volatility === 'number' ? originIntel.currency_volatility : undefined) ??
                50;

            finalResult.underwritingPillars = {
                purchasingPowerEquivalence: Math.round(Number(pppEquivUsd) || 0),
                stabilityScore: Math.round(finNode.financial_stability ?? 50),
                inflationDefenseFactor: currencyRisk <= 35 ? 'Positive' : currencyRisk >= 70 ? 'Negative' : 'Neutral',
                transferabilityIndex: Math.round(countryNode.country_transferability ?? 50),
            };
            const countryBenchmarkAvailable = Boolean(originIntel && Object.keys(originIntel).length > 0);
            finalResult.countryBenchmarkAvailable = countryBenchmarkAvailable;
            finalResult.livePPPMultiplier = countryBenchmarkAvailable && pppMultiplier ? pppMultiplier.toFixed(2) : undefined;
            finalResult.pppContextOnly = usdObligationProduct; // #4: gate PPP headline/strength off for USD-obligation products
            finalResult.realTimeInflationOffset = countryBenchmarkAvailable && typeof originIntel?.inflation_risk === 'number'
                ? Number((originIntel.inflation_risk / 10).toFixed(1))
                : undefined;

            // Income reconciliation (declared vs documented) + provisional status for the UI
            finalResult.reconciliation = reconciliation;
            finalResult.is_provisional = isProvisional;
            finalResult.geo = geoSignal;

            // --- Date Check & Financial Benchmarking Logic ---
            const userDeclaredMonthly = Number(formData['local_monthly_income'] || 0);
            const userDeclaredAnnual = Number(formData['personal_income_ppp'] || 0);
            
            let hasOutdatedDoc = false;
            let hasIncomeMismatch = false;

            // v34.6: the Evidence Detail tab renders documentAnalysis, which the synthesize LLM
            // no longer returns — the page was empty. Build it deterministically from the
            // extractions (in USD, since the UI renders "$"): docs-first, no model judgement.
            if (!Array.isArray(finalResult.documentAnalysis) || finalResult.documentAnalysis.length === 0) {
                finalResult.documentAnalysis = extractedDocuments.map((d: any) => {
                    const inflowUsd = d.is_usable ? toUsdByCurrency(Number(d.average_monthly_inflow) || 0, d) : null;
                    const balanceUsd = d.is_usable ? toUsdByCurrency(Number(d.ending_balance) || 0, d) : null;
                    return {
                        documentType: [d.document_type, d.issuing_institution].filter(Boolean).join(' — ') || 'Document',
                        trustLevel: d.qa_fixture ? 0.70 : Math.max(0, Math.min(1, (Number(d.legibility_score) || 0) / (Number(d.legibility_score) > 1 ? 100 : 1))),
                        status: d.qa_fixture ? 'QA Fixture' : d.is_usable ? 'Verified' : (d.rejection_reason ? 'Failed' : 'Unusable'),
                        notes: d.analyst_note || d.rejection_reason || '',
                        statementPeriod: d.period_covered || '',
                        totalInflow: inflowUsd && inflowUsd > 0 ? Math.round(inflowUsd) : undefined,
                        endingBalance: balanceUsd && balanceUsd > 0 ? Math.round(balanceUsd) : undefined,
                        consistencyScore: d.income_audit?.engine === 'deterministic' ? 1 : (d.inflow_unverified ? 0.4 : 0.7), // 0-1 scale — the UI multiplies by 100
                    };
                });
            }

            if (finalResult.documentAnalysis) {
                finalResult.documentAnalysis = finalResult.documentAnalysis.map(doc => {
                    let updatedDoc = { ...doc };
                    
                    // 1. Date Check (180 days)
                    if (doc.statementPeriod) {
                        // Extract dates using a simple regex pattern
                        const dateMatches = doc.statementPeriod.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/gi);
                        if (dateMatches && dateMatches.length > 0) {
                            const lastDateStr = dateMatches[dateMatches.length - 1];
                            const lastDate = new Date(lastDateStr);
                            if (!isNaN(lastDate.getTime())) {
                                const diffDays = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
                                if (diffDays > 180) {
                                    updatedDoc.status = 'Warning: Outdated';
                                    updatedDoc.notes = (updatedDoc.notes ? updatedDoc.notes + ' ' : '') + 'Document is older than 180 days.';
                                    hasOutdatedDoc = true;
                                }
                            }
                        }
                    }

                    // 2. Financial Benchmarking
                    if (updatedDoc.monthlyNetIncome) {
                        const extractedMonthly = updatedDoc.monthlyNetIncome;
                        // Use local monthly income as the primary benchmark
                        const benchmark = userDeclaredMonthly || (userDeclaredAnnual / 12);
                        if (benchmark > 0) {
                            const diff = Math.abs(extractedMonthly - benchmark) / benchmark;
                            if (diff > 0.25) { // 25% threshold
                                hasIncomeMismatch = true;
                                updatedDoc.notes = (updatedDoc.notes ? updatedDoc.notes + ' ' : '') + `Income mismatch detected (Extracted: ${extractedMonthly} vs Declared: ${benchmark.toFixed(0)}).`;
                            }
                        }
                    }

                    return updatedDoc;
                });
            }

            if (hasIncomeMismatch) {
                finalResult.status = 'Flagged: Review Required';
                finalResult.confidence = Math.min(finalResult.confidence, 0.4);
                finalResult.summaryStatement = 'WARNING: Significant discrepancy between declared income and documentary evidence. Manual review triggered. ' + (finalResult.summaryStatement || '');
            } else if (hasOutdatedDoc) {
                finalResult.status = 'Assessment: Stale Data';
            }

            // Scoring Logic Fix (The Truth Engine)
            if (finalResult.score < 500) {
                finalResult.level = "Limited Evidence";
                finalResult.summaryStatement = "Current TransferScore reflects insufficient evidence. Provide additional identity and financial documents to strengthen the assessment.";
            }

            // v34.15: persistent share/report ID — one ID across the PDF header,
            // the lender email, and the public /report/{id} capability URL.
            // Crypto-random (72 bits): the ID itself is the access credential.
            if (!finalResult.shareId) {
                const rnd = Array.from(crypto.getRandomValues(new Uint8Array(9)))
                    .map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
                finalResult.shareId = `PC-${rnd}`;
            }
            // v34.21: stamp the completion time — shown in History and the admin registry.
            if (!finalResult.generatedAt) {
                finalResult.generatedAt = Date.now();
            }

            currentDB.users[userSession!].dashboardResult = finalResult;
            // Keep formData so user can re-run or edit without re-entering everything
            // (only clear currentStep — they've completed the flow)
            delete currentDB.users[userSession!].currentStep;
            await db.saveAsync(currentDB);   // AWAIT — guarantees KV write completes before UI proceeds
            saveToHistory(finalResult);

            setResult(finalResult);

        } catch (error) {
            console.error("Error scoring data:", error);
            
            // REQUIRED FALLBACK STRUCTURE
            const fallback: Partial<DashboardData> = {
                analysis_status: 'unreliable',
                reason: error instanceof Error ? error.message : "Internal Evaluation Engine Failure",
                missing_critical_information: ["Reliable institutional data signature"],
                safe_partial_analysis: {},
                recommendations: [{ text: "Please try submitting your application again with clearer documents.", predictedGain: 0 }],
                score: 300,
                level: "Unreliable / Fail",
                confidence: 0.1,
                summaryStatement: "SYSTEM ALERT: Evaluation quality became unreliable due to technical constraints or insufficient evidence patterns.",
                status: "Safety Fallback Engaged",
                countryContext: { countryName: formData['country_of_origin'] || "Unknown", medianIncomePPP: 0, costOfLivingIndex: 0, inflation: 0, unemployment: 0 },
                reasonCodes: [{ label: "Data Integrity Failure", impact: "Negative" }],
                documentAnalysis: [],
                partnerOffers: [],
                dossier: `### Verification Note\nAnalysis quality for this subject became limited during processing.\n\n**Reason:** ${error instanceof Error ? error.message : 'Unknown technical error'}\n\n**Recommendation:** Please review your uploads for legibility and chronological coherence.`
            };

            // CRITICAL: persist the fallback too — so the user's session isn't lost
            // and they don't get bounced back to an empty form on reload.
            try {
                if (userSession) {
                    const failDB = db.load();
                    if (failDB.users[userSession]) {
                        failDB.users[userSession].dashboardResult = fallback as DashboardData;
                        // Keep formData intact so they can retry without re-entering
                        await db.saveAsync(failDB);
                    }
                }
            } catch (saveErr) {
                console.error("Failed to persist fallback result:", saveErr);
            }

            setResult(fallback as DashboardData);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleShareDossier = (offerId: string, providerId: string) => {
        if (!userSession) return;
        
        const currentDB = db.load();
        
        const permissionExists = currentDB.permissions.find((p: any) => 
            p.userId === userSession && p.offerId === offerId
        );
        
        if (!permissionExists) {
            // v34.13: the user's dossier snapshot travels WITH the permission —
            // providers can no longer read other users' records directly, so
            // sharing means the user writes an explicit copy of what they share.
            const myRecord = currentDB.users[userSession] || {};
            currentDB.permissions.push({
                userId: userSession,
                providerId,
                offerId,
                timestamp: Date.now(),
                snapshot: {
                    score: myRecord.dashboardResult?.score || 0,
                    dossier: myRecord.dashboardResult?.dossier || 'No dossier available.',
                },
            });
            db.save(currentDB);
            
            // Re-fetch the user's result to update the UI
            loginUser(userSession);
        }
    };

    // --- Help Center Handlers ---
    const handleGoToHelp = () => {
        setPreviousView(view);
        setView('helpCenter');
    };

    const handleBackFromHelp = () => {
        if (previousView) {
            setView(previousView);
            setPreviousView(null);
        } else {
            setView('landing');
        }
    };

    const handleGoToPricing = () => {
        setPreviousView(view);
        setView('pricing');
    };

    const handleBackFromPricing = () => {
        if (previousView) {
            setView(previousView);
            setPreviousView(null);
        } else {
            setView('landing');
        }
    };

    const handleSelectPlan = (selectedPlan: 'standard' | 'membership') => {
        if (!userSession) {
            setView('auth');
            return;
        }
        // Keep the paid storefront intact, then reveal the Early Access gift.
        // No payment details are collected during the MVP launch period.
        setPendingPlan(selectedPlan);
    };

    const handleActivateFreePlan = () => {
        if (!userSession || !pendingPlan) return;
        const currentDB = db.load();
        if (currentDB.users[userSession]) {
            currentDB.users[userSession].isPaid = true;
            currentDB.users[userSession].plan = pendingPlan;
            db.save(currentDB);
        }
        setIsPaid(true);
        setPlan(pendingPlan);
        setPendingPlan(null);
        setView(result ? 'dashboard' : 'form');
    };

    const handleContactSupport = async (subject: string, message: string): Promise<boolean> => {
        try {
            // v34.25-safe: applicant support is email-based for the MVP. Do not
            // store private messages in the shared marketplace blob.
            const emailSubject = encodeURIComponent(`[Persona.Credit Support] ${subject}`);
            const emailBody = encodeURIComponent(`${message}\n\nAccount: ${userSession || 'not signed in'}`);
            window.location.href = `mailto:support@persona.credit?subject=${emailSubject}&body=${emailBody}`;
            return true;
        } catch (e) {
            console.error("Failed to open support email:", e);
            return false;
        }
    };


    // v34.17 (FIX-3): never a silent no-op. `fallback` controls where a signed-in
    // user WITHOUT a saved report goes: the banner button sends them to the form
    // (they need an assessment to have a dashboard); the logo keeps landing.
    const handleGoHome = async (fallback: 'form' | 'landing' = 'landing') => {
        if (userSession) {
            const currentDB = await db.loadAsync();
            if (currentDB.users[userSession]?.dashboardResult) {
                setResult(currentDB.users[userSession].dashboardResult);
                setView('dashboard');
            } else {
                setView(fallback);
            }
        } else {
            setView('landing');
        }
    };



    // --- View Rendering Logic ---

    // Show a loading screen while we read session/report from KV.
    // Prevents the "stuck on landing page" flash for logged-in users.
    if (isInitializing) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#F8FAFC', fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', background: '#0F292F',
                        margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{
                            width: '20px', height: '20px', border: '2.5px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white', borderRadius: '50%', animation: 'pcspin 0.7s linear infinite',
                        }} />
                    </div>
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94A3B8' }}>
                        Loading your dossier…
                    </p>
                </div>
                <style>{`@keyframes pcspin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const handleStartNewApplication = async () => {
        if (userSession) {
            const currentDB = await db.loadAsync();
            if (currentDB.users[userSession]?.dashboardResult) {
                setShowStartNewConfirm(true);
                return;
            }
            handleReset();
        } else {
            setAuthMode('user');
            setView('auth');
        }
    };

    if (view === 'landing') {
        return <>
            {/* v34.8: session banner — a deploy/reload now lands here even when signed in,
                so the account identity and the way back into the dossier must be explicit. */}
            {userSession && (
                <div className="w-full bg-brand-dark text-white px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[11px]">
                    <span className="font-bold uppercase tracking-widest opacity-80">Signed in as</span>
                    <span className="font-black tracking-wide">{userSession}{isAdmin ? ' (admin)' : ''}</span>
                    <button onClick={() => handleGoHome('form')} className="px-4 py-1.5 bg-white text-brand-dark rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Continue to Dashboard</button>
                    <button onClick={() => setShowChangePassword(true)} className="px-4 py-1.5 border border-white/40 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Account</button>
                    <button onClick={handleLogout} className="px-4 py-1.5 border border-white/40 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Sign Out</button>
                </div>
            )}
            {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} onDeleted={handleAccountDeleted} />}
            {showStartNewConfirm && (
                <div className="fixed inset-0 z-[300] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-labelledby="start-new-title">
                    <div className="w-full max-w-md bg-white rounded-[2rem] border border-brand-border shadow-2xl p-8">
                        <h2 id="start-new-title" className="font-display text-3xl font-semibold text-brand-dark tracking-tight">Start a new report?</h2>
                        <p className="mt-3 text-sm text-brand-gray leading-relaxed">Your existing reports will remain available in History. Your current saved report will not be deleted.</p>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowStartNewConfirm(false)} className="flex-1 px-5 py-3.5 border border-brand-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-brand-dark hover:bg-slate-50">Cancel</button>
                            <button onClick={() => { setShowStartNewConfirm(false); handleReset(); }} className="flex-1 px-5 py-3.5 bg-brand-blue text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90">Continue</button>
                        </div>
                    </div>
                </div>
            )}
            <LandingPage 
            onStartApplication={handleStartNewApplication} 
            onGoToProvider={() => { setAuthMode('provider'); setView('auth'); }} 
            onGoToHelp={handleGoToHelp}
            onGoToPricing={handleGoToPricing}
            onGoToPartner={() => {
                if (userProfile) {
                    setView('partner');
                } else {
                    setView('partnerLanding');
                }
            }}
        />
        </>;
    }
    
    if (view === 'auth') {
        const isUser = authMode === 'user';
        return <AuthPage 
            mode={authMode}
            title={isUser ? 'Applicant Portal' : 'Service Provider Portal'}
            onLogin={isUser ? handleLogin : handleProviderLogin} 
            onSignUp={isUser ? handleSignUp : handleProviderSignUp} 
            onBack={() => setView('landing')}
        />;
    }

    if (view === 'providerOnboarding' && currentProviderUser) {
        return <ProviderOnboardingPage onSubmit={handleProviderOnboardSubmit} onBack={handleProviderLogout} />;
    }

    if (view === 'providerDashboard' && providerData?.kybData && currentProviderUser) {
        const currentDB = db.load();
        const providerOffers = Object.values(currentDB.offers).filter((o: any) => o.providerId === providerData.id) as Offer[];
        const applicants = getApplicantsForProvider(providerData.id);
        return <ProviderDashboardPage 
            data={providerData.kybData} 
            formData={providerData.formData}
            offers={providerOffers}
            applicants={applicants}
            onOfferAction={handleOfferAction}
            onLogout={handleProviderLogout} 
        />;
    }
    
    if (view === 'helpCenter') {
        return <HelpCenterPage 
            onContactSupport={handleContactSupport}
            onBack={handleBackFromHelp}
            isLoggedIn={!!userSession}
        />
    }

    if (view === 'partnerLanding') {
        return <PartnerLanding 
            onBack={() => setView('landing')}
            onSignUp={() => { setAuthMode('provider'); setView('auth'); }} // v34.17 (FIX-7): partner CTA leads to the Service Provider Portal, not the applicant one
        />
    }

    if (view === 'partner') {
        return <PartnerDashboard 
            profile={userProfile!} 
            onBack={() => setView('dashboard')} 
        />
    }

    if (view === 'pricing') {
        return <>
            <PricingPage 
                onBack={handleBackFromPricing}
                onSelectPlan={handleSelectPlan}
            />
            {pendingPlan && (
                <div className="fixed inset-0 z-[300] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-labelledby="early-access-title">
                    <div className="w-full max-w-lg bg-white rounded-[2.25rem] border border-brand-border shadow-2xl p-9 text-center relative overflow-hidden">
                        <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-brand-blue/20 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-blue text-white flex items-center justify-center text-2xl shadow-lg shadow-brand-blue/25">🎉</div>
                            <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.22em] text-brand-blue">Early Access Surprise</p>
                            <h2 id="early-access-title" className="mt-2 font-display text-4xl font-semibold text-brand-dark tracking-tight">Congratulations!</h2>
                            <p className="mt-4 text-sm text-brand-gray leading-relaxed">You are one of the first Persona.Credit users. For a limited Early Access period, the <strong className="text-brand-dark">{pendingPlan === 'membership' ? 'Global Membership' : 'Standard Dossier'}</strong> is unlocked for you at no cost.</p>
                            <div className="mt-6 p-5 bg-brand-bg rounded-2xl text-left space-y-2 text-sm text-brand-dark">
                                <p>✓ No payment is required today</p>
                                <p>✓ Premium access is activated immediately</p>
                                <p>✓ No card details are collected</p>
                            </div>
                            <button onClick={handleActivateFreePlan} className="mt-7 w-full py-4 bg-brand-blue text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.18em] hover:opacity-90">Activate Free Access</button>
                            <button onClick={() => setPendingPlan(null)} className="mt-3 text-[10px] font-bold uppercase tracking-widest text-brand-gray hover:text-brand-dark">Not now</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    }

    if (view === 'report' && reportToken) {
        if (!reportData) {
            // v34.18: revoked or unknown share link
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-brand-border p-10 text-center">
                        <div className="w-12 h-12 bg-brand-dark rounded-xl flex items-center justify-center text-white mx-auto mb-6">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-black text-brand-dark uppercase tracking-widest mb-3">Report Unavailable</h1>
                        <p className="text-sm text-slate-500 leading-relaxed">This report link is invalid or has been revoked by its owner. Please ask the applicant for a new link.</p>
                    </div>
                </div>
            );
        }
        return <ReportViewerPage data={reportData} token={reportToken} />;
    }

    if (view === 'dashboard') {
        return <>
        <Dashboard 
            userId={userSession!} 
            data={result!} 
            profile={userProfile || undefined} 
            referralCode={referralCode}
            isPaid={isPaid}
            plan={plan}
            onReset={handleReset} 
            onLogout={handleLogout} 
            onGoToPartner={() => setView('partner')}
            onGoToPricing={handleGoToPricing}
            onExitToLanding={() => setView('landing')} // v34.8: actually go to the landing page (session preserved); handleGoHome loops back into the dashboard when a result exists
            onShareDossier={handleShareDossier} 
            onGoToHelp={handleGoToHelp} 
            isAdmin={isAdmin}
            onChangePassword={() => setShowChangePassword(true)}
        />
        {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} onDeleted={handleAccountDeleted} />}
        </>;
    }
    
    if (isLoading || (view === 'form' && result) || (view === 'providerOnboarding' && isLoading)) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <ResultCard 
                  isLoading={isLoading} 
                  result={result} 
                  onContinue={() => setView('dashboard')} 
                  onReset={handleReset} 
                  loadingMessages={view === 'providerOnboarding' ? PROVIDER_LOADING_MESSAGES : PROFESSIONAL_LOADING_MESSAGES}
                />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-start p-4 sm:p-8 font-sans selection:bg-brand-blue/15">
            {/* Header Area */}
            <header className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between mb-12 py-6 border-b border-brand-border">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer" onClick={handleGoHome}>
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-brand-dark tracking-tight leading-none">Persona.Credit</h1>
                        <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mt-1">Global Verification Protocol</p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {userSession && (
                        <span className="hidden sm:inline text-[10px] font-bold text-brand-gray tracking-widest" title="Signed in account">{userSession}{isAdmin ? ' (ADMIN)' : ''}</span>
                    )}
                    <button 
                        onClick={handleLogout}
                        className="text-[10px] font-bold text-brand-gray hover:text-brand-dark uppercase tracking-widest transition-colors"
                    >
                        Sign Out
                    </button>
                    <button 
                        onClick={() => { setPreviousView('form'); setView('helpCenter'); }}
                        className="px-5 py-2 bg-slate-50 text-brand-dark border border-brand-border rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                        Support
                    </button>
                </div>
            </header>

            <main className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                <datalist id="countries-list">
                    {countries.map(country => <option key={country} value={country} />)}
                </datalist>

                {result ? (
                    <div className="flex flex-col items-center">
                        <ResultCard 
                            isLoading={false} 
                            result={result} 
                            onContinue={() => setView('dashboard')} 
                            onReset={handleReset} 
                        />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <ProgressBar currentStep={currentStep} totalSteps={sections.length} />
                        
                        <div className="bg-white transition-all duration-700">
                             {allStepErrors.length > 0 && isFinalStage && (
                                <div className="mb-10 p-6 bg-red-50 border border-red-200 rounded-2xl animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center space-x-4 mb-6">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                        <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest">Incomplete Nodes Detected</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {allStepErrors.map((err, i) => (
                                            <button 
                                                key={`${err.step}-${i}`}
                                                onClick={() => setCurrentStep(err.step)}
                                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100 hover:border-red-300 transition-all text-left"
                                            >
                                                <div>
                                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Step {err.step + 1}</p>
                                                    <p className="text-[11px] font-bold text-red-700 uppercase tracking-tight">{err.fieldLabel}</p>
                                                </div>
                                                <ChevronLeft className="w-3 h-3 text-red-300 rotate-180" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {processedSection && (
                                <Section 
                                    section={processedSection} 
                                    formData={formData} 
                                    errors={errors} 
                                    onChange={handleChange}
                                    isFieldVisible={isFieldVisible}
                                    onFileValidation={handleFileValidation}
                                />
                            )}
                        </div>

                        {missingEvidenceWarnings.length > 0 && (
                            <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 text-amber-700">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Warnings</span>
                                </div>
                                <div className="space-y-1">
                                    {missingEvidenceWarnings.map(warning => (
                                        <p key={warning} className="text-[10px] font-medium text-amber-800 leading-relaxed uppercase tracking-tight italic">
                                            - Optional Evidence Missing: {warning}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between pt-8 border-t border-brand-border">
                            <button 
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className="px-8 py-4 text-[10px] font-bold text-brand-gray uppercase tracking-widest border border-brand-border rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Previous Step
                            </button>
                            
                            <div className="flex items-center space-x-6">
                                <button 
                                    onClick={handleSaveProgress}
                                    className="text-[10px] font-bold text-brand-gray hover:text-brand-dark uppercase tracking-widest transition-colors"
                                >
                                    {saveMessage || 'Save Progress'}
                                </button>

                                {isFinalStage ? (
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={isLoading || allStepErrors.length > 0}
                                        className="px-12 py-4 bg-white text-brand-blue border-2 border-brand-blue/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-brand-blue/5 disabled:opacity-50 active:scale-95 flex items-center space-x-2"
                                    >
                                        {isLoading ? 'Processing...' : 'FINALIZE REPORT'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleNext}
                                        className="px-12 py-4 bg-white text-brand-blue border-2 border-brand-blue/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95"
                                    >
                                        NEXT
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="w-full max-w-5xl text-center py-12 border-t border-brand-border mt-auto">
                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">
                    &copy; 2026 Persona.Credit &bull; Cross-Border Financial Verification
                </p>
            </footer>
        </div>
    );
};

export default App;
