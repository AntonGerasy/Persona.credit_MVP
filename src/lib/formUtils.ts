import { FormSchema, FormData } from '../types';

export const getInitialFormData = (schema: FormSchema): FormData => {
    const initialData: FormData = {};
    schema.sections.forEach(section => {
        section.fields.forEach(field => {
            if (field.type === 'toggle') {
                initialData[field.id] = false;
            } else if (field.type === 'file') {
                initialData[field.id] = [];
            } else if (field.type === 'number') {
                initialData[field.id] = '';
            } else {
                initialData[field.id] = '';
            }
        });
    });
    return initialData;
};
