'use client';

import Link from 'next/link';
import { FiArrowRight, FiCheckCircle, FiClock, FiFileText, FiLock } from 'react-icons/fi';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Layout from '@/components/utils/Layout';
import Spinner from '@/components/common/Spinner';
import {
  useGetWorkflowStatusQuery,
  useGetApplicationsQuery,
  type WorkflowStage,
} from '@/redux/features/authApiSlice';

const STAGE_COPY: Record<string, { description: string; cta: string }> = {
  concept: {
    description: 'Prepare and generate your concept defense application details and document.',
    cta: 'Open concept defense',
  },
  proposal: {
    description: 'Submit your proposal defense application after concept approval in your workflow.',
    cta: 'Open proposal defense',
  },
  final: {
    description: 'Prepare your final defense application and related manuscript submission requirements.',
    cta: 'Open final defense',
  },
  manuscript: {
    description: 'Submit the approved manuscript to the institutional repository after final defense approval.',
    cta: 'Submit manuscript',
  },
};

function statusStyle(status?: string | null): string {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-800';
    case 'submitted':
    case 'pending': return 'bg-blue-100 text-blue-800';
    case 'rejected': return 'bg-rose-100 text-rose-800';
    case 'revision_required': return 'bg-amber-100 text-amber-800';
    default: return 'bg-slate-100 text-slate-600';
  }
}

export default function DefenseApplicationHub() {
  const { data: workflowStatus, isLoading } = useGetWorkflowStatusQuery();
  const { data: applications = [] } = useGetApplicationsQuery({ scope: 'mine' });

  const stages = workflowStatus?.stages ?? [];

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-12">
            <div className="mx-auto w-full max-w-5xl">
              <header className="mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Academic Workflow</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">Defense Applications</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Track Concept Defense → Proposal Defense → Final Defense → Manuscript. Each stage unlocks after the previous one is approved.
                </p>
              </header>

              {isLoading && (
                <div className="mb-6 flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white"><Spinner /></div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {stages.map((stage, index) => {
                  const copy = STAGE_COPY[stage.key] ?? { description: '', cta: 'Open' };
                  const app = applications.find((item) => item.application_id === stage.application_id);
                  const href = stage.key === 'manuscript'
                    ? '/user/submit-study'
                    : `/user/defense-application/${stage.key as WorkflowStage}`;
                  return (
                    <div key={stage.key} className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]">
                          <FiFileText size={20} />
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">Step {index + 1}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle(stage.status)}`}>
                            {stage.status ? stage.status.replace('_', ' ') : 'not started'}
                          </span>
                        </div>
                      </div>
                      <h2 className="mt-4 text-lg font-bold text-slate-900">{stage.label}</h2>
                      <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{copy.description}</p>
                      {!!app?.submit_blockers?.length && (
                        <p className="mt-3 text-xs font-semibold text-amber-700">
                          {app.submit_blockers[0]}
                        </p>
                      )}
                      <Link
                        href={href}
                        aria-disabled={!stage.available}
                        className={`mt-5 inline-flex items-center gap-2 text-sm font-bold ${stage.available ? 'text-[#103F78]' : 'cursor-not-allowed text-slate-400'}`}
                        onClick={(event) => { if (!stage.available) event.preventDefault(); }}
                      >
                        {stage.available ? <FiArrowRight className="transition group-hover:translate-x-0.5" /> : <FiLock />}
                        {stage.available ? copy.cta : `Requires ${stage.requires.join(' + ') || 'previous stage'}`}
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-slate-700">
                  <FiClock className="text-[#103F78]" /> Review decisions are recorded by assigned panel/faculty.
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-slate-700">
                  <FiCheckCircle className="text-emerald-600" /> Approved manuscripts can be published to the repository.
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </Layout>
  );
}
