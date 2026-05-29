import React from 'react';
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

const PartnerLanding: React.FC<PartnerLandingProps> = ({ onBack, onSignUp }) => {
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
                    onClick={onSignUp}
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
                            Relocation experts, influencers, and consultants: leverage the Persona.Credit infrastructure to provide your audience with verified economic dossiers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left space-y-4 shadow-sm hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-950 tracking-tight">Transparent Revenue</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                High-margin revenue split. Earn <span className="text-emerald-600 font-bold">$2.00</span> for every verified TransferScore report generated through your node.
                            </p>
                        </div>
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left space-y-4 shadow-sm hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-950 tracking-tight">Institutional Trust</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Join a network of certified economic integrity nodes. Not an ad network — a professional utility for financial mobility.
                            </p>
                        </div>
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left space-y-4 shadow-sm hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-950 tracking-tight">Global Impact</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Help bridge the credit gap for international talent. Your referral provides the essential Tier-1 underwriting evidence they need.
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
                                        <span className="text-green-500">The math is simple: <br />
                                        $17 / $2 Revenue Split.</span>
                                    </h2>
                                    <p className="text-slate-400 font-medium text-lg">
                                        The Bureau handles all macro-contextual analysis, Google Search oracles, and dossier generation. You provide the bridge.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-6 items-center">
                                    <button 
                                        onClick={onSignUp}
                                        className="group bg-emerald-600 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 hover:-translate-y-1 shadow-2xl shadow-emerald-900/40 flex items-center gap-3"
                                    >
                                        Apply to Join Network
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <div className="flex items-center gap-3 pl-2">
                                        <div className="flex -space-x-3">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-black">
                                                    {String.fromCharCode(64 + i)}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">140+ active partners</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        <div className="space-y-4">
                            <BarChart3 className="w-8 h-8 text-emerald-600" />
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Real-Time Dashboards</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Every partner receives a live terminal to track conversions, earnings, and payout status with institutional transparency.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <Users className="w-8 h-8 text-emerald-600" />
                            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Immediate Settlements</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                No 30-day waiting periods. Once a dossier is generated and verified, your commission is settleable immediately.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">&copy; 2026 Persona.Credit Institutional Partner Network &bull; Revenue Transparency Code</p>
            </footer>
        </div>
    );
};

export default PartnerLanding;
