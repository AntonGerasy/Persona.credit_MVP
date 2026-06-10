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

  const score = data.score || 0;
  const sc = scoreColor(score);
  const conf = confidenceLabel(data.confidence || 0);

  const formattedDate = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'long' })
    : new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  const expiryDate = data.generatedAt
    ? new Date(data.generatedAt + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { dateStyle: 'long' })
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { dateStyle: 'long' });

  // Document evidence
  const extractions: any[] = data.document_extractions || [];
  const usableDocs = extractions.filter((d: any) => d.is_usable);
  const hasDocuments = usableDocs.length > 0;

  // Country analysis
  const ca = data.country_analysis || {};
  const fv = data.financial_verified || {};

  // Score breakdown
  const bd = data.breakdown;

  // Strengths and risks
  const strengths: string[] = data.strengths || data.analysis?.strengths || [];
  const risks: string[] = data.risks || data.analysis?.risks || [];
  const uncertainties: string[] = data.uncertaintyAnalysis?.high_uncertainty_areas || [];

  // Purpose
  const purpose = purposeLabel[data.verification_purpose || ''] || 'Financial Verification';
  const empType = employmentLabel[data.employment_type || ''] || data.employment_type || '—';

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
            <p className="text-[11px] font-black text-slate-600">{(token || '').slice(0, 14).toUpperCase()}</p>
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
            {data.analysis_status === 'limited_confidence' && (
              <Pill label="Limited Evidence — Review Recommended" variant="amber" />
            )}
            {data.analysis_status === 'success' && hasDocuments && (
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
                  {data.level || 'Assessed'}
                </span>
                <span className={`text-[10px] font-bold ${conf.color}`}>
                  Analysis Confidence: {conf.label} ({((data.confidence || 0) * 100).toFixed(0)}%)
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{data?.fullName || data?.full_name || 'Verified Applicant'}</h1>
              <p className="text-[13px] text-slate-600 leading-relaxed border-l-4 border-slate-200 pl-4 italic">
                {data.summaryStatement || data.summary_statement || 'Financial profile generated from cross-border documentation.'}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="md:col-span-2 space-y-6">

            {/* ── APPLICANT PROFILE ── */}
            <Section title="Applicant Profile" icon={<Briefcase size={12} />}>
              <Row label="Full Name" value={data.fullName || '—'} />
              <Row label="Origin Country" value={data.origin_country || '—'} />
              <Row label="Destination Country" value={data.destination_country || '—'} />
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
                        ≈ ${fmt(fv.verified_income_usd_estimate)} USD/month
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-white/40 tracking-widest mb-1">Income Percentile (Origin)</p>
                      <p className="text-2xl font-black text-white">
                        {ca.origin_income_percentile ? `Top ${100 - ca.origin_income_percentile}%` : '—'}
                      </p>
                      <p className="text-[10px] text-white/50 mt-1">in {data.origin_country}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-white/40 tracking-widest mb-1">Documents Analysed</p>
                      <p className="text-2xl font-black text-white">{usableDocs.length}</p>
                      <p className="text-[10px] text-white/50 mt-1">
                        {fv.document_coverage_months ? `covering ~${fv.document_coverage_months} months` : 'uploaded documents'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-white/40 tracking-widest mb-1">Sector Demand in {data.destination_country}</p>
                      <p className="text-lg font-black text-white leading-tight">{ca.sector_demand_in_destination || '—'}</p>
                    </div>
                  </div>

                  {/* Income context paragraph */}
                  {ca.origin_income_context && (
                    <div className="bg-white/5 rounded-xl p-4 mb-4">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">Income in Origin Country Context</p>
                      <p className="text-[12px] text-white/80 leading-relaxed">{ca.origin_income_context}</p>
                    </div>
                  )}

                  {/* Income transfer narrative — the key paragraph for lenders */}
                  {ca.income_transfer_narrative && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">
                        What This Means for You as a Lender
                      </p>
                      <p className="text-[13px] text-white leading-relaxed font-medium">{ca.income_transfer_narrative}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-start gap-3 bg-amber-500/10 rounded-xl p-4">
                  <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-300">No documents uploaded</p>
                    <p className="text-[10px] text-white/50 mt-1">
                      Income figures below are self-declared by the applicant and have not been verified against documents.
                    </p>
                  </div>
                </div>
              )}
            </Section>

            {/* ── DOCUMENT EVIDENCE ── */}
            <Section title="Document Evidence" icon={<FileText size={12} />}>
              {hasDocuments ? (
                <div className="space-y-4">
                  {usableDocs.map((doc: any, idx: number) => (
                    <div key={idx} className="border border-slate-100 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-[12px] font-bold text-slate-800">{doc.document_type}</p>
                          <p className="text-[10px] text-slate-400">{doc.issuing_institution} · {doc.issuing_country}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <CheckCircle size={12} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-600">Usable</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        {doc.period_covered && (
                          <div>
                            <span className="text-slate-400">Period: </span>
                            <span className="font-semibold">{doc.period_covered}</span>
                          </div>
                        )}
                        {doc.average_monthly_inflow > 0 && (
                          <div>
                            <span className="text-slate-400">Avg monthly inflow: </span>
                            <span className="font-bold text-slate-800">{fmt(doc.average_monthly_inflow, doc.currency_code)}</span>
                          </div>
                        )}
                        {doc.ending_balance > 0 && (
                          <div>
                            <span className="text-slate-400">Ending balance: </span>
                            <span className="font-semibold">{fmt(doc.ending_balance, doc.currency_code)}</span>
                          </div>
                        )}
                        {doc.income_regularity && (
                          <div>
                            <span className="text-slate-400">Income pattern: </span>
                            <span className="font-semibold">{doc.income_regularity}</span>
                          </div>
                        )}
                        {doc.asset_type && doc.asset_type !== 'N/A' && doc.asset_type !== '' && (
                          <div>
                            <span className="text-slate-400">Asset type: </span>
                            <span className="font-semibold">{doc.asset_type}</span>
                          </div>
                        )}
                        {doc.asset_estimated_value_local > 0 && (
                          <div>
                            <span className="text-slate-400">Asset value: </span>
                            <span className="font-bold text-slate-800">{fmt(doc.asset_estimated_value_local, doc.currency_code)}</span>
                          </div>
                        )}
                      </div>

                      {doc.name_match && (
                        <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-semibold ${
                          doc.name_match === 'Match' ? 'text-emerald-600' :
                          doc.name_match === 'Partial match' ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {doc.name_match === 'Match' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                          Name on document: {doc.name_match}
                        </div>
                      )}

                      {doc.analyst_note && (
                        <p className="mt-3 text-[10px] text-slate-500 italic leading-relaxed border-t border-slate-50 pt-3">
                          {doc.analyst_note}
                        </p>
                      )}

                      {doc.authenticity_concerns?.length > 0 && (
                        <div className="mt-3 bg-amber-50 rounded-lg p-3">
                          <p className="text-[10px] font-bold text-amber-700 mb-1">Document Notes</p>
                          {(doc.authenticity_concerns || []).map((c: string, i: number) => (
                            <p key={i} className="text-[10px] text-amber-600">{c}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Unusable docs notice */}
                  {extractions.filter((d: any) => !d.is_usable).map((doc: any, idx: number) => (
                    <div key={`unusable-${idx}`} className="border border-red-100 rounded-xl p-4 bg-red-50 flex items-start gap-3">
                      <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-red-700">Document could not be processed</p>
                        <p className="text-[10px] text-red-500">{doc.rejection_reason || 'File was unreadable or irrelevant.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-[12px] font-semibold">No documents were uploaded</p>
                  <p className="text-[11px] mt-1">This profile is based on self-declared information only.</p>
                </div>
              )}
            </Section>

            {/* ── SCORE BREAKDOWN ── */}
            {bd && (
              <Section title="Score Breakdown" icon={<TrendingUp size={12} />}>
                {[
                  { label: 'Identity Reliability', value: bd.identityScore },
                  { label: 'Financial Stability', value: bd.incomeScore },
                  { label: 'Cross-Border Transferability', value: bd.crossBorderScore },
                  { label: 'Migration Resilience', value: bd.housingScore },
                  { label: 'Behavioral Consistency', value: bd.paymentScore },
                ].map(({ label, value }) => (
                  <div key={label} className="mb-4">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-600">{label}</span>
                      <span className="font-black text-slate-800">{value?.toFixed(0) ?? '—'}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          (value ?? 0) >= 70 ? 'bg-emerald-500' :
                          (value ?? 0) >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${value ?? 0}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* ── STRENGTHS & RISK FACTORS ── */}
            {(strengths.length > 0 || risks.length > 0) && (
              <Section title="Strengths & Risk Factors" icon={<CheckCircle size={12} />}>
                {strengths.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">Strengths</p>
                    <div className="space-y-2">
                      {strengths.slice(0, 5).map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-[12px] text-slate-700">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {risks.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3">Considerations</p>
                    <div className="space-y-2">
                      {risks.slice(0, 5).map((r: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[12px] text-slate-700">{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {uncertainties.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Data Gaps</p>
                    <div className="space-y-2">
                      {uncertainties.slice(0, 3).map((u: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Clock size={12} className="text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-[12px] text-slate-500">{u}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-6">

            {/* Verification status */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-5">Verification Status</p>
              <div className="space-y-3">
                {[
                  {
                    label: 'Documents Uploaded',
                    ok: hasDocuments,
                    note: hasDocuments ? `${usableDocs.length} document(s) analysed` : 'None provided',
                  },
                  {
                    label: 'Income Verified',
                    ok: (fv.verified_monthly_income_local ?? 0) > 0,
                    note: (fv.verified_monthly_income_local ?? 0) > 0 ? 'From document extraction' : 'Self-declared only',
                  },
                  {
                    label: 'Name Consistency',
                    ok: usableDocs.some((d: any) => d.account_holder_name_match === 'Match'),
                    note: usableDocs.some((d: any) => d.account_holder_name_match === 'Match')
                      ? 'Name matches document(s)'
                      : usableDocs.length > 0 ? 'Partial or no match' : 'No documents to check',
                  },
                  {
                    label: 'Anti-Fraud Check',
                    ok: (data.analysis?.fraud_risk ?? 50) < 40,
                    note: (data.analysis?.fraud_risk ?? 50) < 40 ? 'No significant flags' : 'Review recommended',
                  },
                ].map(({ label, ok, note }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    {ok
                      ? <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      : <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">{label}</p>
                      <p className="text-[10px] text-slate-400">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validity */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Calendar size={12} />
                Document Validity
              </div>
              <p className="text-[11px] font-semibold text-slate-600">Generated: <span className="text-slate-800">{formattedDate}</span></p>
              <p className="text-[11px] font-semibold text-slate-600 mt-2">Expires: <span className="text-slate-800">{expiryDate}</span></p>
              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                This report reflects the applicant's financial standing at the time of generation.
                Significant life events after this date are not reflected.
              </p>
            </div>

            {/* Origin country flag */}
            {ca.currency_risk !== null && ca.currency_risk !== undefined && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={12} />
                  Origin Currency Risk
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        ca.currency_risk < 30 ? 'bg-emerald-500' :
                        ca.currency_risk < 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${ca.currency_risk}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-black text-slate-600">{ca.currency_risk}/100</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                  {ca.currency_risk < 30
                    ? 'Low currency volatility. Income figures are reliable without significant adjustment.'
                    : ca.currency_risk < 60
                    ? 'Moderate volatility. USD equivalent figures provided are approximate.'
                    : 'High volatility. USD equivalents should be verified at current exchange rates.'}
                </p>
              </div>
            )}

            {/* For the lender notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">For the Lender</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                This report was generated by Persona.Credit, an AI-powered cross-border
                financial verification service. It is intended to help lenders understand
                applicants whose financial history exists in a different country and currency.
                Income figures are extracted from uploaded documents and contextualised
                against origin-country economic data. This report does not constitute a
                credit bureau record.
              </p>
              <a
                href="https://persona.credit"
                className="text-[10px] font-bold text-blue-500 mt-3 block hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                persona.credit
              </a>
            </div>

          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-slate-100 mt-16">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} Persona.Credit &bull; Cross-Border Financial Verification
        </p>
        <p className="text-[9px] text-slate-300 mt-2">
          Report ID: {(token || '').slice(0, 20).toUpperCase()} &bull; Confidential — for intended recipient only
        </p>
      </footer>
    </div>
  );
};

export default ReportViewerPage;
