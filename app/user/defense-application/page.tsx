'use client';

import Link from 'next/link';
import { FiFileText, FiArrowRight, FiCheckCircle, FiClock } from 'react-icons/fi';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Layout from '@/components/utils/Layout';

const steps = [
  {
    title: 'Panel Nomination',
    href: '/user/panel-nomination',
    description: 'Nominate your adviser and panel members for the oral examination workflow.',
    cta: 'Open nomination',
  },
  {
    title: 'Concept Defense Application',
    href: '/user/defense-application/concept',
    description: 'Prepare and generate your concept defense application details and document.',
    cta: 'Open concept defense',
  },
  {
    title: 'Proposal Defense Application',
    href: '/user/defense-application/proposal',
    description: 'Submit your proposal defense application after concept approval in your workflow.',
    cta: 'Open proposal defense',
  },
  {
    title: 'Final Defense Application',
    href: '/user/defense-application/final',
    description: 'Prepare your final defense application and related manuscript submission requirements.',
    cta: 'Open final defense',
  },
];

export default function DefenseApplicationHub() {
  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-12">
            <div className="mx-auto w-full max-w-5xl">
              <header className="mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Academic Workflow</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">Defense Applications</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Manage panel nomination and defense application steps. Faculty and assigned panel members review submissions through the panel portal.
                </p>
              </header>

              <div className="grid gap-4 sm:grid-cols-2">
                {steps.map((step, i) => (
                  <Link
                    key={step.href}
                    href={step.href}
                    className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]">
                        <FiFileText size={20} />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">Step {i + 1}</span>
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#103F78]">
                      {step.cta} <FiArrowRight className="transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-slate-700">
                  <FiClock className="text-[#103F78]" /> Review decisions are recorded by assigned panel/faculty.
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-slate-700">
                  <FiCheckCircle className="text-emerald-600" /> Approved manuscripts can be published to the repository.
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </Layout>
  );
}
