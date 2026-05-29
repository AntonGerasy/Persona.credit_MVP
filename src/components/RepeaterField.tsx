import React from 'react';
import { Plus, X } from 'lucide-react';
import type { RepeaterItemSchema, RepeaterItem, Field } from '../types';
import FieldRenderer from './FieldRenderer';

interface RepeaterFieldProps {
    id: string;
    label: string;
    value: RepeaterItem[];
    error?: string;
    onChange: (value: RepeaterItem[]) => void;
    itemSchema: RepeaterItemSchema;
    onFileValidation?: (file: File, field: Field) => Promise<{ isValid: boolean; reason: string }>;
}

const RepeaterField: React.FC<RepeaterFieldProps> = ({ label, value, error, onChange, itemSchema, onFileValidation }) => {
    const items = value || [];

    const handleAddItem = () => {
        const newItem: RepeaterItem = { id: new Date().toISOString() };
        onChange([...items, newItem]);
    };

    const handleRemoveItem = (itemId: string) => {
        onChange(items.filter(item => item.id !== itemId));
    };

    const handleItemChange = (itemId: string, fieldId: string, fieldValue: any) => {
        onChange(items.map(item =>
            item.id === itemId ? { ...item, [fieldId]: fieldValue } : item
        ));
    };

    return (
        <div className="md:col-span-2 mt-6 relative z-50 pointer-events-auto">
            <h3 className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1 mb-4">{label}</h3>
            {error && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 mb-4">{error}</p>}
            <div className="space-y-6">
                {items.map((item, index) => (
                    <div key={item.id} className="p-8 bg-slate-50 border border-brand-border rounded-2xl relative shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-bottom-2">
                        <div className="absolute top-6 left-8 text-[9px] font-bold text-brand-gray/40 uppercase tracking-widest">Entry {index + 1}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mt-6">
                             {itemSchema.fields.map(field => (
                                <FieldRenderer
                                    key={`${item.id}-${field.id}`}
                                    field={field}
                                    value={item[field.id]}
                                    onChange={(val) => handleItemChange(item.id, field.id, val)}
                                    onFileValidation={onFileValidation}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute top-6 right-8 p-1.5 text-brand-gray/30 hover:text-red-500 transition-colors z-[60]"
                            aria-label="Remove item"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={handleAddItem}
                className="mt-6 flex items-center gap-3 px-8 py-3 text-[10px] font-bold text-brand-blue bg-brand-blue/5 rounded-xl hover:bg-brand-blue/10 transition-all border border-brand-blue/20 uppercase tracking-widest cursor-pointer z-50 relative"
            >
                <Plus className="w-3.5 h-3.5" />
                Add New Record Node
            </button>
        </div>
    );
};

export default RepeaterField;