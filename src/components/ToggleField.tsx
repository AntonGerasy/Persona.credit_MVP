import React from 'react';

interface ToggleFieldProps {
    id: string;
    label: string;
    value: boolean;
    error?: string;
    onChange: (value: boolean) => void;
    required?: boolean;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ id, label, value, error, onChange, required }) => {
    const isChecked = value === true;

    return (
        <div className="max-w-full overflow-hidden relative z-50 pointer-events-auto group">
            <label 
                htmlFor={id} 
                className="relative flex flex-col cursor-pointer pointer-events-auto"
            >
                {/* 1. The Invisible Input: Layers on top of everything for 100% hit area */}
                <input 
                    type="checkbox"
                    id={id}
                    checked={isChecked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="opacity-0 absolute inset-0 cursor-pointer z-[100] w-full h-full"
                    required={required}
                />

                {/* 2. Visual Label */}
                <span className="block text-[10px] font-black text-white uppercase tracking-apple-label ml-2 mb-3 break-words group-hover:text-cyber-teal transition-colors">
                    {label} {required && <span className="text-cyber-magenta">*</span>}
                </span>

                {/* 3. Decorative Switch */}
                <div 
                    className="flex items-center min-h-[56px] relative z-[50] pointer-events-none"
                >
                    <div
                        className={`${isChecked ? 'bg-cyber-teal border-cyber-teal shadow-[0_0_20px_rgba(20,160,152,0.4)]' : 'bg-white/5 border-white/10'} 
                            relative inline-flex h-10 w-16 flex-shrink-0 rounded-full border-2 
                            transition-all duration-300 ease-in-out overflow-hidden`}
                    >
                        <span
                            className={`${isChecked ? 'translate-x-[26px] bg-white' : 'translate-x-0 bg-cyber-silver/40'} 
                                inline-block h-8 w-8 transform rounded-full shadow-2xl
                                transition duration-300 ease-in-out mt-[2px] ml-[2px]`}
                        />
                    </div>
                </div>
            </label>
            {error && <p className="mt-2 text-[10px] font-black text-cyber-magenta uppercase tracking-apple-label ml-2 italic animate-pulse">! {error}</p>}
        </div>
    );
};

export default ToggleField;