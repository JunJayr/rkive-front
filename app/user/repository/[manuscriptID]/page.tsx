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
  FiLayers,
  FiAward,
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
  return 'Institution';
}

export default function RepositoryDetailPage() {
  const params = useParams<{ manuscriptID: string }>();
  const manuscriptID = params?.manuscriptID;

  const { data: manuscript, isLoading, isFetching, isError } = useGetRepositoryManuscriptQuery(manuscriptID ?? '', {
    skip: !manuscriptID,
  });
  const { data: related = [] } = useGetRelatedManuscriptsQuery(manuscriptID ?? '', {
    skip: !manuscriptID || !manuscript,
  });

  const [addBookmark, { isLoading: addingBookmark }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: removingBookmark }] = useRemoveBookmarkMutation();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyCitation = async () => {
    try {
      await navigator.clipboard?.writeText(citationText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

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
      <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 pb-14 pt-20 sm:px-6 md:pt-8 lg:px-10">
            <div className="mx-auto w-full max-w-6xl">
              <Link href="/user/search" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#103F78] hover:underline">
                <FiArrowLeft size={16} /> Back to Browse Research
              </Link>

              {(isLoading || isFetching) && (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
                  <Spinner />
                  <p className="mt-4 text-sm text-slate-500">Loading research details…</p>
                </div>
              )}

              {isError && !isFetching && (
                <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500"><FiAlertCircle size={26} /></div>
                  <h2 className="mt-4 text-lg font-bold text-slate-800">Research not available</h2>
                  <p className="mt-2 max-w-md text-sm text-slate-500">This manuscript may not exist, may not be approved, or you may not have permission to view it.</p>
                  <Link href="/user/search" className="mt-5 rounded-xl bg-[#103F78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b2d57]">Browse Research</Link>
                </div>
              )}

              {manuscript && !isFetching && !isError && (
                <article className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
                  <div className="bg-gradient-to-br from-[#103F78] via-[#103F78] to-[#1a5494] px-6 py-7 text-white sm:px-8 sm:py-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-50 ring-1 ring-inset ring-emerald-300/20">
                          <FiCheckCircle size={13} /> Approved
                        </span>
                        <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/15">{visibilityLabel(manuscript.visibility)}</span>
                        {manuscript.category && <span className="rounded-full bg-[#FBBF24]/20 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-inset ring-[#FBBF24]/25">{manuscript.category}</span>}
                        {manuscript.year_completed && <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/15">{manuscript.year_completed}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={toggleBookmark}
                        disabled={addingBookmark || removingBookmark}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
                          isBookmarked ? 'bg-[#FBBF24] text-[#103F78]' : 'bg-white/12 text-white ring-1 ring-inset ring-white/20 hover:bg-white/18'
                        }`}
                      >
                        <FiBookmark size={16} className={isBookmarked ? 'fill-current' : ''} /> {isBookmarked ? 'Saved' : 'Save to Collection'}
                      </button>
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#FBBF24]/90">Research Manuscript</p>
                    <h1 className="mt-2 max-w-4xl text-2xl font-extrabold leading-snug tracking-tight sm:text-[2rem]">{manuscript.title}</h1>
                    {(manuscript.authors?.length ?? 0) > 0 && (
                      <p className="mt-4 flex items-start gap-2 text-sm text-blue-100/90">
                        <FiUsers size={16} className="mt-0.5 shrink-0 text-blue-200/80" />
                        <span>{manuscript.authors.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-6 p-5 sm:p-7 lg:p-8">
                      <section>
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><FiFileText size={16} className="text-[#103F78]" /> Abstract</h2>
                        <div className="rounded-2xl bg-[#F6F8FC] p-5 ring-1 ring-inset ring-slate-100">
                          <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">{manuscript.description || 'No abstract provided.'}</p>
                        </div>
                      </section>

                      {(manuscript.keywords?.length ?? 0) > 0 && (
                        <section>
                          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><FiTag size={16} className="text-[#103F78]" /> Keywords</h2>
                          <div className="flex flex-wrap gap-2">
                            {manuscript.keywords.map((kw: string) => (
                              <span key={kw} className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 ring-1 ring-inset ring-amber-100">{kw}</span>
                            ))}
                          </div>
                        </section>
                      )}

                      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Citation</h2>
                          <button type="button" onClick={copyCitation} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            <FiCopy size={13} /> {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-sm leading-7 text-slate-600">{citationText}</p>
                      </section>

                      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><FiBookOpen size={16} className="text-[#103F78]" /> Document Access</h2>
                        <p className="text-sm leading-6 text-slate-600">
                          Preview and download are provided through secure, permission-checked access.
                          {!manuscript.allow_download && (
                            <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500"><FiLock size={13} /> Download is not enabled for this manuscript.</span>
                          )}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button type="button" onClick={handlePreview} disabled={previewLoading} className="inline-flex items-center gap-2 rounded-xl bg-[#103F78] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b2d57] disabled:opacity-60">
                            <FiEye size={16} /> {previewLoading ? 'Loading preview…' : previewUrl ? 'Show Preview' : 'Preview PDF'}
                          </button>
                          <button type="button" onClick={handleDownload} disabled={downloadLoading || !manuscript.allow_download} title={manuscript.allow_download ? 'Download PDF' : 'Download not enabled'} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                            <FiDownload size={16} /> {downloadLoading ? 'Downloading…' : 'Download PDF'}
                          </button>
                        </div>
                        {(previewError || downloadError) && <p className="mt-3 text-sm font-medium text-red-600">{previewError || downloadError}</p>}
                        {showPreview && previewUrl && (
                          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                              <p className="text-sm font-bold text-slate-700">PDF Preview</p>
                              <button type="button" onClick={() => setShowPreview(false)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100">
                                <FiX size={14} /> Hide
                              </button>
                            </div>
                            <iframe title="Manuscript PDF preview" src={previewUrl} className="h-[70vh] min-h-[420px] w-full bg-slate-100" />
                          </div>
                        )}
                      </section>
                    </div>

                    <aside className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-6">
                      <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><FiLayers size={16} className="text-[#103F78]" /> Details</h2>
                      <dl className="space-y-4 text-sm">
                        {[
                          ['Adviser', manuscript.adviser, <FiAward key="a" size={14} />],
                          ['Department', manuscript.department, null],
                          ['Program', manuscript.program, null],
                          ['Year completed', manuscript.year_completed, <FiCalendar key="c" size={14} />],
                          ['Published / Approved', formatDate(manuscript.published_at || manuscript.approved_at), null],
                          ['Visibility', visibilityLabel(manuscript.visibility), null],
                        ].map(([label, value, icon]) => (
                          <div key={String(label)} className="rounded-xl bg-white p-3.5 ring-1 ring-inset ring-slate-100">
                            <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">{icon}{label as string}</dt>
                            <dd className="font-medium text-slate-800">{(value as any) || '—'}</dd>
                          </div>
                        ))}
                        <div className="rounded-xl bg-white p-3.5 ring-1 ring-inset ring-slate-100">
                          <dt className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Panel / Committee</dt>
                          <dd className="font-medium text-slate-800">{(manuscript.panel_members?.length ?? 0) > 0 ? manuscript.panel_members.join(', ') : '—'}</dd>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-white p-3.5 ring-1 ring-inset ring-slate-100">
                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Views</dt>
                            <dd className="mt-1 text-lg font-extrabold text-[#103F78]">{manuscript.view_count ?? 0}</dd>
                          </div>
                          <div className="rounded-xl bg-white p-3.5 ring-1 ring-inset ring-slate-100">
                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Downloads</dt>
                            <dd className="mt-1 text-lg font-extrabold text-[#103F78]">{manuscript.download_count ?? 0}</dd>
                          </div>
                        </div>
                      </dl>
                    </aside>
                  </div>

                  {related.length > 0 && (
                    <section className="border-t border-slate-100 bg-white px-5 py-7 sm:px-7 lg:px-8">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Related Research</h2>
                      <p className="mt-1 text-sm text-slate-500">Similar approved manuscripts you may find useful.</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {related.map((item: any) => (
                          <Link key={item.manuscriptID} href={`/user/repository/${item.manuscriptID}`} className="group rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-[#F6F8FC]">
                            <p className="line-clamp-2 text-sm font-bold text-slate-800 group-hover:text-[#103F78]">{item.title}</p>
                            <p className="mt-1.5 text-xs text-slate-500">{(item.authors ?? []).slice(0, 2).join(', ') || '—'}{item.year_completed ? ` · ${item.year_completed}` : ''}</p>
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
