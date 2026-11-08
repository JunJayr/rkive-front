'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiEdit3, FiClock, FiCheckCircle, FiAlertCircle, FiFileText, FiBookOpen } from 'react-icons/fi';
import PanelSidebar from '@/components/common/panel/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import {
  useGetFacultyQueueQuery,
  useReviewFacultyApplicationMutation,
  useReviewManuscriptMutation,
} from '@/redux/features/authApiSlice';

type QueueItem = {
  type: string;
  id: number;
  research_title?: string;
  lead_researcher?: string;
  department?: string;
  adviser?: string;
  datetime_defense?: string;
  created_at?: string | null;
  latest_status?: string;
  latest_comments?: string;
};

type ManuscriptQueueItem = {
  type: string;
  id: number;
  manuscriptID?: number;
  title?: string;
  authors?: string[];
  department?: string | null;
  adviser?: string | null;
  created_at?: string | null;
  latest_status?: string;
  latest_comments?: string;
};

function statusBadge(status?: string) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'approved') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (s === 'rejected') return 'bg-red-50 text-red-700 ring-red-200';
  if (s === 'revision_required') return 'bg-amber-50 text-amber-800 ring-amber-200';
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

function Section({
  title,
  items,
  onReview,
  busyId,
  comments,
  setComment,
}: {
  title: string;
  items: QueueItem[];
  onReview: (item: QueueItem, status: 'approved' | 'rejected' | 'revision_required') => void;
  busyId: string | null;
  comments: Record<string, string>;
  setComment: (key: string, value: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-bold text-[#103F78]">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">No items in this queue.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const key = `${item.type}-${item.id}`;
            const busy = busyId === key;
            return (
              <li key={key} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusBadge(item.latest_status)}`}>
                        {(item.latest_status || 'pending').replace('_', ' ')}
                      </span>
                      {item.department && <span className="text-xs font-medium text-slate-500">{item.department}</span>}
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 sm:text-base">{item.research_title || 'Untitled research'}</h3>
                    <p className="mt-1 text-sm text-slate-600">Lead researcher: {item.lead_researcher || '—'}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {item.adviser && <span>Adviser: {item.adviser}</span>}
                      {item.datetime_defense && <span><FiClock className="mr-1 inline" />{item.datetime_defense}</span>}
                    </div>
                    {item.latest_comments ? <p className="mt-2 text-xs text-slate-500">Latest note: {item.latest_comments}</p> : null}
                  </div>
                  <div className="w-full shrink-0 xl:w-80">
                    <label htmlFor={`note-${key}`} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Review note (optional)</label>
                    <textarea id={`note-${key}`} value={comments[key] || ''} onChange={(e) => setComment(key, e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15" placeholder="Add a note for this decision..." />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" disabled={busy} onClick={() => onReview(item, 'approved')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                        <FiCheck size={14} /> Approve
                      </button>
                      <button type="button" disabled={busy} onClick={() => onReview(item, 'revision_required')} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60">
                        <FiEdit3 size={14} /> Revise
                      </button>
                      <button type="button" disabled={busy} onClick={() => onReview(item, 'rejected')} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
                        <FiX size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ManuscriptSection({
  title,
  items,
  onReview,
  busyId,
  comments,
  setComment,
}: {
  title: string;
  items: ManuscriptQueueItem[];
  onReview: (item: ManuscriptQueueItem, status: 'approved' | 'rejected' | 'revision_required') => void;
  busyId: string | null;
  comments: Record<string, string>;
  setComment: (key: string, value: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#103F78]"><FiBookOpen /> {title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">No manuscripts assigned for your review.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const key = `manuscript-${item.manuscriptID ?? item.id}`;
            const busy = busyId === key;
            return (
              <li key={key} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusBadge(item.latest_status)}`}>
                        {(item.latest_status || 'pending').replace('_', ' ')}
                      </span>
                      {item.department && <span className="text-xs font-medium text-slate-500">{item.department}</span>}
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 sm:text-base">{item.title || 'Untitled manuscript'}</h3>
                    <p className="mt-1 text-sm text-slate-600">Authors: {(item.authors || []).join(', ') || '—'}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Manuscript #{item.manuscriptID ?? item.id}</span>
                      {item.adviser && <span>Adviser: {item.adviser}</span>}
                    </div>
                  </div>
                  <div className="w-full shrink-0 xl:w-80">
                    <label htmlFor={`note-${key}`} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Review note (optional)</label>
                    <textarea id={`note-${key}`} value={comments[key] || ''} onChange={(e) => setComment(key, e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15" placeholder="Add a note for this decision..." />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" disabled={busy} onClick={() => onReview(item, 'approved')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                        <FiCheck size={14} /> Approve
                      </button>
                      <button type="button" disabled={busy} onClick={() => onReview(item, 'revision_required')} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60">
                        <FiEdit3 size={14} /> Revise
                      </button>
                      <button type="button" disabled={busy} onClick={() => onReview(item, 'rejected')} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
                        <FiX size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function PanelDashboardPage() {
  const { data, isLoading, isError, refetch } = useGetFacultyQueueQuery();
  const [reviewApp, { isLoading: reviewing }] = useReviewFacultyApplicationMutation();
  const [reviewManuscript, { isLoading: reviewingManuscript }] = useReviewManuscriptMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  const setComment = (key: string, value: string) => setComments((prev) => ({ ...prev, [key]: value }));

  const onReview = async (item: QueueItem, status: 'approved' | 'rejected' | 'revision_required') => {
    const key = `${item.type}-${item.id}`;
    setBusyId(key);
    setNotice(null);
    try {
      await reviewApp({ type: item.type, id: item.id, status, comments: comments[key] || '' }).unwrap();
      setNotice({ type: 'ok', text: `Decision recorded: ${status.replace('_', ' ')}.` });
      setComments((prev) => ({ ...prev, [key]: '' }));
      refetch();
    } catch (e: any) {
      setNotice({ type: 'err', text: e?.data?.error || 'Unable to record decision.' });
    } finally {
      setBusyId(null);
    }
  };

  const onReviewManuscript = async (item: ManuscriptQueueItem, status: 'approved' | 'rejected' | 'revision_required') => {
    const id = item.manuscriptID ?? item.id;
    const key = `manuscript-${id}`;
    setBusyId(key);
    setNotice(null);
    try {
      await reviewManuscript({ manuscriptID: id, status, comments: comments[key] || '' }).unwrap();
      setNotice({ type: 'ok', text: `Manuscript decision recorded: ${status.replace('_', ' ')}.` });
      setComments((prev) => ({ ...prev, [key]: '' }));
      refetch();
    } catch (e: any) {
      setNotice({ type: 'err', text: e?.data?.error || 'Unable to record manuscript decision.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FC]">
      <PanelSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-16 pt-24 md:pt-10 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Panel Portal</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#103F78]">Review & Approvals</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Review panel nominations, defense applications, and manuscripts assigned to you. Record approvals, request revisions, or reject with notes for accountability.
              </p>
            </div>

            {notice && (
              <div className={`mb-6 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {notice.type === 'ok' ? <FiCheckCircle /> : <FiAlertCircle />} {notice.text}
              </div>
            )}

            {isLoading && (
              <div className="flex min-h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white"><Spinner /></div>
            )}
            {isError && !isLoading && (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-700">
                Unable to load your review queue. Make sure your account is linked to a faculty profile (for assigned items) or has staff access.
              </div>
            )}
            {data && !isLoading && (
              <div className="space-y-6">
                <ManuscriptSection title="Assigned Manuscripts for Review" items={data.manuscripts_for_review || []} onReview={onReviewManuscript} busyId={busyId || (reviewingManuscript ? 'busy' : null)} comments={comments} setComment={setComment} />
                <Section title="Panel Nominations" items={data.panel_nominations || []} onReview={onReview} busyId={busyId || (reviewing ? 'busy' : null)} comments={comments} setComment={setComment} />
                <Section title="Concept Defense Applications" items={data.concept_defenses || []} onReview={onReview} busyId={busyId} comments={comments} setComment={setComment} />
                <Section title="Proposal Defense Applications" items={data.proposal_defenses || []} onReview={onReview} busyId={busyId} comments={comments} setComment={setComment} />
                <Section title="Final Defense Applications" items={data.final_defenses || []} onReview={onReview} busyId={busyId} comments={comments} setComment={setComment} />
                {(data.other_defenses?.length ?? 0) > 0 && (
                  <Section title="Other Defense Applications" items={data.other_defenses || []} onReview={onReview} busyId={busyId} comments={comments} setComment={setComment} />
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
