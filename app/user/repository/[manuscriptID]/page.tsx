'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiDownload,
  FiEye,
  FiFileText,
  FiLock,
  FiTag,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiBookmark,
  FiCopy,
} from 'react-icons/fi';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';

import {
  useGetRepositoryManuscriptQuery,
  useGetRelatedManuscriptsQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} from '@/redux/features/authApiSlice';

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function visibilityLabel(v?: string) {
  if (v === 'public') return 'Public';
  if (v === 'restricted') return 'Restricted';
  return 'Institution Only';
}

export default function RepositoryDetailPage() {
  const params = useParams<{ manuscriptID: string }>();
  const manuscriptID = params?.manuscriptID;

  const {
    data: manuscript,
    isLoading,
    isFetching,
    isError,
  } = useGetRepositoryManuscriptQuery(manuscriptID ?? '', {
    skip: !manuscriptID,
  });

  const { data: related = [] } = useGetRelatedManuscriptsQuery(manuscriptID ?? '', {
    skip: !manuscriptID || !manuscript,
  });

  const [addBookmark, { isLoading: addingBookmark }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: removingBookmark }] = useRemoveBookmarkMutation();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (manuscript) setIsBookmarked(!!manuscript.is_bookmarked);
  }, [manuscript]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleBookmark = async () => {
    if (!manuscriptID) return;
    try {
      if (isBookmarked) {
        await removeBookmark(manuscriptID).unwrap();
        setIsBookmarked(false);
      } else {
        await addBookmark(manuscriptID).unwrap();
        setIsBookmarked(true);
      }
    } catch {
      // keep state; detail remains source of truth on reload
    }
  };

  const citationText = manuscript
    ? `${(manuscript.authors ?? []).join(', ') || 'Unknown Author'} (${manuscript.year_completed ?? 'n.d.'}). ${manuscript.title}. ${[manuscript.department, manuscript.program].filter(Boolean).join(', ') || 'RKIVE Repository'}${manuscript.published_at || manuscript.approved_at ? `. Published ${formatDate(manuscript.published_at || manuscript.approved_at)}` : ''}.`
    : '';

  const handleDownload = async () => {
    if (!manuscriptID) return;
    setDownloadLoading(true);
    setDownloadError(null);
    try {
      const host = process.env.NEXT_PUBLIC_HOST || '';
      const res = await fetch(`${host}/api/repository/manuscripts/${manuscriptID}/download/`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Download is not permitted for this manuscript.');
        throw new Error('Download is not available.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] || `manuscript-${manuscriptID}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setDownloadError(e?.message || 'Failed to download.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!manuscriptID) return;
    if (previewUrl) {
      setShowPreview(true);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const host = process.env.NEXT_PUBLIC_HOST || '';
      const res = await fetch(`${host}/api/repository/manuscripts/${manuscriptID}/preview/`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Preview is not available for this manuscript.' : 'Failed to load preview.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setShowPreview(true);
    } catch (e: any) {
      setPreviewError(e?.message || 'Failed to load preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-16 pt-24 sm:px-8 md:pt-12">
            <div className="mx-auto w-full max-w-5xl">
              <Link
                href="/user/search"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#103F78] hover:underline"
              >
                <FiArrowLeft size={16} />
                Back to Repository
              </Link>

              {(isLoading || isFetching) && (
                <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white">
                  <Spinner />
                  <p className="text-sm text-slate-500">Loading manuscript...</p>
                </div>
              )}

              {isError && !isFetching && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
                  <FiAlertCircle size={36} className="text-red-500" />
                  <h2 className="mt-4 text-lg font-bold text-slate-800">Manuscript not available</h2>
                  <p className="mt-2 max-w-md text-sm text-slate-500">
                    This manuscript may not exist, may not be approved, or you may not have permission to view it.
                  </p>
                </div>
              )}

              {manuscript && !isFetching && !isError && (
                <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  {/* Header */}
                  <div className="border-b border-slate-100 bg-gradient-to-r from-[#103F78] to-[#1a5fb4] px-6 py-8 text-white sm:px-8">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
                          <FiCheckCircle size={13} />
                          Approved
                        </span>
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                          {visibilityLabel(manuscript.visibility)}
                        </span>
                        {manuscript.category && (
                          <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-100">
                            {manuscript.category}
                          </span>
                        )}
                        {manuscript.year_completed && (
                          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                            {manuscript.year_completed}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={toggleBookmark}
                        disabled={addingBookmark || removingBookmark}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${isBookmarked ? 'bg-amber-300 text-[#103F78]' : 'bg-white/15 text-white hover:bg-white/25'} disabled:opacity-60`}
                      >
                        <FiBookmark size={14} /> {isBookmarked ? 'Saved' : 'Save'}
                      </button>
                    </div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                      RKIVE / Research Repository
                    </p>
                    <h1 className="text-2xl font-extrabold leading-snug sm:text-3xl">
                      {manuscript.title}
                    </h1>
                  </div>

                  <div className="grid gap-0 lg:grid-cols-3">
                    {/* Main */}
                    <div className="space-y-8 p-6 sm:p-8 lg:col-span-2">
                      <section>
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                          <FiFileText size={16} /> Abstract
                        </h2>
                        <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                          {manuscript.description || 'No abstract provided.'}
                        </p>
                      </section>

                      {(manuscript.keywords?.length ?? 0) > 0 && (
                        <section>
                          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                            <FiTag size={16} /> Keywords
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {manuscript.keywords.map((kw) => (
                              <span
                                key={kw}
                                className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}

                      <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Cite this research</h2>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(citationText)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            <FiCopy size={13} /> Copy
                          </button>
                        </div>
                        <p className="text-sm leading-7 text-slate-700">{citationText}</p>
                      </section>

                      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                          <FiBookOpen size={16} /> Document Access
                        </h2>
                        <p className="text-sm text-slate-600">
                          Preview and download this approved manuscript through secure, permission-checked access.
                          {!manuscript.allow_download && (
                            <span className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                              <FiLock size={13} /> Download is not enabled for this manuscript.
                            </span>
                          )}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handlePreview}
                            disabled={previewLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#103F78] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2d57] disabled:opacity-60"
                          >
                            <FiEye size={16} /> {previewLoading ? 'Loading preview…' : previewUrl ? 'Show Preview' : 'Preview PDF'}
                          </button>
                          <button
                            type="button"
                            onClick={handleDownload}
                            disabled={downloadLoading || !manuscript.allow_download}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title={manuscript.allow_download ? 'Download PDF' : 'Download not enabled'}
                          >
                            <FiDownload size={16} /> {downloadLoading ? 'Downloading…' : 'Download PDF'}
                          </button>
                        </div>
                        {(previewError || downloadError) && (
                          <p className="mt-3 text-sm text-red-600">{previewError || downloadError}</p>
                        )}

                        {showPreview && previewUrl && (
                          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                              <p className="text-sm font-semibold text-slate-700">Manuscript Preview</p>
                              <button
                                type="button"
                                onClick={() => setShowPreview(false)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                              >
                                <FiX size={14} /> Hide
                              </button>
                            </div>
                            <iframe
                              title="Manuscript PDF preview"
                              src={previewUrl}
                              className="h-[70vh] min-h-[420px] w-full bg-slate-100"
                            />
                          </div>
                        )}
                      </section>
                    </div>

                    {/* Sidebar meta */}
                    <aside className="border-t border-slate-100 bg-slate-50/60 p-6 sm:p-8 lg:col-span-1 lg:border-l lg:border-t-0">
                      <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-500">
                        Research Details
                      </h2>

                      <dl className="space-y-5 text-sm">
                        <div>
                          <dt className="mb-1 flex items-center gap-1.5 font-semibold text-slate-500">
                            <FiUsers size={14} /> Authors
                          </dt>
                          <dd className="text-slate-800">
                            {(manuscript.authors?.length ?? 0) > 0
                              ? manuscript.authors.join(', ')
                              : '—'}
                          </dd>
                        </div>

                        <div>
                          <dt className="mb-1 font-semibold text-slate-500">Research Adviser</dt>
                          <dd className="text-slate-800">{manuscript.adviser || '—'}</dd>
                        </div>

                        <div>
                          <dt className="mb-1 font-semibold text-slate-500">Panel / Committee</dt>
                          <dd className="text-slate-800">
                            {(manuscript.panel_members?.length ?? 0) > 0
                              ? manuscript.panel_members.join(', ')
                              : '—'}
                          </dd>
                        </div>

                        <div>
                          <dt className="mb-1 font-semibold text-slate-500">Department</dt>
                          <dd className="text-slate-800">{manuscript.department || '—'}</dd>
                        </div>

                        <div>
                          <dt className="mb-1 font-semibold text-slate-500">Academic Program</dt>
                          <dd className="text-slate-800">{manuscript.program || '—'}</dd>
                        </div>

                        <div>
                          <dt className="mb-1 flex items-center gap-1.5 font-semibold text-slate-500">
                            <FiCalendar size={14} /> Year Completed
                          </dt>
                          <dd className="text-slate-800">{manuscript.year_completed ?? '—'}</dd>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                          <dt className="mb-1 font-semibold text-slate-500">Approval / Publication</dt>
                          <dd className="text-slate-800">
                            {formatDate(manuscript.published_at || manuscript.approved_at) || '—'}
                          </dd>
                        </div>

                        <div>
                          <dt className="mb-1 font-semibold text-slate-500">Approval Status</dt>
                          <dd className="font-semibold capitalize text-emerald-700">{manuscript.status}</dd>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                          <div>
                            <dt className="mb-1 font-semibold text-slate-500">Views</dt>
                            <dd className="text-slate-800">{manuscript.view_count ?? 0}</dd>
                          </div>
                          <div>
                            <dt className="mb-1 font-semibold text-slate-500">Downloads</dt>
                            <dd className="text-slate-800">{manuscript.download_count ?? 0}</dd>
                          </div>
                        </div>
                      </dl>
                    </aside>
                  </div>

                  {related.length > 0 && (
                    <section className="border-t border-slate-100 bg-white px-6 py-8 sm:px-8">
                      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">
                        Related Research
                      </h2>
                      <p className="mb-5 text-sm text-slate-500">
                        Recommended based on keywords, department, and research topic.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {related.map((item) => (
                          <Link
                            key={item.manuscriptID}
                            href={`/user/repository/${item.manuscriptID}`}
                            className="group rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                          >
                            <p className="text-sm font-bold text-[#103F78] group-hover:underline">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {(item.authors ?? []).slice(0, 3).join(', ') || '—'}
                              {item.year_completed ? ` · ${item.year_completed}` : ''}
                            </p>
                            {(item.department || item.program) && (
                              <p className="mt-1 text-xs text-slate-400">
                                {[item.department, item.program].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </article>
              )}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </Layout>
  );
}
