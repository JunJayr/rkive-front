
'use client';

import { useState, useEffect, Suspense } from 'react';
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
  FiExternalLink,
  FiAlertCircle,
  FiBookOpen,
} from 'react-icons/fi';

interface Manuscript {
  id?: number | string;
  manuscriptID?: number | string;
  manuscript_id?: number | string;
  title?: string;
  description?: string;
  pdf_url?: string;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('q')?.trim() ?? '';

  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useSearchManuscriptsQuery(query, {
    skip: !query,
  });

  const manuscripts = (data ?? []) as Manuscript[];

  const handleSearch = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const value = searchTerm.trim();

    if (!value) return;

    router.push(
      `/user/search?q=${encodeURIComponent(value)}`
    );
  };

  const handleResultClick = (pdfUrl?: string) => {
    if (!pdfUrl) return;

    window.open(
      pdfUrl,
      '_blank',
      'noopener,noreferrer'
    );
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
                  Explore academic research, discover studies,
                  and access available manuscripts.
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

              {/* RESULTS */}
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
                  <div>
                    <h2 className="text-lg font-bold text-[#103F78]">
                      Search Results
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {query
                        ? `Results for "${query}"`
                        : 'Enter a keyword to begin searching'}
                    </p>
                  </div>

                  {query && !isLoading && !isError && (
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#103F78]">
                      {manuscripts.length} result(s)
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

                {!query && (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <FiSearch
                      size={38}
                      className="text-slate-300"
                    />

                    <p className="mt-4 font-semibold text-slate-700">
                      Start exploring the repository
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      Enter a research title or keyword above.
                    </p>
                  </div>
                )}

                {query &&
                  !isLoading &&
                  !isFetching &&
                  !isError &&
                  manuscripts.length === 0 && (
                    <div className="px-6 py-16 text-center">
                      <FiFileText
                        size={38}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-4 font-semibold text-slate-700">
                        No manuscripts found
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        Try a different keyword or research title.
                      </p>
                    </div>
                  )}

                {query &&
                  !isLoading &&
                  !isFetching &&
                  !isError &&
                  manuscripts.length > 0 && (
                    <ul className="divide-y divide-slate-100">
                      {manuscripts.map((manuscript, index) => {
                        // Use the API's unique identifier when available.
                        // Index is only a temporary fallback.
                        const resultKey =
                          manuscript.id ??
                          manuscript.manuscriptID ??
                          manuscript.manuscript_id ??
                          index;

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
                                <h3 className="text-base font-bold text-[#103F78] sm:text-lg">
                                  {manuscript.title || 'Untitled Manuscript'}
                                </h3>

                                {manuscript.description && (
                                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                    {manuscript.description}
                                  </p>
                                )}

                                {manuscript.pdf_url && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleResultClick(
                                        manuscript.pdf_url
                                      )
                                    }
                                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#103F78] transition hover:text-blue-600"
                                  >
                                    View Manuscript
                                    <FiExternalLink size={15} />
                                  </button>
                                )}
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
