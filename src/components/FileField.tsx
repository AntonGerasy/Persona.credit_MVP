import React from 'react';
import SmartTooltip from './SmartTooltip';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import type { FileData, Field } from '../types';

interface FileFieldProps {
    id: string;
    label: string;
    value: FileData[];
    error?: string;
    onChange: (value: FileData[]) => void;
    multiple?: boolean;
    accept?: string[];
    required?: boolean;
    onFileValidation?: (file: File, field: Field) => Promise<{ isValid: boolean; reason:string }>;
    field: Field;
    tooltip?: string;
}

const FileStatusIcon: React.FC<{ status?: 'validating' | 'valid' | 'invalid' | 'error' }> = ({ status }) => {
    switch (status) {
        case 'validating':
            return <Loader2 className="h-4 w-4 text-brand-blue animate-spin" />;
        case 'valid':
            return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        case 'invalid':
        case 'error':
             return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
            return <FileText className="h-4 w-4 text-brand-gray" />;
    }
}


const FileField: React.FC<FileFieldProps> = ({ id, label, value, error, onChange, multiple, accept, required, onFileValidation, field, tooltip }) => {
    const files = value || [];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newRawFiles = Array.from(e.target.files);
        if (newRawFiles.length === 0) return;

        // If no validation function is provided, just add the files without any validation status.
        if (!onFileValidation) {
            const newFiles: FileData[] = newRawFiles.map((file: File) => ({
                id: `${file.name}-${file.lastModified}-${Math.random()}`,
                file,
            }));
            const currentList = multiple ? [...files, ...newFiles] : [newFiles[0]];
            onChange(currentList);
            return;
        }

        // --- Asynchronous validation logic ---
        const newFilesWithStatus: FileData[] = newRawFiles.map((file: File) => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            validationStatus: 'validating',
            validationReason: 'AI is checking this file...'
        }));
        
        let currentList = multiple ? [...files, ...newFilesWithStatus] : [newFilesWithStatus[0]];
        onChange(currentList);

        const validationPromises = newFilesWithStatus.map(fileWithStatus => 
            onFileValidation(fileWithStatus.file, field).then(result => ({...result, id: fileWithStatus.id}))
        );

        for (const promise of validationPromises) {
            try {
                const result = await promise;
                currentList = currentList.map(fileData => {
                    if (fileData.id === result.id) {
                        return {
                            ...fileData,
                            validationStatus: result.isValid ? 'valid' : 'invalid',
                            validationReason: result.reason,
                        };
                    }
                    return fileData;
                });
                onChange(currentList);
            } catch (validationError) {
                 // Handle if the promise itself rejects
                 console.error("A validation promise failed:", validationError);
            }
        }
    };
    
    const removeFile = (fileId: string) => {
        onChange(files.filter(f => f.id !== fileId));
    };
    
    return (
        <div className="md:col-span-2 relative z-50 pointer-events-auto">
            <label className="flex items-center text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-1 cursor-pointer mb-1">
                <span>{label} {required && <span className="text-red-500 font-bold ml-0.5 select-none">*</span>}</span>
                {tooltip && <SmartTooltip content={tooltip} />}
            </label>
            {field.subLabel && (
                <p className="text-[10px] font-medium text-brand-gray/60 mt-1 ml-1 leading-relaxed italic">
                    {field.subLabel}
                </p>
            )}
            {field.forensicScan && (
                <div className="mt-2 flex items-center gap-2 ml-1">
                    <div className="px-2 py-0.5 bg-brand-blue/5 border border-brand-blue/10 rounded-full flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-bold text-brand-blue uppercase tracking-widest">Active Forensic Scanning</span>
                    </div>
                </div>
            )}
            <div className="mt-3 flex justify-center px-8 py-10 border-2 border-brand-border border-dashed rounded-2xl bg-slate-50 hover:bg-slate-100/50 transition-all group shadow-sm">
                <div className="space-y-4 text-center">
                    <Upload className="mx-auto h-8 w-8 text-brand-gray/30 group-hover:text-brand-blue transition-colors" />
                    <div className="space-y-1">
                        <div className="flex text-xs text-brand-dark font-semibold tracking-tight justify-center">
                            <label htmlFor={id} className="relative cursor-pointer text-brand-blue hover:underline underline-offset-4">
                                <span>Upload internal documents</span>
                                <input id={id} name={id} type="file" className="sr-only" multiple={multiple} accept={accept?.map(a => `.${a}`).join(',')} onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">or drag & drop</p>
                        </div>
                        <p className="text-[10px] font-bold text-brand-gray/40 tracking-widest uppercase">
                            {accept?.join(' / ').toUpperCase()} EVIDENCE SUPPORTED
                        </p>
                    </div>
                </div>
            </div>
            {error && <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 italic">! {error}</p>}
             {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map(fileData => {
                        const statusColorMap = {
                            validating: 'bg-white border-brand-border',
                            valid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                            invalid: 'bg-red-50 text-red-800 border-red-200',
                            error: 'bg-red-50 text-red-800 border-red-200'
                        };
                        const statusColor = fileData.validationStatus ? statusColorMap[fileData.validationStatus] : 'bg-white border-brand-border';

                        const reasonColorMap: Record<string, string> = {
                            valid: 'text-emerald-600',
                            invalid: 'text-red-500',
                            error: 'text-red-500',
                        };
                        const reasonColor = fileData.validationStatus ? (reasonColorMap[fileData.validationStatus] || 'text-brand-gray') : 'text-brand-gray';
                        
                        return (
                        <div key={fileData.id} className={`p-4 rounded-xl text-xs font-semibold tracking-tight transition-all border ${statusColor} shadow-sm`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileStatusIcon status={fileData.validationStatus} />
                                    <span className="truncate">{fileData.file.name}</span>
                                </div>
                                <button type="button" onClick={() => removeFile(fileData.id)} className="ml-4 flex-shrink-0 hover:scale-110 transition-transform text-brand-gray/40 hover:text-brand-dark">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                             {fileData.validationReason && (
                                <p className={`mt-2 pl-7 font-medium tracking-tight animate-in slide-in-from-left-1 ${reasonColor} italic text-[10px]`}>{fileData.validationReason}</p>
                            )}
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};

export default FileField;
