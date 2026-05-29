import React from 'react';
import { motion } from 'motion/react';
import type { Field } from '../types';
import InputField from './InputField';
import SelectField from './SelectField';
import FileField from './FileField';
import ToggleField from './ToggleField';
import RepeaterField from './RepeaterField';
import CheckboxField from './CheckboxField';

interface FieldRendererProps {
    field: Field;
    value: any;
    error?: string;
    onChange: (id: string, value: any) => void;
    onFileValidation?: (file: File, field: Field) => Promise<{ isValid: boolean; reason: string }>;
}

const FieldRenderer = React.forwardRef<HTMLDivElement, FieldRendererProps>(({ field, value, error, onChange, onFileValidation }, ref) => {
    const commonProps = {
        value,
        error,
        onChange: (val: any) => onChange(field.id, val)
    };
    
    const renderField = () => {
        switch (field.type) {
            case 'text':
            case 'date':
            case 'country':
            case 'email':
            case 'phone':
            case 'number':
                return <InputField {...field} {...commonProps} type={field.type} />;
            case 'textarea':
                 return <InputField {...field} {...commonProps} type="textarea" />;
            case 'select':
                return <SelectField {...field} {...commonProps} options={field.options || []} />;
            case 'file':
                return <FileField {...field} {...commonProps} field={field} onFileValidation={onFileValidation} />;
            case 'toggle':
                return <ToggleField {...field} {...commonProps} />;
            case 'checkbox':
                return <CheckboxField {...field} {...commonProps} />;
            case 'repeater':
                return <RepeaterField {...field} {...commonProps} itemSchema={field.item_schema!} onFileValidation={onFileValidation} />;
            default:
                return null;
        }
    };

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
            {renderField()}
        </motion.div>
    );
});

FieldRenderer.displayName = 'FieldRenderer';

export default FieldRenderer;