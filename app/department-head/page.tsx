'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useGetUserProfileQuery, useListUsersQuery, useGetFacultyQuery,
  useGetApplicationsQuery, useGetNotificationsQuery,
  useAddUserMutation, useUpdateUserMutation, useAssignPanelistMutation,
  useRemovePanelistMutation, useUnlockPanelCorrectionMutation,
  useProposeScheduleMutation, useConfirmScheduleMutation, useMarkNotificationReadMutation,
  type PanelAssignment,
} from '@/redux/features/authApiSlice';
import DepartmentHeadSidebar from '@/components/common/department-head/Sidebar';

function errorText(error: any): string {
  const data = error?.data;
  if (!data) return 'Something went wrong.';
  if (typeof data.error === 'string') return data.error;
  if (Array.isArray(data.reasons)) return data.reasons.join(' ');
  if (Array.isArray(data.conflicts) && data.conflicts.length) {
    return data.conflicts.map((c: any) => `${c.stage_label} ${c.group} ${c.date} ${c.start_time}-${c.end_time}`).join('; ');
  }
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  submitted: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  revision_required: 'bg-orange-100 text-orange-800',
};

export default function DepartmentHeadPage() {
  const { data: profile } = useGetUserProfileQuery();
  const { data: users, refetch: refetchUsers } = useListUsersQuery();
  const { data: faculty } = useGetFacultyQuery();
  const scope = profile?.is_superadmin ? 'all' : 'department';
  const { data: applications, refetch: refetchApps } = useGetApplicationsQuery({ scope: scope as 'all' | 'department' });
  const { data: notifications, refetch: refetchNotifications } = useGetNotificationsQuery();

  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [assignPanelist] = useAssignPanelistMutation();
  const [removePanelist] = useRemovePanelistMutation();
  const [unlockPanel] = useUnlockPanelCorrectionMutation();
  const [proposeSchedule] = useProposeScheduleMutation();
  const [confirmSchedule] = useConfirmScheduleMutation();
  const [markRead] = useMarkNotificationReadMutation();

  const [newUser, setNewUser] = useState({
    first_name: '', last_name: '', email: '', password: '', repassword: '', account_type: 'student',
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [facultyId, setFacultyId] = useState('');
  const [position, setPosition] = useState('panel1');
  const [replaceId, setReplaceId] = useState('');
  const [scheduleForm, setScheduleForm] = useState({ date: '', start_time: '', end_time: '', venue_or_link: '' });
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () => applications?.find((a) => a.application_id === selectedId) || applications?.[0] || null,
    [applications, selectedId]
  );

  useEffect(() => {
    if (!selectedId && applications?.length) setSelectedId(applications[0].application_id);
  }, [applications, selectedId]);

  const selectedSchedule = selected?.schedule;
  useEffect(() => {
    if (selectedSchedule) {
      setScheduleForm({
        date: selectedSchedule.date,
        start_time: selectedSchedule.start_time,
        end_time: selectedSchedule.end_time,
        venue_or_link: selectedSchedule.venue_or_link,
      });
    } else {
      setScheduleForm({ date: '', start_time: '', end_time: '', venue_or_link: '' });
    }
  }, [selectedSchedule]);

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      refetchApps();
      refetchUsers();
      refetchNotifications();
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setBusy(false);
    }
  };

  const createAccount = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await addUser({
        ...newUser,
        account_type: newUser.account_type as any,
        department: profile?.department || undefined,
      }).unwrap();
      setNewUser({ first_name: '', last_name: '', email: '', password: '', repassword: '', account_type: 'student' });
    }, 'Department account created.');
  };

  const activePanel = selected?.panel || [];
  const declined = activePanel.filter((a) => a.response === 'declined');
  const availableFaculty = faculty?.filter((f) => !activePanel.some((a) => a.faculty_id === f.facultyID)) || [];

  const assign = () => {
    if (!selected || !facultyId) return;
    run(async () => {
      await assignPanelist({
        applicationID: selected.application_id,
        faculty_id: Number(facultyId),
        position,
        replace_assignment_id: replaceId ? Number(replaceId) : undefined,
      }).unwrap();
      setFacultyId('');
      setReplaceId('');
    }, 'Panelist assignment saved.');
  };

  const remove = (assignment: PanelAssignment) => {
    if (!selected) return;
    run(async () => {
      await removePanelist({ applicationID: selected.application_id, assignmentID: assignment.assignment_id }).unwrap();
    }, 'Panelist removed.');
  };

  const unlock = () => {
    if (!selected) return;
    run(async () => {
      await unlockPanel(selected.application_id).unwrap();
    }, 'Panel unlocked for correction. Make changes before submission.');
  };

  const saveSchedule = () => {
    if (!selected) return;
    run(async () => {
      await proposeSchedule({
        applicationID: selected.application_id,
        ...scheduleForm,
        schedule_id: selected.schedule?.schedule_id,
      }).unwrap();
    }, 'Schedule saved.');
  };

  const confirm = () => {
    if (!selected?.schedule) return;
    run(async () => {
      await confirmSchedule(selected.schedule!.schedule_id).unwrap();
    }, 'Schedule confirmed.');
  };

  const toggleActive = async (user: any) => {
    await run(async () => {
      await updateUser({ userID: String(user.userID), userData: { is_active: !user.is_active } }).unwrap();
    }, 'Account updated.');
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FC]">
      <DepartmentHeadSidebar />
      <main className="flex-1 px-5 pb-16 pt-24 md:px-10 md:pt-10">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Department administration</p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#103F78]">Department Head Portal</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage department accounts, defense panels and schedules. Scope is enforced for {profile?.department || 'your department'}.
          </p>
        </header>

        <section id="notifications" className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#103F78]">Notifications</h2>
          {!notifications?.length && <p className="mt-2 text-sm text-slate-500">No new notifications.</p>}
          <div className="mt-3 space-y-2">
            {notifications?.map((n) => (
              <div key={n.notification_id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-600">{n.message}</p>
                </div>
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => run(async () => { await markRead(n.notification_id).unwrap(); }, 'Marked as read.')}
                    className="rounded-lg bg-[#103F78] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="accounts" className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#103F78]">Create department account</h2>
            <p className="mt-1 text-xs text-slate-500">Only student and faculty accounts can be created at this level.</p>
            <form onSubmit={createAccount} className="mt-4 grid gap-3 sm:grid-cols-2">
              {(['first_name', 'last_name', 'email', 'password', 'repassword'] as const).map((field) => (
                <input
                  key={field}
                  type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                  placeholder={field.replace(/_/g, ' ')}
                  value={newUser[field]}
                  onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              ))}
              <select
                value={newUser.account_type}
                onChange={(e) => setNewUser({ ...newUser, account_type: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="student">Student / User</option>
                <option value="faculty">Faculty / Panelist</option>
                {profile?.is_superadmin && <option value="admin">Admin</option>}
                {profile?.is_superadmin && <option value="department_head">Department Head</option>}
              </select>
              <button disabled={busy} className="rounded-lg bg-[#103F78] px-4 py-2 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">
                Create account
              </button>
            </form>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#103F78]">Department accounts</h2>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {users?.map((u) => (
                <div key={u.userID} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-slate-500">{u.email} · {u.account_type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActive(u)}
                    disabled={busy}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="applications" className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#103F78]">Defense applications & panels</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="max-h-[36rem] space-y-2 overflow-y-auto pr-1">
              {applications?.map((app) => (
                <button
                  key={app.application_id}
                  type="button"
                  onClick={() => setSelectedId(app.application_id)}
                  className={`w-full rounded-xl border p-3 text-left ${selected?.application_id === app.application_id ? 'border-[#103F78] bg-blue-50' : 'border-slate-200'}`}
                >
                  <p className="text-sm font-semibold text-slate-800">{app.research_title || 'Untitled'}</p>
                  <p className="mt-1 text-xs text-slate-500">{app.stage_label} · {app.lead_researcher}</p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[app.status] || 'bg-slate-100'}`}>
                    {app.status}
                  </span>
                </button>
              ))}
              {!applications?.length && <p className="text-sm text-slate-500">No applications in this department yet.</p>}
            </div>

            {selected && (
              <div className="space-y-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-[#103F78]">{selected.research_title}</h3>
                      <p className="text-xs text-slate-600">{selected.stage_label} · attempt {selected.attempt} · {selected.department}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[selected.status] || 'bg-slate-100'}`}>{selected.status}</span>
                  </div>
                  {!!selected.submit_blockers?.length && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-rose-700">
                      {selected.submit_blockers.map((reason) => <li key={reason}>{reason}</li>)}
                    </ul>
                  )}
                  {!!selected.decision_reason && <p className="mt-2 text-xs font-semibold text-rose-700">Decision: {selected.decision_reason}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="">Choose faculty member…</option>
                    {availableFaculty.map((f) => <option key={f.facultyID} value={f.facultyID}>{f.name} — {f.department || 'No dept'}</option>)}
                  </select>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="panel_chair">Panel Chair</option>
                    <option value="panel1">Member 1</option>
                    <option value="panel2">Member 2</option>
                    <option value="panel3">Member 3</option>
                    <option value="extra">Additional Member</option>
                  </select>
                  <select value={replaceId} onChange={(e) => setReplaceId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="">New assignment</option>
                    {declined.map((a) => <option key={a.assignment_id} value={a.assignment_id}>Replace {a.name}</option>)}
                  </select>
                  <button type="button" onClick={assign} disabled={busy || !facultyId} className="rounded-lg bg-[#103F78] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Assign</button>
                  {selected.panel_locked && (
                    <button type="button" onClick={unlock} disabled={busy} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                      Unlock for correction
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr><th className="p-3">Panelist</th><th className="p-3">Position</th><th className="p-3">Response</th><th className="p-3">Reason</th><th className="p-3" /></tr>
                    </thead>
                    <tbody>
                      {activePanel.map((a) => (
                        <tr key={a.assignment_id} className="border-t border-slate-100">
                          <td className="p-3 font-semibold text-slate-800">{a.name}</td>
                          <td className="p-3">{a.position_label}</td>
                          <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${a.response === 'accepted' ? 'bg-emerald-100 text-emerald-700' : a.response === 'declined' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{a.response}</span></td>
                          <td className="p-3 text-xs text-slate-600">{a.response_reason || '—'}</td>
                          <td className="p-3">
                            <button type="button" onClick={() => remove(a)} disabled={busy} className="text-xs font-semibold text-rose-600 hover:underline">Remove</button>
                          </td>
                        </tr>
                      ))}
                      {!activePanel.length && <tr><td colSpan={5} className="p-4 text-center text-slate-500">No panelists assigned yet.</td></tr>}
                    </tbody>
                  </table>
                </div>

                {!!selected.panel_history?.length && (
                  <details className="rounded-xl border border-slate-200 p-4 text-sm">
                    <summary className="cursor-pointer font-semibold text-slate-700">Response history ({selected.panel_history.length})</summary>
                    <ul className="mt-3 space-y-1 text-xs text-slate-600">
                      {selected.panel_history.map((h) => (
                        <li key={h.assignment_id}>{h.name} — {h.position_label} — {h.response} {h.response_reason ? `(${h.response_reason})` : ''}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </section>

        <section id="schedules" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#103F78]">Defense schedule</h2>
          {!selected ? <p className="mt-2 text-sm text-slate-500">Select an application first.</p> : (
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input type="time" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input type="time" value={scheduleForm.end_time} onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input placeholder="Venue or meeting link" value={scheduleForm.venue_or_link} onChange={(e) => setScheduleForm({ ...scheduleForm, venue_or_link: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <button type="button" onClick={saveSchedule} disabled={busy} className="rounded-lg bg-[#103F78] px-4 py-2 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">Save schedule</button>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                {selected.schedule ? (
                  <>
                    <p className="font-semibold text-[#103F78]">{selected.schedule.stage_label} · {selected.schedule.status}</p>
                    <p className="mt-1 text-slate-600">{selected.schedule.date} · {selected.schedule.start_time}–{selected.schedule.end_time}</p>
                    <p className="text-slate-600">{selected.schedule.venue_or_link}</p>
                    {!!selected.schedule.conflicts?.length && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-rose-700">
                        {selected.schedule.conflicts.map((c) => <li key={c.schedule_id}>{c.stage_label} {c.group} on {c.date} {c.start_time}-{c.end_time} ({c.conflicting_panelists.join(', ')})</li>)}
                      </ul>
                    )}
                    {selected.schedule.status !== 'confirmed' && (
                      <button type="button" onClick={confirm} disabled={busy} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Confirm schedule</button>
                    )}
                  </>
                ) : <p className="text-slate-500">No schedule proposed for this attempt.</p>}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
