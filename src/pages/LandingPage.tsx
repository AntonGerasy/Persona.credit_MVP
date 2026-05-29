import React from 'react';
import { 
    Shield, 
    ShieldCheck, 
    FileCheck, 
    ArrowRight, 
    Building2, 
    Briefcase, 
    Car, 
    Search,
    HelpCircle,
    Check,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RealmSwitcher from '../components/RealmSwitcher';

interface LandingPageProps {
  onStartApplication: () => void;
  onGoToProvider: () => void;
  onGoToHelp: () => void;
  onGoToPartner: () => void;
  onGoToPricing: () => void;
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
                            className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-white border border-slate-200 rounded-[4px] z-[110] pointer-events-none"
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

const membershipFeatures = [
    { name: 'Unlimited Dossier Updates', desc: 'Maintain a living financial record. Update your verified data nodes weekly as your career and assets evolve without additional fees.' },
    { name: 'Active Partner Visibility', desc: 'Opt-in to be discovered by our premium network of international banks, high-end property managers, and luxury relocation agents.' },
    { name: 'Global Portability Network', desc: 'Your dossier is hashed onto our global verification ledger, making it instantly verifiable across 40+ strategic economic zones.' },
    { name: 'Alternative Bureau Monitoring', desc: 'We scan secondary data sources including utility payment history, professional tenure, and social financial signatures.' },
    { name: 'Real-time Credit Signal', desc: 'Deploy a live API-backed trust marker on your profile that lenders can ping 24/7 for instant risk confirmation.' },
    { name: 'Priority Verification Node', desc: 'Skip the standard audit queue. Your documents are routed to dedicated verification specialists for accelerated finalization.' }
];

const LandingPage: React.FC<LandingPageProps> = ({ onStartApplication, onGoToHelp, onGoToPartner, onGoToPricing }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-brand-blue/10 selection:text-brand-dark">
      <nav className="max-w-7xl mx-auto w-full px-8 py-10 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-brand-border">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg">
                <Shield className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-brand-dark leading-none">Persona.Credit</h1>
                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mt-1">Verified Financial Identity</p>
            </div>
         </div>
         <div className="flex gap-8 items-center">
            <button onClick={onGoToPartner} className="text-[10px] font-bold text-brand-gray hover:text-brand-dark transition-colors uppercase tracking-widest">For Partners</button>
            <button onClick={onGoToPricing} className="text-[10px] font-bold text-brand-gray hover:text-brand-dark transition-colors uppercase tracking-widest">Pricing</button>
            <button onClick={onGoToHelp} className="text-[10px] font-bold text-brand-gray hover:text-brand-dark transition-colors uppercase tracking-widest">Documentation</button>
            <button 
                onClick={onStartApplication} 
                className="px-6 py-2.5 bg-brand-blue text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-blue/90 shadow-md transition-all active:scale-95"
            >
                Open My Report
            </button>
         </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 flex flex-col items-center justify-center py-20">
        <div className="max-w-4xl text-center space-y-16">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-brand-border rounded-full">
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold text-brand-gray uppercase tracking-widest leading-none">Global Financial Verification Standard</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-bold text-brand-dark tracking-tighter leading-[0.95] text-balance">
                        UNIVERSAL <br /> 
                        <span className="text-brand-blue italic">CREDIT IDENTITY</span>
                    </h1>
                </div>
                <p className="text-xl text-brand-gray font-medium max-w-2xl mx-auto leading-relaxed">
                    The professional bridge for cross-border verification. Our platform generates 
                    verified economic dossiers for relocation, banking, and global mobility.
                </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={onStartApplication}
                        className="group bg-white text-[#004EE5] px-14 py-6 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg border-2 border-[#004EE5]/10 flex items-center gap-3"
                    >
                        START MY REPORT
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={onGoToHelp}
                        className="px-10 py-6 bg-slate-50 text-brand-dark border border-brand-border rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:shadow-sm transition-all"
                    >
                        Review Methodology
                    </button>
                </div>
                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest tracking-[0.2em] italic opacity-60">
                    Secure AI-Powered Financial Verification Service
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
                {[
                    { title: 'Global Portability', desc: 'Carry your verified history across borders without losing momentum.', icon: <ShieldCheck className="w-6 h-6" /> },
                    { title: 'Data Sovereignty', desc: 'Your economic truth, verified by AI, controlled exclusively by you.', icon: <FileCheck className="w-6 h-6" /> },
                    { title: 'Market Benchmarking', desc: 'Instant context for international banks regarding your income and assets.', icon: <Search className="w-6 h-6" /> }
                ].map(item => (
                    <div key={item.title} className="text-left space-y-4 p-8 bg-slate-50 border border-brand-border rounded-2xl hover:bg-white hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-white text-brand-blue rounded-xl border border-brand-border flex items-center justify-center transition-all group-hover:scale-110 shadow-sm">
                            {item.icon}
                        </div>
                        <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest">{item.title}</h3>
                        <p className="text-sm text-brand-gray leading-relaxed font-medium">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="pt-24 border-t border-brand-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-30 grayscale saturate-0">
                    {[
                        { label: 'Neo-Banking', icon: <Building2 className="w-5 h-5" /> },
                        { label: 'Asset Management', icon: <Briefcase className="w-5 h-5" /> },
                        { label: 'Auto Finance', icon: <Car className="w-5 h-5" /> },
                        { label: 'Bureau Nodes', icon: <Search className="w-5 h-5" /> }
                    ].map(item => (
                        <div key={item.label} className="space-y-2 flex flex-col items-center">
                            {item.icon}
                            <p className="text-[9px] font-bold text-brand-dark uppercase tracking-widest">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-24 pb-10">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl font-bold text-brand-dark tracking-tighter">Identity Membership</h2>
                    <p className="text-brand-gray font-medium">Ongoing verification for the global professional.</p>
                </div>
                
                <div className="max-w-md mx-auto">
                    <div className="p-10 bg-slate-950 text-white rounded-[3rem] text-left space-y-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 blur-3xl -mr-10 -mt-10"></div>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="inline-flex px-3 py-1 bg-blue-600 text-[8px] font-black uppercase tracking-widest rounded-full mb-3">RECOMMENDED</div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Global Integrity Membership</h3>
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
                            onClick={onGoToPricing}
                            className="w-full mt-8 py-5 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 relative z-10"
                        >
                            Claim Your Profile
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-20">
                <div className="bg-slate-900 rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-left shadow-2xl">
                    <div className="space-y-6 max-w-xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-tight">
                            Expand the <br />
                            <span className="text-brand-blue italic">Integrity Network.</span>
                        </h2>
                        <p className="text-lg text-slate-300 font-medium">
                            Are you a relocation expert or lawyer? Partner with Persona.Credit to provide 
                            verified financial dossiers for your clients.
                        </p>
                    </div>
                    <button 
                        onClick={onGoToPartner}
                        className="group bg-brand-blue text-white px-12 py-5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 flex items-center gap-3 whitespace-nowrap"
                    >
                        Partner Program
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-8 py-20 border-t border-brand-border mt-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="space-y-5 max-w-lg">
                  <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-brand-dark rounded-lg flex items-center justify-center text-white text-[10px] font-bold">DG</div>
                       <span className="text-xs font-bold uppercase tracking-widest text-brand-dark">Persona.Credit Verification Node</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-loose text-brand-gray/60">
                      Persona.Credit is a professional protocol for financial validation. Powered by TransferScore™ technology, 
                      we generate verified dossiers for cross-border economic identity.
                  </p>
              </div>
              <div className="grid grid-cols-2 gap-20">
                <div className="space-y-6 text-left">
                    <p className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">Network</p>
                    <div className="flex flex-col gap-4">
                        <button onClick={onGoToPartner} className="text-[10px] font-bold uppercase tracking-widest text-brand-gray hover:text-brand-blue transition-colors text-left">Partner Program</button>
                        <button onClick={onGoToPartner} className="text-[10px] font-bold uppercase tracking-widest text-brand-gray hover:text-brand-blue transition-colors text-left">Referral Node</button>
                    </div>
                </div>
                <div className="space-y-6 text-left">
                    <p className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">Protocols</p>
                    <div className="flex flex-col gap-4">
                        <button onClick={onGoToHelp} className="text-[10px] font-bold uppercase tracking-widest text-brand-gray hover:text-brand-dark transition-colors text-left">Privacy Charter</button>
                        <button onClick={onGoToHelp} className="text-[10px] font-bold uppercase tracking-widest text-brand-gray hover:text-brand-dark transition-colors text-left">Internal Standards</button>
                    </div>
                </div>
              </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-20 pt-10 border-t border-brand-border gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray/40">
                &copy; 2026 Persona.Credit &bull; Registered Financial Verification Protocol &bull; compliance@persona.credit
            </p>
            <RealmSwitcher />
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;