'use client';

import { FiFolder, FiFileText, FiBookOpen, FiInfo } from 'react-icons/fi';
import Sidebar from '@/components/common/admin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useListFilesQuery, useGetDocumentCountQuery } from '@/redux/features/authApiSlice';

export default function AdminDocumentsPage() {
  const { data, isLoading, isError } = useListFilesQuery();
  const { data: counts } = useGetDocumentCountQuery();

  return (
    <div className="flex min-h-screen bg-[#F6F8FC]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <header className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Administration</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">Documents</h1>
              <p className="mt-2 text-sm text-slate-500">Overview of generated documents and manuscript files stored by the system.</p>
            </header>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]"><FiFileText size={20} /></div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#103F78]">{counts?.generated_documents_count ?? '—'}</p>
                    <p className="text-sm font-semibold text-slate-600">Generated documents</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><FiBookOpen size={20} /></div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#103F78]">{counts?.manuscripts_count ?? '—'}</p>
                    <p className="text-sm font-semibold text-slate-600">Manuscript files</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                <FiFolder className="text-[#103F78]" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Stored files</h2>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center py-10"><Spinner /></div>
                ) : isError ? (
                  <p className="text-sm text-red-700">Unable to load file list.</p>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <section>
                      <h3 className="mb-3 text-sm font-bold text-slate-700">Generated documents</h3>
                      <ul className="space-y-2">
                        {(data?.generated_documents_files || []).length ? (data?.generated_documents_files || []).map((f: string) => (
                          <li key={f} className="truncate rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-700">{f}</li>
                        )) : <li className="text-sm text-slate-500">No files found.</li>}
                      </ul>
                    </section>
                    <section>
                      <h3 className="mb-3 text-sm font-bold text-slate-700">Manuscripts</h3>
                      <ul className="space-y-2">
                        {(data?.manuscripts_files || []).length ? (data?.manuscripts_files || []).map((f: string) => (
                          <li key={f} className="truncate rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-700">{f}</li>
                        )) : <li className="text-sm text-slate-500">No files found.</li>}
                      </ul>
                    </section>
                  </div>
                )}
                <div className="mt-6 flex items-start gap-2 rounded-xl bg-blue-50 p-4 text-xs leading-6 text-slate-600">
                  <FiInfo className="mt-0.5 shrink-0 text-[#103F78]" />
                  For manuscript review and repository publication decisions, use <span className="font-semibold">Manuscript Review</span>. Direct file access should remain protected by server-side permission checks.
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
