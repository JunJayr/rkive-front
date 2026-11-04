
'use client';

import { useEffect } from 'react';
import {
  FiUsers,
  FiFileText,
  FiUser,
  FiDownload,
  FiArrowLeft,
  FiCheckCircle,
  FiInfo,
  FiSend,
} from 'react-icons/fi';

import { usePanelGeneration } from '@/hooks';

import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import Layout from '@/components/utils/Layout';

const inputClass =
  'w-full min-w-0 rounded-xl border border-slate-200 ' +
  'bg-white px-4 py-3 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 outline-none transition ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const labelClass =
  'mb-2 block text-sm font-semibold text-slate-700';

const facultyFields = [
  { name: 'adviser', label: 'Research Adviser' },
  { name: 'panel_chair', label: 'Panel Chair' },
  { name: 'panel1', label: 'Panel Member 1' },
  { name: 'panel2', label: 'Panel Member 2' },
  { name: 'panel3', label: 'Panel Member 3' },
] as const;

export default function PanelForm() {
  const {
    formData,
    isLoading,
    previewUrl,
    handleChange,
    handleSubmit,
    setPreviewUrl,
    handleDownload,
    facultyList,
  } = usePanelGeneration();

  const pdfUrl = previewUrl
    ? `${previewUrl}#toolbar=0`
    : null;

  const fields = formData as unknown as Record<
    string,
    string | number | undefined
  >;

  // Lock background scrolling while generating.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isLoading) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoading]);

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-12">
            <div className="mx-auto w-full max-w-5xl">

              {/* PAGE HEADER */}
              <header className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  RKIVE / Academic Workflow
                </p>

                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78] sm:text-4xl">
                  Panel Nomination
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Nominate the members of your oral examination
                  panel. Provide your thesis information,
                  research proponents, and faculty selections
                  to generate the official nomination document.
                </p>
              </header>

              {/* MAIN CARD */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                {/* NAVY CARD HEADER */}
                <div className="flex items-center gap-4 border-b border-slate-100 bg-[#103F78] px-6 py-6 sm:px-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                    <FiUsers size={24} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {pdfUrl
                        ? 'Panel Nomination Preview'
                        : 'Oral Examination Panel'}
                    </h2>

                    <p className="mt-1 text-xs text-blue-100/80">
                      {pdfUrl
                        ? 'Review and download your generated nomination document.'
                        : 'Complete the nomination form below.'}
                    </p>
                  </div>
                </div>

                {pdfUrl ? (
                  /* PDF PREVIEW */
                  <div className="p-5 sm:p-8">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800">
                          Generated Nomination Document
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Review the information before downloading.
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                        <FiCheckCircle size={14} />
                        Document Ready
                      </span>
                    </div>

                    <iframe
                      src={pdfUrl}
                      title="Panel Nomination PDF Preview"
                      className="h-[650px] w-full rounded-xl border border-slate-200 bg-slate-50"
                    />

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(null)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FiArrowLeft size={16} />
                        Back to Edit
                      </button>

                      <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#103F78] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                      >
                        <FiDownload size={17} />
                        Download Nomination
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NOMINATION FORM */
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-10 p-5 sm:p-8"
                  >

                    {/* SECTION 1: THESIS INFORMATION */}
                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <FiFileText
                          size={20}
                          className="text-[#103F78]"
                        />

                        <h3 className="text-lg font-bold text-slate-800">
                          Thesis Information
                        </h3>
                      </div>

                      <div>
                        <label
                          htmlFor="research_title"
                          className={labelClass}
                        >
                          Proposed Thesis Title
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          id="research_title"
                          name="research_title"
                          type="text"
                          value={formData.research_title}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          placeholder="Enter your proposed thesis title"
                          className={inputClass}
                        />

                        <p className="mt-2 text-xs text-slate-400">
                          Enter the complete working title of your
                          proposed thesis.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="lead_researcher"
                          className={labelClass}
                        >
                          Lead Researcher
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          id="lead_researcher"
                          name="lead_researcher"
                          type="text"
                          value={formData.lead_researcher}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          placeholder="Enter the lead researcher's full name"
                          className={inputClass}
                        />
                      </div>
                    </section>

                    {/* SECTION 2: RESEARCH PROPONENTS */}
                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <FiUsers
                          size={20}
                          className="text-[#103F78]"
                        />

                        <h3 className="text-lg font-bold text-slate-800">
                          Research Proponents
                        </h3>
                      </div>

                      <p className="text-sm leading-6 text-slate-500">
                        Enter the names of the additional research
                        proponents who will participate in the
                        oral examination.
                      </p>

                      <div className="grid grid-cols-1 gap-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-[#103F78]">
                              {i}
                            </div>

                            <div className="min-w-0 flex-1">
                              <label
                                htmlFor={`co_researcher${i}`}
                                className="mb-2 block text-xs font-semibold text-slate-600"
                              >
                                Proponent {i}
                              </label>

                              <input
                                id={`co_researcher${i}`}
                                name={`co_researcher${i}`}
                                value={fields[`co_researcher${i}`] ?? ''}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder={`Enter proponent ${i}'s full name`}
                                className={inputClass}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SECTION 3: NOMINATED FACULTY */}
                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <FiUser
                          size={20}
                          className="text-[#103F78]"
                        />

                        <h3 className="text-lg font-bold text-slate-800">
                          Nominated Faculty Members
                        </h3>
                      </div>

                      <p className="text-sm leading-6 text-slate-500">
                        Select the research adviser, panel chair,
                        and three panel members from the
                        available faculty list.
                      </p>

                      <div className="grid grid-cols-1 gap-4">
                        {facultyFields.map((field, index) => (
                          <div
                            key={field.name}
                            className="grid grid-cols-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[190px_1fr]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#103F78]">
                                {index + 1}
                              </div>

                              <label
                                htmlFor={field.name}
                                className="text-xs font-bold text-slate-700"
                              >
                                {field.label}
                              </label>
                            </div>

                            <select
                              id={field.name}
                              name={field.name}
                              value={fields[field.name] ?? ''}
                              onChange={handleChange}
                              disabled={isLoading}
                              className={inputClass}
                            >
                              <option value="">
                                Select Faculty Member
                              </option>

                              {facultyList.map((faculty) => (
                                <option
                                  key={faculty.facultyID}
                                  value={faculty.facultyID}
                                >
                                  {faculty.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* INFORMATION NOTICE */}
                    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                      <FiInfo
                        size={19}
                        className="mt-0.5 shrink-0 text-[#103F78]"
                      />

                      <div>
                        <p className="text-sm font-bold text-[#103F78]">
                          Before submitting
                        </p>

                        <p className="mt-1 text-xs leading-6 text-slate-600">
                          Verify the thesis title, researcher names,
                          and nominated faculty members before
                          generating your nomination document.
                        </p>
                      </div>
                    </div>

                    {/* SUBMIT */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
                      <p className="text-xs text-slate-400">
                        Oral Examination Panel Nomination
                      </p>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#FBBF24] px-8 text-sm font-bold text-[#103F78] shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {isLoading ? (
                          <>
                            <Spinner sm />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FiSend size={17} />
                            Submit Panel Nomination
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </main>

          <Footer />
        </div>

        {/* LOADING OVERLAY */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Generating panel nomination"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-2xl">
              <Spinner />

              <p className="text-sm font-bold text-[#103F78]">
                Generating nomination...
              </p>

              <p className="text-center text-xs text-slate-500">
                Please wait while your document is prepared.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
