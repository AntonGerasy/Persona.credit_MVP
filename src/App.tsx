import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Shield, ChevronLeft, AlertCircle } from 'lucide-react';
// GoogleGenAI is now server-side only (Vercel Functions in /api/)
// All AI calls go through fetch('/api/...') — API key never in browser bundle
import { Type } from '@google/genai';
import bcrypt from 'bcryptjs';
import { formSchema, PROFESSIONAL_LOADING_MESSAGES, PROVIDER_LOADING_MESSAGES } from './constants';
import { calculateTransferScore } from './scoreEngine';
import { db } from './lib/storage';
import { getInitialFormData } from './lib/formUtils';
import { ExtractedDocument } from './lib/agents/documentExtractor';
// Agent schemas and prompts live server-side in api/run-agent.ts
// synthesis prompt/schema no longer imported — logic moved to api/synthesize.ts and inline agent aggregation
import { countries } from './countries';
import countryIntelligence from './countryRiskProfiles.json';
import { saveToHistory } from './lib/historyUtils';
import type { FormSchema, Section as SectionType, FormData, FileData, RepeaterData, ValidationErrors, DashboardData, RepeaterItem, ProviderFormData, ProviderDashboardData, Field, Offer, Provider, ProviderUser, PartnerOffer, Applicant, SupportTicket, UserDossier } from './types';
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

    const [authMode, setAuthMode] = useState<'user' | 'provider'>('user');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [reportToken, setReportToken] = useState<string | null>(null);
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
        // Load from KV first (cross-device), falls back to localStorage automatically
        const currentDB = await db.loadAsync();

        // Check for report route
        const path = window.location.pathname;
        if (path.startsWith('/report/')) {
            const token = path.replace('/report/', '');
            if (token) {
                setReportToken(token);
                // Find report data in mock DB
                let foundData: DashboardData | null = null;
                Object.values(currentDB.users).forEach((user: any) => {
                    if (user.dashboardResult && user.dashboardResult.shareId === token) {
                        foundData = user.dashboardResult;
                    }
                });
                
                // Demo fallback if no token found in mock db
                if (!foundData) {
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

        if (currentDB.currentUser) {
            await loginUser(currentDB.currentUser);
            const userData = currentDB.users[currentDB.currentUser];
            setIsPaid(true); // MVP: all features open
            setPlan(userData?.plan || null);
        } else if (currentDB.currentProvider) {
            loginProvider(currentDB.currentProvider);
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

    const loginUser = async (email: string) => {
        const currentDB = await db.loadAsync();
        const userData = currentDB.users[email];
        setUserSession(email);
        setIsPaid(true); // MVP: all features open
        setPlan(userData?.plan || null);
        
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
            setView('dashboard');
        } else {
            setFormData(userData?.formData || getInitialFormData(formSchema));
            setCurrentStep(userData?.currentStep || 0);
            setResult(null);
            setUserProfile(null);
            setView('form');
        }
    }
    
    const loginProvider = (email: string) => {
        const currentDB = db.load();
        const providerUser = currentDB.providerUsers[email];
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

    const handleFileValidation = useCallback(async (file: File, field: Field): Promise<{ isValid: boolean; reason: string }> => {
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

    const handleReset = () => {
        if (userSession) {
            const currentDB = db.load();
            delete currentDB.users[userSession].formData;
            delete currentDB.users[userSession].currentStep;
            delete currentDB.users[userSession].dashboardResult;
            db.save(currentDB);
        }
        setFormData(getInitialFormData(formSchema));
        setCurrentStep(0);
        setErrors({});
        setResult(null);
        setProviderData(null);
        setView('form');
    };
    
    // --- Auth Handlers ---
    const handleSignUp = async (email: string, pass: string): Promise<{ success: boolean, message: string }> => {
        const currentDB = await db.loadAsync();
        if (currentDB.users[email]) {
            return { success: false, message: "An account with this email already exists." };
        }
        const hashedPassword = bcrypt.hashSync(pass, 10);
        currentDB.users[email] = { password: hashedPassword }; 
        currentDB.currentUser = email;
        await db.saveAsync(currentDB);
        await loginUser(email);
        return { success: true, message: "" };
    };

    const handleLogin = async (email: string, pass: string): Promise<{ success: boolean, message: string }> => {
        // --- Admin Authentication Flow (MVP) ---
        if (email === 'kapucinov@gmail.com' && pass === 'FuckFico666##') {
            const currentDB = await db.loadAsync();
            currentDB.currentUser = email;
            await db.saveAsync(currentDB);
            setIsAdmin(true);
            await loginUser(email);
            return { success: true, message: "" };
        }

        const currentDB = await db.loadAsync();
        const user = currentDB.users[email];
        if (!user || !bcrypt.compareSync(pass, user.password)) {
            return { success: false, message: "Invalid email or password." };
        }
        currentDB.currentUser = email;
        await db.saveAsync(currentDB);
        await loginUser(email);
        return { success: true, message: "" };
    };

    const handleLogout = async () => {
        const currentDB = await db.loadAsync();
        currentDB.currentUser = null;
        await db.saveAsync(currentDB);
        setUserSession(null);
        setUserProfile(null);
        setFormData(getInitialFormData(formSchema));
        setCurrentStep(0);
        setResult(null);
        setIsAdmin(false);
        setView('landing');
    };
     // --- Provider Auth Handlers ---
    const handleProviderSignUp = (email: string, pass: string): { success: boolean, message: string } => {
        const currentDB = db.load();
        if (currentDB.providerUsers[email]) {
            return { success: false, message: "A provider account with this email already exists." };
        }
        const providerId = `prov_${new Date().getTime()}`;
        const hashedPassword = bcrypt.hashSync(pass, 10);
        currentDB.providerUsers[email] = { email, password: hashedPassword, providerId };
        currentDB.providers[providerId] = { id: providerId, formData: null, kybData: null };
        currentDB.currentProvider = email;
        db.save(currentDB);
        loginProvider(email);
        return { success: true, message: "" };
    };

    const handleProviderLogin = (email: string, pass: string): { success: boolean, message: string } => {
        const currentDB = db.load();
        const providerUser = currentDB.providerUsers[email];
        if (!providerUser || !bcrypt.compareSync(pass, providerUser.password)) {
            return { success: false, message: "Invalid provider email or password." };
        }
        currentDB.currentProvider = email;
        db.save(currentDB);
        loginProvider(email);
        return { success: true, message: "" };
    };
    
    const handleProviderLogout = () => {
        const currentDB = db.load();
        currentDB.currentProvider = null;
        db.save(currentDB);
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
    
    const handleOfferAction = (action: 'create' | 'update' | 'delete', offer: Offer) => {
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
        db.save(currentDB);
        loginProvider(currentProviderUser.email);
    };

    const getApplicantsForProvider = (providerId: string): Applicant[] => {
        const currentDB = db.load();
        return currentDB.permissions
            .filter((p: any) => p.providerId === providerId)
            .map((p: any) => {
                const user = currentDB.users[p.userId];
                const offer = currentDB.offers[p.offerId];
                return {
                    id: p.userId,
                    offerTitle: offer?.title || 'N/A',
                    dossier: user?.dashboardResult?.dossier || 'No dossier available.',
                    score: user?.dashboardResult?.score || 0,
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
            const monthlyIncome = Number(formData['local_monthly_income']) || 1;
            const annIncomeUSD = Number(formData['ann_income_usd']) || 0;
            const originDebts = Number(formData['debts_total_origin']) || 0;
            const officialShare = Number(formData['official_income_share']) || 1;
            const tenure = Number(formData['experience_years']) || 0;
            const liquidReserves = Number(formData['liquid_reserves']) || 0;

            const localDTI = originDebts / (monthlyIncome || 1);
            const reserveMonths = liquidReserves / (annIncomeUSD / 12 || 1);
            
            // Formulaic Adjustments
            const rationalWarnings: string[] = [];

            if (officialShare < 0.5) {
                rationalWarnings.push("Low Verifiable Income Ratio detected. Risk adjusted for informal economy exposure.");
            }
            if (tenure < 2) {
                rationalWarnings.push("Limited professional tenure in current sector.");
            }
            if (localDTI > 0.45) {
                rationalWarnings.push("High Debt-to-Income ratio detected in origin jurisdiction.");
            }
            if (reserveMonths < 3) {
                rationalWarnings.push("Limited liquid liquidity buffer for cross-border transition.");
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

                const allDocumentEntries: { key: string; label: string; files: File[] }[] = [
                    { key: 'bank_statements_origin', label: 'Origin Country Bank Statement', files: (formData['bank_statements_origin'] as File[]) || [] },
                    { key: 'bank_statements_us',     label: 'Destination Country Bank Statement', files: (formData['bank_statements_us'] as File[]) || [] },
                    { key: 'asset_evidence',         label: 'Asset / Property Document', files: (formData['asset_evidence'] as File[]) || [] },
                ];

                for (const entry of allDocumentEntries) {
                    if (!entry.files || entry.files.length === 0) continue;

                    for (const file of entry.files) {
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
            const callAgent = async (agentName: string, context: any): Promise<any> => {
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
            const verifiedMonthlyInflow = extractedDocuments.length > 0
                ? extractedDocuments
                    .filter(d => d.is_usable && d.average_monthly_inflow > 0)
                    .reduce((sum: number, d: any) => sum + d.average_monthly_inflow, 0) /
                    Math.max(1, extractedDocuments.filter((d: any) => d.is_usable && d.average_monthly_inflow > 0).length)
                : null;

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

            const fraudContext = {
                document_extractions: documentSummary,
                self_declared: {
                    declared_income_usd: formData.ann_income_usd,
                    declared_monthly_local: formData.local_monthly_income,
                    declared_currency: formData.local_currency,
                    employer: formData.employer_name,
                    name: formData.full_name,
                    origin: countryOfOrigin,
                },
            };

            const countryContext = {
                origin_country: countryOfOrigin,
                destination_country: destCountry,
                origin_intelligence: originIntelligence,
                destination_intelligence: destIntelligence,
                applicant_financials: {
                    verified_monthly_inflow: verifiedMonthlyInflow,
                    verified_currency: extractedDocuments[0]?.currency_code || null,
                    declared_income_usd: formData.ann_income_usd,
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
                declared_income: formData.local_monthly_income,
                declared_currency: formData.local_currency,
                has_documents: documentSummary.usable_documents > 0,
                doc_count: documentSummary.usable_documents,
            };

            const cultureContext = {
                origin_country: countryOfOrigin,
                destination_country: destCountry,
                origin_intelligence: originIntelligence,
                applicant_financials: {
                    declared_income_usd: formData.ann_income_usd,
                    liquid_reserves: formData.liquid_reserves,
                    debts_total_origin: formData.debts_total_origin,
                    official_income_share: formData.official_income_share,
                    job_sector: formData.job_sector,
                    has_documents: documentSummary.usable_documents > 0,
                },
            };

            // ── PARALLEL agent execution — all 6 fire simultaneously ────
            const [idNode, finNode, fraudNode, countryNode, behNode, cultureNode] = await Promise.all([
                callAgent('Identity',  idContext),
                callAgent('Financial', finContext),
                callAgent('Fraud',     fraudContext),
                callAgent('Country',   countryContext),
                callAgent('Behavioral',behContext),
                callAgent('Culture',   cultureContext),
            ]);

            // FINAL SYNTHESIS — Structured Aggregation Engine
            // synthesis is now called inline above — no separate function needed


            // Build parsedResult directly from agent outputs — no longer dependent on synthesis succeeding
            // Synthesis adds summary_statement and dossier_markdown only — everything else comes from agents
            const buildResultFromAgents = () => ({
                financial_identity_profile: {
                    profile_type: finNode.income_reliability > 65 ? 'Stable Income Profile' : 'Variable Income Profile',
                    overall_integrity_level: idNode.identity_reliability > 65 ? 'Verified' : 'Partially Verified',
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
                    uncertainty_level: 50,
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
                strengths: parsedResult.aggregated_strengths.map((s: string) => ({ title: s, description: "Verified analytic strength.", confidence: parsedResult.overall_confidence })),
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
                    recommended_next_steps: ["Connect Global Accounts", "Establish Destination Identity"],
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
            parsedResult.uncertainty_analysis = {
                overall_uncertainty: parsedResult.analysis_integrity.uncertainty_level,
                high_uncertainty_areas: parsedResult.aggregated_uncertainties,
                moderate_uncertainty_areas: [],
                low_uncertainty_areas: [],
                missing_critical_information: parsedResult.aggregated_uncertainties,
                weak_evidence_areas: [],
                strong_evidence_areas: []
            };

            // --- Deterministic Weighted Risk Scoring Engine (Hardened Frontend Module) ---
            const agents = [idNode, finNode, fraudNode, countryNode, behNode];
            const evidence_strength = agents.reduce((acc, agent) => acc + (agent.evidence_strength ?? 50), 0) / agents.length;
            const overall_uncertainty = parsedResult.uncertainty_analysis?.overall_uncertainty ?? 50;

            const scoringResult = calculateTransferScore({
                identity_reliability: idNode.identity_reliability ?? 50,
                financial_stability: finNode.financial_stability ?? 50,
                migration_resilience: finNode.migration_resilience ?? 50,
                country_transferability: countryNode.country_transferability ?? 50,
                behavioral_consistency: behNode.behavioral_consistency ?? 50,
                fraud_risk: fraudNode.fraud_risk ?? 0,
                contradiction_score: fraudNode.contradiction_score ?? 0,
                overall_confidence: parsedResult.overall_confidence ?? 0.5,
                evidence_strength: evidence_strength,
                overall_uncertainty: overall_uncertainty
            });

            // Map results to dossier
            parsedResult.score = scoringResult.finalScore;
            parsedResult.level = scoringResult.level;
            parsedResult.score_breakdown = scoringResult.breakdown;
            parsedResult.confidence = Math.max(0.1, (parsedResult.overall_confidence * 0.6) + ((evidence_strength / 100) * 0.4));
            
            // Safety Mode Check
            let analysisStatus: 'success' | 'limited_confidence' | 'unreliable' = 'success';
            if (evidence_strength < 40 || overall_uncertainty > 65 || (fraudNode.contradiction_score ?? 0) > 60) {
                analysisStatus = 'limited_confidence';
            }
            parsedResult.analysis_status = analysisStatus;

            parsedResult.analysis = {
                identity_reliability: idNode.identity_reliability ?? 50,
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
                overall_integrity_risk: ((fraudNode.fraud_risk ?? 0) + (100 - (idNode.identity_reliability ?? 50))) / 2,
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
                    crossBorderScore: countryNode.country_transferability ?? 50
                }
            };

            // --- Date Check & Financial Benchmarking Logic ---
            const userDeclaredMonthly = Number(formData['local_monthly_income'] || 0);
            const userDeclaredAnnual = Number(formData['personal_income_ppp'] || 0);
            
            let hasOutdatedDoc = false;
            let hasIncomeMismatch = false;

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
                finalResult.level = "Subprime / Incomplete";
                finalResult.summaryStatement = "Current score reflects insufficient evidence. To achieve Prime status, please provide professional contracts or utility history.";
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
            currentDB.permissions.push({ userId: userSession, providerId, offerId, timestamp: Date.now() });
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

        const currentDB = db.load();
        // BETA ACCESS OVERRIDE: Everything is free
        currentDB.users[userSession].isPaid = true;
        currentDB.users[userSession].plan = selectedPlan;
        db.save(currentDB);

        setIsPaid(true);
        setPlan(selectedPlan);
        
        // Show success notification or just go to dashboard
        setView('dashboard');
    };

    const handleContactSupport = async (subject: string, message: string): Promise<boolean> => {
        try {
            const currentDB = db.load();
// FIX: Replace incorrect backslash with backtick for template literal
            const ticketId = `ticket_${Date.now()}`;
            const newTicket: SupportTicket = {
                id: ticketId,
                userId: userSession || 'anonymous',
                subject,
                message,
                timestamp: Date.now(),
                status: 'open'
            };
            currentDB.support_tickets[ticketId] = newTicket;
            db.save(currentDB);
            return true;
        } catch (e) {
            console.error("Failed to save support ticket:", e);
            return false;
        }
    };


    const handleGoHome = async () => {
        if (userSession) {
            const currentDB = await db.loadAsync();
            if (currentDB.users[userSession]?.dashboardResult) {
                setResult(currentDB.users[userSession].dashboardResult);
                setView('dashboard');
            } else {
                setView('landing');
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
                setResult(currentDB.users[userSession].dashboardResult);
                setView('dashboard');
                return;
            }
            handleReset();
        } else {
            setAuthMode('user');
            setView('auth');
        }
    };

    if (view === 'landing') {
        return <LandingPage 
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
        />;
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
            onSignUp={() => { setAuthMode('user'); setView('auth'); }}
        />
    }

    if (view === 'partner') {
        return <PartnerDashboard 
            profile={userProfile!} 
            onBack={() => setView('dashboard')} 
        />
    }

    if (view === 'pricing') {
        return <PricingPage 
            onBack={handleBackFromPricing}
            onSelectPlan={handleSelectPlan}
        />
    }

    if (view === 'report' && reportData && reportToken) {
        return <ReportViewerPage data={reportData} token={reportToken} />;
    }

    if (view === 'dashboard') {
        return <Dashboard 
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
            onExitToLanding={handleGoHome}
            onShareDossier={handleShareDossier} 
            onGoToHelp={handleGoToHelp} 
            isAdmin={isAdmin}
        />;
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
        <div className="min-h-screen bg-white flex flex-col items-center justify-start p-4 sm:p-8 font-sans selection:bg-brand-blue/10">
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
