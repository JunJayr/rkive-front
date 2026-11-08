'use client';

import { FiUser, FiMail, FiShield } from 'react-icons/fi';
import { useRetrieveUserQuery } from '@/redux/features/authApiSlice';
import { List, Spinner } from '@/components/common';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Layout from '@/components/utils/Layout';

export default function ProfileForm() {
  const { data: user, isLoading, isFetching } = useRetrieveUserQuery();

  const config = [
    { key: 'first_name', label: 'First name', value: user?.first_name },
    { key: 'last_name', label: 'Last name', value: user?.last_name },
    { key: 'email', label: 'Email', value: user?.email },
  ];

  if (isLoading || isFetching) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">
          <Spinner lg />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-12">
            <div className="mx-auto w-full max-w-4xl">
              <header className="mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Account</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">Profile</h1>
                <p className="mt-2 text-sm text-slate-500">View your account details and access status.</p>
              </header>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-100 bg-[#103F78] px-6 py-6 sm:px-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
                    <FiUser size={26} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Your account' : 'Your account'}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-xs text-blue-100/85">
                      <FiMail size={13} /> {user?.email || '—'}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <List config={config} />

                  {user && (
                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <FiShield className="text-[#103F78]" /> Account status
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className={`rounded-full px-3 py-1 ring-1 ring-inset ${user.is_active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {(user.is_staff || user.is_superuser || user.is_admin) && <span className="rounded-full bg-slate-900 px-3 py-1 text-white ring-1 ring-inset ring-slate-900">Admin</span>}
                        {user.is_faculty && !(user.is_staff || user.is_superuser) && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800 ring-1 ring-inset ring-amber-200">Adviser/Panel</span>}
                        {!user.is_faculty && !(user.is_staff || user.is_superuser) && <span className="rounded-full bg-blue-50 px-3 py-1 text-[#103F78] ring-1 ring-inset ring-blue-200">Student/User</span>}
                      </div>
                    </div>
                  )}
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
