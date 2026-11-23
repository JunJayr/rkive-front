'use client';

import Sidebar from '@/components/common/admin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useGetAuditLogsQuery } from '@/redux/features/authApiSlice';
import { FiShield, FiRefreshCw } from 'react-icons/fi';

export default function AuditLogsPage() {
  const { data: logs, isLoading, isFetching, refetch, error } = useGetAuditLogsQuery({ limit: 200 });

  return (
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Administration</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78] sm:text-4xl">Audit Logs</h1>
                <p className="mt-3 text-sm text-slate-500">
                  Academic/operational audit visibility for Research Coordinators. Superadmin has full system/security visibility in the Superadmin workspace.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#103F78] hover:bg-blue-50">
                  <FiRefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /> Refresh
                </button>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78]"><FiShield size={26} /></div>
              </div>
            </header>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {isLoading ? (
                <div className="flex min-h-64 items-center justify-center"><Spinner /></div>
              ) : error ? (
                <div className="p-8 text-sm text-red-700">Unable to load audit logs. You may not have permission.</div>
              ) : !logs?.length ? (
                <div className="p-8 text-sm text-slate-500">No audit events recorded yet.</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-4 font-bold">Time</th>
                        <th className="px-6 py-4 font-bold">Actor</th>
                        <th className="px-6 py-4 font-bold">Action</th>
                        <th className="px-6 py-4 font-bold">Target</th>
                        <th className="px-6 py-4 font-bold">Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log: any) => (
                        <tr key={log.logID} className="align-top hover:bg-blue-50/20">
                          <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-600">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{log.actor_email || 'system'}</td>
                          <td className="px-6 py-4"><span className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#103F78]">{log.action}</span></td>
                          <td className="px-6 py-4 text-xs text-slate-500">{log.target_type ? `${log.target_type}${log.target_id ? ` #${log.target_id}` : ''}` : '—'}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{log.summary || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
