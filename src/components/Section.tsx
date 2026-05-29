import React from 'react';
import { AnimatePresence } from 'motion/react';
import type { Section as SectionType, FormData, ValidationErrors, Field } from '../types';
import FieldRenderer from './FieldRenderer';

interface SectionProps {
    section: SectionType;
    formData: FormData;
    errors: ValidationErrors;
    onChange: (id: string, value: any) => void;
    isFieldVisible: (field: any, currentFormData: FormData) => boolean;
    onFileValidation: (file: File, field: Field) => Promise<{ isValid: boolean; reason: string }>;
}

const Section: React.FC<SectionProps> = ({ section, formData, errors, onChange, isFieldVisible, onFileValidation }) => {
    const bgClass = section.variant === 'origin' 
        ? 'bg-brand-blue/[0.02] border-brand-blue/20 p-8 rounded-3xl border shadow-sm relative overflow-hidden'
        : section.variant === 'us'
        ? 'bg-slate-50/50 border-brand-border p-8 rounded-3xl border shadow-sm relative overflow-hidden'
        : '';

    return (
        <div className={`transition-all duration-500 ${bgClass} ${section.variant ? 'mb-10' : ''}`}>
            {section.variant && (
                <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-white border-l border-b border-brand-border">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${section.variant === 'origin' ? 'text-brand-blue' : 'text-slate-500'}`}>
                        {section.variant === 'origin' ? 'Origin Foundational' : 'Target Anchorage'}
                    </span>
                </div>
            )}
            <h2 className="text-xs font-bold text-brand-dark uppercase tracking-widest border-b border-brand-border pb-4 mb-4 flex items-center justify-between">
                <span>{section.title}</span>
            </h2>
            {section.description && (
                <div className="mb-8 p-6 bg-slate-100/50 border border-slate-200 rounded-2xl">
                    <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">
                        {section.description}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <AnimatePresence mode="popLayout">
                    {section.fields.map(field => 
                        isFieldVisible(field, formData) && (
                            <FieldRenderer 
                                key={field.id} 
                                field={field} 
                                value={formData[field.id]} 
                                error={errors[field.id]} 
                                onChange={onChange}
                                onFileValidation={onFileValidation}
                            />
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Section;