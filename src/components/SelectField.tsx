import React from 'react';
import SmartTooltip from './SmartTooltip';
import type { FieldOption } from '../types';

interface SelectFieldProps {
    id: string;
    label: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    options: FieldOption[];
    required?: boolean;
    tooltip?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, error, onChange, options, required, tooltip }) => {
    return (
        <div className="relative z-50 pointer-events-auto">
            <label htmlFor={id} className="flex items-center text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1 cursor-pointer mb-1">
                <span>{label} {required && <span className="text-red-500 font-bold ml-0.5 select-none">*</span>}</span>
                {tooltip && <SmartTooltip content={tooltip} />}
            </label>
            <div className="relative">
                <select
                    id={id}
                    name={id}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`mt-2 block w-full px-5 py-4 bg-white border border-brand-border rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-brand-dark appearance-none cursor-pointer`}
                >
                    <option value="" disabled className="bg-white text-brand-gray/50">Select an option</option>
                    {options.map(option => (
                        <option key={option.id} value={option.id} className="bg-white text-brand-dark">{option.label}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-brand-gray">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            {error && <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 italic">! {error}</p>}
        </div>
    );
};

export default SelectField;