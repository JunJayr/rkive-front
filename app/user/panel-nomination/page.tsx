'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiTrash2,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

import { usePanelGeneration } from '@/hooks';
import { useGetDepartmentsQuery } from '@/redux/features/authApiSlice';

import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import Layout from '@/components/utils/Layout';

const inputClass =
  'w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50';

const labelClass = 'mb-2 block text-sm font-semibold text-slate-700';

const FIXED_ROLE_KEYS = ['adviser', 'panel_chair', 'panel1'];

function statusStyle(status: string): string {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-800';
    case 'submitted':
    case 'pending': return 'bg-blue-100 text-blue-800';
    case 'rejected': return 'bg-rose-100 text-rose-800';
    case 'revision_required': return 'bg-amber-100 text-amber-800';
    default: return 'bg-slate-100 text-slate-600';
  }
}

export default function PanelNominationPage() {
  const {
    fields,
    proponents,
    roster,
    nomination,
    nominationId,
    status,
    attempt,
    reason,
    decisionReason,
    blockers,
    editable,
    locked,
    needsRevision,
    busy,
    preview,
    notice,
    facultyList,
    changeField,
    changeProponent,
    addProponent,
    removeProponent,
    changeFaculty,
    addPanelMember,
    removePanelMember,
    handleGenerate,
    handleSaveDraft,
    handleSubmit,
    handleRevision,
    handleOfficialForm,
    clearPreview,
    roleLabel,
  } = usePanelGeneration();
  const { data: departments = [] } = useGetDepartmentsQuery();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (busy) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [busy]);

  const previewHref = preview?.url
    ? `${preview.url}${preview.isPdf ? '#toolbar=0' : ''}`
    : null;
  const previewName = `panel_nomination_${nominationId ?? 'draft'}.${preview?.isPdf ? 'pdf' : 'docx'}`;

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#FAF9F6]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-12">
            <div className="mx-auto w-full max-w-5xl">
              <header className="mb-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                    RKIVE / Academic Workflow
                  </p>
                  <Link href="/user/defense-application" className="inline-flex items-center gap-1 text-xs font-semibold text-[#12186E] hover:underline">
                    <FiArrowLeft size={14} /> All applications
                  </Link>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#12186E] sm:text-4xl">
                  Panel Nomination
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  This is the first stage of the defense workflow. Nominate your research adviser and
                  panel, save the record, and submit it for approval before any defense application
                  can be opened.
                </p>
              </header>

              {notice && (
                <div className={`mb-6 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {notice.type === 'ok' ? <FiCheckCircle className="mt-0.5 shrink-0" /> : <FiAlertCircle className="mt-0.5 shrink-0" />}
                  <span>{notice.text}</span>
                </div>
              )}

              <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-[#12186E]">Nomination status</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {nominationId
                        ? `Record #${nominationId} · Attempt ${attempt}`
                        : 'No nomination record saved yet'}
                      {nomination?.submitted_at ? ` · Submitted ${new Date(nomination.submitted_at).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(status)}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
                {!!reason && (
                  <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">{reason}</p>
                )}
                {!!decisionReason && (
                  <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                    Review comment: {decisionReason}
                  </p>
                )}
                {locked && (
                  <p className="mt-3 flex items-start gap-2 text-xs text-slate-600">
                    <FiInfo className="mt-0.5 shrink-0 text-[#12186E]" />
                    This nomination is read-only. Use the official form download below for your records.
                  </p>
                )}
                {needsRevision && (
                  <button type="button" onClick={() => void handleRevision()} disabled={busy} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50">
                    <FiRefreshCw size={15} /> Start Revision
                  </button>
                )}
              </section>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-100 bg-[#12186E] px-6 py-6 sm:px-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                    <FiUsers size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {preview ? 'Panel Nomination Preview' : 'Oral Examination Panel'}
                    </h2>
                    <p className="mt-1 text-xs text-blue-100/80">
                      {preview
                        ? 'Review the generated document or download it.'
                        : editable
                          ? 'Complete the nomination form below.'
                          : 'Submitted values are shown for reference.'}
                    </p>
                  </div>
                </div>

                {preview && previewHref ? (
                  <div className="p-5 sm:p-8">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800">Generated Nomination Document</h3>
                        <p className="mt-1 text-xs text-slate-500">Saved before this preview was shown.</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                        <FiCheckCircle size={14} /> Document Ready
                      </span>
                    </div>
                    {preview.isPdf ? (
                      <iframe src={previewHref} title="Panel Nomination document preview" className="h-[650px] w-full rounded-xl border border-slate-200 bg-slate-50" />
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                        <FiFileText size={36} className="text-slate-400" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">Word document generated</p>
                        <p className="mt-1 text-xs text-slate-500">Your browser cannot preview DOCX files. Download it to review.</p>
                      </div>
                    )}
                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                      <button type="button" onClick={clearPreview} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <FiArrowLeft size={16} /> Back to Edit
                      </button>
                      <a href={previewHref} download={previewName} className="inline-flex items-center gap-2 rounded-xl bg-[#12186E] px-6 py-3 text-sm font-bold text-white hover:bg-blue-800">
                        <FiDownload size={17} /> Download Nomination
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={(event) => { event.preventDefault(); void handleGenerate(); }} className="space-y-10 p-5 sm:p-8">
                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <FiFileText size={20} className="text-[#12186E]" />
                        <h3 className="text-lg font-bold text-slate-800">Thesis Information</h3>
                      </div>
                      <div>
                        <label htmlFor="department" className={labelClass}>Department</label>
                        <select id="department" name="department" value={fields.department} onChange={changeField} disabled={!editable || busy} className={inputClass}>
                          <option value="">Select Department</option>
                          {departments.map((department) => (
                            <option key={department.department_id} value={department.name}>{department.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="research_title" className={labelClass}>
                          Proposed Thesis Title <span className="ml-1 text-red-500">*</span>
                        </label>
                        <input id="research_title" name="research_title" value={fields.research_title} onChange={changeField} required disabled={!editable || busy} placeholder="Enter your proposed thesis title" className={inputClass} />
                      </div>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="lead_researcher" className={labelClass}>
                            Lead Researcher <span className="ml-1 text-red-500">*</span>
                          </label>
                          <input id="lead_researcher" name="lead_researcher" value={fields.lead_researcher} onChange={changeField} required disabled={!editable || busy} placeholder="Full name" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="lead_contactno" className={labelClass}>Contact Number</label>
                          <input id="lead_contactno" name="lead_contactno" type="tel" value={fields.lead_contactno} onChange={changeField} disabled={!editable || busy} placeholder="09XXXXXXXXX" className={inputClass} />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <FiUsers size={20} className="text-[#12186E]" />
                        <h3 className="text-lg font-bold text-slate-800">Research Proponents</h3>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm leading-6 text-slate-500">
                          Three proponents are required. Add more when your group has additional members.
                        </p>
                        <button type="button" onClick={addProponent} disabled={!editable || busy} className="inline-flex items-center gap-1.5 rounded-lg border border-[#12186E] px-3 py-1.5 text-xs font-bold text-[#12186E] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">
                          <FiPlus size={14} /> Add Proponent
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {proponents.map((row, index) => (
                          <div key={row.id} className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-[#12186E]">
                              {index + 1}
                            </div>
                            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label htmlFor={`proponent-name-${row.id}`} className="mb-2 block text-xs font-semibold text-slate-600">Proponent {index + 1}</label>
                                <input id={`proponent-name-${row.id}`} value={row.name} onChange={(event) => changeProponent(row.id, 'name', event.target.value)} disabled={!editable || busy} placeholder={`Proponent ${index + 1} full name`} className={inputClass} />
                              </div>
                              <div>
                                <label htmlFor={`proponent-email-${row.id}`} className="mb-2 block text-xs font-semibold text-slate-600">Email (optional)</label>
                                <input id={`proponent-email-${row.id}`} value={row.email} onChange={(event) => changeProponent(row.id, 'email', event.target.value)} disabled={!editable || busy} placeholder="name@example.com" className={inputClass} />
                              </div>
                            </div>
                            {proponents.length > 3 && editable && (
                              <button type="button" onClick={() => removeProponent(row.id)} aria-label={`Remove proponent ${index + 1}`} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" disabled={busy}>
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <FiUser size={20} className="text-[#12186E]" />
                        <h3 className="text-lg font-bold text-slate-800">Nominated Panel / Adviser Members</h3>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm leading-6 text-slate-500">
                          Adviser, Panel Chair, and Panel Member 1 are required. At least three distinct
                          non-adviser panel members must be nominated.
                        </p>
                        <button type="button" onClick={addPanelMember} disabled={!editable || busy} className="inline-flex items-center gap-1.5 rounded-lg border border-[#12186E] px-3 py-1.5 text-xs font-bold text-[#12186E] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">
                          <FiPlus size={14} /> Add Panel Member
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {roster.map((row, index) => {
                          const fixed = FIXED_ROLE_KEYS.includes(row.role);
                          return (
                            <div key={row.id} className="grid grid-cols-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[190px_1fr_auto]">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#12186E]">
                                  {index + 1}
                                </div>
                                <span className="text-xs font-bold text-slate-700">{roleLabel(row.role)}</span>
                              </div>
                              <select
                                aria-label={roleLabel(row.role)}
                                value={row.faculty_id}
                                onChange={(event) => changeFaculty(row.id, event.target.value)}
                                disabled={!editable || busy}
                                className={inputClass}
                              >
                                <option value="">Select Panel / Adviser Member</option>
                                {facultyList.map((faculty) => {
                                  const selectedElsewhere = roster.some((other) => other.id !== row.id && other.faculty_id === String(faculty.facultyID));
                                  return (
                                    <option key={faculty.facultyID} value={faculty.facultyID} disabled={selectedElsewhere}>
                                      {faculty.name}
                                    </option>
                                  );
                                })}
                              </select>
                              {!fixed && editable && (
                                <button type="button" onClick={() => removePanelMember(row.id)} aria-label={`Remove ${roleLabel(row.role)}`} className="justify-self-end rounded-lg p-2 text-rose-600 hover:bg-rose-50" disabled={busy}>
                                  <FiTrash2 size={16} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {!!blockers.length && editable && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <p className="text-sm font-bold text-amber-900">Complete these items before submitting:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-800">
                          {blockers.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                      <FiInfo size={19} className="mt-0.5 shrink-0 text-[#12186E]" />
                      <div>
                        <p className="text-sm font-bold text-[#12186E]">Before submitting</p>
                        <p className="mt-1 text-xs leading-6 text-slate-600">
                          Values are saved to the database before a document is generated. After approval,
                          this roster is copied into every defense form and cannot be replaced there.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
                      <p className="text-xs text-slate-400">
                        {nominationId ? `Saved nomination #${nominationId}` : 'Not saved yet'}
                      </p>
                      <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
                        {nominationId && ['submitted', 'pending', 'approved'].includes(status) && (
                          <button type="button" onClick={() => void handleOfficialForm()} disabled={busy} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                            <FiDownload size={17} /> Official Form
                          </button>
                        )}
                        <button type="button" onClick={() => void handleSaveDraft()} disabled={!editable || busy} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                          {busy ? <Spinner sm /> : <><FiFileText size={18} /> Save Draft</>}
                        </button>
                        <button type="submit" disabled={!editable || busy || blockers.length > 0} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                          {busy ? <Spinner sm /> : <><FiFileText size={18} /> Save &amp; Generate</>}
                        </button>
                        <button type="button" onClick={() => void handleSubmit()} disabled={!editable || busy || blockers.length > 0} className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#F9B515] px-8 text-sm font-bold text-[#12186E] shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                          {busy ? <Spinner sm /> : <><FiSend size={17} /> Submit Nomination</>}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </main>
          <Footer />
        </div>

        {busy && (
          <div role="status" aria-live="polite" aria-label="Saving panel nomination" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-2xl">
              <Spinner />
              <p className="text-sm font-bold text-[#12186E]">Saving nomination...</p>
              <p className="text-center text-xs text-slate-500">Please wait while your record is written.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
