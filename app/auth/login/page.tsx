'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import { useLogin } from '@/hooks';

export default function LoginForm() {
  const { email, password, errors, onChange, onSubmit } = useLogin();
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowFullScreenSpinner(true);
    try {
      await onSubmit(e);
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setShowFullScreenSpinner(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://pbs.twimg.com/media/Egbd8bVWAAEtEzP?format=jpg&name=4096x4096')",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#103F78]/85 via-[#103F78]/65 to-slate-900/70"
        aria-hidden="true"
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center text-white">
            <img alt="RKIVE logo" src="/logo.png" className="mx-auto h-16 w-auto drop-shadow-sm sm:h-20" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Research Repository</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-blue-100/90">Sign in to manage your research, submissions, and approvals.</p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur sm:p-8">
            <h2 className="text-center text-lg font-bold text-[#103F78]">Sign in to your account</h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
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
                {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={onChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15"
                    required
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-end">
                <Link href="/password-reset" className="text-sm font-semibold text-[#103F78] hover:text-[#0b2d57] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#103F78] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b2d57] focus:outline-none focus:ring-2 focus:ring-[#103F78]/30 disabled:opacity-60"
                disabled={showFullScreenSpinner}
              >
                Sign in
                <FiArrowRight size={16} />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-[#103F78] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

      {showFullScreenSpinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px]">
          <div className="rounded-2xl bg-white px-6 py-5 shadow-xl">
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
}