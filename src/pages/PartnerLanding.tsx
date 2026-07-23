import React, { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import { 
    Users, 
    TrendingUp, 
    DollarSign, 
    ShieldCheck, 
    ArrowRight,
    Globe,
    BarChart3,
    ArrowLeft
} from 'lucide-react';

interface PartnerLandingProps {
    onBack: () => void;
    onSignUp: () => void;
}

const PartnerLanding: React.FC<PartnerLandingProps> = ({ onBack, onSignUp: _onSignUp }) => {
    // v34.20: provider onboarding is deferred to the backlog — the page stays as a
    // showcase for SERVICE PROVIDERS (lenders/landlords/banks), and every CTA
    // shows a "not available yet" notice instead of opening registration.
    const [showNotAvailable, setShowNotAvailable] = useState(false);
    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-emerald-50 selection:text-emerald-900">
            {/* Nav */}
            <nav className="max-w-7xl mx-auto w-full px-8 py-10 flex justify-between items-center">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Terminal
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Users className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Institutional Partner Network</h1>
                </div>
                <button 
                    onClick={() => setShowNotAvailable(true)}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:-translate-y-0.5"
                >
                    Join Network
                </button>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-20 pb-40">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Partner Opportunity</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-slate-950 tracking-tighter leading-[0.9]">
                            Helping Global Citizens <br />
                            <span className="text-emerald-600 underline decoration-8 decoration-emerald-100">Monetize Integrity.</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                            For service providers — lenders, landlords, property managers, banks, and fintechs. Receive applicant-consented, document-verified cross-border dossiers and publish offers targeted by TransferScore.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left space-y-4 shadow-sm hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-950 tracking-tight">Verified Applicants</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Every dossier is built from origin-country bank statements with a deterministic, line-by-line income audit — not self-reported numbers.
                            </p>
                        </div>
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left space-y-4 shadow-sm hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-950 tracking-tight">Institutional Trust</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Applicants explicitly choose to share their dossier with you. You see verified income, obligations, and the full analysis — with their consent on record.
                            </p>
                        </div>
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left space-y-4 shadow-sm hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-950 tracking-tight">Targeted Offers</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Publish rental, lending, or banking offers with a minimum TransferScore — and receive only applicants who clear your bar.
                            </p>
                        </div>
                    </div>

                    <div className="pt-20 border-t border-slate-50">
                        <div className="bg-slate-950 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden text-left">
                            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                                <TrendingUp className="w-64 h-64" />
                            </div>
                            <div className="max-w-2xl space-y-10 relative z-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                                        <span className="text-green-500">Underwrite the invisible: <br />
                                        verified cross-border applicants.</span>
                                    </h2>
                                    <p className="text-slate-400 font-medium text-lg">
                                        Persona.Credit handles document verification, deterministic income audits, and dossier generation. You receive decision-ready applicants.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-6 items-center">
                                    <button 
                                        onClick={() => setShowNotAvailable(true)}
                                        className="group bg-emerald-600 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 hover:-translate-y-1 shadow-2xl shadow-emerald-900/40 flex items-center gap-3"
                                    >
                                        Apply to Join Network
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <div className="flex items-center gap-3 pl-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Institutional program in preparation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        <div className="space-y-4">
                            <BarChart3 className="w-8 h-8 text-emerald-600" />
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Planned: Partner Dashboards</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                The partner program will provide a dashboard to review consented applicant dossiers. This is in preparation and not yet available.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <Users className="w-8 h-8 text-emerald-600" />
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Planned: Offer Publishing</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                A future release will let approved partners publish rental, lending, or banking offers targeted by TransferScore. Details will be shared as the program opens.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">&copy; 2026 Persona.Credit &bull; Partner program in preparation</p>
            </footer>
            {showNotAvailable && (
                <ConfirmModal
                    title="Partner Onboarding Opens Soon"
                    message="We are onboarding institutional partners in waves, and self-serve registration is not available yet. If you are a lender, landlord, or bank interested in receiving verified cross-border applicants, contact us and we will reach out as the next wave opens."
                    confirmLabel="Got It"
                    onClose={() => setShowNotAvailable(false)}
                />
            )}
        </div>
    );
};

export default PartnerLanding;
