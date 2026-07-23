import React from 'react';
import SmartTooltip from './SmartTooltip';
import { countries } from '../countries';

interface InputFieldProps {
    id: string;
    label: string;
    value: string | number;
    error?: string;
    onChange: (value: string | number) => void;
    type: 'text' | 'date' | 'country' | 'email' | 'phone' | 'number' | 'textarea';
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    tooltip?: string;
    datalistId?: string;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, error, onChange, type, required, min, max, step, tooltip, datalistId, placeholder: propPlaceholder }) => {
    const isDob = id === 'dob';
    const displayType = isDob ? 'text' : (type === 'textarea' ? undefined : type);
    const placeholder = propPlaceholder || (isDob ? "MM/DD/YYYY" : undefined);

    // v34.22 (FIX-2): country selection. The old <input list=datalist> gave a
    // desktop dropdown but on iOS Safari the datalist is silently ignored, forcing
    // users to type the full country name by hand. A native <select> works on BOTH
    // desktop and mobile and emits exactly the same string value, so nothing
    // downstream (validation, engines) changes.
    const isCountry = type === 'country' || (!!datalistId && datalistId === 'countries-list');

    // v34.22 (FIX-1): date-of-birth auto-formatting. Insert the slashes as the user
    // types digits so "01171985" becomes "01/17/1985". We keep the field a plain
    // text input (unchanged) and still emit an MM/DD/YYYY string — the exact format
    // validation and the rest of the pipeline already expect.
    const handleDobChange = (raw: string) => {
        const digits = raw.replace(/\D/g, '').slice(0, 8);
        let out = digits;
        if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        onChange(out);
    };

    const inputClasses = `
        mt-2 block w-full px-5 py-4 bg-white border border-brand-border rounded-xl 
        ${error ? 'border-red-500' : 'border-brand-border'} 
        text-sm font-medium shadow-sm placeholder-brand-gray/30
        focus:outline-none focus:ring-2 
        ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-brand-blue/20 focus:border-brand-blue'}
        transition-all text-brand-dark
    `;
    
    const Component = type === 'textarea' ? 'textarea' : 'input';

    return (
        <div className={`${type === 'textarea' ? 'md:col-span-2' : ''} relative z-50 pointer-events-auto`}>
            <label htmlFor={id} className="flex items-center text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1 cursor-pointer mb-1">
                <span>{label} {required && <span className="text-red-500 font-bold ml-0.5 select-none">*</span>}</span>
                {tooltip && <SmartTooltip content={tooltip} />}
            </label>
            {isCountry ? (
                <select
                    id={id}
                    name={id}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClasses}
                >
                    <option value="">Select a country…</option>
                    {countries.map((country) => <option key={country} value={country}>{country}</option>)}
                </select>
            ) : (
                <Component
                    id={id}
                    name={id}
                    type={displayType}
                    placeholder={placeholder}
                    value={value ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        isDob
                            ? handleDobChange(e.target.value)
                            : onChange(type === 'number' && e.target.value !== '' ? parseFloat(e.target.value) : e.target.value)
                    }
                    inputMode={isDob ? 'numeric' : undefined}
                    className={inputClasses}
                    rows={type === 'textarea' ? 4 : undefined}
                    min={min}
                    max={max}
                    step={step}
                    list={isDob ? undefined : datalistId}
                />
            )}
            {error && <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 italic">! {error}</p>}
        </div>
    );
};

export default InputField;