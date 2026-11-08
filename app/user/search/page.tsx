
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';

import { useSearchManuscriptsQuery } from '@/redux/features/authApiSlice';

import {
  FiSearch,
  FiFileText,
  FiAlertCircle,
  FiBookOpen,
  FiUsers,
  FiTag,
  FiSliders,
  FiX,
} from 'react-icons/fi';

interface Manuscript {
  manuscriptID: number;
  title?: string;
  description?: string;
  authors?: string[];
  adviser?: string | null;
  department?: string | null;
  program?: string | null;
  year_completed?: number | null;
  keywords?: string[];
  status?: string;
  visibility?: string;
  approved_at?: string | null;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('q')?.trim() ?? '';

  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const [filters, setFilters] = useState({
    department: searchParams.get('department') ?? '',
    program: searchParams.get('program') ?? '',
    year: searchParams.get('year') ?? '',
    keyword: searchParams.get('keyword') ?? '',
    author: searchParams.get('author') ?? '',
    category: searchParams.get('category') ?? '',
    sort: searchParams.get('sort') ?? 'newest',
  });

  useEffect(() => {
    setFilters({
      department: searchParams.get('department') ?? '',
      program: searchParams.get('program') ?? '',
      year: searchParams.get('year') ?? '',
      keyword: searchParams.get('keyword') ?? '',
      author: searchParams.get('author') ?? '',
      category: searchParams.get('category') ?? '',
      sort: searchParams.get('sort') ?? 'newest',
    });
  }, [searchParams]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useSearchManuscriptsQuery({ q: query, ...filters });

  const manuscripts = (Array.isArray(data) ? data : data?.results ?? []) as Manuscript[];

  const pushParams = (nextQ: string, nextFilters = filters) => {
    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    (Object.entries(nextFilters) as [string, string][]).forEach(([k, v]) => {
      if (v && v !== 'newest') params.set(k, v);
      if (k === 'sort' && v && v !== 'newest') params.set('sort', v);
    });
    const qs = params.toString();
    router.push(qs ? `/user/search?${qs}` : '/user/search');
  };

  const handleSearch = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    pushParams(searchTerm.trim(), filters);
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    pushParams(searchTerm.trim(), next);
  };

  const clearFilters = () => {
    const next = { department: '', program: '', year: '', keyword: '', author: '', category: '', sort: 'newest' };
    setFilters(next);
    setSearchTerm('');
    router.push('/user/search');
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-16 pt-24 sm:px-8 md:pt-12">
            <div className="mx-auto w-full max-w-5xl">

              {/* HEADER */}
              <div className="mb-10 text-center">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78]">
                  <FiBookOpen size={30} />
                </div>

                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  RKIVE / Research Repository
                </p>

                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78] sm:text-4xl">
                  Search Manuscripts
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
                  Browse officially approved research manuscripts in the RKIVE repository.
                </p>
              </div>

              {/* SEARCH BAR */}
              <form
                onSubmit={handleSearch}
                className="mx-auto mb-10 max-w-3xl"
              >
                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                  <FiSearch
                    size={22}
                    className="ml-4 shrink-0 text-slate-400"
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Search research titles, keywords..."
                    aria-label="Search manuscripts"
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="submit"
                    disabled={!searchTerm.trim() || isFetching}
                    className="rounded-xl bg-[#FBBF24] px-5 py-3 text-sm font-bold text-[#103F78] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* FILTERS */}
              <div className="mx-auto mb-8 max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FiSliders size={16} /> Filter &amp; Sort
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#103F78]"
                  >
                    <FiX size={14} /> Clear
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input
                    value={filters.author}
                    onChange={(e) => updateFilter('author', e.target.value)}
                    placeholder="Author"
                    aria-label="Filter by author"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <input
                    value={filters.department}
                    onChange={(e) => updateFilter('department', e.target.value)}
                    placeholder="Department"
                    aria-label="Filter by department"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <input
                    value={filters.program}
                    onChange={(e) => updateFilter('program', e.target.value)}
                    placeholder="Program"
                    aria-label="Filter by program"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <input
                    value={filters.year}
                    onChange={(e) => updateFilter('year', e.target.value)}
                    placeholder="Year (e.g. 2026)"
                    inputMode="numeric"
                    aria-label="Filter by year"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <input
                    value={filters.keyword}
                    onChange={(e) => updateFilter('keyword', e.target.value)}
                    placeholder="Keyword"
                    aria-label="Filter by keyword"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <input
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    placeholder="Category"
                    aria-label="Filter by category"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    aria-label="Sort manuscripts"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Title A–Z</option>
                    <option value="year_desc">Year (newest)</option>
                    <option value="year_asc">Year (oldest)</option>
                    <option value="most_viewed">Most viewed</option>
                    <option value="most_downloaded">Most downloaded</option>
                  </select>
                </div>
              </div>

              {/* RESULTS */}
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
                  <div>
                    <h2 className="text-lg font-bold text-[#103F78]">
                      Approved Manuscripts
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {query
                        ? `Results for "${query}"`
                        : 'Showing all approved manuscripts'}
                    </p>
                  </div>

                  {!isLoading && !isError && (
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#103F78]">
                      {manuscripts.length} manuscript(s)
                    </span>
                  )}
                </div>

                {(isLoading || isFetching) && (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-4">
                    <Spinner />
                    <p className="text-sm text-slate-500">
                      Searching manuscripts...
                    </p>
                  </div>
                )}

                {isError && !isFetching && (
                  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                    <FiAlertCircle
                      size={36}
                      className="text-red-500"
                    />

                    <h3 className="mt-4 font-bold text-slate-800">
                      Unable to load manuscripts
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Please check your connection or login
                      session and try again.
                    </p>
                  </div>
                )}

                {!isLoading &&
                  !isFetching &&
                  !isError &&
                  manuscripts.length === 0 && (
                    <div className="px-6 py-16 text-center">
                      <FiFileText
                        size={38}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-4 font-semibold text-slate-700">
                        No approved manuscripts found
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        {query
                          ? 'Try a different keyword or research title.'
                          : 'No manuscripts have been officially approved for publication yet.'}
                      </p>
                    </div>
                  )}

                {!isLoading &&
                  !isFetching &&
                  !isError &&
                  manuscripts.length > 0 && (
                    <ul className="divide-y divide-slate-100">
                      {manuscripts.map((manuscript, index) => {
                        const resultKey = manuscript.manuscriptID ?? index;
                        const authorText = (manuscript.authors ?? []).join(', ');
                        const keywords = (manuscript.keywords ?? []).slice(0, 5);

                        return (
                          <li
                            key={resultKey}
                            className="p-6 transition hover:bg-blue-50/40 sm:px-8"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]">
                                <FiFileText size={22} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <h3 className="text-base font-bold text-[#103F78] sm:text-lg">
                                    <Link
                                      href={`/user/repository/${manuscript.manuscriptID}`}
                                      className="hover:underline"
                                    >
                                      {manuscript.title || 'Untitled Manuscript'}
                                    </Link>
                                  </h3>
                                  {manuscript.year_completed && (
                                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                      {manuscript.year_completed}
                                    </span>
                                  )}
                                </div>

                                {authorText && (
                                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                                    <FiUsers size={14} className="shrink-0 text-slate-400" />
                                    <span className="truncate">{authorText}</span>
                                  </p>
                                )}

                                {(manuscript.department || manuscript.program) && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {[manuscript.department, manuscript.program].filter(Boolean).join(' · ')}
                                  </p>
                                )}

                                {manuscript.description && (
                                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                    {manuscript.description}
                                  </p>
                                )}

                                {keywords.length > 0 && (
                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <FiTag size={13} className="text-slate-400" />
                                    {keywords.map((kw) => (
                                      <span
                                        key={kw}
                                        className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                                      >
                                        {kw}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="mt-4">
                                  <Link
                                    href={`/user/repository/${manuscript.manuscriptID}`}
                                    className="text-sm font-semibold text-[#103F78] hover:underline"
                                  >
                                    View research details →
                                  </Link>
                                  <span className="ml-3 text-xs text-slate-400">PDF preview &amp; download: Tasks 3–4</span>
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
          </main>

          <Footer />
        </div>
      </div>
    </Layout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">
          <Spinner />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
