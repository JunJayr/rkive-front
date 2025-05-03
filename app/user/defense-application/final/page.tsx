'use client';

import { useFinalApplicationGeneration } from '@/hooks';
import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import Layout from '@/components/utils/Layout';

export default function ApplicationForm() {
  const {
    formData,
    isLoading,
    previewUrl,
    setPreviewUrl,
    handleDownload,
    handleChange,
    handleSubmit,
  } = useFinalApplicationGeneration();

  const pdfUrl = previewUrl ? `${previewUrl}#toolbar=0` : null;

  const handleClosePreview = () => {
    setPreviewUrl(null);
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-inter">
        <Sidebar />
        <div className="flex-grow flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
            {pdfUrl ? (
              <div>
                <div className="relative mb-8">
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[600px] border border-gray-300 dark:border-gray-600 rounded-2xl mb-6"
                    title="Application Document Preview"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors duration-200"
                  >
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                  Application for Final Defense
                </h2>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3"
                  >
                    Department
                  </label>
                  <select
                    name="department"
                    id="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Technology Communication Management">Technology Communication Management</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label
                      htmlFor="lead_researcher"
                      className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3"
                    >
                      Lead Researcher
                    </label>
                    <input
                      type="text"
                      name="lead_researcher"
                      id="lead_researcher"
                      value={formData.lead_researcher}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lead_contactno"
                      className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3"
                    >
                      Lead Contact Number
                    </label>
                    <input
                      type="text"
                      name="lead_contactno"
                      id="lead_contactno"
                      value={formData.lead_contactno}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Research Proponents Table */}
                <div>
                  <label
                    className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4"
                  >
                    Research Proponents
                  </label>
                  <div className="overflow-x-auto rounded-2xl shadow-md">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300"
                          >
                            #
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300"
                          >
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {[1, 2, 3, 4, 5].map((index) => (
                          <tr key={index}>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {index}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              <input
                                type="text"
                                name={`co_researcher${index}`}
                                value={formData[`co_researcher${index}`] || ''}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                              />
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              Proponent
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="research_title"
                    className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3"
                  >
                    Research Title
                  </label>
                  <input
                    type="text"
                    name="research_title"
                    id="research_title"
                    value={formData.research_title}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label
                      htmlFor="datetime_defense"
                      className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3"
                    >
                      Defense Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="datetime_defense"
                      id="datetime_defense"
                      value={formData.datetime_defense}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="place_defense"
                      className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3"
                    >
                      Defense Venue
                    </label>
                    <input
                      type="text"
                      name="place_defense"
                      id="place_defense"
                      value={formData.place_defense}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Nominated Faculty Members Table */}
                <div>
                  <h3
                    className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4"
                  >
                    Nominated Faculty Members
                  </h3>
                  <div className="overflow-x-auto rounded-2xl shadow-md">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300"
                          >
                            #
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-300"
                          >
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {[1, 2, 3, 4, 5].map((index) => {
                          type NameField =
                            | 'adviser'
                            | 'panel_chair'
                            | 'panel1'
                            | 'panel2'
                            | 'panel3';
                          let nameField: NameField;
                          if (index === 1) {
                            nameField = 'adviser';
                          } else if (index === 2) {
                            nameField = 'panel_chair';
                          } else {
                            nameField = `panel${index - 2}` as
                              | 'panel1'
                              | 'panel2'
                              | 'panel3';
                          }

                          const facultyOptions = [
                            'Quinto A. Tan Jr., MIT',
                            'Jay Noel Rojo',
                            'Jerwin S. Borres',
                            'Christopher Daniot II, MDS',
                          ].sort(); // Sort alphabetically

                          return (
                            <tr key={index}>
                              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {index}
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                <select
                                  name={nameField}
                                  id={nameField}
                                  value={formData[nameField] || ''}
                                  onChange={handleChange}
                                  className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                                >
                                  <option value="">Select Faculty Member</option>
                                  {facultyOptions.map((faculty) => (
                                    <option key={faculty} value={faculty}>
                                      {faculty}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {index === 1
                                  ? 'Adviser'
                                  : index === 2
                                  ? 'Panel Chair'
                                  : 'Member'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="documenter"
                    className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3"
                  >
                    Documenter
                  </label>
                  <input
                    type="text"
                    name="documenter"
                    id="documenter"
                    value={formData.documenter}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-shadow duration-200"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-colors duration-200 text-base font-semibold shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner sm />
                    </div>
                  ) : (
                    'Generate Panel'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </Layout>
  );
}