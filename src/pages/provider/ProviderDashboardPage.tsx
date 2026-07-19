import React, { useState } from 'react';
import type { Offer, Applicant, ProviderDashboardPageProps } from '../../types';
import ConfirmModal from '../../components/ConfirmModal';

// --- Internal components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
        {children}
    </div>
);
const CardHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
        {children}
    </div>
);
const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <div className={`p-4 ${className}`}>{children}</div>;

const TierBadge: React.FC<{ tier: 'A' | 'B' | 'C' }> = ({ tier }) => {
    const tierMap = {
        A: { label: 'Tier A: Verified', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        B: { label: 'Tier B: Verified - Limited', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
        C: { label: 'Tier C: Provisional', color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' },
    };
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${tierMap[tier].color}`}>{tierMap[tier].label}</span>;
}

const TrustMeter: React.FC<{ label: string; score: number }> = ({ label, score }) => {
    const getDotColor = (s: number) => {
        if (s > 0.8) return 'bg-green-500';
        if (s > 0.6) return 'bg-amber-500';
        return 'bg-red-500';
    };
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono">{(score * 100).toFixed(0)}%</span>
                <div className={`w-3 h-3 rounded-full ${getDotColor(score)}`}></div>
            </div>
        </div>
    );
};

const OfferModal: React.FC<{
    offer: Offer | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (offer: Offer) => void;
    defaultMinScore: number;
}> = ({ offer, isOpen, onClose, onSave, defaultMinScore }) => {
    const [currentOffer, setCurrentOffer] = useState<Omit<Offer, 'providerId'>>({
        id: '', title: '', description: '', minTransferScore: defaultMinScore, minConfidence: 0.75, regions: [], status: 'draft'
    });

    React.useEffect(() => {
        if (offer) {
            setCurrentOffer(offer);
        } else {
             setCurrentOffer({
                id: `offer_${new Date().getTime()}`, title: '', description: '', minTransferScore: defaultMinScore, minConfidence: 0.75, regions: [], status: 'draft'
            });
        }
    }, [offer, isOpen, defaultMinScore]);

    if (!isOpen) return null;

    const handleChange = (field: keyof Offer, value: any) => {
        setCurrentOffer(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(currentOffer as Offer);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold">{offer ? 'Edit Offer' : 'Create New Offer'}</h3>
                </div>
                <div className="p-4 space-y-4">
                     <div>
                        <label className="text-sm">Offer Title</label>
                        <input type="text" value={currentOffer.title} onChange={e => handleChange('title', e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                     <div>
                        <label className="text-sm">Description</label>
                        <textarea value={currentOffer.description} onChange={e => handleChange('description', e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm">Min. TransferScore</label>
                            <input type="number" value={currentOffer.minTransferScore} onChange={e => handleChange('minTransferScore', Number(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        </div>
                         <div>
                            <label className="text-sm">Min. Confidence (%)</label>
                            <input type="number" value={currentOffer.minConfidence * 100} onChange={e => handleChange('minConfidence', Number(e.target.value) / 100)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        </div>
                    </div>
                </div>
                <div className="p-4 flex justify-end gap-2 border-t dark:border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-600 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded">Save Offer</button>
                </div>
            </div>
        </div>
    );
};

const formatDossier = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br />'); // Line breaks
};

const DossierModal: React.FC<{ applicant: Applicant | null; onClose: () => void; }> = ({ applicant, onClose }) => {
    if (!applicant) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                 <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Applicant Dossier</h3>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="p-4 overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formatDossier(applicant.dossier) }} />
                </div>
                 <div className="p-2 border-t dark:border-slate-700 text-right">
                     <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-600 rounded">Close</button>
                </div>
            </div>
        </div>
    )
}

type Tab = 'offers' | 'applicants';

const ProviderDashboardPage: React.FC<ProviderDashboardPageProps> = ({ data, formData, offers, applicants, onOfferAction, onLogout }) => {
    const [activeTab, setActiveTab] = useState<Tab>('offers');
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);
    const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null); // v34.15: styled confirm
    
    const handleCreateOffer = () => {
        setEditingOffer(null);
        setIsOfferModalOpen(true);
    };

    const handleEditOffer = (offer: Offer) => {
        setEditingOffer(offer);
        setIsOfferModalOpen(true);
    };

    const handleSaveOffer = (offer: Offer) => {
        onOfferAction(editingOffer ? 'update' : 'create', offer);
    };
    
    const handleDeleteOffer = (offer: Offer) => {
        setOfferToDelete(offer); // v34.15: styled confirm modal instead of window.confirm
    };
    
    const toggleOfferStatus = (offer: Offer) => {
        const updatedOffer: Offer = {...offer, status: offer.status === 'draft' ? 'published' : 'draft'};
        onOfferAction('update', updatedOffer);
    };

    const TabButton: React.FC<{ tabId: Tab; children: React.ReactNode; count?: number }> = ({ tabId, children, count }) => {
      const isActive = activeTab === tabId;
      return (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {children}
            {count !== undefined && <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>{count}</span>}
        </button>
      )
    };
    
    const renderTabContent = () => {
        if (activeTab === 'applicants') {
             return (
                 <Card>
                    <CardHeader title="Consented Applicants" />
                    <CardContent className="space-y-3">
                         {applicants.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <h4 className="font-semibold">No applicants yet.</h4>
                                <p>When a user applies to one of your published offers, they will appear here.</p>
                            </div>
                        )}
                        {applicants.map(applicant => (
                             <div key={applicant.id} className="p-3 border dark:border-slate-700 rounded-lg flex justify-between items-center">
                                 <div>
                                    <p className="font-semibold">Applicant ID: ...{applicant.id.slice(-8)}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Applied for: "{applicant.offerTitle}" | Score: {applicant.score}</p>
                                 </div>
                                 <button onClick={() => setViewingApplicant(applicant)} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                     View Dossier
                                 </button>
                             </div>
                        ))}
                    </CardContent>
                </Card>
            );
        }
        
        return (
            <Card>
                <CardHeader title="Manage Your Offers" children={
                    <button onClick={handleCreateOffer} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        + Create Offer
                    </button>
                } />
                <CardContent className="space-y-4">
                    {offers.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <h4 className="font-semibold">No offers yet.</h4>
                            <p>Click "Create Offer" to get started.</p>
                        </div>
                    )}
                    {offers.map(offer => (
                         <div key={offer.id} className={`p-4 rounded-lg transition-all ${offer.status === 'published' ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700' : 'border dark:border-slate-600'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{offer.title}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{offer.description}</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Min. Score: {offer.minTransferScore}</span>
                                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Min. Confidence: {(offer.minConfidence * 100)}%</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                                    <button 
                                        onClick={() => toggleOfferStatus(offer)}
                                        className={`w-24 text-center px-4 py-1.5 text-sm font-semibold rounded-md ${offer.status === 'published' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                    >
                                        {offer.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <div className="flex gap-2">
                                       <button onClick={() => handleEditOffer(offer)} className="text-xs text-slate-500 hover:underline">Edit</button>
                                       <button onClick={() => handleDeleteOffer(offer)} className="text-xs text-red-500 hover:underline">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }


    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans">
            <OfferModal 
                isOpen={isOfferModalOpen} 
                offer={editingOffer} 
                onClose={() => setIsOfferModalOpen(false)} 
                onSave={handleSaveOffer}
                defaultMinScore={Number(formData.minScore)}
            />
            <DossierModal applicant={viewingApplicant} onClose={() => setViewingApplicant(null)} />
            {offerToDelete && (
                <ConfirmModal
                    title="Delete This Offer?"
                    message={`"${offerToDelete.title}" will be removed permanently. Applicants who already shared their dossier for this offer keep their share history.`}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    danger
                    onConfirm={() => onOfferAction('delete', offerToDelete)}
                    onClose={() => setOfferToDelete(null)}
                />
            )}
            <header className="bg-white dark:bg-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">{data.companyName} - Partner Portal</h1>
                    <button onClick={onLogout} className="text-sm text-blue-600 hover:underline">Exit Portal</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Welcome to the Network!</h2>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">Your AI-powered verification is complete. Create and manage your offers below to start receiving qualified, anonymized leads.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader title="Trust & Verification" />
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">KYB Confidence Score</div>
                                    <div className="text-5xl font-bold text-slate-800 dark:text-slate-100">{(data.kybConfidence * 100).toFixed(0)}<span className="text-2xl">%</span></div>
                                    <div className="mt-2"><TierBadge tier={data.tier} /></div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-600 dark:text-slate-300">Trust Heatmap</h4>
                                    <TrustMeter label="Uploaded Documents" score={data.trustHeatmap.docs} />
                                    <TrustMeter label="Official Registry Match" score={data.trustHeatmap.registry} />
                                    <TrustMeter label="Web Presence" score={data.trustHeatmap.webPresence} />
                                    <TrustMeter label="Public Reviews" score={data.trustHeatmap.reviews} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader title="Compliance Log" />
                             <CardContent className="space-y-2 text-xs max-h-60 overflow-y-auto">
                                {data.complianceLog.map(log => (
                                    <div key={log.id} className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{log.check}</p>
                                        <p className="text-slate-500 dark:text-slate-400">Result: {log.result} | Source: <span className="italic">{log.source}</span></p>
                                    </div>
                                ))}
                             </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                            <TabButton tabId="offers">My Offers</TabButton>
                            <TabButton tabId="applicants" count={applicants.length}>Applicants</TabButton>
                        </div>
                        {renderTabContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderDashboardPage;
