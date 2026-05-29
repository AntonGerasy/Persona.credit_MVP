import React from 'react';
import SmartTooltip from './SmartTooltip';

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
            <Component
                id={id}
                name={id}
                type={displayType}
                placeholder={placeholder}
                value={value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(type === 'number' && e.target.value !== '' ? parseFloat(e.target.value) : e.target.value)}
                className={inputClasses}
                rows={type === 'textarea' ? 4 : undefined}
                min={min}
                max={max}
                step={step}
                list={datalistId}
            />
            {error && <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 italic">! {error}</p>}
        </div>
    );
};

export default InputField;