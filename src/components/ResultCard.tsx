import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PROFESSIONAL_LOADING_MESSAGES } from '../constants';
import type { DashboardData } from '../types';

interface ResultCardProps {
    isLoading: boolean;
    result: DashboardData | null;
    onContinue: () => void;
    onReset: () => void;
    loadingMessages?: string[];
}

const ResultCard: React.FC<ResultCardProps> = ({ isLoading, result, onContinue, onReset, loadingMessages = PROFESSIONAL_LOADING_MESSAGES }) => {
    const [index, setIndex] = useState(0);
    const intervalRef = useRef<number | null>(null);

     useEffect(() => {
        if (isLoading) {
            setIndex(0);
            intervalRef.current = window.setInterval(() => {
                setIndex((prev) => (prev + 1) % loadingMessages.length);
            }, 2800);
        } else {
             if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
             }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLoading, loadingMessages.length]);

    const progress = ((index + 1) / loadingMessages.length) * 100;

    return (
        <div className="w-full max-w-4xl bg-white border border-brand-border rounded-3xl shadow-2xl p-12 text-center transition-all duration-500 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue/5" />
            
            <AnimatePresence mode="wait">
                {isLoading ? (
                     <motion.div 
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-12 relative z-10"
                     >
                        <div className="space-y-3">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight uppercase">Underwriting Analysis</h2>
                            <p className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.2em]">Institutional Verification Node</p>
                        </div>

                        <div className="flex justify-center items-center py-4">
                            <div className="relative">
                                <motion.div 
                                    className="h-20 w-20 border-[2px] border-brand-blue/10 border-t-brand-blue rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Search className="w-6 h-6 text-brand-blue/40" />
                                </div>
                            </div>
                        </div>

                        <div className="max-w-xs mx-auto space-y-6">
                            <div className="h-6 overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.p 
                                        key={loadingMessages[index]}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="text-[11px] font-bold text-brand-blue uppercase tracking-widest italic"
                                    >
                                        {loadingMessages[index]}
                                    </motion.p>
                                </AnimatePresence>
                            </div>

                            {/* Progress Tracking */}
                            <div className="space-y-2">
                                <div className="w-full bg-slate-100 h-[2px] rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-brand-blue"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[8px] font-bold text-brand-gray uppercase tracking-widest">
                                    <span>Analysis Engine</span>
                                    <span>{Math.round(progress)}% Complete</span>
                                </div>
                            </div>
                        </div>
                     </motion.div>
                ) : result ? (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-10 relative z-10"
                    >
                        <div className="space-y-3">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-brand-blue/5 rounded-2xl flex items-center justify-center text-brand-blue">
                                    <Search className="w-8 h-8" />
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight uppercase">Analysis Complete</h2>
                            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em]">Institutional Dossier Ready</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                            <button onClick={onReset} className="px-10 py-5 text-[10px] font-bold text-brand-gray uppercase tracking-widest hover:text-brand-dark transition-all border border-brand-border rounded-xl">
                                RESTART PROTOCOL
                            </button>
                            <button onClick={onContinue} className="px-14 py-5 bg-brand-blue text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-brand-blue/90 shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95">
                                ACCESS DASHBOARD
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default ResultCard;
