'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiEdit3,
  FiFileText,
  FiX,
} from 'react-icons/fi';

import PanelSidebar from '@/components/common/panel/Sidebar';
import Footer from '@/components/common/Footer';
import { AcademicReviewTools } from '@/components/common/academic/AcademicWorkflowTools';
import {
  useGetUserProfileQuery,
  useGetPanelInvitationsQuery,
  useGetApplicationsQuery,
  useGetPanelSchedulesQuery,
  useRespondAssignmentMutation,
  useAttachSignatureMutation,
  useDecideApplicationMutation,
  type PanelInvitation,
  type WorkflowApplication,
  type DefenseSchedule,
} from '@/redux/features/authApiSlice';

function errorText(error: unknown): string {
  const data = (error as { data?: Record<string, unknown> })?.data;
  if (!data) return 'Unable to complete the request.';
  if (typeof data.error === 'string') return data.error;
  if (Array.isArray(data.reasons)) return (data.reasons as string[]).join(' ');
  if (Array.isArray(data.conflicts) && data.conflicts.length) {
    return (data.conflicts as DefenseSchedule[]).map((c) =>
      `${c.stage_label} ${c.group} ${c.date} ${c.start_time}-${c.end_time}`
    ).join('; ');
  }
  return 'Unable to complete the request.';
}

function statusBadge(status?: string) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'approved' || s === 'accepted' || s === 'confirmed') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (s === 'rejected' || s === 'declined') return 'bg-red-50 text-red-700 ring-red-200';
  if (s === 'revision_required' || s === 'pending' || s === 'proposed') return 'bg-amber-50 text-amber-800 ring-amber-200';
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

function InvitationCard({
  invitation,
  busy,
  onRespond,
}: {
  invitation: PanelInvitation;
  busy: boolean;
  onRespond: (invitation: PanelInvitation, accept: boolean, reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <li className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusBadge(invitation.response)}`}>invitation pending</span>
            <span className="text-xs font-medium text-slate-500">{invitation.position_label}</span>
            <span className="text-xs font-medium text-slate-500">{invitation.application.department}</span>
          </div>
          <h3 className="mt-2 text-sm font-bold text-slate-900 sm:text-base">{invitation.application.research_title || 'Untitled research'}</h3>
          <p className="mt-1 text-sm text-slate-600">Lead researcher: {invitation.application.lead_researcher || '—'}</p>
          <p className="mt-1 text-xs text-slate-500">
            {invitation.application.stage.replace('_', ' ')} · attempt {invitation.application.attempt} · {invitation.application.status}
          </p>
        </div>
        <div className="w-full shrink-0 xl:w-96">
          <label htmlFor={`invite-reason-${invitation.assignment_id}`} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Reason (required to decline)
          </label>
          <textarea
            id={`invite-reason-${invitation.assignment_id}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#12186E] focus:ring-2 focus:ring-[#12186E]/15"
            placeholder="Explain why you cannot serve on this panel..."
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => onRespond(invitation, true, '')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
              <FiCheck size={14} /> Accept
            </button>
            <button type="button" disabled={busy || !reason.trim()} onClick={() => onRespond(invitation, false, reason)} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
              <FiX size={14} /> Decline
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function DecisionCard({
  application,
  facultyId,
  busy,
  onDecide,
  onAttach,
}: {
  application: WorkflowApplication;
  facultyId?: number | null;
  busy: boolean;
  onDecide: (application: WorkflowApplication, decision: 'approve' | 'reject' | 'revision', reason: string, comments: string) => void;
  onAttach: (application: WorkflowApplication, file: File) => void;
}) {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const myApproval = application.approvals?.find((approval) =>
    approval.faculty_id === facultyId && approval.attempt === application.attempt
  );
  const decided = Boolean(myApproval && ['approved', 'rejected', 'revision_required'].includes(myApproval.status));

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  };

  return (
    <li className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusBadge(application.status)}`}>
              {application.status.replace('_', ' ')}
            </span>
            <span className="text-xs font-medium text-slate-500">{application.stage_label}</span>
            <span className="text-xs font-medium text-slate-500">attempt {application.attempt}</span>
          </div>
          <h3 className="mt-2 text-sm font-bold text-slate-900 sm:text-base">{application.research_title || 'Untitled research'}</h3>
          <p className="mt-1 text-sm text-slate-600">Lead researcher: {application.lead_researcher || '—'}</p>
          {!!application.decision_reason && (
            <p className="mt-2 text-xs font-semibold text-rose-700">Decision reason: {application.decision_reason}</p>
          )}
          {myApproval && (
            <p className="mt-2 text-xs text-slate-600">
              Your decision: <span className="font-bold">{myApproval.status.replace('_', ' ')}</span>
              {myApproval.has_signature ? ' · signature attached' : ' · no signature attached'}
              {myApproval.reason ? ` · ${myApproval.reason}` : ''}
            </p>
          )}
        </div>
        <div className="w-full shrink-0 space-y-3 xl:w-96">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label htmlFor={`signature-${application.application_id}`} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Your signature {myApproval?.has_signature ? '(attached)' : '(required to approve)'}
            </label>
            <input id={`signature-${application.application_id}`} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={chooseFile} disabled={busy || decided} className="w-full text-xs text-slate-600" />
            {preview && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
                <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Signature preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Selected signature preview" className="h-16 max-w-full object-contain" />
              </div>
            )}
            {file && !decided && (
              <button type="button" disabled={busy} onClick={() => onAttach(application, file)} className="mt-2 rounded-lg border border-[#12186E] px-3 py-1.5 text-xs font-bold text-[#12186E] hover:bg-blue-50 disabled:opacity-50">
                Attach signature
              </button>
            )}
          </div>
          {!decided ? (
            <>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#12186E] focus:ring-2 focus:ring-[#12186E]/15"
                placeholder="Reason (required for reject / revision)"
              />
              <textarea
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#12186E] focus:ring-2 focus:ring-[#12186E]/15"
                placeholder="Optional comments"
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => onDecide(application, 'approve', '', comments)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                  <FiCheck size={14} /> Approve
                </button>
                <button type="button" disabled={busy || !reason.trim()} onClick={() => onDecide(application, 'revision', reason, comments)} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60">
                  <FiEdit3 size={14} /> Request revision
                </button>
                <button type="button" disabled={busy || !reason.trim()} onClick={() => onDecide(application, 'reject', reason, comments)} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
                  <FiX size={14} /> Reject
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">Your decision for this attempt is final. Prior decisions are preserved in the application history.</p>
          )}
        </div>
      </div>
    </li>
  );
}

export default function PanelDashboardPage() {
  const { data: profile } = useGetUserProfileQuery();
  const facultyId = profile?.faculty_id ?? null;
  const { data: invitations = [], refetch: refetchInvitations } = useGetPanelInvitationsQuery();
  const { data: applications = [], refetch: refetchApplications } = useGetApplicationsQuery({ scope: 'mine' });
  const { data: schedules = [] } = useGetPanelSchedulesQuery();

  const [respondAssignment, { isLoading: responding }] = useRespondAssignmentMutation();
  const [attachSignature] = useAttachSignatureMutation();
  const [decideApplication] = useDecideApplicationMutation();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const decisionApps = applications.filter((app) =>
    ['submitted', 'pending'].includes(app.status)
    && app.panel.some((member) => member.faculty_id === facultyId && member.response === 'accepted')
  );

  const refreshWorkflow = async () => {
    await Promise.all([refetchInvitations(), refetchApplications()]);
  };

  const onRespond = async (invitation: PanelInvitation, accept: boolean, reason: string) => {
    setBusyId(`invite-${invitation.assignment_id}`);
    setNotice(null);
    try {
      await respondAssignment({ assignmentID: invitation.assignment_id, decision: accept ? 'accept' : 'decline', reason }).unwrap();
      setNotice({ type: 'ok', text: `Invitation ${accept ? 'accepted' : 'declined'}.` });
      await refreshWorkflow();
    } catch (error) {
      setNotice({ type: 'err', text: errorText(error) });
    } finally {
      setBusyId(null);
    }
  };

  const onAttach = async (application: WorkflowApplication, signature: File) => {
    setBusyId(`signature-${application.application_id}`);
    setNotice(null);
    try {
      await attachSignature({ applicationID: application.application_id, signature }).unwrap();
      setNotice({ type: 'ok', text: 'Signature attached to your approval record.' });
      await refreshWorkflow();
    } catch (error) {
      setNotice({ type: 'err', text: errorText(error) });
    } finally {
      setBusyId(null);
    }
  };

  const onDecide = async (application: WorkflowApplication, decision: 'approve' | 'reject' | 'revision', reason: string, note: string) => {
    setBusyId(`decision-${application.application_id}`);
    setNotice(null);
    try {
      await decideApplication({ applicationID: application.application_id, decision, reason, comments: note }).unwrap();
      setNotice({ type: 'ok', text: `Decision recorded: ${decision}.` });
      await refreshWorkflow();
    } catch (error) {
      setNotice({ type: 'err', text: errorText(error) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6]">
      <PanelSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-16 pt-24 sm:px-8 md:pt-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Panel / Adviser Workspace</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#12186E]">Adviser, Panelist &amp; Committee Review</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Accept or decline panel invitations, attach your signature before approving a defense application, and review confirmed schedules.
              </p>
            </div>

            {notice && (
              <div className={`mb-6 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {notice.type === 'ok' ? <FiCheckCircle className="mt-0.5 shrink-0" /> : <FiAlertCircle className="mt-0.5 shrink-0" />}
                {notice.text}
              </div>
            )}

            <section id="invitations" className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#12186E]"><FiFileText /> Panel Invitations</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{invitations.length}</span>
              </div>
              {invitations.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-500">No pending panel invitations.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {invitations.map((invitation) => (
                    <InvitationCard
                      key={invitation.assignment_id}
                      invitation={invitation}
                      busy={responding && busyId === `invite-${invitation.assignment_id}`}
                      onRespond={(item, accept, reason) => void onRespond(item, accept, reason)}
                    />
                  ))}
                </ul>
              )}
            </section>

            <section id="reviews" className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#12186E]"><FiCheckCircle /> Applications Awaiting Your Decision</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{decisionApps.length}</span>
              </div>
              {decisionApps.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-500">No submitted applications are currently assigned to you.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {decisionApps.map((application) => (
                    <DecisionCard
                      key={application.application_id}
                      application={application}
                      facultyId={facultyId}
                      busy={Boolean(busyId?.startsWith(`signature-${application.application_id}`) || busyId?.startsWith(`decision-${application.application_id}`))}
                      onAttach={(app, file) => void onAttach(app, file)}
                      onDecide={(app, decision, reason, note) => void onDecide(app, decision, reason, note)}
                    />
                  ))}
                </ul>
              )}
            </section>

            <section id="schedule" className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#12186E]"><FiClock /> My Defense Schedule</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{schedules.length}</span>
              </div>
              {schedules.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-500">No defense schedules assigned to you yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {schedules.map((schedule) => (
                    <li key={schedule.schedule_id} className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusBadge(schedule.status)}`}>{schedule.status}</span>
                            <span className="text-xs font-semibold text-slate-600">{schedule.stage_label}</span>
                          </div>
                          <h3 className="mt-2 text-sm font-bold text-slate-900">{schedule.research_title}</h3>
                          <p className="mt-1 text-xs text-slate-600">Group: {schedule.group} · {schedule.date} · {schedule.start_time}–{schedule.end_time}</p>
                          <p className="mt-1 text-xs text-slate-600">Venue/link: {schedule.venue_or_link}</p>
                        </div>
                      </div>
                      {!!schedule.conflicts?.length && (
                        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                          <p className="font-bold">Overlapping confirmed defense:</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5">
                            {schedule.conflicts.map((conflict) => (
                              <li key={conflict.schedule_id}>
                                {conflict.stage_label} · {conflict.group} · {conflict.date} {conflict.start_time}–{conflict.end_time} ({conflict.conflicting_panelists.join(', ')})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section id="academic-tools" className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#12186E]"><FiClipboard /> Academic Review Tools</h2>
              <p className="mt-1 text-xs text-slate-500">
                Endorse defenses, score with the published CITC rubric, and verify revisions. Server-side rules limit each action to the assigned reviewer.
              </p>
              <div className="mt-5">
                <AcademicReviewTools applications={applications} facultyId={facultyId} />
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
