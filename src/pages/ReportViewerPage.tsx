import React, { useEffect } from 'react';
import { Shield, Calendar, CheckCircle, AlertCircle, Clock, TrendingUp, MapPin, Briefcase, DollarSign, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import type { DashboardData } from '../types';

interface ReportViewerPageProps {
  data: DashboardData;
  token: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const purposeLabel: Record<string, string> = {
  apartment_rental: 'Apartment / Housing Rental',
  personal_loan: 'Personal Loan',
  auto_financing: 'Auto Financing',
  credit_card: 'Credit Card',
  mortgage: 'Mortgage',
  business_account: 'Business / Bank Account',
  other: 'General Financial Verification',
};

const employmentLabel: Record<string, string> = {
  employed_full_time: 'Full-Time Employee',
  employed_part_time: 'Part-Time Employee',
  self_employed: 'Self-Employed / Freelance',
  business_owner: 'Business Owner',
  contractor: 'Independent Contractor',
  remote_for_foreign: 'Remote Worker (Foreign Employer)',
  unemployed: 'Not Currently Employed',
};

const scoreColor = (score: number) => {
  if (score >= 720) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
  if (score >= 620) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
  if (score >= 520) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
};

const confidenceLabel = (c: number) => {
  if (c >= 0.75) return { label: 'High', color: 'text-emerald-600' };
  if (c >= 0.5)  return { label: 'Moderate', color: 'text-amber-600' };
  return { label: 'Limited', color: 'text-red-500' };
};

const fmt = (n: number | null | undefined, currency?: string) => {
  if (n === null || n === undefined || n === 0) return '—';
  const s = n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return currency ? `${currency} ${s}` : s;
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; dark?: boolean }> = ({ title, icon, children, dark }) => (
  <section className={`rounded-2xl border p-8 ${dark ? 'bg-[#0F292F] text-white border-white/10' : 'bg-white border-slate-100'}`}>
    <div className={`flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.25em] ${dark ? 'text-white/50' : 'text-slate-400'}`}>
      {icon}
      {title}
    </div>
    {children}
  </section>
);

const Row: React.FC<{ label: string; value: React.ReactNode; subtle?: boolean }> = ({ label, value, subtle }) => (
  <div className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0 gap-4">
    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">{label}</span>
    <span className={`text-[12px] font-bold text-right ${subtle ? 'text-slate-400' : 'text-slate-800'}`}>{value}</span>
  </div>
);

const Pill: React.FC<{ label: string; variant: 'green' | 'amber' | 'red' | 'blue' | 'gray' }> = ({ label, variant }) => {
  const map = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red:   'bg-red-50 text-red-700 border-red-200',
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    gray:  'bg-slate-50 text-slate-500 border-slate-200',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${map[variant]}`}>{label}</span>;
};

// ─── Component ────────────────────────────────────────────────────────────────

const ReportViewerPage: React.FC<ReportViewerPageProps> = ({ data, token }) => {
  useEffect(() => {
    document.body.style.backgroundColor = '#F8FAFC';
    document.body.style.color = '#0F172A';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  const score = data?.score || 0;
  const sc = scoreColor(score);
  const conf = confidenceLabel(data?.confidence || 0);

  const formattedDate = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'long' })
    : new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  const expiryDate = data?.generatedAt
    ? new Date(data.generatedAt + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { dateStyle: 'long' })
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { dateStyle: 'long' });

  // Document evidence
  const extractions: any[] = data?.document_extractions || [];
  const usableDocs = extractions.filter((d: any) => d.is_usable);
  const hasDocuments = usableDocs.length > 0;

  // Country analysis
  const ca = data?.country_analysis || {};
  const fv = data?.financial_verified || {};

  // Score breakdown
  const bd = data?.breakdown;

  // Strengths and risks
  const strengths: string[] = data?.strengths || data?.analysis?.strengths || [];
  const risks: string[] = data?.risks || data?.analysis?.risks || [];
  const uncertainties: string[] = data?.uncertaintyAnalysis?.high_uncertainty_areas || [];

  // Safe Purpose & Employment Parsing to prevent toLowerCase crashes
  const purposeKey = data && data.verification_purpose ? String(data.verification_purpose).toLowerCase() : '';
  const purpose = purposeLabel[purposeKey] || (data ? data.verification_purpose : null) || 'General Financial Verification';
  const empType = employmentLabel[data?.employment_type || ''] || data?.employment_type || '—';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">

      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0 opacity-[0.025] rotate-[-20deg] scale-150 flex flex-wrap gap-16 items-center justify-center">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} className="text-3xl font-black whitespace-nowrap uppercase tracking-[0.4em]">PERSONA.CREDIT</span>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F292F] rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-black uppercase tracking-tight text-slate-900">Persona.Credit</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">Cross-Border Financial Verification</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Report ID</p>
            <p className="text-[11px] font-black text-slate-600">{token ? token.slice(0, 14).toUpperCase() : '—'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-10 space-y-6 relative z-10">

        {/* ── HERO: Score + Summary ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
        >
          {/* Purpose badge */}
          <div className="flex items-center gap-2 mb-6">
            <Pill label={purpose} variant="blue" />
            {data?.analysis_status === 'limited_confidence' && (
              <Pill label="Limited Evidence — Review Recommended" variant="amber" />
            )}
            {data?.analysis_status === 'success' && hasDocuments && (
              <Pill label="Document-Verified" variant="green" />
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Score circle */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="72" stroke="#F1F5F9" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="80" cy="80" r="72"
                  stroke={score >= 720 ? '#10B981' : score >= 620 ? '#3B82F6' : score >= 520 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="10" fill="none"
                  strokeDasharray={2 * Math.PI * 72}
                  initial={{ strokeDashoffset: 2 * Math.PI * 72 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 72 * (1 - (score - 300) / 550) }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{score}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">TransferScore™</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${sc.bg} ${sc.text} ${sc.border}`}>
                  {data?.level || 'Assessed'}
                </span>
                <span className={`text-[10px] font-bold ${conf.color}`}>
                  Analysis Confidence: {conf.label} ({((data?.confidence || 0) * 100).toFixed(0)}%)
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{data?.fullName || 'Verified Applicant'}</h1>
              <p className="text-[13px] text-slate-600 leading-relaxed border-l-4 border-slate-200 pl-4 italic">
                {data?.summaryStatement || 'Financial profile generated from cross-border documentation.'}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="md:col-span-2 space-y-6">

            {/* ── APPLICANT PROFILE ── */}
            <Section title="Applicant Profile" icon={<Briefcase size={12} />}>
              <Row label="Full Name" value={data?.fullName || '—'} />
              <Row label="Origin Country" value={data?.origin_country || '—'} />
              <Row label="Destination Country" value={data?.destination_country || '—'} />
              <Row label="Purpose of Application" value={purpose} />
              <Row label="Employment Type" value={empType} />
              <Row label="Report Generated" value={formattedDate} />
              <Row label="Valid Until" value={expiryDate} />
            </Section>

            {/* ── INCOME & FINANCIAL SUMMARY ── */}
            <Section title="Income & Financial Summary" icon={<DollarSign size={12} />} dark>
              {hasDocuments ? (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-[9px] font-bold uppercase text-white/40 tracking-widest mb-1">Verified Monthly Income</p>
                      <p className="text-2xl font-black text-white">
                        {fmt(fv.verified_monthly_income_local, fv.verified_currency || '')}
                      </p>
                      <p className="text-[10px] text-white/50 mt-1">
                        ≈ ${fmt