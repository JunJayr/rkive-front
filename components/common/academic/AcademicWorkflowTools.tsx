'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  FiCheckCircle,
  FiClipboard,
  FiList,
  FiSave,
  FiShield,
  FiUsers,
} from 'react-icons/fi';

import { ActionSpinner, EmptyState, Notice, StatusBadge } from '@/components/common/Feedback';
import {
  useGetApplicationsQuery,
  useGetClearanceQuery,
  useGetEndorsementQuery,
  useGetFacultyQuery,
  useGetMentorshipRequestsQuery,
  useGetPanelScoresQuery,
  useGetRevisionItemsQuery,
  useGetRubricsQuery,
  useActOnRevisionItemMutation,
  useCreateMentorshipRequestMutation,
  useCreateRubricMutation,
  useGrantClearanceMutation,
  useRespondMentorshipRequestMutation,
  useSavePanelScoresMutation,
  useSetEndorsementMutation,
  type WorkflowApplication,
} from '@/redux/features/authApiSlice';

type NoticeState = { tone: 'success' | 'error'; text: string } | null;

function messageOf(error: unknown): string {
  const data = (error as { data?: unknown })?.data;
  if (data && typeof data === 'object') {
    const value = data as { error?: string; errors?: string[] };
    if (typeof value.error === 'string') return value.error;
    if (Array.isArray(value.errors)) return value.errors.join(' ');
  }
  if (typeof data === 'string') return data;
  return 'Something went wrong. Please try again.';
}

function ToolCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rk-card p-5">
      <h4 className="flex items-center gap-2 text-sm font-bold text-brandNavy">{icon}{title}</h4>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Panel / Adviser tools                                                       */
/* -------------------------------------------------------------------------- */

export function AcademicReviewTools({
  applications,
  facultyId,
}: {
  applications: WorkflowApplication[];
  facultyId: number | null;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(
    () => applications.find((app) => app.application_id === selectedId) || applications[0] || null,
    [applications, selectedId]
  );
  const isAdviser = Boolean(
    selected && facultyId && selected.panel?.some((member) => member.faculty_id === facultyId && member.position === 'adviser')
  );

  if (!applications.length) {
    return <EmptyState title="No assigned applications" description="Endorsement, scoring and revision verification appear once you are assigned to an application." />;
  }

  return (
    <div className="space-y-5">
      <label className="block text-xs font-semibold text-mutedSlate">
        Application
        <select
          value={selected?.application_id ?? ''}
          onChange={(event) => setSelectedId(Number(event.target.value))}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15"
        >
          {applications.map((app) => (
            <option key={app.application_id} value={app.application_id}>
              {app.research_title || 'Untitled'} · {app.stage_label}
            </option>
          ))}
        </select>
      </label>

      {selected && isAdviser ? <EndorsementCard applicationID={selected.application_id} /> : null}
      {selected ? <RubricScoringCard applicationID={selected.application_id} /> : null}
      {selected ? <RevisionVerificationCard applicationID={selected.application_id} /> : null}

      {selected && !isAdviser ? (
        <p className="text-xs text-mutedSlate">Adviser endorsement is managed by the assigned adviser for this application.</p>
      ) : null}
      <MentorshipResponseCard />
    </div>
  );
}

function MentorshipResponseCard() {
  const { data: requests = [], isLoading, refetch } = useGetMentorshipRequestsQuery();
  const [respond, { isLoading: saving }] = useRespondMentorshipRequestMutation();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState<NoticeState>(null);

  const decide = async (requestID: number, decision: 'accept' | 'decline') => {
    setNotice(null);
    try {
      await respond({ request_id: requestID, decision, note: notes[requestID] || '' }).unwrap();
      setNotice({ tone: 'success', text: `Mentorship request ${decision === 'accept' ? 'accepted' : 'declined'}.` });
      await refetch();
    } catch (error) {
      setNotice({ tone: 'error', text: messageOf(error) });
    }
  };

  return (
    <ToolCard title="Mentorship requests" icon={<FiUsers />}>
      {isLoading ? <ActionSpinner label="Loading requests" /> : requests.length === 0 ? (
        <p className="text-xs text-mutedSlate">No mentorship requests awaiting your response.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.request_id} className="rounded-xl border border-slate-100 bg-brandSurface p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{request.research_title || 'Untitled research'}</p>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-1 text-xs text-mutedSlate">From {request.requester}{request.message ? ` · ${request.message}` : ''}</p>
              {request.status === 'pending' ? (
                <div className="mt-2 space-y-2">
                  <input aria-label={`Response note for ${request.research_title}`} value={notes[request.request_id] ?? ''} onChange={(event) => setNotes((prev) => ({ ...prev, [request.request_id]: event.target.value }))} placeholder="Optional note" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void decide(request.request_id, 'accept')} disabled={saving} className="rk-button-primary disabled:opacity-50">Accept</button>
                    <button type="button" onClick={() => void decide(request.request_id, 'decline')} disabled={saving} className="rk-button-secondary disabled:opacity-50">Decline</button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {notice ? <Notice tone={notice.tone} title="Mentorship" message={notice.text} /> : null}
    </ToolCard>
  );
}

function EndorsementCard({ applicationID }: { applicationID: number }) {
  const { data, isLoading, refetch } = useGetEndorsementQuery(applicationID);
  const [setEndorsement, { isLoading: saving }] = useSetEndorsementMutation();
  const [comments, setComments] = useState('');
  const [notice, setNotice] = useState<NoticeState>(null);

  const submit = async (endorsed: boolean) => {
    setNotice(null);
    try {
      await setEndorsement({ applicationID, endorsed, comments }).unwrap();
      setNotice({ tone: 'success', text: endorsed ? 'Endorsement recorded.' : 'Endorsement withdrawn.' });
      await refetch();
    } catch (error) {
      setNotice({ tone: 'error', text: messageOf(error) });
    }
  };

  if (isLoading) return <ToolCard title="Adviser endorsement" icon={<FiCheckCircle />}><ActionSpinner label="Loading endorsement" /></ToolCard>;

  return (
    <ToolCard title="Adviser endorsement" icon={<FiCheckCircle />}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-mutedSlate">
          Endorsement is required before a defense schedule can be proposed.
        </p>
        {data ? <StatusBadge status={data.endorsed ? 'approved' : 'pending'} /> : null}
      </div>
      {data?.endorsed ? (
        <p className="text-xs text-emerald-700">
          Endorsed by {data.adviser || data.reviewer || 'the adviser'}{data.decided_at ? ` on ${data.decided_at}` : ''}.
        </p>
      ) : null}
      <textarea
        aria-label="Endorsement comments"
        value={comments}
        onChange={(event) => setComments(event.target.value)}
        placeholder="Optional comments for the department head"
        rows={2}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15"
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void submit(true)} disabled={saving} className="rk-button-primary">
          {saving ? <ActionSpinner label="Saving" /> : 'Endorse'}
        </button>
        {data?.endorsed ? (
          <button type="button" onClick={() => void submit(false)} disabled={saving} className="rk-button-secondary">
            Withdraw
          </button>
        ) : null}
      </div>
      {notice ? <Notice tone={notice.tone} title="Endorsement" message={notice.text} /> : null}
    </ToolCard>
  );
}

function RubricScoringCard({ applicationID }: { applicationID: number }) {
  const { data: allRubrics = [], isLoading: loadingRubrics } = useGetRubricsQuery();
  const { data: scores = [], refetch: refetchScores } = useGetPanelScoresQuery(applicationID);
  const [saveScores, { isLoading: saving }] = useSavePanelScoresMutation();
  const [rubricId, setRubricId] = useState<number | null>(null);
  const [values, setValues] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState<NoticeState>(null);

  const rubrics = allRubrics.filter((item) => item.is_active);
  const rubric = rubrics.find((item) => item.rubric_id === rubricId) || rubrics[0] || null;

  const save = async () => {
    if (!rubric) return;
    setNotice(null);
    try {
      const payload = rubric.criteria
        .filter((criterion) => (values[criterion.criterion_id] ?? '').trim() !== '')
        .map((criterion) => ({
          criterion_id: criterion.criterion_id,
          score: values[criterion.criterion_id],
        }));
      if (!payload.length) {
        setNotice({ tone: 'error', text: 'Enter at least one criterion score.' });
        return;
      }
      await saveScores({ applicationID, rubric_id: rubric.rubric_id, scores: payload }).unwrap();
      setNotice({ tone: 'success', text: 'Scores saved.' });
      await refetchScores();
    } catch (error) {
      setNotice({ tone: 'error', text: messageOf(error) });
    }
  };

  if (loadingRubrics) return <ToolCard title="CITC rubric scoring" icon={<FiClipboard />}><ActionSpinner label="Loading rubrics" /></ToolCard>;

  return (
    <ToolCard title="CITC rubric scoring" icon={<FiClipboard />}>
      {!rubrics.length ? (
        <p className="text-xs text-mutedSlate">No scoring rubric has been published yet.</p>
      ) : (
        <>
          <label className="block text-xs font-semibold text-mutedSlate">
            Rubric
            <select
              value={rubric?.rubric_id ?? ''}
              onChange={(event) => { setRubricId(Number(event.target.value)); setValues({}); }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15"
            >
              {rubrics.map((item) => (
                <option key={item.rubric_id} value={item.rubric_id}>{item.name} · v{item.version}</option>
              ))}
            </select>
          </label>
          {rubric?.criteria.map((criterion) => (
            <label key={criterion.criterion_id} className="flex flex-col gap-1 text-xs font-semibold text-mutedSlate sm:flex-row sm:items-center sm:justify-between">
              <span>{criterion.name} <span className="font-normal">/ {criterion.max_score}</span></span>
              <input
                type="number"
                min={0}
                max={Number(criterion.max_score)}
                value={values[criterion.criterion_id] ?? ''}
                onChange={(event) => setValues((prev) => ({ ...prev, [criterion.criterion_id]: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15 sm:w-28"
              />
            </label>
          ))}
          <button type="button" onClick={() => void save()} disabled={saving} className="rk-button-primary">
            {saving ? <ActionSpinner label="Saving" /> : <><FiSave size={15} /> Save scores</>}
          </button>
          {scores.length ? (
            <p className="text-xs text-mutedSlate">{scores.length} score record(s) saved for this attempt.</p>
          ) : null}
          {notice ? <Notice tone={notice.tone} title="Scores" message={notice.text} /> : null}
        </>
      )}
    </ToolCard>
  );
}

function RevisionVerificationCard({ applicationID }: { applicationID: number }) {
  const { data: items = [], isLoading, refetch } = useGetRevisionItemsQuery(applicationID);
  const [act, { isLoading: saving }] = useActOnRevisionItemMutation();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState<NoticeState>(null);

  const verify = async (itemID: number) => {
    setNotice(null);
    try {
      await act({ applicationID, itemID, action: 'verify', note: notes[itemID] || '' }).unwrap();
      setNotice({ tone: 'success', text: 'Revision verified.' });
      await refetch();
    } catch (error) {
      setNotice({ tone: 'error', text: messageOf(error) });
    }
  };

  if (isLoading) return <ToolCard title="Revision verification" icon={<FiClipboard />}><ActionSpinner label="Loading revisions" /></ToolCard>;

  return (
    <ToolCard title="Revision verification" icon={<FiClipboard />}>
      {!items.length ? (
        <p className="text-xs text-mutedSlate">No revision items have been recorded for this application.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.item_id} className="rounded-xl border border-slate-100 bg-brandSurface p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{item.requirement}</p>
                <StatusBadge status={item.panel_verified ? 'approved' : item.student_addressed ? 'submitted' : 'pending'} />
              </div>
              <p className="mt-1 text-xs text-mutedSlate">Student: {item.student_note || (item.student_addressed ? 'Addressed' : 'Not yet addressed')}</p>
              {item.panel_verified ? (
                <p className="mt-1 text-xs text-emerald-700">Verified: {item.panel_note || 'Confirmed'}</p>
              ) : (
                <div className="mt-2 space-y-2">
                  <input
                    aria-label={`Verification note for ${item.requirement}`}
                    value={notes[item.item_id] ?? ''}
                    onChange={(event) => setNotes((prev) => ({ ...prev, [item.item_id]: event.target.value }))}
                    placeholder="Verification note"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15"
                    disabled={!item.student_addressed}
                  />
                  <button
                    type="button"
                    onClick={() => void verify(item.item_id)}
                    disabled={saving || !item.student_addressed}
                    className="rk-button-primary disabled:opacity-50"
                  >
                    Verify revision
                  </button>
                  {!item.student_addressed ? <p className="text-xs text-mutedSlate">Available after the student marks this item addressed.</p> : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {notice ? <Notice tone={notice.tone} title="Revision" message={notice.text} /> : null}
    </ToolCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Student tools                                                               */
/* -------------------------------------------------------------------------- */

export function StudentAcademicTools() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <MentorshipCard />
      <StudentRevisionCard />
    </div>
  );
}

function MentorshipCard() {
  const { data: faculty = [] } = useGetFacultyQuery();
  const { data: requests = [], isLoading, refetch } = useGetMentorshipRequestsQuery();
  const [createRequest, { isLoading: creating }] = useCreateMentorshipRequestMutation();
  const [facultyId, setFacultyId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState<NoticeState>(null);

  const submit = async () => {
    if (!facultyId) return;
    setNotice(null);
    try {
      await createRequest({ faculty_id: Number(facultyId), research_title: title, message }).unwrap();
      setNotice({ tone: 'success', text: 'Mentorship request sent.' });
      setFacultyId('');
      setTitle('');
      setMessage('');
      await refetch();
    } catch (error) {
      setNotice({ tone: 'error', text: messageOf(error) });
    }
  };

  return (
    <ToolCard title="Mentorship requests" icon={<FiUsers />}>
      <label className="block text-xs font-semibold text-mutedSlate">
        Panel / Adviser
        <select value={facultyId} onChange={(event) => setFacultyId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15">
          <option value="">Select a reviewer</option>
          {faculty.map((member) => <option key={member.facultyID} value={member.facultyID}>{member.name}{member.department ? ` — ${member.department}` : ''}</option>)}
        </select>
      </label>
      <input aria-label="Research title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Research title" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
      <textarea aria-label="Message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Introduce your group and your research" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
      <button type="button" onClick={() => void submit()} disabled={creating || !facultyId} className="rk-button-primary disabled:opacity-50">
        {creating ? <ActionSpinner label="Sending" /> : 'Request mentorship'}
      </button>
      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-mutedSlate">Your requests</p>
        {isLoading ? <ActionSpinner label="Loading requests" /> : requests.length === 0 ? (
          <p className="text-xs text-mutedSlate">No requests yet.</p>
        ) : (
          <ul className="space-y-2">
            {requests.map((request) => (
              <li key={request.request_id} className="flex items-center justify-between gap-2 rounded-lg bg-brandSurface px-3 py-2 text-xs">
                <span className="text-ink">{request.research_title || 'Untitled research'} · {request.panelist}</span>
                <StatusBadge status={request.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {notice ? <Notice tone={notice.tone} title="Mentorship" message={notice.text} /> : null}
    </ToolCard>
  );
}

function StudentRevisionCard() {
  const { data: applications = [] } = useGetApplicationsQuery({ scope: 'mine' });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = applications.find((app) => app.application_id === selectedId) || applications[0] || null;
  const { data: items = [], isLoading, refetch } = useGetRevisionItemsQuery(selected?.application_id ?? 0);
  const [act, { isLoading: saving }] = useActOnRevisionItemMutation();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState<NoticeState>(null);

  const markAddressed = async (itemID: number) => {
    setNotice(null);
    try {
      await act({ applicationID: selected!.application_id, itemID, action: 'addressed', note: notes[itemID] || '' }).unwrap();
      setNotice({ tone: 'success', text: 'Revision marked addressed. Awaiting panel verification.' });
      await refetch();
    } catch (error) {
      setNotice({ tone: 'error', text: messageOf(error) });
    }
  };

  if (!applications.length) {
    return <ToolCard title="Revision items" icon={<FiClipboard />}><p className="text-xs text-mutedSlate">No applications found.</p></ToolCard>;
  }

  return (
    <ToolCard title="Revision items" icon={<FiClipboard />}>
      <label className="block text-xs font-semibold text-mutedSlate">
        Application
        <select value={selected?.application_id ?? ''} onChange={(event) => setSelectedId(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15">
          {applications.map((app) => <option key={app.application_id} value={app.application_id}>{app.research_title || 'Untitled'} · {app.stage_label}</option>)}
        </select>
      </label>
      {isLoading ? <ActionSpinner label="Loading revisions" /> : items.length === 0 ? (
        <p className="text-xs text-mutedSlate">No revision items for this application.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.item_id} className="rounded-xl border border-slate-100 bg-brandSurface p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{item.requirement}</p>
                <StatusBadge status={item.panel_verified ? 'approved' : item.student_addressed ? 'submitted' : 'pending'} />
              </div>
              {item.panel_verified ? (
                <p className="mt-1 text-xs text-emerald-700">Verified by panel: {item.panel_note || 'Confirmed'}</p>
              ) : (
                <div className="mt-2 space-y-2">
                  <input aria-label={`Response for ${item.requirement}`} value={notes[item.item_id] ?? ''} onChange={(event) => setNotes((prev) => ({ ...prev, [item.item_id]: event.target.value }))} placeholder="How you addressed this" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
                  <button type="button" onClick={() => void markAddressed(item.item_id)} disabled={saving || item.student_addressed} className="rk-button-primary disabled:opacity-50">
                    {item.student_addressed ? 'Addressed' : 'Mark addressed'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {notice ? <Notice tone={notice.tone} title="Revisions" message={notice.text} /> : null}
    </ToolCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Department Head and academic admin tools                                    */
/* -------------------------------------------------------------------------- */

export function DepartmentClearanceCard({ applicationID }: { applicationID: number }) {
  const { data, isLoading, refetch } = useGetClearanceQuery(applicationID);
  const [grant, { isLoading: saving }] = useGrantClearanceMutation();
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState<NoticeState>(null);

  const submit = async () => {
    setNotice(null);
    try {
      await grant({ applicationID, final_grade: grade, notes }).unwrap();
      setNotice({ tone: 'success', text: 'Departmental clearance recorded.' });
      await refetch();
    } catch (error) {
      setNotice({ tone: 'error', text: messageOf(error) });
    }
  };

  if (isLoading) return <ToolCard title="Departmental clearance" icon={<FiShield />}><ActionSpinner label="Loading clearance" /></ToolCard>;

  return (
    <ToolCard title="Departmental clearance" icon={<FiShield />}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-mutedSlate">Clearance is available after all revision items are panel-verified.</p>
        {data ? <StatusBadge status="approved" /> : null}
      </div>
      {data ? (
        <p className="text-xs text-emerald-700">Granted {data.granted_at ? `on ${data.granted_at}` : ''} · Grade: {data.final_grade}</p>
      ) : null}
      <input aria-label="Final grade" value={grade} onChange={(event) => setGrade(event.target.value)} placeholder="Final grade (e.g. Passed)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
      <textarea aria-label="Clearance notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Clearance notes" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
      <button type="button" onClick={() => void submit()} disabled={saving || !grade} className="rk-button-primary disabled:opacity-50">
        {saving ? <ActionSpinner label="Saving" /> : 'Grant clearance'}
      </button>
      {notice ? <Notice tone={notice.tone} title="Clearance" message={notice.text} /> : null}
    </ToolCard>
  );
}

export function RubricManagementCard() {
  const { data: rubrics = [], isLoading, refetch } = useGetRubricsQuery();
  const [create, { isLoading: saving }] = useCreateRubricMutation();
  const [form, setForm] = useState({ name: '', version: '', description: '', criteria: 'Methodology,50\nContribution,50' });
  const [notice, setNotice] = useState<NoticeState>(null);

  const submit = async () => {
    setNotice(null);
    try {
      const criteria = form.criteria.split('\n').map((line) => {
        const [name, max] = line.split(',').map((part) => part.trim());
        return { name, max_score: Number(max) || 50 };
      }).filter((item) => item.name);
      await create({ name: form.name, version: form.version, description: form.description, criteria }).unwrap();
      setNotice({ tone: 'success', text: 'Rubric published.' });
      setForm({ name: '', version: '', description: '', criteria: 'Methodology,50\nContribution,50' });
      await refetch();
    } catch (error) {
      setNotice({ tone: 'error', text: messageOf(error) });
    }
  };

  return (
    <ToolCard title="CITC scoring rubrics" icon={<FiList />}>
      <input aria-label="Rubric name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Rubric name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input aria-label="Version" value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} placeholder="Version (e.g. 1.0)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
        <input aria-label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
      </div>
      <label className="block text-xs font-semibold text-mutedSlate">
        Criteria (one per line: name, max score)
        <textarea aria-label="Rubric criteria" value={form.criteria} onChange={(event) => setForm({ ...form, criteria: event.target.value })} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brandNavy focus:ring-2 focus:ring-brandNavy/15" />
      </label>
      <button type="button" onClick={() => void submit()} disabled={saving || !form.name} className="rk-button-primary disabled:opacity-50">
        {saving ? <ActionSpinner label="Publishing" /> : 'Publish rubric'}
      </button>
      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-mutedSlate">Published rubrics</p>
        {isLoading ? <ActionSpinner label="Loading rubrics" /> : rubrics.length === 0 ? (
          <p className="text-xs text-mutedSlate">No rubrics published yet.</p>
        ) : (
          <ul className="space-y-2">
            {rubrics.map((rubric) => (
              <li key={rubric.rubric_id} className="flex items-center justify-between gap-2 rounded-lg bg-brandSurface px-3 py-2 text-xs">
                <span className="font-semibold text-ink">{rubric.name} · v{rubric.version}</span>
                <StatusBadge status={rubric.is_active ? 'active' : 'inactive'} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {notice ? <Notice tone={notice.tone} title="Rubric" message={notice.text} /> : null}
    </ToolCard>
  );
}
