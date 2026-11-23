'use client';

import Link from 'next/link';
import { FiShield, FiUsers, FiList, FiSettings, FiAlertTriangle, FiDatabase } from 'react-icons/fi';
import Sidebar from '@/components/common/superadmin/Sidebar';
import Footer from '@/components/common/Footer';

const cards = [
  { href: '/superadmin/users', title: 'Users & Privileged Access', desc: 'Create/manage Admin accounts, control privileged access, and deactivate users. API-enforced: only Superadmin may manage privileged accounts.', icon: FiUsers },
  { href: '/superadmin/audit-logs', title: 'Security & Audit Logs (Full)', desc: 'Monitor logins context, permission changes, user/faculty/academic decision events, and administrative activities.', icon: FiList },
  { href: '/superadmin/system', title: 'System Configuration', desc: 'Global settings, ISO/template governance context, repository policy governance, and maintenance responsibilities.', icon: FiSettings },
  { href: '/admin', title: 'Academic Operations (Oversight)', desc: 'View the Research Coordinator workspace for day-to-day academic operations and document management.', icon: FiShield },
];

export default function SuperadminPage() {
  return (
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <header className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / System Owner</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78] sm:text-4xl">Superadmin Dashboard</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-500">
                Controls overall RKIVE system, security, and high-level configuration. Superadmin does not routinely approve student defenses or manuscripts; academic decisions belong to authorized faculty. Exceptional intervention is audited.
              </p>
            </header>

            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
                <div>
                  <p className="font-bold text-amber-900">Separation of responsibilities</p>
                  <p className="mt-1 text-sm text-amber-900/90">System control (Superadmin), academic administration (Admin/Research Coordinator), and academic approval (assigned Adviser/Panelist/Committee Chair) are separated. Use exceptional overrides only with proper justification; actions are logged.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {cards.map((c) => {
                const Icon = c.icon;
                return (
                  <Link key={c.href} href={c.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]"><Icon size={22} /></div>
                    <h2 className="mt-4 text-base font-bold text-slate-800">{c.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{c.desc}</p>
                  </Link>
                );
              })}
            </div>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#103F78]"><FiDatabase /> Superadmin responsibilities (reference)</h2>
              <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <li>• User/role management and privileged access</li>
                <li>• Global/system configuration and academic-year rules (governance)</li>
                <li>• ISO form/template versioning and numbering governance</li>
                <li>• Security, audit logs, and permission-change monitoring</li>
                <li>• Research repository governance and access policies</li>
                <li>• Maintenance, integrations, backup/recovery procedures</li>
              </ul>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
