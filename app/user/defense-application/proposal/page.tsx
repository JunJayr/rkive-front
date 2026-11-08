'use client';

import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiUsers,
  FiCalendar,
  FiBookOpen,
  FiX,
} from 'react-icons/fi';
import { useProposalApplicationGeneration } from '@/hooks';
import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import Layout from '@/components/utils/Layout';

const inputClass =
  'w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15';
const labelClass = 'mb-2 block text-sm font-semibold text-slate-700';
const departments = [
  'Information Technology',
  'Technology Communication Management',
  'Data Science',
  'Computer Science',
];
const facultyFields = [
  { name: 'adviser', label: 'Adviser' },
  { name: 'panel_chair', label: 'Panel Chair' },
  { name: 'panel1', label: 'Panel Member 1' },
  { name: 'panel2', label: 'Panel Member 2' },
  { name: 'panel3', label: 'Panel Member 3' },
] as const;

export default function ProposalDefenseApplicationPage() {
  const {
    formData,
    isLoading,
    previewUrl,
    handleChange,
    handleSubmit,
    setPreviewUrl,
    handleDownload,
    facultyList,
  } = useProposalApplicationGeneration();

  const pdfUrl = previewUrl ? `${previewUrl}#toolbar=0` : null;
  const fields = formData as unknown as Record<string, string | number | undefined>;

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-12">
            <div className="mx-auto w-full max-w-5xl">
              <header className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Academic Workflow</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78] sm:text-4xl">Application for Proposal Defense</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Complete your proposal defense details, nominate faculty, and generate the official application document.
                </p>
              </header>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-100 bg-[#103F78] px-6 py-6 sm:px-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-amber-300"><FiFileText size={24} /></div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{pdfUrl ? 'Application Preview' : 'Proposal Defense Details'}</h2>
                    <p className="mt-1 text-xs text-blue-100/80">{pdfUrl ? 'Review your generated document.' : 'Fields marked with * are required.'}</p>
                  </div>
                </div>

                {pdfUrl ? (
                  <div className="p-5 sm:p-8">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-bold text-slate-800">Generated Application</h3>
                      <button type="button" onClick={() => setPreviewUrl(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FiX size={16} /> Close Preview</button>
                    </div>
                    <iframe src={pdfUrl} title="Proposal Defense Application Preview" className="h-[650px] w-full rounded-xl border border-slate-200 bg-slate-50" />
                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                      <button type="button" onClick={() => setPreviewUrl(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FiArrowLeft size={16} /> Back to Form</button>
                      <button type="button" onClick={handleDownload} className="inline-flex items-center gap-2 rounded-xl bg-[#103F78] px-6 py-3 text-sm font-bold text-white hover:bg-[#0b2d57]"><FiDownload size={17} /> Download Application</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-10 p-5 sm:p-8">
                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FiBookOpen size={20} className="text-[#103F78]" /><h3 className="text-lg font-bold text-slate-800">Research Information</h3></div>
                      <div>
                        <label htmlFor="department" className={labelClass}>Department *</label>
                        <select id="department" name="department" value={formData.department} onChange={handleChange} required className={inputClass}>
                          <option value="">Select Department</option>
                          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="research_title" className={labelClass}>Research Title *</label>
                        <input id="research_title" name="research_title" value={formData.research_title} onChange={handleChange} required className={inputClass} placeholder="Enter your research title" />
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FiUsers size={20} className="text-[#103F78]" /><h3 className="text-lg font-bold text-slate-800">Research Team</h3></div>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div><label htmlFor="lead_researcher" className={labelClass}>Lead Researcher *</label><input id="lead_researcher" name="lead_researcher" value={formData.lead_researcher} onChange={handleChange} required className={inputClass} /></div>
                        <div><label htmlFor="lead_contactno" className={labelClass}>Contact Number *</label><input id="lead_contactno" name="lead_contactno" type="tel" value={formData.lead_contactno} onChange={handleChange} required className={inputClass} placeholder="09XXXXXXXXX" /></div>
                      </div>
                      <div>
                        <h4 className="mb-4 text-sm font-bold text-slate-700">Research Proponents</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#103F78]">{i}</div>
                              <div className="min-w-0 flex-1">
                                <label htmlFor={`co_researcher${i}`} className="mb-1 block text-xs font-semibold text-slate-500">Proponent {i}</label>
                                <input id={`co_researcher${i}`} name={`co_researcher${i}`} value={fields[`co_researcher${i}`] ?? ''} onChange={handleChange} className={inputClass} placeholder="Full name" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FiCalendar size={20} className="text-[#103F78]" /><h3 className="text-lg font-bold text-slate-800">Defense Schedule</h3></div>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div><label htmlFor="datetime_defense" className={labelClass}>Defense Date & Time *</label><input id="datetime_defense" type="datetime-local" name="datetime_defense" value={formData.datetime_defense} onChange={handleChange} required className={inputClass} /></div>
                        <div><label htmlFor="place_defense" className={labelClass}>Defense Venue *</label><input id="place_defense" name="place_defense" value={formData.place_defense} onChange={handleChange} required className={inputClass} placeholder="Room or venue" /></div>
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FiUsers size={20} className="text-[#103F78]" /><h3 className="text-lg font-bold text-slate-800">Nominated Faculty Members</h3></div>
                      <div className="grid grid-cols-1 gap-4">
                        {facultyFields.map((field) => (
                          <div key={field.name} className="grid grid-cols-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[180px_1fr]">
                            <span className="text-xs font-bold text-slate-700">{field.label}</span>
                            <select name={field.name} aria-label={field.label} value={fields[field.name] ?? ''} onChange={handleChange} required className={inputClass}>
                              <option value="">Select Faculty</option>
                              {facultyList.map((f) => <option key={f.facultyID} value={f.facultyID}>{f.name}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="border-b border-slate-100 pb-4"><h3 className="text-lg font-bold text-slate-800">Documentation</h3></div>
                      <div><label htmlFor="documenter" className={labelClass}>Documenter *</label><input id="documenter" name="documenter" value={formData.documenter} onChange={handleChange} required className={inputClass} placeholder="Enter documenter's full name" /></div>
                    </section>

                    <div className="flex justify-end border-t border-slate-100 pt-7">
                      <button type="submit" disabled={isLoading} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#FBBF24] px-8 text-sm font-bold text-[#103F78] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
                        {isLoading ? <Spinner sm /> : <><FiFileText size={18} /> Generate Application</>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </Layout>
  );
}
