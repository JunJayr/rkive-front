'use client';

import Sidebar from '@/components/common/superadmin/Sidebar';
import Footer from '@/components/common/Footer';
import { FiSettings, FiInfo } from 'react-icons/fi';

export default function SuperadminSystemPage() {
  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-5xl">
            <header className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / System Owner</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#12186E]">System Configuration & Governance</h1>
              <p className="mt-3 text-sm text-slate-500">Superadmin area for global configuration, ISO/template governance, repository policy, and maintenance controls.</p>
            </header>
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 font-bold text-[#12186E]"><FiSettings /> Governance areas</h2><ul className="mt-4 space-y-2 text-sm text-slate-600"><li>• Academic years, departments, programs, defense stages, and global application rules (configure in future system-settings module).</li><li>• ISO form/template management and numbering governance — see Admin ISO form pages for authorized template updates; system-level version policy belongs here.</li><li>• Research repository publication policies, access permissions, and archival rules.</li><li>• Integrations, storage, backup, and recovery procedures.</li></ul></section>
              <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6"><h2 className="flex items-center gap-2 font-bold text-[#12186E]"><FiInfo /> Implemented foundations</h2><p className="mt-2 text-sm text-slate-700">Role separation, privileged-access API enforcement, audit logging (`/superadmin/audit-logs`), workflow configuration foundation (`GET /api/workflow-config/`), and committee-chair assignment support are implemented. Add institution-specific workflow-rule UI and system-settings models as the next configuration step.</p></section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
