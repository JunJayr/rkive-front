'use client';

import { useEffect } from 'react';
import { useApplicationGeneration } from '@/hooks';
import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import Layout from '@/components/utils/Layout';

export default function ApplicationForm() {
  const {
    formData,
    isLoading,
    previewUrl,
    handleChange,
    handleSubmit,
    setPreviewUrl,
    handleDownload,
    facultyList,
  } = useApplicationGeneration();

  const pdfUrl = previewUrl ? `${previewUrl}#toolbar=0` : null;

  /* 🔒 LOCK BODY SCROLL WHEN LOADING */
  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  return (
    <Layout>
      {/* FULL VIEWPORT LOCK */}
      <div className="flex h-screen bg-[#F9FAFB] text-[#0A4D9C] overflow-hidden">
        <Sidebar />

        <main className="flex-grow px-4 py-5 overflow-hidden">
          <div className="max-w-3xl mx-auto h-full">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm h-full flex flex-col">

              {pdfUrl ? (
                <>
                  {/* PDF PREVIEW */}
                  <div className="flex-1 overflow-hidden p-5">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full border border-[#E5E7EB] rounded-xl"
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="border-t border-[#E5E7EB] px-5 py-4 flex justify-center gap-4">
                    <button
                      onClick={() => setPreviewUrl(null)}
                      className="px-6 py-2 border border-[#0A4D9C] rounded-full
                      hover:bg-[#0A4D9C] hover:text-white transition"
                    >
                      Back to Edit
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-6 py-2 bg-[#0A4D9C] text-white rounded-full
                      hover:opacity-90 transition"
                    >
                      Download
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6 text-[14px] leading-relaxed"
                  >

                    {/* TITLE */}
                    <h1 className="text-lg font-bold text-center uppercase tracking-wide">
                      Application for Concept Defense
                    </h1>

                    {/* APPLICATION INFO */}
                    <section className="space-y-4">
                      <div className="bg-[#EEF2F7] px-4 py-2 rounded-md font-semibold text-sm">
                        Application Information
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                          className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2
                          focus:ring-2 focus:ring-[#FBBF24]"
                        >
                          <option value="">Select Department</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Technology Communication Management">Technology Communication Management</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Computer Science">Computer Science</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">
                          Research Title
                        </label>
                        <input
                          name="research_title"
                          value={formData.research_title}
                          onChange={handleChange}
                          required
                          className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2
                          focus:ring-2 focus:ring-[#FBBF24]"
                        />
                      </div>
                    </section>

                    {/* LEAD */}
                    <section className="space-y-4">
                      <div className="bg-[#EEF2F7] px-4 py-2 rounded-md font-semibold text-sm">
                        Lead Researcher
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">
                          Name
                        </label>
                        <input
                          name="lead_researcher"
                          value={formData.lead_researcher}
                          onChange={handleChange}
                          required
                          className="w-full border border-[#E5E7EB] rounded-md px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">
                          Contact Number
                        </label>
                        <input
                          name="lead_contactno"
                          value={formData.lead_contactno}
                          onChange={handleChange}
                          required
                          className="w-full border border-[#E5E7EB] rounded-md px-3 py-2"
                        />
                      </div>
                    </section>

                    {/* PROPONENTS */}
                    <section>
                      <div className="bg-[#EEF2F7] px-4 py-2 rounded-md font-semibold text-sm mb-3">
                        Research Proponents
                      </div>

                      <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-[#F9FAFB] text-[#666]">
                            <tr>
                              <th className="px-3 py-2">#</th>
                              <th className="px-3 py-2 text-left">Name</th>
                              <th className="px-3 py-2 text-left">Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <tr key={i} className="border-t">
                                <td className="px-3 py-2">{i}</td>
                                <td className="px-3 py-2">
                                  <input
                                    name={`co_researcher${i}`}
                                    value={formData[`co_researcher${i}`] || ''}
                                    onChange={handleChange}
                                    className="w-full border border-[#E5E7EB] rounded px-2 py-1"
                                  />
                                </td>
                                <td className="px-3 py-2 text-[#666]">
                                  Proponent
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* FACULTY */}
                    <section>
                      <div className="bg-[#EEF2F7] px-4 py-2 rounded-md font-semibold text-sm mb-3">
                        Nominated Faculty Members
                      </div>

                      <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-[#F9FAFB] text-[#666]">
                            <tr>
                              <th className="px-3 py-2">#</th>
                              <th className="px-3 py-2 text-left">Name</th>
                              <th className="px-3 py-2 text-left">Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[1, 2, 3, 4, 5].map((i) => {
                              const nameField =
                                i === 1
                                  ? 'adviser'
                                  : i === 2
                                  ? 'panel_chair'
                                  : `panel${i - 2}`;

                              return (
                                <tr key={i} className="border-t">
                                  <td className="px-3 py-2">{i}</td>
                                  <td className="px-3 py-2">
                                    <select
                                      name={nameField}
                                      value={(formData as any)[nameField] ?? ''}
                                      onChange={handleChange}
                                      className="w-full border border-[#E5E7EB] rounded px-2 py-1"
                                    >
                                      <option value="">Select Faculty</option>
                                      {facultyList.map((f) => (
                                        <option
                                          key={f.facultyID}
                                          value={f.facultyID}
                                        >
                                          {f.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 text-[#666]">
                                    {i === 1
                                      ? 'Adviser'
                                      : i === 2
                                      ? 'Panel Chair'
                                      : 'Member'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* DOCUMENTER */}
                    <section>
                      <div className="bg-[#EEF2F7] px-4 py-2 rounded-md font-semibold text-sm">
                        Documenter
                      </div>

                      <input
                        name="documenter"
                        value={formData.documenter}
                        onChange={handleChange}
                        required
                        className="w-full mt-2 border border-[#E5E7EB] rounded-md px-3 py-2"
                      />
                    </section>

                    {/* SUBMIT */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-[#0A4D9C] text-white rounded-xl
                      hover:opacity-90 focus:ring-4 focus:ring-[#FBBF24]
                      transition font-semibold"
                    >
                      Submit Application
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />

        {/* 🔄 FULLSCREEN LOADING OVERLAY */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <Spinner />
          </div>
        )}
      </div>
    </Layout>
  );
}
