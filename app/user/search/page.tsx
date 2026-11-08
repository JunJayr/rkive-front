'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiSearch,
  FiSliders,
  FiX,
  FiBookOpen,
  FiArrowRight,
  FiBookmark,
  FiFileText,
  FiAlertCircle,
} from 'react-icons/fi';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';
import { useSearchManuscriptsQuery } from '@/redux/features/authApiSlice';

type Manuscript = {
  manuscriptID: number;
  title?: string;
  description?: string;
  authors?: string[];
  adviser?: string | null;
  department?: string | null;
  program?: string | null;
  year_completed?: number | null;
  keywords?: string[];
  category?: string | null;
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'year_desc', label: 'Year (newest)' },
  { value: 'year_asc', label: 'Year (oldest)' },
  { value: 'most_viewed', label: 'Most viewed' },
  { value: 'most_downloaded', label: 'Most downloaded' },
];

function normalize(data: any): { results: Manuscript[]; count?: number } {
  if (Array.isArray(data)) return { results: data };
  return { results: data?.results ?? [], count: data?.count };
}

function BrowseResearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('q')?.trim() ?? '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [showFilters, setShowFilters] = useState(false);

  const readFilters = () => ({
    author: searchParams.get('author') ?? '',
    department: searchParams.get('department') ?? '',
    program: searchParams.get('program') ?? '',
    year: searchParams.get('year') ?? '',
    keyword: searchParams.get('keyword') ?? '',
    category: searchParams.get('category') ?? '',
    sort: searchParams.get('sort') ?? 'newest',
  });

  const [filters, setFilters] = useState(readFilters);

  useEffect(() => {
    setSearchTerm(query);
    setFilters(readFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const hasAny = ['author','department','program','year','keyword','category'].some((k) => searchParams.get(k));
    if (hasAny) setShowFilters(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, isFetching, isError } = useSearchManuscriptsQuery({ q: query, ...filters } as any);
  const { results: manuscripts, count } = useMemo(() => normalize(data), [data]);

  const push = (nextQ: string, nextFilters = filters) => {
    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    (Object.entries(nextFilters) as [string, string][]).forEach(([k, v]) => {
      if (!v) return;
      if (k === 'sort' && v === 'newest') return;
      params.set(k, v);
    });
    const qs = params.toString();
    router.push(qs ? `/user/search?${qs}` : '/user/search');
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    push(searchTerm.trim(), filters);
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    push(searchTerm.trim(), next);
  };

  const clearAll = () => {
    const next = { author: '', department: '', program: '', year: '', keyword: '', category: '', sort: 'newest' };
    setFilters(next);
    setSearchTerm('');
    router.push('/user/search');
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && !(k === 'sort' && v === 'newest')).length;
  const busy = isLoading || isFetching;

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 pb-14 pt-20 sm:px-6 md:pt-8 lg:px-10">
            <div className="mx-auto w-full max-w-6xl">
              <header className="rounded-[26px] bg-[#103F78] px-5 py-7 shadow-[0_20px_50px_-24px_rgba(16,63,120,0.55)] sm:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FBBF24]">Repository</p>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Browse Research</h1>
                    <p className="mt-2 text-sm leading-6 text-blue-100/85">
                      Find approved manuscripts by title, author, keyword, program, and more.
                    </p>
                  </div>
                  <Link href="/user/bookmarks" className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/15 hover:bg-white/15">
                    <FiBookmark size={16} /> My Collection
                  </Link>
                </div>

                <form onSubmit={onSearch} className="mt-6 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                    <FiSearch size={20} className="shrink-0 text-slate-400" />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title, topic, or keyword…"
                      aria-label="Search manuscripts"
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-[15px]"
                    />
                    {searchTerm && (
                      <button type="button" aria-label="Clear search text" onClick={() => setSearchTerm('')} className="rounded-md p-1 text-slate-400 hover:text-slate-700">
                        <FiX size={17} />
                      </button>
                    )}
                  </div>
                  <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FBBF24] px-6 text-sm font-bold text-[#103F78] transition hover:bg-amber-300 disabled:opacity-60">
                    {busy ? <Spinner sm /> : <>Search <FiArrowRight size={16} /></>}
                  </button>
                </form>
              </header>

              <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-6">
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setShowFilters((v) => !v)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 lg:cursor-default">
                      <FiSliders size={16} className="text-[#103F78]" /> Filters
                      {activeFilterCount > 0 && <span className="rounded-full bg-[#103F78] px-2 py-0.5 text-[10px] font-bold text-white">{activeFilterCount}</span>}
                    </button>
                    {(activeFilterCount > 0 || query) && (
                      <button type="button" onClick={clearAll} className="text-xs font-semibold text-slate-500 hover:text-[#103F78]">Clear all</button>
                    )}
                  </div>

                  <div className={`${showFilters ? 'mt-4 block' : 'mt-4 hidden lg:block'} space-y-3`}>
                    <div>
                      <label htmlFor="f-sort" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Sort</label>
                      <select id="f-sort" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/10">
                        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    {([
                      ['author', 'Author', 'Author name'],
                      ['department', 'Department', 'Department'],
                      ['program', 'Program', 'Program'],
                      ['year', 'Year', 'e.g. 2026'],
                      ['keyword', 'Keyword', 'Keyword'],
                      ['category', 'Category', 'Category'],
                    ] as const).map(([key, label, placeholder]) => (
                      <div key={key}>
                        <label htmlFor={`f-${key}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>
                        <input id={`f-${key}`} value={(filters as any)[key]} onChange={(e) => updateFilter(key as any, e.target.value)} placeholder={placeholder} inputMode={key === 'year' ? 'numeric' : undefined} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/10" />
                      </div>
                    ))}
                  </div>
                </aside>

                <section className="min-w-0">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">
                        {query ? `Results for “${query}”` : 'Approved research'}
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {busy ? 'Loading…' : `${count ?? manuscripts.length} manuscript${(count ?? manuscripts.length) === 1 ? '' : 's'} found`}
                      </p>
                    </div>
                  </div>

                  {busy && (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
                      <Spinner />
                      <p className="mt-4 text-sm text-slate-500">Searching the repository…</p>
                    </div>
                  )}

                  {isError && !busy && (
                    <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-white px-6 py-14 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500"><FiAlertCircle size={26} /></div>
                      <h3 className="mt-4 font-bold text-slate-800">Unable to load research</h3>
                      <p className="mt-1.5 max-w-md text-sm text-slate-500">Check your connection or session, then try again.</p>
                    </div>
                  )}

                  {!busy && !isError && manuscripts.length === 0 && (
                    <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78]"><FiBookOpen size={26} /></div>
                      <h3 className="mt-4 font-bold text-slate-800">No manuscripts found</h3>
                      <p className="mt-1.5 max-w-md text-sm text-slate-500">
                        {query || activeFilterCount ? 'Try different keywords or clear some filters.' : 'No manuscripts have been approved for publication yet.'}
                      </p>
                      {(query || activeFilterCount > 0) && (
                        <button type="button" onClick={clearAll} className="mt-5 rounded-xl bg-[#103F78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b2d57]">Clear search &amp; filters</button>
                      )}
                    </div>
                  )}

                  {!busy && !isError && manuscripts.length > 0 && (
                    <ul className="space-y-3">
                      {manuscripts.map((m, i) => {
                        const id = m.manuscriptID ?? (m as any).id ?? i;
                        const authors = (m.authors ?? []).join(', ');
                        const meta = [m.department, m.program, m.year_completed].filter(Boolean).join(' · ');
                        return (
                          <li key={id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-blue-200/80 hover:shadow-md">
                            <div className="flex gap-4">
                              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 text-[#103F78] ring-1 ring-inset ring-slate-100 sm:flex">
                                <FiFileText size={22} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                                  <h3 className="min-w-0 flex-1 text-[17px] font-bold leading-snug text-slate-800">
                                    <Link href={`/user/repository/${id}`} className="transition group-hover:text-[#103F78] hover:underline">
                                      {m.title || 'Untitled Manuscript'}
                                    </Link>
                                  </h3>
                                  {m.year_completed && (
                                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{m.year_completed}</span>
                                  )}
                                </div>
                                {authors && <p className="mt-1.5 text-sm text-slate-600"><span className="text-slate-400">By </span>{authors}</p>}
                                {meta && <p className="mt-1 text-xs font-medium text-slate-400">{meta}</p>}
                                {m.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{m.description}</p>}
                                {(m.keywords?.length ?? 0) > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(m.keywords ?? []).slice(0, 5).map((kw) => (
                                      <span key={kw} className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-100">{kw}</span>
                                    ))}
                                  </div>
                                )}
                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Approved research</span>
                                  <Link href={`/user/repository/${id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#103F78] hover:underline">
                                    View details <FiArrowRight size={15} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </Layout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]"><Spinner /></div>}>
      <BrowseResearchContent />
    </Suspense>
  );
}
