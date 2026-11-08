'use client';

import { useMemo, useState } from 'react';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiLink, FiInfo, FiAlertCircle } from 'react-icons/fi';
import Sidebar from '@/components/common/admin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import {
  useGetAdminFacultyQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
  useListUsersQuery,
} from '@/redux/features/authApiSlice';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15';

type FacultyForm = {
  facultyID?: number;
  name: string;
  title: string;
  department: string;
  user: string; // '' means unlink
};

const emptyForm: FacultyForm = { name: '', title: '', department: '', user: '' };

export default function AdminFacultyPage() {
  const { data: faculty = [], isLoading, isError, refetch, isFetching } = useGetAdminFacultyQuery();
  const { data: users = [] } = useListUsersQuery();
  const [createFaculty, { isLoading: creating }] = useCreateFacultyMutation();
  const [updateFaculty, { isLoading: updating }] = useUpdateFacultyMutation();
  const [deleteFaculty, { isLoading: deleting }] = useDeleteFacultyMutation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FacultyForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const usersById = useMemo(() => {
    const m = new Map<string, any>();
    users.forEach((u: any) => m.set(String(u.userID), u));
    return m;
  }, [users]);

  const openCreate = () => {
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  };

  const openEdit = (f: any) => {
    setForm({
      facultyID: f.facultyID,
      name: f.name || '',
      title: f.title || '',
      department: f.department || '',
      user: f.user == null ? '' : String(f.user),
    });
    setError(null);
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      title: form.title,
      department: form.department,
      user: form.user === '' ? null : Number(form.user),
    };
    try {
      if (form.facultyID) {
        await updateFaculty({ facultyID: form.facultyID, data: payload as any }).unwrap();
      } else {
        await createFaculty(payload as any).unwrap();
      }
      setOpen(false);
      refetch();
    } catch (err: any) {
      setError(err?.data?.error || 'Unable to save adviser/panel record.');
    }
  };

  const onDelete = async (facultyID: number, name: string) => {
    if (!window.confirm(`Delete adviser/panel record "${name}"?`)) return;
    setError(null);
    try {
      await deleteFaculty(facultyID).unwrap();
      refetch();
    } catch (err: any) {
      setError(err?.data?.error || 'Unable to delete adviser/panel record.');
    }
  };

  const linkedUser = form.user ? usersById.get(String(form.user)) : null;
  const busy = creating || updating || deleting;

  return (
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Administration</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">Adviser/Panel Links</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Manage adviser/panel records used in nominations and defenses, and link each record to an <span className="font-semibold">Adviser/Panel</span> login account so assigned reviews appear in <span className="font-semibold">/panel</span>.
                </p>
              </div>
              <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FBBF24] px-5 py-3 text-sm font-bold text-[#103F78] transition hover:bg-amber-300">
                <FiPlus size={18} /> Add Adviser/Panel
              </button>
            </header>

            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
              <FiInfo className="mt-0.5 shrink-0 text-[#103F78]" />
              <div>
                <p className="font-semibold text-[#103F78]">How Adviser/Panel accounts get assignments</p>
                <p className="mt-1 text-xs leading-6 text-slate-600">
                  1) Set the login account’s type to <b>Adviser/Panel</b> in User Management. 2) Create or select an adviser/panel record here and link that user. 3) When that member is assigned as adviser, panel chair, or panel member on an application or manuscript, the item appears in their <b>/panel</b> queue.
                </p>
              </div>
            </div>

            {error && !open && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><FiAlertCircle /> {error}</div>
            )}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]"><FiUsers size={22} /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Adviser/Panel Records</h2>
                    <p className="text-xs text-slate-500">{faculty.length} record(s){isFetching ? ' · refreshing…' : ''}</p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex min-h-48 items-center justify-center"><Spinner /></div>
              ) : isError ? (
                <div className="px-6 py-10 text-sm text-red-700">Unable to load adviser/panel records. Admin access is required.</div>
              ) : faculty.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <FiUsers className="mx-auto text-slate-300" size={34} />
                  <p className="mt-4 font-semibold text-slate-700">No adviser/panel records yet</p>
                  <p className="mt-1 text-sm text-slate-500">Add records and link them to Adviser/Panel login accounts.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-bold">Adviser/Panel</th>
                        <th className="px-6 py-4 font-bold">Department / Title</th>
                        <th className="px-6 py-4 font-bold">Linked Account</th>
                        <th className="px-6 py-4 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {faculty.map((f: any) => {
                        const linked = f.user ? usersById.get(String(f.user)) : null;
                        const isPanel = linked ? (linked.is_faculty || linked.is_panel) : false;
                        const isAdmin = linked ? (linked.is_staff || linked.is_superuser) : false;
                        return (
                          <tr key={f.facultyID} className="hover:bg-blue-50/20">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800">{f.name}</p>
                              <p className="mt-0.5 text-xs text-slate-500">ID #{f.facultyID}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              <p>{f.department || <span className="text-slate-400">No department</span>}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{f.title || '—'}</p>
                            </td>
                            <td className="px-6 py-4">
                              {f.user ? (
                                <div>
                                  <div className="flex items-center gap-2">
                                    <FiLink className="text-emerald-600" size={14} />
                                    <span className="text-sm font-semibold text-slate-800">{f.user_name || f.user_email || `User #${f.user}`}</span>
                                  </div>
                                  <p className="mt-0.5 text-xs text-slate-500">{f.user_email}</p>
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {isAdmin ? <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">Admin</span> : null}
                                    {isPanel ? <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Adviser/Panel</span> : <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">Not an Adviser/Panel account</span>}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">Not linked</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex gap-2">
                                <button type="button" onClick={() => openEdit(f)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[#103F78] hover:bg-blue-50"><FiEdit2 size={14} /> Edit / Link</button>
                                <button type="button" onClick={() => onDelete(f.facultyID, f.name)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><FiTrash2 size={14} /> Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="faculty-modal-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#103F78] px-6 py-5">
              <div>
                <h2 id="faculty-modal-title" className="text-lg font-bold text-white">{form.facultyID ? 'Edit Adviser/Panel & Link Account' : 'Add Adviser/Panel Record'}</h2>
                <p className="mt-1 text-xs text-blue-100">Records are used for adviser/panel selection and assignment.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} disabled={busy} aria-label="Close" className="rounded-lg p-2 text-white hover:bg-white/10"><FiX size={21} /></button>
            </div>

            <form onSubmit={onSave} className="space-y-5 p-6">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div>
                <label htmlFor="f-name" className="mb-2 block text-sm font-semibold text-slate-700">Name *</label>
                <input id="f-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} placeholder="Full name as shown in forms" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-title" className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                  <input id="f-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. Professor" />
                </div>
                <div>
                  <label htmlFor="f-dept" className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
                  <input id="f-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} placeholder="Department" />
                </div>
              </div>

              <div>
                <label htmlFor="f-user" className="mb-2 block text-sm font-semibold text-slate-700">Linked login account (Adviser/Panel)</label>
                <select id="f-user" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className={inputClass}>
                  <option value="">— Not linked —</option>
                  {users.map((u: any) => {
                    const id = String(u.userID);
                    const type = (u.is_staff || u.is_superuser) ? 'Admin' : u.is_faculty ? 'Adviser/Panel' : 'Student/User';
                    return (
                      <option key={id} value={id}>
                        {`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email} ({u.email}) — {type}
                      </option>
                    );
                  })}
                </select>
                {form.user && linkedUser && !(linkedUser.is_faculty || linkedUser.is_staff || linkedUser.is_superuser) && (
                  <p className="mt-2 text-xs font-medium text-amber-700">This user is not an Adviser/Panel account. Set their Account Type to <b>Adviser/Panel</b> in User Management so they can access <b>/panel</b>.</p>
                )}
                {form.user && linkedUser && (linkedUser.is_faculty || linkedUser.is_staff || linkedUser.is_superuser) && (
                  <p className="mt-2 text-xs font-medium text-emerald-700">This account can access review features when assigned. Ensure it’s an <b>Adviser/Panel</b> account for normal reviewer logins.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={() => setOpen(false)} disabled={busy} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#FBBF24] px-6 py-3 text-sm font-bold text-[#103F78] hover:bg-amber-300 disabled:opacity-60">
                  <FiSave size={17} /> {busy ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {busy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-xl">
            <Spinner />
            <p className="text-sm font-bold text-[#103F78]">Processing…</p>
          </div>
        </div>
      )}
    </div>
  );
}
