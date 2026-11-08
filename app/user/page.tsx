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
} from 'react-icons/fi';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';
import { useSearchManuscriptsQuery } from '@/redux/features/authApiSlice';

const quickActions = [
  {
    title: 'Browse Research',
    description: 'Search and filter approved manuscripts in the repository.',
    href: '/user/search',
    icon: FiSearch,
    accent: 'bg-[#103F78] text-white',
  },
  {
    title: 'My Collection',
    description: 'Open manuscripts you’ve saved for quick access.',
    href: '/user/bookmarks',
    icon: FiBookmark,
    accent: 'bg-[#FBBF24] text-[#103F78]',
  },
  {
    title: 'Submit Manuscript',
    description: 'Upload your manuscript for review and approval.',
    href: '/user/submit-study',
    icon: FiUploadCloud,
    accent: 'bg-white text-[#103F78] ring-1 ring-slate-200',
  },
  {
    title: 'Defense Workflow',
    description: 'Apply for concept, proposal, and final defense steps.',
    href: '/user/defense-application',
    icon: FiClipboard,
    accent: 'bg-white text-[#103F78] ring-1 ring-slate-200',
  },
];

export default function UserDashboardPage() {
  const { data, isLoading } = useSearchManuscriptsQuery({ sort: 'newest' } as any);
  const recent = (Array.isArray(data) ? data : (data as any)?.results ?? []).slice(0, 4);

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 pb-12 pt-20 sm:px-6 md:pt-8 lg:px-10">
            <div className="mx-auto w-full max-w-6xl">
              <section className="relative overflow-hidden rounded-[28px] bg-[#103F78] px-6 py-8 shadow-[0_24px_60px_-24px_rgba(16,63,120,0.55)] sm:px-8 sm:py-10">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/5" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-[#FBBF24]/10" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FBBF24]">Student/User Workspace</p>
                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Welcome to RKIVE</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/85 sm:text-[15px]">
                    Discover approved research, manage your collection, and move through your submission and defense workflow in one place.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/user/search" className="inline-flex items-center gap-2 rounded-xl bg-[#FBBF24] px-5 py-3 text-sm font-bold text-[#103F78] transition hover:bg-amber-300">
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
                        <h3 className="mt-4 text-[15px] font-bold text-slate-800 group-hover:text-[#103F78]">{action.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-slate-500">{action.description}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><FiClock className="text-[#103F78]" /> Recently added research</p>
                      <p className="mt-0.5 text-xs text-slate-500">Approved manuscripts from the repository</p>
                    </div>
                    <Link href="/user/search?sort=newest" className="text-xs font-bold text-[#103F78] hover:underline">View all</Link>
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
                          <Link href={`/user/repository/${m.manuscriptID}`} className="block px-5 py-4 transition hover:bg-[#F6F8FC] sm:px-6">
                            <p className="line-clamp-1 text-sm font-bold text-slate-800 hover:text-[#103F78]">{m.title || 'Untitled Manuscript'}</p>
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]">
                    <FiCompass size={20} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-800">How to use RKIVE</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FBBF24]" /><span><b className="text-slate-700">Browse Research</b> to find approved manuscripts with search and filters.</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FBBF24]" /><span><b className="text-slate-700">Save</b> manuscripts to your collection for quick access later.</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FBBF24]" /><span><b className="text-slate-700">Submit &amp; Defense</b> tools help you manage your research workflow.</span></li>
                  </ul>
                  <Link href="/user/search" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#103F78] hover:underline">
                    Open repository <FiArrowRight size={15} />
                  </Link>
                </div>
              </section>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </Layout>
  );
}
