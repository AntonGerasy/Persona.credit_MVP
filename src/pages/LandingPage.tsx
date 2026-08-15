import React from 'react';
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Car,
  Check,
  FileCheck2,
  FileText,
  Globe2,
  Home,
  Landmark,
  Layers3,
  LockKeyhole,
  Shield,
  ShieldCheck,
  Smartphone,
  Upload,
  Users,
} from 'lucide-react';
import RealmSwitcher from '../components/RealmSwitcher';

interface LandingPageProps {
  onStartApplication: () => void;
  onGoToHelp: () => void;
  onGoToPartner: () => void;
  onGoToPrivacy: () => void;
  onGoToTerms: () => void;
  onNavigatePublic: (path: '/how-it-works' | '/what-you-get' | '/security') => void;
}

type TrackName =
  | 'homepage_view'
  | 'hero_create_report_click'
  | 'hero_sample_report_click'
  | 'security_section_view'
  | 'sample_report_open'
  | 'registration_started'
  | 'founding50_click';

const track = (event: TrackName) => {
  if (typeof window === 'undefined') return;
  const w = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, page: 'homepage', ts: Date.now() });
};

const DemoReport = ({ className = '' }: { className?: string }) => (
  <div className={`relative rounded-[2rem] border border-brand-border bg-white shadow-2xl shadow-stone-900/10 overflow-hidden ${className}`}>
    <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div>
        <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-gray">Synthetic sample</p><p className="text-xs font-semibold">PersonaCredit Financial Report</p></div>
      </div>
      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[8px] font-bold tracking-[0.16em] text-emerald-700">DEMO DATA</span>
    </div>
    <img
      src="/demo/china-dashboard.webp"
      alt="Synthetic PersonaCredit dashboard showing a cross-border financial report"
      className="w-full h-auto block"
      loading="eager"
      decoding="async"
    />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-brand-border border-t border-brand-border">
      {['Income', 'Employment', 'Country Context', 'Evidence'].map((label) => (
        <div key={label} className="bg-white px-3 py-3 text-center text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.13em] text-brand-gray">{label}</div>
      ))}
    </div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStartApplication, onGoToPartner, onGoToPrivacy, onGoToTerms, onNavigatePublic }) => {
  React.useEffect(() => { track('homepage_view'); }, []);
  const securityRef = React.useRef<HTMLElement | null>(null);
  const securitySeen = React.useRef(false);

  React.useEffect(() => {
    if (!securityRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !securitySeen.current) {
        securitySeen.current = true;
        track('security_section_view');
      }
    }, { threshold: 0.35 });
    observer.observe(securityRef.current);
    return () => observer.disconnect();
  }, []);

  const start = () => {
    track('hero_create_report_click');
    track('registration_started');
    onStartApplication();
  };
  const sample = () => {
    track('hero_sample_report_click');
    track('sample_report_open');
    onNavigatePublic('/what-you-get');
  };
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return <div className="min-h-screen bg-brand-bg font-sans relative overflow-x-hidden">
    <div className="bloom w-[620px] h-[620px] -top-52 -right-40 bg-brand-blue/15" />
    <div className="bloom w-[520px] h-[520px] top-[58rem] -left-48 bg-amber-200/35" />

    <div className="sticky top-0 z-[100] px-4 sm:px-8 pt-5 pb-2">
      <nav className="max-w-7xl mx-auto glass-panel rounded-[1.75rem] px-5 sm:px-7 py-3.5 flex justify-between items-center gap-4">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 shrink-0 text-left">
          <div className="w-10 h-10 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/25"><Shield className="w-5 h-5" /></div>
          <div><div className="text-lg font-semibold tracking-tight leading-none">Persona.Credit</div><div className="text-[8px] sm:text-[9px] font-semibold text-brand-gray uppercase tracking-[0.17em] mt-1.5">Cross-border financial identity</div></div>
        </button>
        <div className="flex gap-5 items-center">
          <button onClick={() => scrollTo('how-it-works')} className="hidden lg:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark">How It Works</button>
          <button onClick={() => scrollTo('transferscore')} className="hidden lg:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark">TransferScore™</button>
          <button onClick={() => scrollTo('security')} className="hidden lg:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark">Security</button>
          <button onClick={() => { track('founding50_click'); onGoToPartner(); }} className="hidden md:block text-[11px] font-semibold text-brand-gray hover:text-brand-dark">For Partners</button>
          <button onClick={start} className="px-5 sm:px-6 py-3 bg-brand-dark text-white rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide hover:opacity-90">Create My Report</button>
        </div>
      </nav>
    </div>

    <main className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
      <section className="pt-14 sm:pt-20 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-[.92fr_1.08fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full mb-6"><span className="w-1.5 h-1.5 rounded-full bg-brand-blue" /><span className="text-[9px] sm:text-[10px] font-bold text-brand-gray uppercase tracking-[0.17em]">Alternative to the outdated credit scoring comes now</span></div>
            <h1 className="font-display text-[3.2rem] sm:text-6xl md:text-[4.6rem] font-light tracking-[-0.045em] leading-[0.96] text-balance">Turn your foreign financial documents into one clear <span className="text-brand-blue font-normal">U.S.-ready financial report.</span></h1>
            <p className="mt-7 text-lg sm:text-xl text-brand-gray max-w-2xl leading-relaxed">PersonaCredit organizes and explains your income, savings, assets, business ownership and financial history — including the financial context of the country you came from.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button onClick={start} className="group bg-brand-blue text-white px-9 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.13em] shadow-xl shadow-brand-blue/25 flex items-center justify-center gap-3">Create My Report — Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
              <button onClick={sample} className="px-8 py-5 glass-panel rounded-full text-[11px] font-bold uppercase tracking-[0.13em]">See a Sample Report</button>
            </div>
            <p className="mt-4 text-xs text-brand-gray">Free during current access · No credit card required</p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-2xl">
              {[
                'Your documents remain under your control.',
                'Original uploads are not kept as a permanent document archive.',
                'You decide when and with whom your report is shared.'
              ].map((x) => <div key={x} className="flex gap-2.5 items-start text-[11px] leading-relaxed text-brand-gray"><Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>{x}</span></div>)}
            </div>
          </div>

          <div className="relative lg:pl-4">
            <div className="absolute -inset-8 bg-gradient-to-br from-brand-blue/10 via-transparent to-amber-200/30 blur-3xl rounded-full" />
            <div className="relative grid grid-cols-[.34fr_.66fr] gap-4 items-center">
              <div className="space-y-3">
                {[
                  ['BANK STATEMENT', 'CNY · 2 months'],
                  ['INCOME RECORD', 'Employment evidence'],
                  ['BUSINESS OWNERSHIP', 'Registered interest'],
                  ['PROPERTY / ASSETS', 'Supporting evidence']
                ].map(([a,b], i) => <div key={a} className={`bg-white border border-brand-border rounded-2xl p-4 shadow-lg ${i === 1 ? 'translate-x-2' : i === 2 ? '-translate-x-1' : ''}`}><div className="flex gap-3"><div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center"><FileText className="w-4 h-4" /></div><div><p className="text-[8px] font-bold tracking-[0.15em] text-brand-gray">{a}</p><p className="mt-1 text-[10px] font-semibold text-brand-dark">{b}</p></div></div></div>)}
              </div>
              <div className="relative">
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-brand-blue text-white border-4 border-brand-bg flex items-center justify-center shadow-xl"><ArrowRight className="w-5 h-5" /></div>
                <DemoReport />
              </div>
            </div>
            <p className="mt-5 text-center text-xs italic text-brand-gray">One report. Your financial life, made understandable.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-28 py-20 border-t border-brand-border/70">
        <div className="max-w-4xl mx-auto text-center"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">How it works</p><h2 className="mt-4 font-display text-4xl md:text-6xl font-light tracking-[-0.035em]">From the documents you already have to one professional report.</h2></div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            [<Upload className="w-6 h-6" />, '01', 'Bring the evidence', 'Upload bank statements, income records, employment documents, business ownership, property and assets.'],
            [<Layers3 className="w-6 h-6" />, '02', 'PersonaCredit makes it understandable', 'The system reconciles information across documents, surfaces uncertainty and explains important country-specific financial context.'],
            [<FileCheck2 className="w-6 h-6" />, '03', 'Get one professional report', 'Receive one structured financial profile you control and can share when needed.']
          ].map(([icon,n,t,d]: any) => <div key={n} className="glass-panel rounded-[1.75rem] p-8 soft-lift"><div className="flex items-center justify-between"><div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">{icon}</div><span className="text-[10px] font-bold text-brand-gray tracking-[0.18em]">{n}</span></div><h3 className="mt-6 text-lg font-semibold">{t}</h3><p className="mt-3 text-sm text-brand-gray leading-relaxed">{d}</p></div>)}
        </div>
      </section>

      <section id="what-you-get" className="scroll-mt-28 py-24">
        <div className="grid lg:grid-cols-[.78fr_1.22fr] gap-10 lg:gap-14 items-center">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">See what you get</p><h2 className="mt-4 font-display text-4xl md:text-6xl font-light tracking-[-0.035em]">This is what PersonaCredit creates.</h2><p className="mt-6 text-lg text-brand-gray leading-relaxed">A structured financial report built from the evidence you already have — organized, reconciled and explained in a format that is easier to review in the United States.</p><div className="mt-8 space-y-4">{[
            ['Verified Financial Evidence', 'Income, savings, assets, employment, business ownership and supporting evidence.'],
            ['Cross-Document Reconciliation', 'Information is compared across documents instead of being treated as isolated files.'],
            ['Country & Financial Context', 'The report explains unfamiliar financial structures and behavior in the market where the evidence was created.'],
            ['Contradictions & Review', 'Uncertain or conflicting information is surfaced for review rather than silently guessed.']
          ].map(([a,b]) => <div key={a} className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0 mt-1"/><div><p className="font-semibold">{a}</p><p className="text-sm text-brand-gray leading-relaxed mt-1">{b}</p></div></div>)}</div><button onClick={sample} className="mt-9 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">See a Sample Report <ArrowRight className="w-4 h-4" /></button></div>
          <div className="relative">
            <DemoReport />
            <div className="hidden sm:block absolute -bottom-10 -left-8 w-[44%] bg-white rounded-[1.5rem] border border-brand-border p-3 shadow-xl"><img src="/demo/china-evidence.webp" alt="Synthetic verified evidence detail" className="rounded-xl w-full" loading="lazy" decoding="async"/><p className="mt-2 text-[8px] font-bold text-brand-gray uppercase tracking-[0.14em]">Verified evidence detail</p></div>
          </div>
        </div>
      </section>

      <section className="py-24 border-y border-brand-border/70">
        <div className="max-w-5xl mx-auto"><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Financial context</p><h2 className="mt-4 font-display text-4xl md:text-6xl font-light">Understanding the numbers is only half the story.</h2><p className="mt-6 text-lg text-brand-gray leading-relaxed max-w-4xl mx-auto">The same income, savings, transfers, cash usage, business ownership or spending patterns can mean very different things depending on the country where a person lived and worked. PersonaCredit helps explain the financial reality behind the documents — not only translate the numbers.</p></div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">{[
          ['Country Context', 'Explain unfamiliar currencies, document structures, banking practices, income formats and ownership arrangements.'],
          ['Financial Habits', 'Explain patterns such as cash use, family transfers, multiple currencies, property-based savings or wealth held inside a private business when relevant.'],
          ['The Person Behind the Documents', 'Connect documents, behavior, assets, employment and business ownership into one coherent profile.']
        ].map(([a,b]) => <div key={a} className="glass-panel rounded-[1.75rem] p-7"><Globe2 className="w-6 h-6 text-brand-blue"/><h3 className="mt-5 font-semibold">{a}</h3><p className="mt-3 text-sm text-brand-gray leading-relaxed">{b}</p></div>)}</div>
        <div className="mt-8 rounded-[2rem] border border-brand-border overflow-hidden bg-white"><img src="/demo/china-context.webp" alt="Synthetic PersonaCredit country financial context report" className="w-full h-auto block" loading="lazy" decoding="async"/></div>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            ['/demo/china-dashboard.webp', 'CHINA', 'Chen Wei · synthetic demo'],
            ['/demo/india-dashboard.webp', 'INDIA', 'Rahul Sharma · synthetic demo'],
            ['/demo/vietnam-dashboard.webp', 'VIETNAM', 'Nguyễn Thị Hoa · synthetic demo']
          ].map(([src,country,label]) => <div key={country} className="bg-white border border-brand-border rounded-[1.5rem] overflow-hidden shadow-lg"><img src={src} alt={`Synthetic PersonaCredit dashboard sample for ${country}`} className="w-full h-auto block" loading="lazy" decoding="async"/><div className="px-4 py-3"><p className="text-[9px] font-bold tracking-[0.16em] text-brand-blue">{country}</p><p className="mt-1 text-[10px] text-brand-gray">{label}</p></div></div>)}
        </div>
        <p className="mt-6 text-center font-display text-2xl md:text-3xl font-light">We do not just translate documents. We explain the financial reality behind them.</p></div>
      </section>

      <section id="transferscore" className="scroll-mt-28 py-24">
        <div className="rounded-[2.5rem] bg-stone-950 text-white p-9 md:p-14 relative overflow-hidden">
          <div className="absolute -top-28 -right-20 w-80 h-80 bg-brand-blue/25 blur-3xl rounded-full" />
          <div className="relative z-10 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">TransferScore™</p><h2 className="mt-4 font-display text-5xl md:text-6xl font-light text-white tracking-[-0.04em]">The score is not the product. The evidence is.</h2><p className="mt-7 text-stone-300 text-lg leading-relaxed">PersonaCredit is designed around deterministic rules for critical classifications, reconciliation and contradiction handling. The score summarizes the underlying evidence; it does not replace it.</p><p className="mt-4 text-stone-500 text-sm">TransferScore™ is proprietary to PersonaCredit. It is not FICO, a credit bureau score or an approval decision.</p></div><div className="glass-panel rounded-[2rem] p-8 text-brand-dark"><p className="text-[9px] uppercase tracking-[0.18em] text-brand-gray font-bold">One output of the report</p><div className="font-display text-6xl font-light mt-2">0–1000</div><div className="mt-7 h-2 rounded-full bg-stone-200 overflow-hidden"><div className="h-full w-[67%] bg-brand-blue rounded-full" /></div><p className="mt-5 text-xs text-brand-gray leading-relaxed">Designed to sit beside the evidence and the explanation, not hide them.</p></div></div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Use cases</p><h2 className="mt-4 font-display text-4xl md:text-6xl font-light">One financial identity. Many moments that depend on trust.</h2></div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[
          [<Home className="w-5 h-5"/>, 'Renting a home', 'Show foreign income, savings and assets when a landlord needs more context.'],
          [<Landmark className="w-5 h-5"/>, 'Banking & lending', 'Present foreign financial evidence in a clear, structured format where additional documentation can be considered.'],
          [<Car className="w-5 h-5"/>, 'Auto financing', 'Organize foreign income, savings and assets for lender review when local credit history is thin.'],
          [<ShieldCheck className="w-5 h-5"/>, 'Insurance', 'Provide additional financial context where insurers or brokers permit supporting documentation.'],
          [<Smartphone className="w-5 h-5"/>, 'Utilities & mobile', 'Use a clear report where a provider offers alternative verification instead of relying only on local history.'],
          [<BriefcaseBusiness className="w-5 h-5"/>, 'Professional & relocation', 'Organize foreign income, employment, business and asset records for relocation or professional review.']
        ].map(([icon,a,b]: any) => <div key={a} className="glass-panel rounded-[1.5rem] p-7"><div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">{icon}</div><h3 className="mt-5 font-semibold">{a}</h3><p className="mt-3 text-sm text-brand-gray leading-relaxed">{b}</p></div>)}</div>
        <p className="mt-6 text-center text-[10px] text-brand-gray">Use of a PersonaCredit report does not imply guaranteed acceptance by any institution.</p>
      </section>

      <section className="py-20">
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-8 items-stretch"><div className="glass-panel rounded-[2.25rem] p-9 md:p-12"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Built for consistency</p><h2 className="mt-4 font-display text-4xl md:text-5xl font-light">Built for consistency — not AI guesswork.</h2><p className="mt-6 text-brand-gray leading-relaxed">PersonaCredit uses structured verification rules for critical classifications, contradiction handling, identity matching and review decisions. AI assists with document interpretation, but it does not independently decide your financial identity.</p></div><div className="glass-panel rounded-[2.25rem] p-9 md:p-12 flex items-center"><div className="grid grid-cols-3 gap-4 w-full">{[['01','CLASSIFY'],['02','RECONCILE'],['03','EXPLAIN']].map(([n,t]) => <div key={n} className="bg-white border border-brand-border rounded-2xl px-4 py-7 text-center"><p className="text-[9px] font-bold tracking-[0.18em] text-brand-blue">{n}</p><p className="mt-2 text-[10px] sm:text-xs font-bold tracking-[0.1em]">{t}</p></div>)}</div></div></div>
      </section>

      <section id="security" ref={securityRef} className="scroll-mt-28 py-24">
        <div className="glass-panel-strong rounded-[2.5rem] p-9 md:p-14">
          <div className="grid lg:grid-cols-[.72fr_1.28fr] gap-10 items-center"><div className="flex justify-center"><div className="w-40 h-40 rounded-[2.5rem] bg-brand-dark text-white flex flex-col items-center justify-center shadow-2xl"><LockKeyhole className="w-14 h-14 text-brand-blue"/><span className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em]">Your control</span></div></div><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Security & data protection</p><h2 className="mt-4 font-display text-4xl md:text-5xl font-light">Your financial documents are sensitive. We designed PersonaCredit accordingly.</h2><p className="mt-6 text-brand-gray leading-relaxed">We keep the structured report you asked us to create — not a permanent archive of the original documents you uploaded.</p><div className="mt-7 grid sm:grid-cols-2 gap-4">{['Original uploaded documents are not retained as a permanent document archive.','The structured report remains accessible through your account and the sharing links you create.','You control sharing and can revoke access.','Documents are not sold or used for advertising.'].map(x => <div key={x} className="flex gap-2.5 text-sm text-brand-gray"><Check className="w-5 h-5 text-emerald-600 shrink-0"/><span>{x}</span></div>)}</div><button onClick={() => onNavigatePublic('/security')} className="mt-8 text-[11px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2">How we protect your information <ArrowRight className="w-4 h-4"/></button></div></div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">{['Your document','Secure processing','Financial evidence extracted','Original upload removed','Your PersonaCredit report'].map((x,i) => <React.Fragment key={x}><div className="bg-white border border-brand-border rounded-2xl px-3 py-5 text-center"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gray">{x}</p></div>{i < 4 && <ArrowRight className="hidden sm:block w-4 h-4 text-brand-blue mx-auto"/>}</React.Fragment>)}</div>
        </div>
      </section>

      <section className="py-24">
        <div className="bg-stone-900 rounded-[2.5rem] p-10 md:p-16 text-white grid lg:grid-cols-[1.15fr_.85fr] gap-10 items-center relative overflow-hidden"><div className="absolute -bottom-28 -left-20 w-80 h-80 bg-brand-blue/20 blur-3xl rounded-full"/><div className="relative z-10"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">The Founding 50</p><h2 className="mt-4 font-display text-4xl md:text-6xl font-light text-white">Before a new standard becomes familiar, someone has to believe it should exist.</h2><p className="mt-6 text-stone-300 leading-relaxed max-w-2xl">A limited Charter Partner program for trusted professionals and organizations helping introduce PersonaCredit to the first communities who can benefit from it.</p></div><div className="relative z-10 lg:text-right"><button onClick={() => { track('founding50_click'); onGoToPartner(); }} className="bg-brand-blue text-white px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-3">Explore The Founding 50 <ArrowRight className="w-4 h-4"/></button><p className="mt-5 text-[10px] text-stone-500">Charter Partner is a program designation and does not imply equity.</p></div></div>
      </section>

      <section className="py-28 text-center"><Banknote className="w-7 h-7 text-brand-blue mx-auto"/><h2 className="mt-5 font-display text-4xl md:text-6xl font-light">Your past should still count when your future crosses a border.</h2><p className="mt-6 text-brand-gray max-w-2xl mx-auto">Build a financial identity from the evidence you already have — and decide when to share it.</p><button onClick={start} className="mt-9 bg-brand-blue text-white px-11 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em]">Create My Report — Free</button><p className="mt-4 text-xs text-brand-gray">Free during current access · No credit card required</p></section>
    </main>

    <footer className="max-w-7xl mx-auto px-6 sm:px-8 pb-12"><div className="glass-panel rounded-[2rem] p-8 md:p-10"><div className="flex flex-col md:flex-row justify-between gap-8"><div className="max-w-lg"><div className="font-semibold">Persona.Credit</div><p className="mt-3 text-xs text-brand-gray leading-relaxed">PersonaCredit helps internationally mobile people organize foreign financial documents into clear, structured reports for use in the United States. TransferScore™ is proprietary and is not a FICO score or credit bureau record.</p></div><div className="flex flex-wrap gap-x-8 gap-y-3 text-[11px]"><button onClick={() => scrollTo('how-it-works')}>How It Works</button><button onClick={() => scrollTo('security')}>Security</button><button onClick={() => { track('founding50_click'); onGoToPartner(); }}>The Founding 50</button><button onClick={onGoToPrivacy}>Privacy Policy</button><button onClick={onGoToTerms}>Terms of Service</button></div></div><div className="mt-8 pt-7 border-t border-brand-border flex flex-col md:flex-row justify-between gap-4 text-[10px] text-brand-gray"><span>© 2026 Persona.Credit · compliance@persona.credit</span><RealmSwitcher/></div></div></footer>
  </div>;
};

export default LandingPage;
