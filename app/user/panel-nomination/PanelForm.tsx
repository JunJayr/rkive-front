'use client';

import { usePanelGeneration } from '@/hooks';
import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import Layout from '@/components/utils/Layout';
import Link from 'next/link';

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
    isFacultyLoading,
  } = usePanelGeneration();

  const pdfUrl = previewUrl ? `${previewUrl}#toolbar=0` : null;

  const handleClosePreview = () => {
    setPreviewUrl(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-inter relative">
        <div className="fixed top-3 left-20 z-50 flex items-center space-x-4">
          <Sidebar />
          <div className="text-2xl font-bold tracking-widest text-indigo-400 hover:text-indigo-300 transition">
            <Link href="/user">Rkive</Link>
          </div>
        </div>

        <main className="pt-24 px-4">
          <div className="max-w-5xl mx-auto w-full">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition duration-300">
              {pdfUrl ? (
                <div>
                  <div className="relative mb-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={handleClosePreview}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200"
                      aria-label="Close Preview"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[600px] border-none rounded-2xl"
                      title="Document Preview"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 transition-colors duration-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Nomination of Members of Oral Examination Panel
                  </h2>

                  <div>
                    <label htmlFor="research_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Proposed Thesis Title
                    </label>
                    <input
                      type="text"
                      name="research_title"
                      id="research_title"
                      value={formData.research_title}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lead_researcher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lead Researcher
                    </label>
                    <input
                      type="text"
                      name="lead_researcher"
                      id="lead_researcher"
                      value={formData.lead_researcher}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Research Proponents
                    </label>
                    <div className="overflow-x-auto rounded-2xl shadow-md">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Role</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {[1, 2, 3, 4, 5].map((index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{index}</td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  name={`co_researcher${index}`}
                                  value={formData[`co_researcher${index}`] || ''}
                                  onChange={handleChange}
                                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-6 py-4 text-gray-900 dark:text-white">Proponent</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Nominated Faculty Members</h3>
                    <div className="overflow-x-auto rounded-2xl shadow-md">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Role</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {[1, 2, 3, 4, 5].map((index) => {
                            type NameField = 'adviser' | 'panel_chair' | 'panel1' | 'panel2' | 'panel3';
                            let nameField: NameField =
                              index === 1
                                ? 'adviser'
                                : index === 2
                                ? 'panel_chair'
                                : `panel${index - 2}` as NameField;

                            return (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{index}</td>
                                <td className="px-6 py-4">
                                  <select
                                    name={nameField}
                                    id={nameField}
                                    value={formData[nameField] ?? ''}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="">Select Faculty Member</option>
                                    {facultyList.map((faculty) => (
                                      <option key={faculty.facultyID} value={faculty.facultyID}>
                                        {faculty.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-6 py-4 text-gray-900 dark:text-white">
                                  {index === 1 ? 'Adviser' : index === 2 ? 'Panel Chair' : 'Member'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 transition duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner sm />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </Layout>
  );
}
