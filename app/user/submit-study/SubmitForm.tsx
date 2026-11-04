
'use client';

import { useEffect, useRef } from 'react';
import {
  FiFileText,
  FiUploadCloud,
  FiCheckCircle,
  FiInfo,
  FiSend,
  FiBookOpen,
  FiFile,
} from 'react-icons/fi';

import { useManuscriptSubmission } from '@/hooks';

import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import Layout from '@/components/utils/Layout';

const inputClass =
  'w-full rounded-xl border border-slate-200 ' +
  'bg-white px-4 py-3 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 outline-none transition ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export default function SubmitForm() {
  const {
    title,
    description,
    file,
    isLoading,
    onChangeTitle,
    onChangeDescription,
    onChangeFile,
    onSubmit,
  } = useManuscriptSubmission();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preserve the original body scroll lock.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isLoading) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoading]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-12">
            <div className="mx-auto w-full max-w-5xl">

              {/* PAGE HEADER */}
              <header className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  RKIVE / Academic Repository
                </p>

                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78] sm:text-4xl">
                  Manuscript Submission
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Submit your completed research manuscript
                  to the academic repository. Provide the
                  research title, abstract, and PDF document
                  before submitting.
                </p>
              </header>

              {/* MAIN CARD */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                {/* CARD HEADER */}
                <div className="flex items-center gap-4 border-b border-slate-100 bg-[#103F78] px-6 py-6 sm:px-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                    <FiFileText size={24} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Manuscript Details
                    </h2>

                    <p className="mt-1 text-xs text-blue-100/80">
                      Complete all required fields to submit
                      your research document.
                    </p>
                  </div>
                </div>

                {/* FORM */}
                <form
                  onSubmit={onSubmit}
                  className="space-y-9 p-5 sm:p-8"
                >

                  {/* SECTION 1 */}
                  <section className="space-y-5">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <FiBookOpen
                        size={20}
                        className="text-[#103F78]"
                      />

                      <h3 className="text-lg font-bold text-slate-800">
                        Research Information
                      </h3>
                    </div>

                    {/* TITLE */}
                    <div>
                      <label
                        htmlFor="manuscript-title"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Manuscript Title
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <input
                        id="manuscript-title"
                        type="text"
                        value={title}
                        onChange={onChangeTitle}
                        required
                        disabled={isLoading}
                        placeholder="Enter the complete title of your research"
                        className={inputClass}
                      />

                      <p className="mt-2 text-xs text-slate-400">
                        Use the official title appearing on
                        your manuscript.
                      </p>
                    </div>

                    {/* ABSTRACT */}
                    <div>
                      <label
                        htmlFor="manuscript-description"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Description / Abstract
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <textarea
                        id="manuscript-description"
                        value={description}
                        onChange={onChangeDescription}
                        rows={7}
                        required
                        disabled={isLoading}
                        placeholder="Provide a concise overview of your research, including its objectives, methodology, and findings..."
                        className={`${inputClass} resize-y leading-7`}
                      />

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-400">
                          Include the key information from
                          your research abstract.
                        </p>

                        <span className="shrink-0 text-xs font-medium text-slate-400">
                          {description.length} characters
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* SECTION 2 */}
                  <section className="space-y-5">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <FiUploadCloud
                        size={21}
                        className="text-[#103F78]"
                      />

                      <h3 className="text-lg font-bold text-slate-800">
                        Manuscript Document
                      </h3>
                    </div>

                    <div>
                      <label
                        htmlFor="manuscript-file"
                        className="mb-3 block text-sm font-semibold text-slate-700"
                      >
                        Upload PDF Manuscript
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      {/* UPLOAD AREA */}
                      <div
                        className={`
                          relative rounded-2xl border-2 border-dashed
                          p-8 text-center transition
                          ${
                            file
                              ? 'border-emerald-300 bg-emerald-50/40'
                              : 'border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/30'
                          }
                        `}
                      >
                        <input
                          ref={fileInputRef}
                          id="manuscript-file"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={onChangeFile}
                          required
                          disabled={isLoading}
                          className="sr-only"
                        />

                        {file ? (
                          <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                              <FiCheckCircle size={28} />
                            </div>

                            <p className="max-w-full break-all text-sm font-bold text-slate-800">
                              {file.name}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                              {formatFileSize(file.size)}
                            </p>

                            <p className="mt-3 text-xs font-semibold text-emerald-700">
                              File selected
                            </p>

                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#103F78] transition hover:bg-slate-50 disabled:opacity-50"
                            >
                              Change File
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78]">
                              <FiUploadCloud size={28} />
                            </div>

                            <h4 className="text-base font-bold text-slate-800">
                              Upload your manuscript
                            </h4>

                            <p className="mt-2 text-sm text-slate-500">
                              Select the PDF file containing
                              your completed research.
                            </p>

                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-5 rounded-xl bg-[#103F78] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
                            >
                              Browse Files
                            </button>

                            <p className="mt-4 text-xs text-slate-400">
                              Accepted format: PDF
                            </p>
                          </div>
                        )}
                      </div>
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
                        Verify that your manuscript title
                        and abstract are correct, and ensure
                        that you have selected the intended
                        PDF document.
                      </p>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row">
                    <p className="flex items-center gap-2 text-xs text-slate-400">
                      <FiFile size={15} />
                      PDF manuscript submission
                    </p>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#FBBF24] px-8 text-sm font-bold text-[#103F78] shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Spinner sm />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiSend size={17} />
                          Submit Manuscript
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
            aria-label="Submitting manuscript"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-2xl">
              <Spinner />

              <p className="text-sm font-bold text-[#103F78]">
                Submitting manuscript...
              </p>

              <p className="text-center text-xs text-slate-500">
                Please wait while your document is uploaded.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
