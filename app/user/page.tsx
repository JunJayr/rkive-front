
'use client';

import {
  useEffect,
  useMemo,
  useState,
  FormEvent,
  Suspense,
} from 'react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  FiSearch,
  FiArrowRight,
  FiArrowLeft,
  FiArrowUpRight,
  FiBookOpen,
  FiFileText,
  FiAlertCircle,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiX,
} from 'react-icons/fi';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';

import {
  useSearchManuscriptsQuery,
} from '@/redux/features/authApiSlice';

type Manuscript = {
  id: number | string;
  title: string;
  description?: string | null;
  pdf_url?: string | null;
  author?: string | null;
  year?: string | number | null;
  type?: string | null;
  created_at?: string | null;
};

const PAGE_SIZE = 6;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('q')?.trim() || '';
  const sortParam = searchParams.get('sort') || '';
  const typeParam = searchParams.get('type') || '';

  const [searchTerm, setSearchTerm] = useState(query);
  const [sortBy, setSortBy] = useState(
    sortParam === 'latest' ? 'newest' : 'relevance'
  );
  const [page, setPage] = useState(1);

  // Keep the input synchronized with URL navigation.
  useEffect(() => {
    setSearchTerm(query);
    setPage(1);
  }, [query, typeParam, sortParam]);

  const {
    data: manuscripts = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useSearchManuscriptsQuery(query, {
    skip: !query,
  });

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = searchTerm.trim();

    const params = new URLSearchParams();
    if (value) params.set('q', value);
    if (typeParam) params.set('type', typeParam);

    router.push(`/user/search?${params.toString()}`);
  };

  const results = useMemo(() => {
    // Assumes the API returns an array, as in the
    // original implementation.
    const items = Array.isArray(manuscripts)
      ? ([...manuscripts] as Manuscript[])
      : [];

    const filtered = typeParam
      ? items.filter(
          (item) =>
            item.type?.toLowerCase() ===
            typeParam.toLowerCase()
        )
      : items;

    if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const dateA = a.created_at
          ? Date.parse(a.created_at)
          : NaN;
        const dateB = b.created_at
          ? Date.parse(b.created_at)
          : NaN;

        if (Number.isFinite(dateA) &&
            Number.isFinite(dateB)) {
          return dateB - dateA;
        }

        return Number(b.year || 0) -
          Number(a.year || 0);
      });
    }

    if (sortBy === 'title') {
      filtered.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return filtered;
  }, [manuscripts, sortBy, typeParam]);

  const totalPages = Math.ceil(results.length / PAGE_SIZE);

  const paginatedResults = results.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const openManuscript = (url?: string | null) => {
    if (!url) return;

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const isBusy = isLoading || isFetching;

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">

              {/* BREADCRUMBS */}
              <nav
                aria-label="Breadcrumb"
                className="mb-7 flex items-center gap-2 text-sm"
              >
                <button
                  onClick={() => router.push('/user')}
                  className="flex items-center gap-2 text-slate-500 hover:text-[#103F78]"
                >
                  <FiHome size={15} />
                  Home
                </button>

                <FiChevronRight
                  size={14}
                  className="text-slate-300"
                />

                <span className="font-semibold text-[#103F78]">
                  Search Repository
                </span>
              </nav>

              {/* SEARCH HERO */}
              <section className="relative isolate overflow-hidden rounded-[28px] bg-[#103F78] px-6 py-10 shadow-[0_18px_50px_-20px_rgba(16,63,120,0.5)] sm:px-10 lg:px-12 lg:py-12">

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-40 h-[400px] w-[400px] rounded-full border border-white/10"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-20 h-[300px] w-[300px] rounded-full border border-white/10"
                />

                <div className="relative z-10">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                    RKIVE / Research Discovery
                  </p>

                  <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Explore academic research
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100/80">
                    Search capstone projects, theses, and
                    scholarly works from the USTP community.
                  </p>

                  {/* SEARCH FORM */}
                  <form
                    onSubmit={handleSearch}
                    role="search"
                    className="mt-7 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-blue-950/20 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                      <FiSearch
                        size={21}
                        className="shrink-0 text-slate-400"
                      />

                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) =>
                          setSearchTerm(e.target.value)
                        }
                        placeholder="Search title, author, keyword, or year..."
                        aria-label="Search manuscripts"
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
                      />

                      {searchTerm && (
                        <button
                          type="button"
                          aria-label="Clear search"
                          onClick={() => setSearchTerm('')}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <FiX size={18} />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FBBF24] px-7 text-sm font-bold text-[#103F78] transition hover:bg-amber-300 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Spinner sm />
                      ) : (
                        <>
                          Search
                          <FiArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </section>

              {/* RESULTS HEADER */}
              <section className="mt-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                      Repository Collection
                    </p>

                    <h2 className="text-2xl font-extrabold text-slate-800">
                      {query
                        ? 'Search Results'
                        : 'Browse Research'}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {query ? (
                        <>
                          Results for{' '}
                          <span className="font-semibold text-[#103F78]">
                            "{query}"
                          </span>
                        </>
                      ) : (
                        'Enter a keyword to discover manuscripts.'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isBusy && !isError && query && (
                      <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-[#103F78]">
                        {results.length} results
                      </span>
                    )}

                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      aria-label="Sort results"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
                    >
                      <option value="relevance">
                        Relevance
                      </option>
                      <option value="newest">
                        Newest First
                      </option>
                      <option value="title">
                        Title A–Z
                      </option>
                    </select>
                  </div>
                </div>

                {/* LOADING */}
                {isBusy && (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <Spinner />

                    <p className="mt-5 text-sm font-medium text-slate-500">
                      Searching the repository...
                    </p>
                  </div>
                )}

                {/* ERROR */}
                {!isBusy && isError && (
                  <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-white px-6 py-14 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                      <FiAlertCircle size={30} />
                    </div>

                    <h3 className="text-lg font-bold text-slate-800">
                      Unable to load manuscripts
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Something went wrong while retrieving
                      repository records. Please try again.
                    </p>

                    <button
                      onClick={() => refetch()}
                      className="mt-6 rounded-xl bg-[#103F78] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* EMPTY STATE */}
                {!isBusy && !isError &&
                  results.length === 0 && (
                    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78]">
                        {query ? (
                          <FiInbox size={30} />
                        ) : (
                          <FiSearch size={30} />
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-800">
                        {query
                          ? 'No manuscripts found'
                          : 'Start your research journey'}
                      </h3>

                      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        {query
                          ? 'Try a different keyword, title, author, or research topic.'
                          : 'Use the search bar above to explore the RKIVE academic collection.'}
                      </p>
                    </div>
                  )}

                {/* MANUSCRIPT RESULTS */}
                {!isBusy && !isError &&
                  paginatedResults.length > 0 && (
                    <div className="space-y-4">
                      {paginatedResults.map((item) => (
                        <article
                          key={item.id}
                          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-lg sm:p-7"
                        >
                          <div className="flex items-start gap-4">

                            {/* DOCUMENT ICON */}
                            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78] sm:flex">
                              <FiFileText size={25} />
                            </div>

                            <div className="min-w-0 flex-1">

                              {/* BADGES */}
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#103F78]">
                                  {item.type || 'Manuscript'}
                                </span>

                                {item.year && (
                                  <span className="text-xs text-slate-400">
                                    {item.year}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-lg font-bold leading-snug text-slate-800 transition group-hover:text-[#103F78] sm:text-xl">
                                {item.title}
                              </h3>

                              {item.author && (
                                <p className="mt-2 text-xs font-medium text-slate-500">
                                  By {item.author}
                                </p>
                              )}

                              {item.description && (
                                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                                  {item.description}
                                </p>
                              )}

                              <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <FiBookOpen size={14} />
                                  RKIVE Repository
                                </div>

                                {item.pdf_url ? (
                                  <button
                                    onClick={() =>
                                      openManuscript(item.pdf_url)
                                    }
                                    className="inline-flex items-center gap-2 text-sm font-bold text-[#103F78] hover:text-blue-600"
                                  >
                                    View Manuscript
                                    <FiArrowUpRight size={17} />
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    File unavailable
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                {/* PAGINATION */}
                {!isBusy && !isError &&
                  totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-sm text-slate-500">
                        Showing{' '}
                        {(page - 1) * PAGE_SIZE + 1}–
                        {Math.min(
                          page * PAGE_SIZE,
                          results.length
                        )}{' '}
                        of {results.length}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setPage((p) => Math.max(1, p - 1))
                          }
                          disabled={page === 1}
                          aria-label="Previous page"
                          className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <FiChevronLeft size={17} />
                        </button>

                        <span className="px-3 text-sm font-semibold text-slate-700">
                          {page} / {totalPages}
                        </span>

                        <button
                          onClick={() =>
                            setPage((p) =>
                              Math.min(totalPages, p + 1)
                            )
                          }
                          disabled={page === totalPages}
                          aria-label="Next page"
                          className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <FiChevronRight size={17} />
                        </button>
                      </div>
                    </div>
                  )}

                {/* BACK TO DASHBOARD */}
                <div className="mt-10">
                  <button
                    onClick={() => router.push('/user')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#103F78] hover:text-blue-600"
                  >
                    <FiArrowLeft size={16} />
                    Back to Dashboard
                  </button>
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
