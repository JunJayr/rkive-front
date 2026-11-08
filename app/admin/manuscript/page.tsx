'use client';

import { useMemo, useState } from 'react';
import { FiBookOpen, FiSearch, FiFilter, FiCheck, FiX, FiEdit3, FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Sidebar from '@/components/common/admin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useGetAdminManuscriptsQuery, useReviewManuscriptMutation } from '@/redux/features/authApiSlice';

type Manuscript = {
  manuscriptID: number;
  title: string;
  description?: string;
  authors?: string[];
  department?: string | null;
  program?: string | null;
  year_completed?: number | null;
  status: string;
  visibility: string;
  allow_download: boolean;
  created_at?: string | null;
  submitted_by?: string | null;
  keywords?: string[];
  category?: string | null;
};

const statusOptions = ['', 'pending', 'under_review', 'revision_required', 'approved', 'rejected'] as const;

function badge(status?: string) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'approved') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (s === 'rejected') return 'bg-red-50 text-red-700 ring-red-200';
  if (s === 'revision_required') return 'bg-amber-50 text-amber-800 ring-amber-200';
  if (s === 'under_review') return 'bg-blue-50 text-[#103F78] ring-blue-200';
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

export default function AdminManuscriptPage() {
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [comments, setComments] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const args = useMemo(() => ({ status: status || undefined, q: query || undefined }), [status, query]);
  const { data = [], isLoading, isError, refetch, isFetching } = useGetAdminManuscriptsQuery(args);
  const [reviewManuscript] = useReviewManuscriptMutation();

  const onReview = async (m: Manuscript, decision: 'approved' | 'rejected' | 'revision_required') => {
    setBusy(m.manuscriptID);
    setNotice(null);
    try {
      await reviewManuscript({ manuscriptID: m.manuscriptID, status: decision, comments: comments[m.manuscriptID] || '' }).unwrap();
      setNotice({ type: 'ok', text: `Manuscript #${m.manuscriptID} marked as ${decision.replace('_', ' ')}.` });
      setComments((prev) => ({ ...prev, [m.manuscriptID]: '' }));
      refetch();
    } catch (e: any) {
      setNotice({ type: 'err', text: e?.data?.error || 'Unable to record review decision.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Administration</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">Manuscript Review</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">Review submitted manuscripts and record official approval decisions. Only approved manuscripts become eligible for repository publication based on visibility rules.</p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78]"><FiBookOpen size={26} /></div>
            </header>

            {notice && (
              <div className={`mb-6 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {notice.type === 'ok' ? <FiCheckCircle /> : <FiAlertCircle />} {notice.text}
              </div>
            )}

            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label htmlFor="q" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Search</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="q" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setQuery(q)} placeholder="Title, author, keyword, category..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15" />
                  </div>
                </div>
                <div className="w-full lg:w-56">
                  <label htmlFor="status" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"><FiFilter className="mr-1 inline" />Status</label>
                  <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15">
                    <option value="">All statuses</option>
                    {statusOptions.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setQuery(q)} className="rounded-xl bg-[#103F78] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0b2d57]">Apply</button>
                  <button type="button" onClick={() => { setQ(''); setQuery(''); setStatus(''); refetch(); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FiRefreshCw className={isFetching ? 'animate-spin' : ''} /> Reset</button>
                </div>
              </div>
            </section>

            {isLoading ? (
              <div className="flex min-h-56 items-center justify-center rounded-3xl border border-slate-200 bg-white"><Spinner /></div>
            ) : isError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-700">Unable to load manuscripts. Admin/staff access is required.</div>
            ) : data.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <FiBookOpen className="mx-auto text-slate-300" size={34} />
                <p className="mt-4 font-semibold text-slate-700">No manuscripts found</p>
                <p className="mt-1 text-sm text-slate-500">Try adjusting filters or wait for new submissions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((m: Manuscript) => {
                  const busyRow = busy === m.manuscriptID;
                  return (
                    <article key={m.manuscriptID} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${badge(m.status)}`}>{(m.status || 'pending').replace('_', ' ')}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{m.visibility}</span>
                            {m.allow_download ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#103F78]">download enabled</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">view only</span>}
                          </div>
                          <h2 className="mt-3 text-lg font-bold text-slate-900">{m.title}</h2>
                          <p className="mt-1 text-sm text-slate-600">{(m.authors || []).join(', ') || 'Authors not specified'}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>ID: #{m.manuscriptID}</span>
                            {m.department && <span>{m.department}</span>}
                            {m.program && <span>{m.program}</span>}
                            {m.year_completed && <span>{m.year_completed}</span>}
                            {m.submitted_by && <span>Submitted by: {m.submitted_by}</span>}
                            {m.created_at && <span>Created: {m.created_at}</span>}
                          </div>
                          {(m.keywords?.length || m.category) ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {m.category && <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">{m.category}</span>}
                              {(m.keywords || []).slice(0, 8).map((k) => <span key={k} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{k}</span>)}
                            </div>
                          ) : null}
                          {m.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{m.description}</p> : null}
                        </div>

                        <div className="w-full shrink-0 xl:w-[22rem]">
                          <label htmlFor={`comments-${m.manuscriptID}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Review note (optional)</label>
                          <textarea
                            id={`comments-${m.manuscriptID}`}
                            value={comments[m.manuscriptID] || ''}
                            onChange={(e) => setComments((prev) => ({ ...prev, [m.manuscriptID]: e.target.value }))}
                            rows={3}
                            placeholder="Add context for approval, revision, or rejection..."
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" disabled={busyRow} onClick={() => onReview(m, 'approved')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"><FiCheck size={14} /> Approve</button>
                            <button type="button" disabled={busyRow} onClick={() => onReview(m, 'revision_required')} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60"><FiEdit3 size={14} /> Request revision</button>
                            <button type="button" disabled={busyRow} onClick={() => onReview(m, 'rejected')} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"><FiX size={14} /> Reject</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
