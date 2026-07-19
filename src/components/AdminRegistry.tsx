import React, { useEffect, useState } from 'react';
import { getSession } from '../lib/session';

/**
 * AdminRegistry (v34.20) — the live traction panel behind the USER REGISTRY
 * button on the admin dashboard. Talks to /api/admin, which re-verifies the
 * ADMIN_EMAIL gate server-side on every call.
 */

type RegistryUser = {
  email: string;
  createdAt: number | null;
  hasReport: boolean;
  score: number | null;
  level: string | null;
  reportGeneratedAt: number | null;
  currentStep: number | null;
  plan: string | null;
};

type Counters = {
  totalSignups: number;
  reachedReport: number;
  inProgress: number;
  reportsGeneratedTotal: number;
  providerSignups: number;
};

const fmtDate = (ts: number | null): string => (ts ? new Date(ts).toLocaleString() : '—');

const AdminRegistry: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counters, setCounters] = useState<Counters | null>(null);
  const [users, setUsers] = useState<RegistryUser[]>([]);
  const [openReportFor, setOpenReportFor] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const callAdmin = async (body: Record<string, unknown>) => {
    const session = getSession();
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, token: session?.token || '' }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(data?.error || `Request failed (${response.status})`));
    return data;
  };

  useEffect(() => {
    callAdmin({ action: 'stats' })
      .then((data) => {
        setCounters(data.counters);
        setUsers(Array.isArray(data.users) ? data.users : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewReport = (email: string) => {
    if (openReportFor === email) { setOpenReportFor(null); setReport(null); return; }
    setOpenReportFor(email);
    setReport(null);
    setReportLoading(true);
    callAdmin({ action: 'get_report', email })
      .then((data) => setReport(data.report))
      .catch((err) => setReport({ error: err.message }))
      .finally(() => setReportLoading(false));
  };

  const statusChip = (u: RegistryUser) => {
    if (u.hasReport) return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Report · {u.score}</span>;
    if (u.currentStep !== null) return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest">Form step {u.currentStep + 1}</span>;
    return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">Registered</span>;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/60 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-brand-border">
          <div>
            <h3 className="text-lg font-black text-brand-dark uppercase tracking-widest">User Registry</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live traction — visible only to the admin account.</p>
          </div>
          <button onClick={onClose} className="px-5 py-2 border border-brand-border rounded-xl font-bold uppercase tracking-widest text-[10px] text-brand-dark hover:bg-slate-50 transition-all">Close</button>
        </div>

        <div className="overflow-y-auto px-8 py-6">
          {loading && <p className="text-sm text-slate-500">Loading registry…</p>}
          {error && <div className="text-xs font-bold rounded-lg px-4 py-3 bg-red-50 text-red-600">{error}</div>}

          {counters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {[
                { label: 'Signups', value: counters.totalSignups },
                { label: 'Reached report', value: counters.reachedReport },
                { label: 'In progress', value: counters.inProgress },
                { label: 'Reports total', value: counters.reportsGeneratedTotal },
                { label: 'Provider signups', value: counters.providerSignups },
              ].map((c) => (
                <div key={c.label} className="p-4 bg-slate-50 border border-brand-border rounded-xl">
                  <p className="text-2xl font-black text-brand-dark leading-none">{c.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray mt-2">{c.label}</p>
                </div>
              ))}
            </div>
          )}

          {users.length > 0 && (
            <div className="border border-brand-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brand-gray">Email</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brand-gray">Signed up</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brand-gray">Status</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brand-gray">Last report</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <React.Fragment key={u.email}>
                      <tr className="border-t border-brand-border">
                        <td className="px-4 py-3 text-xs font-bold text-brand-dark">{u.email}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(u.createdAt)}</td>
                        <td className="px-4 py-3">{statusChip(u)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(u.reportGeneratedAt)}</td>
                        <td className="px-4 py-3 text-right">
                          {u.hasReport && (
                            <button onClick={() => viewReport(u.email)} className="text-[10px] font-bold uppercase tracking-widest text-brand-blue hover:underline underline-offset-4">
                              {openReportFor === u.email ? 'Hide' : 'View report'}
                            </button>
                          )}
                        </td>
                      </tr>
                      {openReportFor === u.email && (
                        <tr className="border-t border-brand-border bg-slate-50/60">
                          <td colSpan={5} className="px-6 py-5">
                            {reportLoading && <p className="text-xs text-slate-500">Loading report…</p>}
                            {report?.error && <p className="text-xs font-bold text-red-600">{report.error}</p>}
                            {report && !report.error && (
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-6 text-xs text-brand-dark">
                                  <span><b>{report.fullName || '—'}</b></span>
                                  <span>Score: <b>{report.score ?? '—'}</b> ({report.level ?? '—'})</span>
                                  <span>Confidence: <b>{report.confidence != null ? Math.round(report.confidence * 100) + '%' : '—'}</b></span>
                                  <span>Verified income: <b>{report.reconciliation?.verified_monthly_usd ? '$' + Number(report.reconciliation.verified_monthly_usd).toLocaleString() + '/mo' : '—'}</b></span>
                                  {report.shareId && <span>Report ID: <b>{report.shareId}</b></span>}
                                </div>
                                {report.summaryStatement && (
                                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{report.summaryStatement}</p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <p className="text-sm text-slate-500">No signups yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRegistry;
