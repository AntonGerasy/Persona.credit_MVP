import React from 'react';
import { ArrowRight, Building2, FileCheck2, Globe2, Landmark, Scale, Shield, ShieldCheck, Sparkles, Users } from 'lucide-react';
import RealmSwitcher from '../components/RealmSwitcher';

interface LandingPageProps {
  onStartApplication: () => void;
  onGoToHelp: () => void;
  onGoToPartner: () => void;
  onGoToPrivacy: () => void;
  onGoToTerms: () => void;
  onNavigatePublic: (path: '/how-it-works' | '/what-you-get' | '/security') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartApplication, onGoToPartner, onGoToPrivacy, onGoToTerms, onNavigatePublic }) => {
  return <div className="min-h-screen bg-brand-bg font-sans relative overflow-x-hidden">
    <div className="bloom w-[560px] h-[560px] -top-48 -right-32 bg-brand-blue/20" />
    <div className="bloom w-[440px] h-[440px] top-[48rem] -left-40 bg-amber-200/40" />

    <div className="sticky top-0 z-[100] px-4 sm:px-8 pt-5 pb-2">
      <nav className="max-w-7xl mx-auto glass-panel rounded-[1.75rem] px-5 sm:px-7 py-4 flex justify-between items-center gap-4">
        <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} className="flex items-center gap-3 shrink-0 text-left">
          <div className="w-11 h-11 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/25"><Shield className="w-5 h-5"/></div>
          <div><div className="text-lg font-semibold tracking-tight leading-none">Persona.Credit</div><div className="text-[9px] font-semibold text-brand-gray uppercase tracking-[0.18em] mt-1.5">Cross-border financial identity</div></div>
        </button>
        <div className="flex gap-5 items-center">
          <button onClick={() => onNavigatePublic('/how-it-works')} className="hidden lg:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark">How It Works</button>
          <button onClick={() => onNavigatePublic('/what-you-get')} className="hidden lg:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark">TransferScore™</button>
          <button onClick={() => onNavigatePublic('/security')} className="hidden lg:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark">Security</button>
          <button onClick={onGoToPartner} className="hidden md:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark">For Partners</button>
          <button onClick={onStartApplication} className="px-6 py-3 bg-brand-dark text-white rounded-full text-[11px] font-semibold tracking-wide hover:opacity-90">Create My Report</button>
        </div>
      </nav>
    </div>

    <main className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
      <section className="min-h-[720px] flex items-center justify-center text-center py-20">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 glass-panel rounded-full mb-8"><span className="w-1.5 h-1.5 rounded-full bg-brand-blue"/><span className="text-[10px] font-semibold text-brand-gray uppercase tracking-[0.18em]">Financial history should travel with you</span></div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-[5.5rem] font-light tracking-[-0.045em] leading-[0.96] text-balance">
            Alternative To The Outdated<br/><span className="text-brand-blue font-normal">Credit Scoring Comes Now</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-brand-gray max-w-3xl mx-auto leading-relaxed">PersonaCredit turns financial evidence from the country you came from into a structured, explainable financial identity you can carry into the country where you are going.</p>
          <p className="mt-4 text-sm md:text-base text-brand-gray/90 max-w-2xl mx-auto leading-relaxed">Bank statements, income evidence and identity documents become one clear report — including TransferScore™ — built to help another person understand the financial history that ordinary domestic credit systems often cannot see.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={onStartApplication} className="group bg-brand-blue text-white px-10 py-5 rounded-full text-[11px] font-semibold uppercase tracking-[0.13em] shadow-xl shadow-brand-blue/25 flex items-center justify-center gap-3">Create My Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></button>
            <button onClick={() => onNavigatePublic('/how-it-works')} className="px-9 py-5 glass-panel rounded-full text-[11px] font-semibold uppercase tracking-[0.13em]">See How It Works</button>
          </div>
          <p className="mt-6 text-[10px] text-brand-gray uppercase tracking-[0.16em]">Informational financial-evidence analysis — not FICO, not a credit bureau report, and not an approval decision.</p>
        </div>
      </section>

      <section className="py-24 border-t border-brand-border/70">
        <div className="max-w-4xl mx-auto text-center mb-14"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">The problem</p><h2 className="mt-4 font-display text-4xl md:text-6xl font-light tracking-[-0.035em]">Your financial life does not begin again when you cross a border.</h2><p className="mt-6 text-lg text-brand-gray leading-relaxed">Yet traditional credit systems are largely national. A person can arrive with years of income, savings and responsible financial behavior — and still look almost invisible to the next system.</p></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            ['Bring the evidence', 'Use financial records you already have from another country.', <FileCheck2 className="w-6 h-6"/>],
            ['Make it understandable', 'PersonaCredit reconciles the evidence into a consistent, structured view.', <Globe2 className="w-6 h-6"/>],
            ['Share the context', 'Create a report you control and can share with a recipient when it is useful.', <Landmark className="w-6 h-6"/>]
          ].map(([t,d,i]: any) => <div key={t} className="glass-panel rounded-[1.75rem] p-8 soft-lift"><div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">{i}</div><h3 className="mt-6 text-lg font-semibold">{t}</h3><p className="mt-3 text-sm text-brand-gray leading-relaxed">{d}</p></div>)}
        </div>
      </section>

      <section className="py-24">
        <div className="rounded-[2.5rem] bg-stone-950 text-white p-9 md:p-16 relative overflow-hidden">
          <div className="absolute -top-28 -right-20 w-80 h-80 bg-brand-blue/30 blur-3xl rounded-full"/>
          <div className="relative z-10 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
            <div><p className="text-[11px] md:text-sm font-bold uppercase tracking-[0.22em] text-brand-blue">Introducing TransferScore™</p><h2 className="mt-4 font-display text-5xl md:text-7xl font-light text-white tracking-[-0.04em] leading-[.98]">Your financial history should not disappear when you cross a border.</h2><p className="mt-7 text-stone-200 text-lg leading-relaxed">Traditional credit scores are usually tied to one country's financial system. Move to another country, and years of income, savings, stability and responsible financial behavior may suddenly become difficult for institutions to understand.</p><p className="mt-5 text-stone-300 text-lg leading-relaxed"><span className="text-white font-semibold">TransferScore™ is designed to make that history portable.</span> PersonaCredit brings the financial evidence you submit into one standardized 0–1000 signal and shows the evidence behind it — so a recipient can understand the financial history you have already built.</p><p className="mt-5 text-stone-400 text-sm leading-relaxed">TransferScore™ does not replace FICO or a local credit bureau score, and it does not make a credit, housing or employment decision. It provides something domestic systems often cannot: a way to carry your documented financial reputation with you.</p><button onClick={() => onNavigatePublic('/what-you-get')} className="mt-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Understand TransferScore™ <ArrowRight className="w-4 h-4"/></button></div>
            <div className="glass-panel rounded-[2rem] p-8 text-brand-dark"><div className="flex justify-between items-end"><div><p className="text-[9px] uppercase tracking-[0.18em] text-brand-gray font-bold">One portable signal</p><div className="font-display text-6xl font-light mt-2">0–1000</div></div><Sparkles className="w-8 h-8 text-brand-blue"/></div><div className="mt-7 h-2 rounded-full bg-stone-200 overflow-hidden"><div className="h-full w-[72%] bg-brand-blue rounded-full"/></div><p className="mt-5 text-xs text-brand-gray leading-relaxed">Designed to sit beside the underlying evidence, not hide it. A recipient can see the score and the facts that produced it.</p></div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="glass-panel rounded-[2.25rem] p-9 md:p-12"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Where it can help</p><h2 className="mt-4 font-display text-4xl md:text-5xl font-light">One financial identity. Many moments that depend on trust.</h2><div className="mt-9 grid sm:grid-cols-2 gap-5 text-sm">{['Housing & rentals','Banking & lending','Auto finance','Utilities & mobile','Insurance','Professional & relocation contexts'].map(x=><div key={x} className="flex gap-3 items-center"><div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center"><Building2 className="w-4 h-4 text-brand-blue"/></div><span className="font-medium">{x}</span></div>)}</div></div>
          <div className="glass-panel rounded-[2.25rem] p-9 md:p-12"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Built for explainability</p><h2 className="mt-4 font-display text-4xl md:text-5xl font-light">The score is not the product. The evidence is.</h2><p className="mt-6 text-brand-gray leading-relaxed">PersonaCredit is designed around deterministic rules for critical classifications, reconciliation and contradiction handling. When evidence conflicts or cannot be resolved confidently, the system can flag review rather than pretending certainty.</p><button onClick={() => onNavigatePublic('/how-it-works')} className="mt-8 text-[11px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2">Explore the methodology <ArrowRight className="w-4 h-4"/></button></div>
        </div>
      </section>

      <section className="py-24">
        <div className="glass-panel-strong rounded-[2.5rem] p-9 md:p-14 grid lg:grid-cols-[.8fr_1.2fr] gap-10 items-center">
          <div className="flex justify-center"><div className="w-44 h-44 rounded-[2.5rem] bg-brand-dark text-white flex flex-col items-center justify-center shadow-2xl relative"><ShieldCheck className="w-16 h-16 text-brand-blue"/><span className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em]">Data Protection</span><span className="text-[8px] text-stone-400 mt-1">PersonaCredit Assurance</span></div></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Your data is treated as sensitive by design</p><h2 className="mt-4 font-display text-4xl md:text-5xl font-light">Protected with Google Cloud safeguards.</h2><p className="mt-6 text-brand-gray leading-relaxed">PersonaCredit does not keep original uploaded documents in a separate persistent file store. Documents are sent to the paid Google Gemini API for analysis; under Google's paid-service terms, submitted content is not used to train or improve Google's models. Account records and report links are isolated and can be deleted.</p><p className="mt-4 text-[10px] text-brand-gray leading-relaxed">The shield shown here is a PersonaCredit assurance mark. It is not an independent Google certification or endorsement.</p><button onClick={() => onNavigatePublic('/security')} className="mt-7 text-[11px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2">How we protect your information <ArrowRight className="w-4 h-4"/></button></div>
        </div>
      </section>

      <section className="py-24">
        <div className="bg-stone-900 rounded-[2.5rem] p-10 md:p-16 text-white grid lg:grid-cols-[1.15fr_.85fr] gap-10 items-center relative overflow-hidden"><div className="absolute -bottom-28 -left-20 w-80 h-80 bg-brand-blue/20 blur-3xl rounded-full"/><div className="relative z-10"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">The Founding 200</p><h2 className="mt-4 font-display text-4xl md:text-6xl font-light text-white">Before a new standard becomes familiar, someone has to believe it should exist.</h2><p className="mt-6 text-stone-300 leading-relaxed max-w-2xl">We are inviting a limited group of trusted professionals and organizations — including immigration attorneys, relocation experts, educators, accelerators and community leaders — to introduce PersonaCredit to the first communities who can benefit from it.</p></div><div className="relative z-10 lg:text-right"><button onClick={onGoToPartner} className="bg-brand-blue text-white px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-3">Explore The Founding 200 <ArrowRight className="w-4 h-4"/></button><p className="mt-5 text-[10px] text-stone-500">General access remains available. The Founding 200 is a separate Charter Partner program.</p></div></div>
      </section>

      <section className="py-28 text-center"><Scale className="w-7 h-7 text-brand-blue mx-auto"/><h2 className="mt-5 font-display text-4xl md:text-6xl font-light">Your past should still count when your future crosses a border.</h2><p className="mt-6 text-brand-gray max-w-2xl mx-auto">Build a financial identity from the evidence you already have — and decide when to share it.</p><button onClick={onStartApplication} className="mt-9 bg-brand-blue text-white px-11 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em]">Create My Report</button></section>
    </main>

    <footer className="max-w-7xl mx-auto px-6 sm:px-8 pb-12"><div className="glass-panel rounded-[2rem] p-8 md:p-10"><div className="flex flex-col md:flex-row justify-between gap-8"><div className="max-w-lg"><div className="font-semibold">Persona.Credit</div><p className="mt-3 text-xs text-brand-gray leading-relaxed">Cross-border financial evidence, made understandable. TransferScore™ is proprietary to PersonaCredit and is not a FICO score or credit bureau record.</p></div><div className="flex flex-wrap gap-x-8 gap-y-3 text-[11px]"><button onClick={() => onNavigatePublic('/how-it-works')}>How It Works</button><button onClick={() => onNavigatePublic('/security')}>Security</button><button onClick={onGoToPartner}>The Founding 200</button><button onClick={onGoToPrivacy}>Privacy Policy</button><button onClick={onGoToTerms}>Terms of Service</button></div></div><div className="mt-8 pt-7 border-t border-brand-border flex flex-col md:flex-row justify-between gap-4 text-[10px] text-brand-gray"><span>© 2026 Persona.Credit · compliance@persona.credit</span><RealmSwitcher/></div></div></footer>
  </div>;
};
export default LandingPage;
