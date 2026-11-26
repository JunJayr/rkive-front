'use client';

import Link from 'next/link';
import {
  FiSearch,
  FiBookmark,
  FiUploadCloud,
  FiClipboard,
  FiArrowRight,
  FiBookOpen,
  FiCompass,
  FiClock,
  FiLock,
} from 'react-icons/fi';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';
import { StudentAcademicTools } from '@/components/common/academic/AcademicWorkflowTools';
import { useGetWorkflowStatusQuery, useSearchManuscriptsQuery } from '@/redux/features/authApiSlice';

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

function workflowHref(stage: { key: string; nomination_id?: number | null }): string {
  if (stage.key === 'manuscript') return '/user/submit-study';
  if (stage.key === 'panel_nomination') {
    return `/user/panel-nomination${stage.nomination_id ? `?nomination_id=${stage.nomination_id}` : ''}`;
  }
  return `/user/defense-application/${stage.key}`;
}

const quickActions = [
  {
    title: 'Browse Research',
    description: 'Search and filter approved manuscripts in the repository.',
    href: '/user/search',
    icon: FiSearch,
    accent: 'bg-[#12186E] text-white',
  },
  {
    title: 'My Collection',
    description: 'Open manuscripts you’ve saved for quick access.',
    href: '/user/bookmarks',
    icon: FiBookmark,
    accent: 'bg-[#F9B515] text-[#12186E]',
  },
  {
    title: 'Submit Manuscript',
    description: 'Upload your manuscript for review and approval.',
    href: '/user/submit-study',
    icon: FiUploadCloud,
    accent: 'bg-white text-[#12186E] ring-1 ring-slate-200',
  },
  {
    title: 'Defense Workflow',
    description: 'Track panel nomination, concept, proposal, and final defense steps.',
    href: '/user/defense-application',
    icon: FiClipboard,
    accent: 'bg-white text-[#12186E] ring-1 ring-slate-200',
  },
];

export default function UserDashboardPage() {
  const { data, isLoading } = useSearchManuscriptsQuery({ sort: 'newest' } as any);
  const { data: workflowStatus, isLoading: workflowLoading } = useGetWorkflowStatusQuery();
  const recent = (Array.isArray(data) ? data : (data as any)?.results ?? []).slice(0, 4);
  const stages = workflowStatus?.stages ?? [];

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#FAF9F6] text-slate-800">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 pb-12 pt-20 sm:px-6 md:pt-8 lg:px-10">
            <div className="mx-auto w-full max-w-6xl">
              <section className="relative overflow-hidden rounded-[28px] bg-[#12186E] px-6 py-8 shadow-[0_24px_60px_-24px_rgba(16,63,120,0.55)] sm:px-8 sm:py-10">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/5" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-[#F9B515]/10" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F9B515]">Student/User Workspace</p>
                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Welcome to RKIVE</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/85 sm:text-[15px]">
                    Discover approved research, manage your collection, and move through your submission and defense workflow in one place.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/user/search" className="inline-flex items-center gap-2 rounded-xl bg-[#F9B515] px-5 py-3 text-sm font-bold text-[#12186E] transition hover:bg-amber-300">
                      <FiSearch size={17} /> Browse Research
                    </Link>
                    <Link href="/user/submit-study" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/15">
                      Submit Manuscript <FiArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Quick actions</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.href} href={action.href} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.accent}`}>
                          <Icon size={20} />
                        </div>
                        <h3 className="mt-4 text-[15px] font-bold text-slate-800 group-hover:text-[#12186E]">{action.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-slate-500">{action.description}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Your defense workflow</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Stages unlock in order after the previous stage is approved.
                    </p>
                  </div>
                  <Link href="/user/defense-application" className="text-xs font-bold text-[#12186E] hover:underline">
                    Open all applications
                  </Link>
                </div>
                {workflowLoading ? (
                  <div className="flex min-h-24 items-center justify-center"><Spinner /></div>
                ) : (
                  <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {stages.map((stage, index) => (
                      <li key={stage.key} className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#12186E]">{index + 1}</span>
                            <span className="text-sm font-bold text-slate-800">{stage.label}</span>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle(stage.status)}`}>
                            {stage.status ? stage.status.replace('_', ' ') : 'not started'}
                          </span>
                        </div>
                        {!stage.available && !!stage.reason && (
                          <p className="mt-2 text-xs font-semibold text-amber-700">{stage.reason}</p>
                        )}
                        <Link
                          href={workflowHref(stage)}
                          aria-disabled={!stage.available}
                          onClick={(event) => { if (!stage.available) event.preventDefault(); }}
                          className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold ${stage.available ? 'text-[#12186E] hover:underline' : 'cursor-not-allowed text-slate-400'}`}
                        >
                          {stage.available ? 'Open stage' : <><FiLock size={13} /> Locked</>}
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><FiClock className="text-[#12186E]" /> Recently added research</p>
                      <p className="mt-0.5 text-xs text-slate-500">Approved manuscripts from the repository</p>
                    </div>
                    <Link href="/user/search?sort=newest" className="text-xs font-bold text-[#12186E] hover:underline">View all</Link>
                  </div>
                  {isLoading ? (
                    <div className="flex min-h-[220px] items-center justify-center"><Spinner /></div>
                  ) : recent.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <FiBookOpen className="mx-auto text-slate-300" size={30} />
                      <p className="mt-3 text-sm font-semibold text-slate-700">No approved manuscripts yet</p>
                      <p className="mt-1 text-sm text-slate-500">Published research will appear here once approved.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {recent.map((m: any) => (
                        <li key={m.manuscriptID}>
                          <Link href={`/user/repository/${m.manuscriptID}`} className="block px-5 py-4 transition hover:bg-[#FAF9F6] sm:px-6">
                            <p className="line-clamp-1 text-sm font-bold text-slate-800 hover:text-[#12186E]">{m.title || 'Untitled Manuscript'}</p>
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                              {(m.authors ?? []).join(', ') || 'Unknown author'}{m.year_completed ? ` · ${m.year_completed}` : ''}
                            </p>
                            {(m.department || m.program) && (
                              <p className="mt-1 text-[11px] font-medium text-slate-400">{[m.department, m.program].filter(Boolean).join(' · ')}</p>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#12186E]">
                    <FiCompass size={20} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-800">How to use RKIVE</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F9B515]" /><span><b className="text-slate-700">Browse Research</b> to find approved manuscripts with search and filters.</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F9B515]" /><span><b className="text-slate-700">Save</b> manuscripts to your collection for quick access later.</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F9B515]" /><span><b className="text-slate-700">Submit &amp; Defense</b> tools help you manage your research workflow.</span></li>
                  </ul>
                  <Link href="/user/search" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#12186E] hover:underline">
                    Open repository <FiArrowRight size={15} />
                  </Link>
                </div>
              </section>

              <section id="academic-tools" className="mt-6">
                <h2 className="rk-section-title mb-1">Academic support</h2>
                <p className="mb-4 text-xs text-mutedSlate">
                  Request mentorship from a Panel / Adviser and track revision items across your defense applications. Panel verification is recorded separately.
                </p>
                <StudentAcademicTools />
              </section>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </Layout>
  );
}
