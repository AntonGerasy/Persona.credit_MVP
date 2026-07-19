import React, { useState } from 'react';
import type { ProviderFormData, ValidationErrors, FileData, Field } from '../../types';
import { countries } from '../../countries';
import FileField from '../../components/FileField';

interface ProviderOnboardingPageProps {
  onSubmit: (data: ProviderFormData) => void;
  onBack: () => void;
}

// v34.19 (FIX): these field components MUST live at module scope. When they were
// defined inside the page component, every keystroke re-created their function
// identity, so React remounted the underlying <input> and focus was lost after
// each character. `errors` now arrives via prop instead of closure.
const Input = ({ id, label, errors = {}, tooltip: _tooltip, ...props }: any) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={id}
            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border ${errors[id] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-md text-sm shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 ${errors[id] ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'} dark:text-white`}
            {...props}
        />
        {errors[id] && <p className="mt-1 text-xs text-red-500">{errors[id]}</p>}
    </div>
);

const Select = ({ id, label, errors = {}, children, ...props }: any) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={id}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${errors[id] ? 'border-red-500' : 'border-slate-600'} focus:outline-none focus:ring-1 ${errors[id] ? 'focus:ring-red-500' : 'focus:ring-blue-500'} rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
            {...props}
        >
            {children}
        </select>
         {errors[id] && <p className="mt-1 text-xs text-red-500">{errors[id]}</p>}
    </div>
);

const ProviderOnboardingPage: React.FC<ProviderOnboardingPageProps> = ({ onSubmit, onBack }) => {
    const [formData, setFormData] = useState<ProviderFormData>({
        email: '',
        legalName: '',
        country: '',
        websiteUrl: '',
        category: 'Lender',
        contactName: '',
        minScore: '650', 
        documents: [],
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [consent, setConsent] = useState(false);

    const handleChange = (field: keyof ProviderFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    const validate = () => {
        const newErrors: ValidationErrors = {};
        if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid business email.';
        if (!formData.legalName) newErrors.legalName = 'Company legal name is required.';
        if (!formData.country) newErrors.country = 'Country is required.';
        if (!formData.websiteUrl.startsWith('http')) newErrors.websiteUrl = 'Please enter a valid URL (e.g., https://...).';
        if (!formData.contactName) newErrors.contactName = 'A contact person is required.';
        const minScoreNum = Number(formData.minScore);
        if (isNaN(minScoreNum) || minScoreNum < 300 || minScoreNum > 850) newErrors.minScore = 'Score must be between 300 and 850.';
        if (!consent) newErrors.consent = 'You must agree to the policy.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    // The FileField doesn't need onFileValidation for providers, as we do it all in one go at the end.
    const fileFieldProps: Field = {
        id: "documents",
        label: "Optional Documents (Registration, License, etc.)",
        type: 'file',
        multiple: true,
        accept: ['pdf', 'jpg', 'png'],
    };


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl mx-auto">
                <datalist id="countries-list">
                    {countries.map(country => <option key={country} value={country} />)}
                </datalist>

                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Join the TransferScore Network</h1>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-lg mx-auto">
                        Provide your company details below. Our AI will then perform a Know-Your-Business (KYB) check using public sources and any documents you provide.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input errors={errors} id="email" label="Business Email" type="email" value={formData.email} onChange={(e:any) => handleChange('email', e.target.value)} required />
                        <Input errors={errors} id="legalName" label="Company Legal Name" type="text" value={formData.legalName} onChange={(e:any) => handleChange('legalName', e.target.value)} required />
                        <Input errors={errors} id="country" label="Country of Registration" type="text" list="countries-list" value={formData.country} onChange={(e:any) => handleChange('country', e.target.value)} required />
                        <Input errors={errors} id="websiteUrl" label="Website URL" type="url" placeholder="https://example.com" value={formData.websiteUrl} onChange={(e:any) => handleChange('websiteUrl', e.target.value)} required />
                         <Select errors={errors} id="category" label="Business Category" value={formData.category} onChange={(e:any) => handleChange('category', e.target.value)} required>
                            <option>Lender</option>
                            <option>Real Estate</option>
                            <option>Auto</option>
                            <option>Other</option>
                        </Select>
                        <Input errors={errors} id="contactName" label="Primary Contact Person" type="text" value={formData.contactName} onChange={(e:any) => handleChange('contactName', e.target.value)} required />
                        <Input errors={errors} id="minScore" label="Default Minimum TransferScore" type="number" min="300" max="850" value={formData.minScore} onChange={(e:any) => handleChange('minScore', e.target.value)} required 
                            tooltip="This will be the default minimum score when you create new offers." 
                        />
                    </div>

                    <FileField 
                        {...fileFieldProps}
                        value={formData.documents}
                        onChange={(val) => handleChange('documents', val as FileData[])}
                        field={fileFieldProps}
                    />

                     <div>
                        <div className="flex items-start">
                            <div className="flex h-5 items-center">
                                <input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="consent" className="font-medium text-gray-700 dark:text-gray-300">I permit TransferScore's AI to verify my company using public sources and analyze my uploaded documents.</label>
                            </div>
                        </div>
                         {errors.consent && <p className="mt-1 text-xs text-red-500">{errors.consent}</p>}
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <button type="button" onClick={onBack} className="px-6 py-2 text-base font-medium text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                            Back
                        </button>
                        <button type="submit" className="px-6 py-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Begin AI Verification
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProviderOnboardingPage;
