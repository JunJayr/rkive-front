'use client';

import Link from 'next/link';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import { useResetPassword } from '@/hooks';

export default function PasswordResetForm() {
  const { email, isLoading, onChange, onSubmit } = useResetPassword();

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://pbs.twimg.com/media/Egbd8bVWAAEtEzP?format=jpg&name=4096x4096')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#103F78]/85 via-[#103F78]/65 to-slate-900/70" aria-hidden="true" />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center text-white">
            <img alt="RKIVE logo" src="/logo.png" className="mx-auto h-16 w-auto drop-shadow-sm" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Account Recovery</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Reset your password</h1>
            <p className="mt-2 text-sm text-blue-100/90">Enter your email and we&apos;ll send a reset link.</p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur sm:p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={onChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#103F78] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b2d57] disabled:opacity-60"
              >
                {isLoading ? <Spinner sm className="text-white" /> : 'Send reset link'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#103F78] hover:underline">
                <FiArrowLeft size={15} /> Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
