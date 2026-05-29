import React, { useState } from 'react';
import type { HelpCenterPageProps } from '../types';
import RealmSwitcher from '../components/RealmSwitcher';

const faqData = [
    { q: "What is TransferScore?", a: "TransferScore is an alternative credit scoring platform designed for individuals moving to the US. We analyze your financial history from your country of origin to create a comprehensive score that US lenders and service providers can trust." },
    { q: "Is my data secure?", a: "Yes. We take data security and privacy very seriously. All data is encrypted at rest and in transit. We only share your detailed report with service providers after you give explicit consent for each specific offer." },
    { q: "How is my score calculated?", a: "Our AI analyzes hundreds of data points from the information and documents you provide. It cross-references your data with real-time economic indicators for your country of origin to create a fair and context-aware score." },
    { q: "What if I upload the wrong document?", a: "Our AI performs an instant check on every document you upload. If you upload an irrelevant or incorrect file, the system will notify you immediately so you can correct it before submitting your application." },
    { q: "How can I improve my score?", a: "The best way to improve your score is to provide complete, accurate, and verifiable information. The 'Recommendations' on your dashboard provide personalized tips, and the 'Simulator' tool can help you understand how certain financial changes might impact your score." },
];

const AccordionItem: React.FC<{ q: string; a: string; isOpen: boolean; onClick: () => void }> = ({ q, a, isOpen, onClick }) => (
    <div className="border-b border-slate-200 dark:border-slate-700">
        <h2>
            <button
                type="button"
                className="flex justify-between items-center w-full p-5 font-medium text-left text-slate-700 dark:text-slate-300"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <span>{q}</span>
                <svg className={`w-6 h-6 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
        </h2>
        <div className={`p-5 border-t border-slate-200 dark:border-slate-700 ${isOpen ? 'block' : 'hidden'}`}>
            <p className="text-slate-500 dark:text-slate-400">{a}</p>
        </div>
    </div>
);

type Tab = 'faq' | 'articles' | 'contact';

const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onContactSupport, onBack, isLoggedIn }) => {
    const [activeTab, setActiveTab] = useState<Tab>('faq');
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);
    
    // Contact form state
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        const success = await onContactSupport(subject, message);
        if (success) {
            setFormStatus('success');
            setSubject('');
            setMessage('');
        } else {
            setFormStatus('error');
        }
    };
    
    const TabButton: React.FC<{ tabId: Tab, children: React.ReactNode }> = ({ tabId, children }) => {
        const isActive = activeTab === tabId;
        return (
            <button
                onClick={() => setActiveTab(tabId)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
                {children}
            </button>
        )
    };
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'articles':
                return <div className="p-6 text-center text-slate-500">Educational articles are coming soon to help you on your financial journey.</div>
            case 'contact':
                return (
                    <div className="p-6">
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                             <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                                <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                                <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={5} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600" />
                            </div>
                            <button type="submit" disabled={formStatus === 'submitting'} className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400">
                                {formStatus === 'submitting' ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                            {formStatus === 'success' && <p className="text-sm text-green-600">Your ticket has been received! Our team will get back to you shortly.</p>}
                            {formStatus === 'error' && <p className="text-sm text-red-600">Could not submit your ticket. Please try again later.</p>}
                        </form>
                    </div>
                );
            case 'faq':
            default:
                return (
                    <div>
                        {faqData.map((item, index) => (
                            <AccordionItem 
                                key={index} 
                                q={item.q} 
                                a={item.a} 
                                isOpen={openAccordion === index}
                                onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                            />
                        ))}
                    </div>
                );
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center p-4 font-sans">
            <div className="w-full max-w-3xl mx-auto my-8">
                <header className="text-center mb-8">
                     <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Help Center</h1>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">Find answers to your questions and get support.</p>
                </header>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl">
                    <div className="border-b border-slate-200 dark:border-slate-700 flex space-x-2 px-4">
                        <TabButton tabId="faq">FAQ</TabButton>
                        <TabButton tabId="articles">Articles</TabButton>
                        <TabButton tabId="contact">Contact Support</TabButton>
                    </div>
                    {renderTabContent()}
                </div>

                 <div className="text-center mt-8 flex flex-col items-center gap-6">
                    <button onClick={onBack} className="px-6 py-2 text-base font-medium text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                        {isLoggedIn ? 'Back to Terminal' : 'Back to App'}
                    </button>
                    <RealmSwitcher />
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
