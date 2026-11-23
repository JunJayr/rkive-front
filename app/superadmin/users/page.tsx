'use client';

import { useState } from 'react';
import Sidebar from '@/components/common/superadmin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useAdminDashboard } from '@/hooks/admin';
import { FiShield, FiUsers, FiSave } from 'react-icons/fi';

const types = [
  { value: 'student', label: 'Student / Research Group' },
  { value: 'faculty', label: 'Faculty (Adviser/Panelist by assignment)' },
  { value: 'department_head', label: 'Department Head (own department only)' },
  { value: 'admin', label: 'Admin (Research Coordinator)' },
  { value: 'superadmin', label: 'Superadmin (System Owner)' },
] as const;

export default function SuperadminUsersPage() {
  const { users, loading, selectedUser, showModal, handleUserClick, handleInputChange, handleSave, getAccountType, setAccountType, setShowModal } = useAdminDashboard();
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await handleSave(); } finally { setSaving(false); } };
  return (
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <header className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / System Owner</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">Users &amp; Privileged Access</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-500">
                Superadmin controls user/role management, Department Head accounts, Admin account creation, privileged access assignment, and deactivation. Admin and Department Head restrictions are enforced by the API.
              </p>
            </header>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 bg-[#103F78] px-6 py-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300"><FiUsers size={22} /></div><div><h2 className="text-lg font-bold text-white">All Accounts</h2><p className="text-xs text-blue-100/80">System-level access control</p></div></div>
              {loading ? <div className="flex min-h-64 items-center justify-center"><Spinner /></div> : (
                <div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left"><thead className="bg-slate-50"><tr className="text-xs uppercase tracking-wide text-slate-500"><th className="px-6 py-4 font-bold">Account</th><th className="px-6 py-4 font-bold">Role</th><th className="px-6 py-4 font-bold">Department</th><th className="px-6 py-4 font-bold">Status</th><th className="px-6 py-4 text-right font-bold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{(users || []).map((u: any) => { const t = getAccountType(u); return (
                  <tr key={u.userID} className="hover:bg-blue-50/20"><td className="px-6 py-4"><p className="font-semibold text-slate-800">{u.first_name} {u.last_name}</p><p className="text-xs text-slate-500">{u.email}</p></td><td className="px-6 py-4 text-sm font-medium text-slate-700">{t.replace('_', ' ')}</td><td className="px-6 py-4 text-sm text-slate-600">{u.department || '—'}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-6 py-4 text-right"><button type="button" onClick={() => handleUserClick(u)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-[#103F78] hover:bg-blue-50">Manage</button></td></tr>
                ); })}</tbody></table></div>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
      {showModal && selectedUser ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4"><div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-5 flex items-center gap-2"><FiShield className="text-[#103F78]" /><h3 className="text-lg font-bold text-[#103F78]">Manage Access</h3></div>
          <p className="text-sm text-slate-600">{selectedUser.first_name} {selectedUser.last_name} — {selectedUser.email}</p>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Department</span>
            <input name="department" value={selectedUser.department || ''} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#103F78]" placeholder="Department name" />
          </label>
          <div className="mt-5 space-y-2">{types.map((t) => (<label key={t.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${getAccountType(selectedUser as any) === t.value ? 'border-[#103F78] bg-blue-50/50' : 'border-slate-200'}`}><input type="radio" name="at" checked={getAccountType(selectedUser as any) === t.value} onChange={() => setAccountType(t.value)} /> <span className="text-sm font-semibold">{t.label}</span></label>))}</div>
          <label className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"><span className="text-sm font-semibold">Active</span><input type="checkbox" name="is_active" checked={Boolean(selectedUser.is_active)} onChange={handleInputChange} /></label>
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button><button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#103F78] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"><FiSave size={16} /> {saving ? 'Saving...' : 'Save'}</button></div>
        </div></div>
      ) : null}
    </div>
  );
}
