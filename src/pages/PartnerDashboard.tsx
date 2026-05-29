import React, { useState } from 'react';
import { 
    Users, 
    TrendingUp, 
    DollarSign, 
    Copy, 
    ArrowLeft,
    Clock,
    CheckCircle,
    BarChart3,
    Zap
} from 'lucide-react';
import type { UserDossier } from '../types';

interface PartnerDashboardProps {
    profile: UserDossier;
    onBack: () => void;
}

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ profile, onBack }) => {
    const [copied, setCopied] = useState(false);
    
    // Default affiliate data if not present (Demo Mode)
    const affiliate = profile.affiliate || {
        referralCode: profile.uid.split('@')[0] + '_dossier',
        totalSales: 11425,
        unpaidCommission: 1250,
        referralEarnings: [
            { id: '1', timestamp: Date.now() - 3600000, amount: 2, subjectUid: 'user_421@gmail.com' },
            { id: '2', timestamp: Date.now() - 86400000, amount: 2, subjectUid: 'user_289@yahoo.com' },
            { id: '3', timestamp: Date.now() - 172800000, amount: 2, subjectUid: 'user_112@outlook.com' },
        ]
    };

    const referralLink = `${window.location.origin}?ref=${affiliate.referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={onBack}
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-100 shadow-sm group-hover:bg-slate-900 group-hover:text-white transform group-hover:-translate-x-1 transition-all">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Back to Terminal</span>
                        </button>
                        <div className="h-8 w-px bg-slate-100 hidden sm:block mx-2"></div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-600" />
                                <h1 className="text-xl font-black text-slate-950 tracking-tighter uppercase">Institutional Partner Network</h1>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Terminal Dashboard v2.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-slate-900">{profile.personalInfo.fullName}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Partner</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="p-8 bg-emerald-950 rounded-[2.5rem] text-white space-y-1 relative overflow-hidden group shadow-2xl shadow-emerald-100">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-24 h-24 text-emerald-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Gross Impact Volume</p>
                        <h2 className="text-5xl font-black tracking-tighter">${affiliate.totalSales.toLocaleString()}</h2>
                        <div className="pt-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Network Growth Factor: 1.4x</span>
                        </div>
                    </div>

                    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 space-y-1 flex flex-col justify-center shadow-xl shadow-slate-100/50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Accrued Commission</p>
                        <h2 className="text-5xl font-black tracking-tighter text-slate-950">${affiliate.unpaidCommission.toLocaleString()}</h2>
                        <div className="pt-4">
                            <button className="flex items-center gap-2 text-[10px] font-black text-white bg-emerald-600 px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50">
                                <Zap className="w-3 h-3" />
                                Instant Settlement
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-50 space-y-6 flex flex-col justify-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Unique Referral Asset</p>
                            <div className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100">
                                <code className="text-xs font-black text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap flex-grow">
                                    {referralLink}
                                </code>
                                <button 
                                    onClick={handleCopy}
                                    className={`p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-950 hover:text-white'}`}
                                >
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center italic">
                            Share this link to earn $2 per verified TransferScore purchase.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3 className="w-5 h-5 text-slate-900" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Network Transactions</h3>
                            </div>
                            
                            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject UID</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {affiliate.referralEarnings.map((earning) => (
                                            <tr key={earning.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <Users className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-black text-slate-900">{earning.subjectUid}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            {new Date(earning.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-black text-emerald-600 text-sm">
                                                    +${earning.amount.toFixed(2)}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        Settleable
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Partner Sidebar */}
                    <div className="space-y-8">
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-50 space-y-6">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-slate-900" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Revenue Share Model</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                                    <span className="font-bold text-slate-500 uppercase tracking-widest">Item Price</span>
                                    <span className="font-black text-slate-900 underline decoration-emerald-400">$19.00</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                                    <span className="font-bold text-slate-500 uppercase tracking-widest">Platform Fee</span>
                                    <span className="font-black text-slate-900">$17.00</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-500 uppercase tracking-widest">Partner Share</span>
                                    <span className="font-black text-emerald-600">$2.00</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-950 rounded-[2rem] text-white">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 text-center">Referral Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-white/5 rounded-2xl">
                                    <p className="text-2xl font-black tracking-tighter">1,204</p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Total Visits</p>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-2xl">
                                    <p className="text-2xl font-black tracking-tighter">11.8%</p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Conversion</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">&copy; 2026 TransferScore Affiliate Network &bull; Revenue Share Transparency</p>
            </footer>
        </div>
    );
};

export default PartnerDashboard;
