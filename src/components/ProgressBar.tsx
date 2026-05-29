import React from 'react';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="mb-10">
            <div className="flex justify-between mb-3 px-1">
                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">Verification Node {currentStep + 1} of {totalSteps}</span>
                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner overflow-hidden">
                <div 
                    className="bg-brand-blue h-full rounded-full transition-all duration-700 ease-in-out" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;