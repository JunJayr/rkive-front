'use client';

import { useState } from 'react';
import { FiUsers, FiDownload, FiInfo } from 'react-icons/fi';
import Sidebar from '@/components/common/admin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useAdminUpdatePanelTemplateMutation } from '@/redux/features/authApiSlice';

export default function AdminPanelNominationFormPage() {
  const [rev, setRev] = useState('');
  const [date, setDate] = useState('');
  const [updateTemplate, { isLoading }] = useAdminUpdatePanelTemplateMutation();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const blob = await updateTemplate({ rev, date }).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_panel.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.data?.error || 'Failed to update the panel nomination template.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FC]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-3xl">
            <header className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Administration</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">ISO Panel Nomination Template</h1>
              <p className="mt-2 text-sm text-slate-500">Update revision metadata for the panel nomination DOCX template and download the generated file.</p>
            </header>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-4 border-b border-slate-100 bg-[#103F78] px-6 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-amber-300"><FiUsers size={24} /></div>
                <div>
                  <h2 className="text-lg font-bold text-white">Template Revision</h2>
                  <p className="mt-1 text-xs text-blue-100/80">Provide the revision number and date used in the template.</p>
                </div>
              </div>
              <form onSubmit={onSubmit} className="space-y-5 p-6 sm:p-8">
                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rev" className="mb-2 block text-sm font-semibold text-slate-700">Revision</label>
                    <input id="rev" value={rev} onChange={(e) => setRev(e.target.value)} placeholder="e.g. 02" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15" />
                  </div>
                  <div>
                    <label htmlFor="date" className="mb-2 block text-sm font-semibold text-slate-700">Date</label>
                    <input id="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g. 2026-11-09" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15" />
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-xs leading-6 text-slate-600">
                  <FiInfo className="mt-0.5 shrink-0 text-[#103F78]" size={16} />
                  This action updates the server-side template file and returns the generated DOCX for download.
                </div>
                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl bg-[#FBBF24] px-6 py-3 text-sm font-bold text-[#103F78] hover:bg-amber-300 disabled:opacity-60">
                    {isLoading ? <Spinner sm /> : <><FiDownload size={17} /> Generate & Download</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
