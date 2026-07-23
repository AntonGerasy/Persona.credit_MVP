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
                <div className="w-5 h-5 bg-brand-blue/25 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-brand-blue" />
                </div>
                <span>{feature}</span>
            </div>
            
            <div 
                className="relative flex items-center"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
            >
                <HelpCircle className="w-3.5 h-3.5 text-stone-500 hover:text-white cursor-pointer transition-all opacity-50 hover:opacity-100" />
                
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-white rounded-2xl shadow-xl z-[110] pointer-events-none"
                        >
                            <div className="relative">
                                <p className="text-[11px] font-medium leading-relaxed text-stone-600 normal-case tracking-normal">
                                    {description}
                                </p>
                                <div className="absolute -bottom-5 right-2 w-3 h-3 bg-white rotate-45 transform"></div>
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
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-blue/15 selection:text-brand-dark relative overflow-x-hidden">
      {/* Ambient blooms — purely decorative */}
      <div className="bloom w-[520px] h-[520px] -top-40 -right-32 bg-brand-blue/25"></div>
      <div className="bloom w-[420px] h-[420px] top-[38rem] -left-40 bg-amber-200/40"></div>

      <div className="sticky top-0 z-[100] px-4 sm:px-8 pt-5 pb-2">
        <nav className="max-w-7xl mx-auto w-full glass-panel rounded-[1.75rem] px-5 sm:px-7 py-4 flex justify-between items-center gap-4">
           <div className="flex items-center gap-3 shrink-0">
              <div className="w-11 h-11 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/25">
                  <Shield className="w-5 h-5" />
              </div>
              <div>
                  <h1 className="text-lg font-semibold tracking-tight text-brand-dark leading-none">Persona.Credit</h1>
                  <p className="text-[9px] font-semibold text-brand-gray uppercase tracking-[0.18em] mt-1.5">Verified Financial Identity</p>
              </div>
           </div>
           <div className="flex gap-2 sm:gap-6 items-center overflow-x-auto no-scrollbar">
              <button onClick={onGoToPartner} className="hidden md:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark transition-colors whitespace-nowrap">For Partners</button>
              <button onClick={onGoToPricing} className="hidden md:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark transition-colors whitespace-nowrap">Pricing</button>
              <button onClick={onGoToHelp} className="hidden md:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark transition-colors whitespace-nowrap">Documentation</button>
              <button 
                  onClick={onStartApplication} 
                  className="px-6 py-3 bg-brand-dark text-white rounded-full text-[11px] font-semibold tracking-wide hover:bg-brand-dark/90 transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                  Open My Report
              </button>
           </div>
        </nav>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 flex flex-col items-center justify-center py-16 relative z-10">
        <div className="max-w-5xl w-full text-center space-y-20">
            <div className="space-y-8">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 glass-panel rounded-full">
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-semibold text-brand-gray uppercase tracking-[0.18em] leading-none">Global Financial Verification Standard</span>
                </div>
                <div className="space-y-4">
                    <h1 className="font-display text-6xl md:text-8xl font-light text-brand-dark tracking-[-0.03em] leading-[0.92] text-balance">
                        UNIVERSAL <br /> 
                        <span className="text-brand-blue font-normal">CREDIT IDENTITY</span>
                    </h1>
                </div>
                <p className="text-lg md:text-xl text-brand-gray font-normal max-w-2xl mx-auto leading-relaxed">
                    The professional bridge for cross-border verification. Our platform generates 
                    verified economic dossiers for relocation, banking, and global mobility.
                </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-7">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onStartApplication}
                        className="group bg-brand-blue text-white px-12 py-5 rounded-full text-[12px] font-semibold tracking-[0.12em] uppercase transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-brand-blue/25 flex items-center gap-3"
                    >
                        START MY REPORT
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={onGoToHelp}
                        className="px-10 py-5 glass-panel text-brand-dark rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-white transition-all"
                    >
                        Review Methodology
                    </button>
                </div>
                <p className="text-[10px] font-semibold text-brand-gray/70 uppercase tracking-[0.2em]">
                    Secure AI-Powered Financial Verification Service
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                {[
                    { title: 'Global Portability', desc: 'Carry your verified history across borders without losing momentum.', icon: <ShieldCheck className="w-6 h-6" /> },
                    { title: 'Data Sovereignty', desc: 'Your economic truth, verified by AI, controlled exclusively by you.', icon: <FileCheck className="w-6 h-6" /> },
                    { title: 'Market Benchmarking', desc: 'Instant context for international banks regarding your income and assets.', icon: <Search className="w-6 h-6" /> }
                ].map(item => (
                    <div key={item.title} className="text-left space-y-5 p-8 glass-panel rounded-[1.75rem] soft-lift group">
                        <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
                            {item.icon}
                        </div>
                        <h3 className="text-base font-semibold text-brand-dark tracking-tight">{item.title}</h3>
                        <p className="text-sm text-brand-gray leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="pt-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
                    {[
                        { label: 'Neo-Banking', icon: <Building2 className="w-5 h-5" /> },
                        { label: 'Asset Management', icon: <Briefcase className="w-5 h-5" /> },
                        { label: 'Auto Finance', icon: <Car className="w-5 h-5" /> },
                        { label: 'Bureau Nodes', icon: <Search className="w-5 h-5" /> }
                    ].map(item => (
                        <div key={item.label} className="space-y-2.5 flex flex-col items-center text-brand-dark">
                            {item.icon}
                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em]">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-24 pb-10">
                <div className="text-center space-y-4 mb-14">
                    <h2 className="font-display text-4xl md:text-5xl font-light text-brand-dark tracking-[-0.02em]">Identity Membership</h2>
                    <p className="text-brand-gray">Ongoing verification for the global professional.</p>
                </div>
                
                <div className="max-w-md mx-auto">
                    <div className="p-10 bg-stone-950 text-white rounded-[2.5rem] text-left space-y-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-56 h-56 bg-brand-blue/30 blur-3xl -mr-16 -mt-16"></div>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="inline-flex px-3 py-1 bg-brand-blue text-[8px] font-bold uppercase tracking-[0.18em] rounded-full mb-3">RECOMMENDED</div>
                                <h3 className="font-display text-2xl font-semibold text-white tracking-tight">Global Integrity Membership</h3>
                                <div className="flex items-baseline gap-1.5 mt-2">
                                    <span className="font-display text-5xl font-light text-white">$7</span>
                                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.15em]">per month</span>
                                </div>
                            </div>
                            <ul className="space-y-4 text-stone-300">
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
                            className="w-full mt-8 py-5 bg-white text-stone-950 text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-stone-100 transition-all flex items-center justify-center gap-2 relative z-10"
                        >
                            Claim Your Profile
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-12">
                <div className="bg-stone-900 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-left shadow-2xl relative overflow-hidden">
                    <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-brand-blue/20 blur-3xl"></div>
                    <div className="space-y-6 max-w-xl relative z-10">
                        <h2 className="font-display text-4xl md:text-5xl font-light text-white tracking-[-0.02em] leading-tight">
                            Expand the <br />
                            <span className="text-brand-blue font-normal">Integrity Network.</span>
                        </h2>
                        <p className="text-lg text-stone-300">
                            Are you a relocation expert or lawyer? Partner with Persona.Credit to provide 
                            verified financial dossiers for your clients.
                        </p>
                    </div>
                    <button 
                        onClick={onGoToPartner}
                        className="group bg-brand-blue text-white px-12 py-5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-all hover:bg-brand-blue/90 shadow-xl shadow-brand-blue/25 flex items-center gap-3 whitespace-nowrap relative z-10"
                    >
                        Partner Program
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-20 mt-10 relative z-10">
          <div className="glass-panel rounded-[2rem] p-10 md:p-14">
              <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                  <div className="space-y-5 max-w-lg">
                      <div className="flex items-center gap-3">
                           <div className="w-9 h-9 bg-brand-dark rounded-xl flex items-center justify-center text-white text-[10px] font-bold">DG</div>
                           <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-dark">Persona.Credit Verification Node</span>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed text-brand-gray">
                          Persona.Credit is a professional protocol for financial validation. Powered by TransferScore™ technology, 
                          we generate verified dossiers for cross-border economic identity.
                      </p>
                  </div>
                  <div className="grid grid-cols-2 gap-12 md:gap-20">
                    <div className="space-y-6 text-left">
                        <p className="text-[10px] font-semibold text-brand-dark uppercase tracking-[0.18em]">Network</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={onGoToPartner} className="text-[11px] font-medium text-brand-gray hover:text-brand-blue transition-colors text-left">Partner Program</button>
                            <button onClick={onGoToPartner} className="text-[11px] font-medium text-brand-gray hover:text-brand-blue transition-colors text-left">Referral Node</button>
                        </div>
                    </div>
                    <div className="space-y-6 text-left">
                        <p className="text-[10px] font-semibold text-brand-dark uppercase tracking-[0.18em]">Protocols</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={onGoToHelp} className="text-[11px] font-medium text-brand-gray hover:text-brand-dark transition-colors text-left">Privacy Charter</button>
                            <button onClick={onGoToHelp} className="text-[11px] font-medium text-brand-gray hover:text-brand-dark transition-colors text-left">Internal Standards</button>
                        </div>
                    </div>
                  </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center mt-14 pt-8 border-t border-brand-border gap-6">
                <p className="text-[10px] font-medium tracking-wide text-brand-gray/70">
                    &copy; 2026 Persona.Credit &bull; Registered Financial Verification Protocol &bull; compliance@persona.credit
                </p>
                <RealmSwitcher />
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
