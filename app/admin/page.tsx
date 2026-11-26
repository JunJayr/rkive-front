'use client';

import {
  FiBookOpen,
  FiCheckCircle,
  FiFileText,
  FiShield,
  FiUsers,
} from 'react-icons/fi';

import Sidebar from '@/components/common/admin/Sidebar';
import Footer from '@/components/common/Footer';
import { EmptyState, Notice, RouteSkeleton, StatusBadge } from '@/components/common/Feedback';
import { RubricManagementCard } from '@/components/common/academic/AcademicWorkflowTools';
import {
  useGetDocumentCountQuery,
  useListUsersQuery,
} from '@/redux/features/authApiSlice';

export default function AdminDashboard() {
  const { data: documentCount, isLoading: loadingStats, isError: statsError, refetch: refetchStats } = useGetDocumentCountQuery();
  const { data: users = [], isLoading: loadingUsers } = useListUsersQuery();

  const overviewConfig = [
    { label: 'Total Accounts', value: users.length, icon: FiUsers, detail: 'Registered RKIVE users' },
    { label: 'Research Groups', value: documentCount?.research_groups ?? 0, icon: FiUsers, detail: 'Distinct research titles' },
    { label: 'Pending Reviews', value: documentCount?.pending_reviews ?? 0, icon: FiFileText, detail: 'Awaiting decisions' },
    { label: 'Completed Defenses', value: documentCount?.completed_defenses ?? 0, icon: FiCheckCircle, detail: 'Final defense records' },
    { label: 'Published Manuscripts', value: documentCount?.published_manuscripts ?? 0, icon: FiBookOpen, detail: 'Approved in repository' },
  ];

  if (loadingStats || loadingUsers) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <RouteSkeleton label="Loading academic operations" />
      </div>
    );
  }

  const stages = documentCount?.stages;
  const stageRows = stages
    ? [
        { label: 'Panel Nomination', value: (stages as Record<string, number>).panel_nomination ?? 0 },
        { label: 'Concept Defense', value: stages.concept ?? 0 },
        { label: 'Proposal Defense', value: stages.proposal ?? 0 },
        { label: 'Final Defense', value: stages.final_defense ?? 0 },
        { label: 'Manuscript', value: stages.manuscript ?? 0 },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-brandSurface text-ink">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brandGold">
                  RKIVE / Academic Administration
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-brandNavy sm:text-4xl">
                  Research Coordinator Dashboard
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-mutedSlate">
                  Monitor academic progress, coordinate panels and schedules, manage ISO forms and repository metadata, and generate reports. Account creation and imports now live in the dedicated Academic Operations workspace.
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brandNavy-50 text-brandNavy">
                <FiShield size={26} aria-hidden="true" />
              </div>
            </header>

            {statsError ? (
              <div className="mb-8">
                <Notice
                  tone="error"
                  title="Some dashboard totals could not be loaded."
                  message="Workflow records are unaffected. Retry to refresh the overview."
                  onRetry={() => void refetchStats()}
                />
              </div>
            ) : null}

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
              {overviewConfig.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rk-card p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brandNavy-50 text-brandNavy">
                        <Icon size={23} aria-hidden="true" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-mutedSlate">
                        Overview
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-brandNavy">
                      {item.value.toLocaleString()}
                    </p>
                    <h2 className="mt-2 text-sm font-semibold text-ink">{item.label}</h2>
                    <p className="mt-1 text-xs text-mutedSlate">{item.detail}</p>
                  </div>
                );
              })}
            </div>

            <section className="mb-8 rk-card p-6">
              <h2 className="rk-section-title">Scoring configuration</h2>
              <p className="mt-1 text-xs text-mutedSlate">
                Publish the CITC rubric used by assigned panelists for defense scoring.
              </p>
              <div className="mt-5">
                <RubricManagementCard />
              </div>
            </section>

            <section className="rk-card p-6">
              <h2 className="rk-section-title">Research Progress by Stage</h2>
              <p className="mt-1 text-xs text-mutedSlate">
                Counts are calculated from RKIVE records and follow the linear workflow.
              </p>
              {stageRows.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {stageRows.map((stage) => {
                    const max = Math.max(1, ...stageRows.map((row) => Number(row.value) || 0));
                    const pct = Math.round(((Number(stage.value) || 0) / max) * 100);
                    return (
                      <div key={stage.label} className="rounded-xl border border-slate-100 bg-brandSurface p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-ink">{stage.label}</span>
                          <span className="font-bold text-brandNavy">{stage.value}</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-brandNavy" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState title="No stage totals yet" description="Stage counts appear as applications move through the workflow." />
                </div>
              )}
            </section>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-mutedSlate">
              <StatusBadge status="approved" />
              <span>Academic decisions remain scoped to assigned panels and Department Heads.</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
