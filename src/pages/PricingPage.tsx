import React from 'react';
import { Check, Shield, Zap, Globe, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RealmSwitcher from '../components/RealmSwitcher';

interface PricingPageProps {
    onBack: () => void;
    onSelectPlan: (plan: 'standard' | 'membership') => void;
}

const TooltipItem: React.FC<{ feature: string; description: string }> = ({ feature, description }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <li className="relative flex items-center justify-between gap-3 text-sm font-medium group">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-400" />
                </div>
                <span>{feature}</span>
            </div>
            
            <div 
                className="relative flex items-center"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
            >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer transition-all opacity-50 hover:opacity-100" />
                
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-white border border-slate-200 rounded-[4px] z-50 pointer-events-none"
                        >
                            <div className="relative">
                                <p className="text-[11px] font-medium leading-relaxed text-slate-600 normal-case tracking-normal">
                                    {description}
                                </p>
                                <div className="absolute -bottom-5 right-2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45 transform"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </li>
    );
};

const PricingPage: React.FC<PricingPageProps> = ({ onBack, onSelectPlan }) => {
    const membershipFeatures = [
        { name: 'Unlimited Dossier Updates', desc: 'Maintain a living financial record. Update your verified data nodes weekly as your career and assets evolve without additional fees.' },
        { name: 'Active Partner Visibility', desc: 'Opt-in to be discovered by our premium network of international banks, high-end property managers, and luxury relocation agents.' },
        { name: 'Global Portability Network', desc: 'Your dossier is hashed onto our global verification ledger, making it instantly verifiable across 40+ strategic economic zones.' },
        { name: 'Alternative Bureau Monitoring', desc: 'We scan secondary data sources including utility payment history, professional tenure, and social financial signatures.' },
        { name: 'Real-time Credit Signal', desc: 'Deploy a live API-backed trust marker on your profile that lenders can ping 24/7 for instant risk confirmation.' },
        { name: 'Priority Verification Node', desc: 'Skip the standard audit queue. Your documents are routed to dedicated verification specialists for accelerated finalization.' }
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-50">
            <header className="max-w-7xl mx-auto px-6 py-10 flex justify-between items-center">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-950 uppercase tracking-widest transition-all"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back
                </button>
                <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-slate-950" />
                    <span className="text-lg font-black tracking-tighter">Persona.Credit</span>
                </div>
                <div className="w-20"></div> {/* Spacer */}
            </header>

            <main className="max-w-5xl mx-auto px-6 py-20 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6 mb-10"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter leading-[0.9]">
                        VERIFY YOUR <br />
                        <span className="text-slate-300">ECONOMIC IDENTITY</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Secure your cross-border financial integrity with Persona.Credit. Unlock institutional grade underwriting used by global banks and lenders.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                    {/* Option A: Standard */}
                    <motion.div 
                        whileHover={{ y: -8 }}
                        className="p-10 bg-white border border-slate-100 rounded-[3rem] text-left space-y-8 shadow-[0_40px_100px_rgba(15,23,42,0.03)] flex flex-col justify-between"
                    >
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-slate-950" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-950 tracking-tight">Standard Dossier</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-black text-slate-950">$19</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">one time</span>
                                </div>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    'Institutional PDF Report',
                                    '30-day Digital Access',
                                    'Basic AI Document Verification',
                                    'Standard Support'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-emerald-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button 
                            onClick={() => onSelectPlan('standard')}
                            className="w-full py-5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            Purchase Standard Dossier
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </motion.div>

                    {/* Option B: Membership */}
                    <motion.div 
                        whileHover={{ y: -8 }}
                        className="p-10 bg-slate-950 border border-slate-900 rounded-[3rem] text-left space-y-8 flex flex-col justify-between shadow-[0_40px_100px_rgba(15,23,42,0.12)]"
                    >
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="inline-flex px-3 py-1 bg-brand-blue text-white text-[8px] font-black uppercase tracking-widest rounded-full mb-3">RECOMMENDED</div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Global Membership</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-black text-white">$7</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per month</span>
                                </div>
                            </div>
                            <ul className="space-y-4 text-slate-300">
                                {membershipFeatures.map((feature) => (
                                    <TooltipItem 
                                        key={feature.name} 
                                        feature={feature.name} 
                                        description={feature.desc} 
                                    />
                                ))}
                            </ul>
                        </div>
                        <button 
                            onClick={() => onSelectPlan('membership')}
                            className="w-full py-5 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                        >
                            Buy Membership
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </motion.div>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-6 py-20 text-center border-t border-slate-50 flex flex-col items-center gap-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">&copy; 2026 Persona.Credit &bull; Protocol for Financial Integrity</p>
                <RealmSwitcher />
            </footer>
        </div>
    );
};

export default PricingPage;
