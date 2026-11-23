'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi';

import {
  useGetWorkflowStatusQuery,
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useGetFacultyQuery,
  useGetDepartmentsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useSubmitApplicationMutation,
  useReviseApplicationMutation,
  useApplicationGenerateMutation,
  useProposalGenerateMutation,
  useFinalGenerateMutation,
  useLazyGetSignedFormQuery,
  type Proponent,
} from '@/redux/features/authApiSlice';

import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import Layout from '@/components/utils/Layout';

export type DefenseStage = 'concept' | 'proposal' | 'final';

const STAGE_TITLES: Record<DefenseStage, string> = {
  concept: 'Application for Concept Defense',
  proposal: 'Application for Proposal Defense',
  final: 'Application for Final Defense',
};

const inputClass =
  'w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15 disabled:bg-slate-50';
const labelClass = 'mb-2 block text-sm font-semibold text-slate-700';

type FacultyValue = string;

interface FormState {
  department: string;
  research_title: string;
  lead_researcher: string;
  lead_contactno: string;
  datetime_defense: string;
  place_defense: string;
  documenter: string;
  adviser: FacultyValue;
  panel_chair: FacultyValue;
  panel1: FacultyValue;
  panel2: FacultyValue;
  panel3: FacultyValue;
}

interface ProponentRow {
  id: number;
  name: string;
  email: string;
}

const emptyForm: FormState = {
  department: '',
  research_title: '',
  lead_researcher: '',
  lead_contactno: '',
  datetime_defense: '',
  place_defense: '',
  documenter: '',
  adviser: '',
  panel_chair: '',
  panel1: '',
  panel2: '',
  panel3: '',
};

function localInputValue(value?: string | null): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
  }
  const match = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  return match ? `${match[1]}T${match[2]}` : '';
}

function documentDateValue(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

function toNumber(value: string): number | null {
  return /^\d+$/.test(value) ? Number(value) : null;
}

function errorText(error: unknown): string {
  const data = (error as { data?: Record<string, unknown> })?.data;
  if (!data) return 'Unable to complete the request.';
  if (typeof data.error === 'string') return data.error;
  if (Array.isArray(data.reasons)) return (data.reasons as string[]).join(' ');
  return 'Unable to complete the request.';
}

function statusBadge(status?: string): string {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-800';
    case 'submitted':
    case 'pending': return 'bg-blue-100 text-blue-800';
    case 'rejected': return 'bg-rose-100 text-rose-800';
    case 'revision_required': return 'bg-amber-100 text-amber-800';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export default function DefenseApplicationForm({ stage }: { stage: DefenseStage }) {
  const { data: workflowStatus, isLoading: statusLoading } = useGetWorkflowStatusQuery();
  const { data: applications, isLoading: appsLoading, refetch: refetchApplications } = useGetApplicationsQuery({ stage });
  const { data: facultyList = [] } = useGetFacultyQuery();
  const { data: departments = [] } = useGetDepartmentsQuery();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const stageState = workflowStatus?.stages.find((item) => item.key === stage);
  const discoveredId = stageState?.application_id ?? applications?.[0]?.application_id ?? null;
  const applicationId = selectedId ?? discoveredId;

  const { data: application, refetch: refetchApplication } = useGetApplicationQuery(applicationId ?? 0, {
    skip: !applicationId,
  });

  const [createApplication, { isLoading: creating }] = useCreateApplicationMutation();
  const [updateApplication, { isLoading: updating }] = useUpdateApplicationMutation();
  const [submitApplication, { isLoading: submitting }] = useSubmitApplicationMutation();
  const [reviseApplication, { isLoading: revising }] = useReviseApplicationMutation();
  const [generateConcept, { isLoading: generatingConcept }] = useApplicationGenerateMutation();
  const [generateProposal, { isLoading: generatingProposal }] = useProposalGenerateMutation();
  const [generateFinal, { isLoading: generatingFinal }] = useFinalGenerateMutation();
  const [getSignedForm] = useLazyGetSignedFormQuery();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [proponents, setProponents] = useState<ProponentRow[]>(() => [
    { id: 1, name: '', email: '' },
    { id: 2, name: '', email: '' },
    { id: 3, name: '', email: '' },
  ]);
  const nextProponentId = useRef(4);
  const loadedRef = useRef('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const generating = generatingConcept || generatingProposal || generatingFinal;
  const busy = creating || updating || submitting || revising || generating;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!application) return;
    const marker = `${application.application_id}:${application.attempt}`;
    if (loadedRef.current === marker) return;
    loadedRef.current = marker;
    setForm({
      department: application.department || '',
      research_title: application.research_title || '',
      lead_researcher: application.lead_researcher || '',
      lead_contactno: application.lead_contactno || '',
      datetime_defense: localInputValue(application.datetime_defense),
      place_defense: application.place_defense || '',
      documenter: application.documenter || '',
      adviser: application.adviser_id ? String(application.adviser_id) : '',
      panel_chair: application.panel_chair_id ? String(application.panel_chair_id) : '',
      panel1: application.panel1_id ? String(application.panel1_id) : '',
      panel2: application.panel2_id ? String(application.panel2_id) : '',
      panel3: application.panel3_id ? String(application.panel3_id) : '',
    });
    const saved = (application.proponents || []).map((item: Proponent) => {
      const raw: unknown = item;
      if (typeof raw === 'string') {
        return { id: nextProponentId.current++, name: raw, email: '' };
      }
      const record = raw as { name?: string; email?: string };
      return { id: nextProponentId.current++, name: record.name || '', email: record.email || '' };
    });
    setProponents(saved.length >= 3 ? saved : [
      ...saved,
      ...Array.from({ length: 3 - saved.length }, () => ({ id: nextProponentId.current++, name: '', email: '' })),
    ]);
  }, [application]);

  const refresh = async () => {
    await Promise.all([refetchApplications(), applicationId ? refetchApplication() : Promise.resolve()]);
  };

  const changeField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const changeProponent = (id: number, field: 'name' | 'email', value: string) => {
    setProponents((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addProponent = () => {
    setProponents((prev) => [...prev, { id: nextProponentId.current++, name: '', email: '' }]);
  };

  const removeProponent = (id: number) => {
    setProponents((prev) => (prev.length <= 3 ? prev : prev.filter((row) => row.id !== id)));
  };

  const applicantProponents: Proponent[] = proponents
    .filter((row) => row.name.trim())
    .map((row) => ({ name: row.name.trim(), email: row.email.trim() }));

  const applicationPayload = {
    department: form.department,
    research_title: form.research_title,
    lead_researcher: form.lead_researcher,
    lead_contactno: form.lead_contactno,
    datetime_defense: form.datetime_defense,
    place_defense: form.place_defense,
    documenter: form.documenter,
    adviser: toNumber(form.adviser),
    panel_chair: toNumber(form.panel_chair),
    panel1: toNumber(form.panel1),
    panel2: toNumber(form.panel2),
    panel3: toNumber(form.panel3),
    proponents: applicantProponents,
  };

  const ensureDraft = async (): Promise<number> => {
    if (applicationId) {
      if (application?.permissions?.can_edit === false) {
        throw new Error('This application can no longer be edited.');
      }
      await updateApplication({ applicationID: applicationId, data: applicationPayload as any }).unwrap();
      await refresh();
      return applicationId;
    }
    const created = await createApplication({ ...applicationPayload, stage } as any).unwrap();
    setSelectedId(created.application_id);
    loadedRef.current = '';
    await refresh();
    return created.application_id;
  };

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    try {
      const id = await ensureDraft();
      const coResearchers: Record<string, string> = {};
      applicantProponents.slice(0, 5).forEach((item, index) => {
        coResearchers[`co_researcher${index + 1}`] = item.name;
      });
      const documentPayload = {
        ...applicationPayload,
        ...coResearchers,
        application_id: id,
        datetime_defense: documentDateValue(form.datetime_defense),
      };
      const url = stage === 'concept'
        ? await generateConcept(documentPayload as any).unwrap()
        : stage === 'proposal'
          ? await generateProposal(documentPayload as any).unwrap()
          : await generateFinal(documentPayload as any).unwrap();
      setPreviewUrl(url);
      toast.success('Application document generated.');
    } catch (error) {
      setNotice({ type: 'err', text: errorText(error) });
      toast.error('Unable to generate the application.');
    }
  };

  const handleSubmit = async () => {
    if (!applicationId) {
      toast.error('Save or generate the application first.');
      return;
    }
    setNotice(null);
    try {
      await submitApplication(applicationId).unwrap();
      await refresh();
      toast.success('Application submitted for panel review.');
    } catch (error) {
      setNotice({ type: 'err', text: errorText(error) });
    }
  };

  const handleRevision = async () => {
    if (!applicationId) return;
    setNotice(null);
    try {
      await reviseApplication(applicationId).unwrap();
      loadedRef.current = '';
      await refresh();
      toast.success('New revision attempt started.');
    } catch (error) {
      setNotice({ type: 'err', text: errorText(error) });
    }
  };

  const handleSignedForm = async () => {
    if (!applicationId) return;
    try {
      const blob = await getSignedForm(applicationId).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `defense_application_${applicationId}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  const canSubmit = Boolean(
    application
      && application.status === 'draft'
      && application.permissions?.can_submit
      && application.submit_blockers.length === 0
  );
  const needsRevision = Boolean(application && ['rejected', 'revision_required'].includes(application.status));
  const editable = !application || application.permissions?.can_edit !== false;
  const gate = application?.stage_gate ?? (stageState && !stageState.available
    ? { stage, prerequisites: stageState.requires, completed: [], satisfied: false, missing: stageState.requires, message: 'Complete and approve the previous defense stage first.' }
    : null);

  const preview = previewUrl ? `${previewUrl}#toolbar=0` : null;

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-12">
            <div className="mx-auto w-full max-w-5xl">
              <header className="mb-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Academic Workflow</p>
                  <Link href="/user/defense-application" className="inline-flex items-center gap-1 text-xs font-semibold text-[#103F78] hover:underline">
                    <FiArrowLeft size={14} /> All applications
                  </Link>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78] sm:text-4xl">{STAGE_TITLES[stage]}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Complete the research details, review your assigned panel, and submit once every panelist has accepted.
                </p>
              </header>

              {(statusLoading || appsLoading) && (
                <div className="mb-6 flex min-h-32 items-center justify-center rounded-3xl border border-slate-200 bg-white"><Spinner /></div>
              )}

              {notice && (
                <div className={`mb-6 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {notice.type === 'ok' ? <FiCheckCircle className="mt-0.5 shrink-0" /> : <FiAlertCircle className="mt-0.5 shrink-0" />}
                  <span>{notice.text}</span>
                </div>
              )}

              {application && (
                <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-[#103F78]">Workflow status</h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Attempt {application.attempt} · {application.stage_label} · {application.department || 'No department'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(application.status)}`}>
                        {(application.status || 'draft').replace('_', ' ')}
                      </span>
                      <button type="button" onClick={() => void refresh()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        <FiRefreshCw size={13} /> Refresh status
                      </button>
                    </div>
                  </div>

                  {gate && !gate.satisfied && (
                    <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">{gate.message}</p>
                  )}
                  {!!application.decision_reason && (
                    <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                      Decision: {application.decision_reason}
                    </p>
                  )}

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><FiUsers size={16} className="text-[#103F78]" /> Assigned panel</h3>
                      {application.panel.length === 0 ? (
                        <p className="mt-2 text-xs text-slate-500">No panelists assigned yet. The Department Head assigns panelists for your department.</p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {application.panel.map((member) => (
                            <li key={member.assignment_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs">
                              <span className="font-semibold text-slate-700">{member.name} <span className="font-normal text-slate-400">· {member.position_label}</span></span>
                              <span className={`rounded-full px-2 py-0.5 font-bold ${
                                member.response === 'accepted' ? 'bg-emerald-100 text-emerald-700'
                                  : member.response === 'declined' ? 'bg-rose-100 text-rose-700'
                                    : 'bg-amber-100 text-amber-700'
                              }`}>{member.response}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><FiCheckCircle size={16} className="text-[#103F78]" /> Panel readiness</h3>
                      <p className="mt-2 text-xs text-slate-600">
                        {application.panel_readiness.distinct_count} of at least 3 distinct panelists assigned.
                        {application.panel_readiness.all_accepted ? ' All assigned panelists accepted.' : ''}
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        {!!application.panel_readiness.pending.length && (
                          <p className="text-amber-700">Pending: {application.panel_readiness.pending.join(', ')}</p>
                        )}
                        {!!application.panel_readiness.declined.length && (
                          <p className="text-rose-700">Declined: {application.panel_readiness.declined.join(', ')}</p>
                        )}
                        {application.panel_locked && <p className="font-semibold text-slate-600">Panel is locked for this attempt.</p>}
                      </div>
                      {application.schedule && (
                        <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">
                          <FiClock className="mr-1 inline" />
                          {application.schedule.date} · {application.schedule.start_time}–{application.schedule.end_time} · {application.schedule.venue_or_link}
                          <span className="ml-1 font-semibold">({application.schedule.status})</span>
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-100 bg-[#103F78] px-6 py-6 sm:px-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-amber-300"><FiFileText size={24} /></div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{preview ? 'Application Preview' : 'Defense Details'}</h2>
                    <p className="mt-1 text-xs text-blue-100/80">{preview ? 'Review your generated document.' : 'Fields marked with * are required.'}</p>
                  </div>
                </div>

                {preview ? (
                  <div className="p-5 sm:p-8">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-bold text-slate-800">Generated Application</h3>
                      <button type="button" onClick={() => setPreviewUrl(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <FiX size={16} /> Close Preview
                      </button>
                    </div>
                    <iframe src={preview} title={`${stage} defense application preview`} className="h-[650px] w-full rounded-xl border border-slate-200 bg-slate-50" />
                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                      <button type="button" onClick={() => setPreviewUrl(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <FiArrowLeft size={16} /> Back to Form
                      </button>
                      <a href={previewUrl ?? '#'} download={`application_${stage}.docx`} className="inline-flex items-center gap-2 rounded-xl bg-[#103F78] px-6 py-3 text-sm font-bold text-white hover:bg-[#0b2d57]">
                        <FiDownload size={17} /> Download Application
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGenerate} className="space-y-10 p-5 sm:p-8">
                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FiFileText size={20} className="text-[#103F78]" /><h3 className="text-lg font-bold text-slate-800">Research Information</h3></div>
                      <div>
                        <label htmlFor="department" className={labelClass}>Department *</label>
                        <select id="department" name="department" value={form.department} onChange={changeField} required disabled={!editable || busy} className={inputClass}>
                          <option value="">Select Department</option>
                          {departments.map((department) => (
                            <option key={department.department_id} value={department.name}>{department.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="research_title" className={labelClass}>Research Title *</label>
                        <input id="research_title" name="research_title" value={form.research_title} onChange={changeField} required disabled={!editable || busy} className={inputClass} placeholder="Enter your research title" />
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FiUsers size={20} className="text-[#103F78]" /><h3 className="text-lg font-bold text-slate-800">Research Team</h3></div>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label htmlFor="lead_researcher" className={labelClass}>Lead Researcher *</label>
                          <input id="lead_researcher" name="lead_researcher" value={form.lead_researcher} onChange={changeField} required disabled={!editable || busy} className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="lead_contactno" className={labelClass}>Contact Number *</label>
                          <input id="lead_contactno" name="lead_contactno" type="tel" value={form.lead_contactno} onChange={changeField} required disabled={!editable || busy} className={inputClass} placeholder="09XXXXXXXXX" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-700">Research Proponents</h4>
                          <button type="button" onClick={addProponent} disabled={!editable || busy} className="inline-flex items-center gap-1.5 rounded-lg border border-[#103F78] px-3 py-1.5 text-xs font-bold text-[#103F78] hover:bg-blue-50 disabled:opacity-50">
                            <FiPlus size={14} /> Add Proponent
                          </button>
                        </div>
                        <p className="mb-3 text-xs text-slate-500">Three rows are provided by default. Add more when your research group has additional proponents.</p>
                        <div className="grid grid-cols-1 gap-3">
                          {proponents.map((row, index) => (
                            <div key={row.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#103F78]">{index + 1}</div>
                              <div className="min-w-0 flex-1">
                                <label htmlFor={`proponent-name-${row.id}`} className="mb-1 block text-xs font-semibold text-slate-500">Full name</label>
                                <input id={`proponent-name-${row.id}`} value={row.name} onChange={(e) => changeProponent(row.id, 'name', e.target.value)} disabled={!editable || busy} className={inputClass} placeholder="Full name" />
                                <label htmlFor={`proponent-email-${row.id}`} className="mb-1 mt-2 block text-xs font-semibold text-slate-500">Email (optional)</label>
                                <input id={`proponent-email-${row.id}`} value={row.email} onChange={(e) => changeProponent(row.id, 'email', e.target.value)} disabled={!editable || busy} className={inputClass} placeholder="name@example.com" />
                              </div>
                              {proponents.length > 3 && (
                                <button type="button" onClick={() => removeProponent(row.id)} aria-label={`Remove proponent ${index + 1}`} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" disabled={!editable || busy}>
                                  <FiTrash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FiCalendar size={20} className="text-[#103F78]" /><h3 className="text-lg font-bold text-slate-800">Defense Schedule</h3></div>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label htmlFor="datetime_defense" className={labelClass}>Defense Date &amp; Time *</label>
                          <input id="datetime_defense" name="datetime_defense" type="datetime-local" value={form.datetime_defense} onChange={changeField} required disabled={!editable || busy} className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="place_defense" className={labelClass}>Defense Venue *</label>
                          <input id="place_defense" name="place_defense" value={form.place_defense} onChange={changeField} required disabled={!editable || busy} className={inputClass} placeholder="Room or venue" />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FiUsers size={20} className="text-[#103F78]" /><h3 className="text-lg font-bold text-slate-800">Nominated Faculty Members</h3></div>
                      <p className="text-sm leading-6 text-slate-500">Nominations are recorded on the application. Actual panel assignments and acceptance are managed by the Department Head and the panelists.</p>
                      <div className="grid grid-cols-1 gap-4">
                        {([
                          ['adviser', 'Adviser'],
                          ['panel_chair', 'Panel Chair'],
                          ['panel1', 'Panel Member 1'],
                          ['panel2', 'Panel Member 2'],
                          ['panel3', 'Panel Member 3'],
                        ] as const).map(([name, label]) => (
                          <div key={name} className="grid grid-cols-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[180px_1fr]">
                            <span className="text-xs font-bold text-slate-700">{label}</span>
                            <select name={name} aria-label={label} value={form[name]} onChange={changeField} disabled={!editable || busy} className={inputClass}>
                              <option value="">Select Faculty</option>
                              {facultyList.map((faculty) => (
                                <option key={faculty.facultyID} value={faculty.facultyID}>{faculty.name}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="border-b border-slate-100 pb-4"><h3 className="text-lg font-bold text-slate-800">Documentation</h3></div>
                      <div>
                        <label htmlFor="documenter" className={labelClass}>Documenter *</label>
                        <input id="documenter" name="documenter" value={form.documenter} onChange={changeField} required disabled={!editable || busy} className={inputClass} placeholder="Enter documenter's full name" />
                      </div>
                    </section>

                    <div className="space-y-4 border-t border-slate-100 pt-7">
                      {!!application?.submit_blockers?.length && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-bold text-amber-900">Submission is locked until these items are resolved:</p>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-800">
                            {application.submit_blockers.map((reason) => <li key={reason}>{reason}</li>)}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-wrap justify-end gap-3">
                        {needsRevision && (
                          <button type="button" onClick={() => void handleRevision()} disabled={busy} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-6 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50">
                            <FiRefreshCw size={17} /> Start Revision
                          </button>
                        )}
                        {application && (
                          <button type="button" onClick={() => void handleSignedForm()} disabled={!applicationId} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <FiDownload size={17} /> Official Form (signed)
                          </button>
                        )}
                        <button type="submit" disabled={!editable || busy || !stageState?.available} className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                          {generating ? <Spinner sm /> : <><FiFileText size={18} /> Save &amp; Generate Preview</>}
                        </button>
                        <button type="button" onClick={() => void handleSubmit()} disabled={!canSubmit || busy} className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#FBBF24] px-8 text-sm font-bold text-[#103F78] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
                          {submitting ? <Spinner sm /> : <><FiCheckCircle size={18} /> Submit Application</>}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              <p className="mt-6 text-center text-xs text-slate-400">
                Defense applications follow the approved Concept → Proposal → Final → Manuscript sequence.
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </Layout>
  );
}
