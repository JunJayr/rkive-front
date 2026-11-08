'use client';

import Link from 'next/link';
import { FiBookmark, FiFileText, FiTrash2, FiAlertCircle, FiArrowRight, FiSearch } from 'react-icons/fi';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';
import { useGetBookmarksQuery, useRemoveBookmarkMutation } from '@/redux/features/authApiSlice';

export default function BookmarksPage() {
  const { data = [], isLoading, isError, refetch } = useGetBookmarksQuery();
  const [removeBookmark, { isLoading: removing }] = useRemoveBookmarkMutation();

  const handleRemove = async (id: number) => {
    try {
      await removeBookmark(id).unwrap();
      refetch();
    } catch {
      // keep UI stable
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 pb-14 pt-20 sm:px-6 md:pt-8 lg:px-10">
            <div className="mx-auto w-full max-w-5xl">
              <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Repository</p>
                  <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#103F78] sm:text-3xl">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBBF24]/20 text-[#103F78]"><FiBookmark size={20} /></span>
                    My Collection
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">Approved manuscripts you’ve saved for quick access.</p>
                </div>
                <Link href="/user/search" className="inline-flex items-center gap-2 self-start rounded-xl bg-[#103F78] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2d57]">
                  <FiSearch size={16} /> Browse Research
                </Link>
              </header>

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                {isLoading && (
                  <div className="flex min-h-[260px] items-center justify-center"><Spinner /></div>
                )}

                {isError && !isLoading && (
                  <div className="flex flex-col items-center px-6 py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500"><FiAlertCircle size={26} /></div>
                    <p className="mt-4 font-semibold text-slate-800">Unable to load your collection</p>
                    <p className="mt-1 text-sm text-slate-500">Please try again.</p>
                    <button type="button" onClick={() => refetch()} className="mt-4 text-sm font-bold text-[#103F78] hover:underline">Retry</button>
                  </div>
                )}

                {!isLoading && !isError && data.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78]"><FiBookmark size={28} /></div>
                    <h2 className="mt-5 text-lg font-bold text-slate-800">No saved manuscripts yet</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      When you find research worth revisiting, save it from the manuscript details page and it will appear here.
                    </p>
                    <Link href="/user/search" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FBBF24] px-5 py-3 text-sm font-bold text-[#103F78] hover:bg-amber-300">
                      Browse Research <FiArrowRight size={16} />
                    </Link>
                  </div>
                )}

                {!isLoading && !isError && data.length > 0 && (
                  <ul className="divide-y divide-slate-100">
                    {data.map((m: any) => {
                      const meta = [(m.authors ?? []).join(', '), m.year_completed, m.department].filter(Boolean).join(' · ');
                      return (
                        <li key={m.manuscriptID} className="group flex flex-col gap-4 p-5 transition hover:bg-[#F6F8FC]/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                          <Link href={`/user/repository/${m.manuscriptID}`} className="flex min-w-0 items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#103F78] ring-1 ring-inset ring-blue-100/60">
                              <FiFileText size={20} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[15px] font-bold text-slate-800 group-hover:text-[#103F78]">{m.title}</span>
                              {meta && <span className="mt-1 block line-clamp-1 text-sm text-slate-500">{meta}</span>}
                              {m.category && <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">{m.category}</span>}
                            </span>
                          </Link>
                          <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                            <Link href={`/user/repository/${m.manuscriptID}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-[#103F78] hover:bg-blue-50">
                              Open <FiArrowRight size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleRemove(m.manuscriptID)}
                              disabled={removing}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              aria-label={`Remove ${m.title} from collection`}
                            >
                              <FiTrash2 size={14} /> Remove
                            </button>
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
