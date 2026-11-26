'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { FiGrid, FiPlus, FiSave, FiTrash2, FiUsers } from 'react-icons/fi';

import Sidebar from '@/components/common/superadmin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useListUsersQuery,
  useAddUserMutation,
} from '@/redux/features/authApiSlice';

function messageOf(error: unknown): string {
  const data = (error as { data?: { error?: string } })?.data;
  return data?.error || 'Unable to complete the request.';
}

export default function SuperadminDepartmentsPage() {
  const { data: departments = [], isLoading } = useGetDepartmentsQuery();
  const { data: users = [] } = useListUsersQuery();
  const [createDepartment, { isLoading: creatingDepartment }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: updatingDepartment }] = useUpdateDepartmentMutation();
  const [deleteDepartment, { isLoading: deletingDepartment }] = useDeleteDepartmentMutation();
  const [addUser, { isLoading: creatingHead }] = useAddUserMutation();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | ''>('');
  const [head, setHead] = useState({ first_name: '', last_name: '', email: '', password: '', repassword: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({ name: '', code: '' });

  const heads = users.filter((user: any) =>
    user.account_type === 'department_head' || user.is_department_head || user.is_headdept
  );
  const selectedDepartment = departments.find((department) => department.department_id === selectedDepartmentId);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createDepartment({ name, code }).unwrap();
      setName('');
      setCode('');
      toast.success('Department created.');
    } catch (error) {
      toast.error(messageOf(error));
    }
  };

  const startEdit = (department: { department_id: number; name: string; code: string }) => {
    setEditingId(department.department_id);
    setEditDraft({ name: department.name, code: department.code });
  };

  const saveEdit = async (departmentId: number) => {
    try {
      await updateDepartment({ departmentID: departmentId, data: editDraft }).unwrap();
      setEditingId(null);
      toast.success('Department updated.');
    } catch (error) {
      toast.error(messageOf(error));
    }
  };

  const remove = async (departmentId: number, departmentName: string) => {
    if (!window.confirm(`Delete ${departmentName}? Existing user department labels are not changed.`)) return;
    try {
      await deleteDepartment(departmentId).unwrap();
      if (selectedDepartmentId === departmentId) setSelectedDepartmentId('');
      toast.success('Department deleted.');
    } catch (error) {
      toast.error(messageOf(error));
    }
  };

  const createHead = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedDepartment) {
      toast.error('Select a department first.');
      return;
    }
    try {
      await addUser({
        ...head,
        account_type: 'department_head',
        department: selectedDepartment.name,
        is_active: true,
      }).unwrap();
      setHead({ first_name: '', last_name: '', email: '', password: '', repassword: '' });
      toast.success('Department Head account created.');
    } catch (error) {
      toast.error(messageOf(error));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <header className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / System Owner</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#12186E]">Departments &amp; Department Heads</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-500">
                Departments are the scope used for panel assignment and routine account creation. Department Heads can create Panel / Adviser and Student accounts in their own department only; privileged role grants remain Superadmin-only.
              </p>
            </header>

            {isLoading && (
              <div className="mb-6 flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white"><Spinner /></div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 bg-[#12186E] px-6 py-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300"><FiGrid size={22} /></div><div><h2 className="text-lg font-bold text-white">Departments</h2><p className="text-xs text-blue-100/80">Create and maintain the department registry</p></div></div>
                <div className="p-5 sm:p-6">
                  <form onSubmit={create} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Department name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#12186E]" />
                    <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#12186E]" />
                    <button type="submit" disabled={creatingDepartment} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#12186E] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><FiPlus size={16} /> Add</button>
                  </form>

                  <div className="mt-5 divide-y divide-slate-100">
                    {departments.map((department) => (
                      <div key={department.department_id} className="flex flex-wrap items-center gap-3 py-3">
                        {editingId === department.department_id ? (
                          <>
                            <input value={editDraft.name} onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })} className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                            <input value={editDraft.code} onChange={(event) => setEditDraft({ ...editDraft, code: event.target.value })} className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                            <button type="button" onClick={() => void saveEdit(department.department_id)} disabled={updatingDepartment} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Save</button>
                            <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Cancel</button>
                          </>
                        ) : (
                          <>
                            <div className="min-w-[180px] flex-1">
                              <p className="text-sm font-bold text-slate-800">{department.name}</p>
                              <p className="text-xs text-slate-500">{department.code || 'No code'}</p>
                            </div>
                            <button type="button" onClick={() => startEdit(department)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[#12186E] hover:bg-blue-50">Edit</button>
                            <button type="button" onClick={() => void remove(department.department_id, department.name)} disabled={deletingDepartment} aria-label={`Delete ${department.name}`} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"><FiTrash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    ))}
                    {!departments.length && <p className="py-8 text-center text-sm text-slate-500">No departments yet. Add one above.</p>}
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 bg-[#12186E] px-6 py-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300"><FiUsers size={22} /></div><div><h2 className="text-lg font-bold text-white">Create Department Head</h2><p className="text-xs text-blue-100/80">Scoped to one department</p></div></div>
                <form onSubmit={createHead} className="space-y-4 p-5 sm:p-6">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Department *</span>
                    <select value={selectedDepartmentId} onChange={(event) => setSelectedDepartmentId(event.target.value ? Number(event.target.value) : '')} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#12186E]">
                      <option value="">Select department</option>
                      {departments.map((department) => <option key={department.department_id} value={department.department_id}>{department.name}</option>)}
                    </select>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={head.first_name} onChange={(event) => setHead({ ...head, first_name: event.target.value })} required placeholder="First name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                    <input value={head.last_name} onChange={(event) => setHead({ ...head, last_name: event.target.value })} required placeholder="Last name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <input value={head.email} onChange={(event) => setHead({ ...head, email: event.target.value })} required type="email" placeholder="Email address" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={head.password} onChange={(event) => setHead({ ...head, password: event.target.value })} required type="password" placeholder="Password" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                    <input value={head.repassword} onChange={(event) => setHead({ ...head, repassword: event.target.value })} required type="password" placeholder="Confirm password" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <button type="submit" disabled={creatingHead || !selectedDepartment} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F9B515] px-5 py-3 text-sm font-bold text-[#12186E] hover:bg-amber-300 disabled:opacity-50"><FiSave size={16} /> {creatingHead ? 'Creating…' : 'Create Department Head'}</button>
                  <p className="text-xs leading-5 text-slate-500">The account receives <code className="rounded bg-slate-100 px-1">department_head</code> access and is bound to {selectedDepartment ? selectedDepartment.name : 'the selected department'}.</p>
                </form>
              </section>
            </div>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4"><FiUsers className="text-[#12186E]" /><h2 className="text-base font-bold text-[#12186E]">Current Department Heads</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{heads.length}</span></div>
              {heads.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-500">No Department Head accounts found.</p>
              ) : (
                <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left"><thead className="bg-slate-50"><tr className="text-xs uppercase tracking-wide text-slate-500"><th className="px-6 py-3 font-bold">Name</th><th className="px-6 py-3 font-bold">Email</th><th className="px-6 py-3 font-bold">Department</th><th className="px-6 py-3 font-bold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{heads.map((user: any) => (
                  <tr key={user.userID}><td className="px-6 py-3 text-sm font-semibold text-slate-800">{user.first_name} {user.last_name}</td><td className="px-6 py-3 text-sm text-slate-600">{user.email}</td><td className="px-6 py-3 text-sm text-slate-600">{user.department || '—'}</td><td className="px-6 py-3 text-sm"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td></tr>
                ))}</tbody></table></div>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
