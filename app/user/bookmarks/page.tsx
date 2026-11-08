'use client';

import Link from 'next/link';
import { FiBookmark, FiFileText, FiTrash2, FiAlertCircle } from 'react-icons/fi';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';

import {
  useGetBookmarksQuery,
  useRemoveBookmarkMutation,
} from '@/redux/features/authApiSlice';

export default function BookmarksPage() {
  const { data = [], isLoading, isError, refetch } = useGetBookmarksQuery();
  const [removeBookmark, { isLoading: removing }] = useRemoveBookmarkMutation();

  const handleRemove = async (id: number) => {
    try {
      await removeBookmark(id).unwrap();
      refetch();
    } catch {
      // ignore
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-16 pt-24 sm:px-8 md:pt-12">
            <div className="mx-auto w-full max-w-5xl">
              <div className="mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Repository</p>
                <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-[#103F78]">
                  <FiBookmark /> Saved Manuscripts
                </h1>
                <p className="mt-2 text-sm text-slate-500">Your bookmarked, approved research manuscripts.</p>
              </div>

              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {isLoading && (
                  <div className="flex min-h-48 items-center justify-center"><Spinner /></div>
                )}
                {isError && !isLoading && (
                  <div className="flex flex-col items-center px-6 py-14 text-center">
                    <FiAlertCircle size={32} className="text-red-500" />
                    <p className="mt-3 text-sm text-slate-600">Unable to load saved manuscripts.</p>
                  </div>
                )}
                {!isLoading && !isError && data.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <FiBookmark size={34} className="mx-auto text-slate-300" />
                    <p className="mt-4 font-semibold text-slate-700">No saved manuscripts</p>
                    <p className="mt-2 text-sm text-slate-400">Bookmark approved manuscripts to find them here.</p>
                    <Link href="/user/search" className="mt-4 inline-block text-sm font-semibold text-[#103F78] hover:underline">Browse repository</Link>
                  </div>
                )}
                {!isLoading && !isError && data.length > 0 && (
                  <ul className="divide-y divide-slate-100">
                    {data.map((m) => (
                      <li key={m.manuscriptID} className="flex items-start justify-between gap-4 p-6">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]"><FiFileText size={20} /></div>
                          <div className="min-w-0">
                            <Link href={`/user/repository/${m.manuscriptID}`} className="text-base font-bold text-[#103F78] hover:underline">
                              {m.title}
                            </Link>
                            <p className="mt-1 text-sm text-slate-500">{(m.authors ?? []).join(', ')}{m.year_completed ? ` · ${m.year_completed}` : ''}</p>
                            {(m.department || m.category) && <p className="mt-1 text-xs text-slate-400">{[m.category, m.department].filter(Boolean).join(' · ')}</p>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(m.manuscriptID)}
                          disabled={removing}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label="Remove bookmark"
                        >
                          <FiTrash2 size={14} /> Remove
                        </button>
                      </li>
                    ))}
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
