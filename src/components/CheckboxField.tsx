import React from 'react';

interface CheckboxFieldProps {
    id: string;
    label: string;
    subLabel?: string;
    value: boolean;
    error?: string;
    onChange: (value: boolean) => void;
    required?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ id, label, subLabel, value, error, onChange, required }) => {
    return (
        <div className="md:col-span-2 relative z-50 pointer-events-auto">
            <div className="flex items-start min-h-[44px]">
                <div className="flex h-6 items-center mt-1">
                    <input
                        id={id}
                        name={id}
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-5 w-5 rounded-lg border-slate-200 text-slate-950 focus:ring-slate-950 transition-all cursor-pointer"
                    />
                </div>
                <div className="ml-4">
                    <label htmlFor={id} className="text-[11px] font-bold text-white uppercase tracking-widest cursor-pointer block">
                        {label} {required && <span className="text-cyber-magenta">*</span>}
                    </label>
                    {subLabel && (
                        <p className="mt-1 text-[9px] font-medium text-white/50 leading-relaxed max-w-xl italic">
                            {subLabel}
                        </p>
                    )}
                </div>
            </div>
            {error && <p className="mt-2 text-[10px] font-bold text-cyber-magenta uppercase tracking-widest ml-1 animate-pulse">! {error}</p>}
        </div>
    );
};

export default CheckboxField;