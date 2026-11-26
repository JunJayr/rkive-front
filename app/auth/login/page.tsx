'use client';

import Link from 'next/link';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import Footer from '@/components/common/Footer';
import { ActionSpinner, Notice } from '@/components/common/Feedback';
import { useLogin } from '@/hooks';

export default function LoginForm() {
  const { email, password, errors, submitError, isLoading, onChange, onSubmit } = useLogin();

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
        className="absolute inset-0 bg-gradient-to-br from-[#12186E]/85 via-[#12186E]/65 to-slate-900/70"
        aria-hidden="true"
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="RKIVE logo" src="/logo.png" className="mx-auto h-16 w-auto drop-shadow-sm sm:h-20" />
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur sm:p-8">
            <h2 className="text-center text-lg font-bold text-[#12186E]">Sign in to your account</h2>

            {submitError ? (
              <div className="mt-5">
                <Notice tone="error" title="Sign in failed" message={submitError} />
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#12186E] focus:ring-2 focus:ring-[#12186E]/15"
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
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#12186E] focus:ring-2 focus:ring-[#12186E]/15"
                    required
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-end">
                <Link href="/password-reset" className="text-sm font-semibold text-[#12186E] hover:text-[#0E1358] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#12186E] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0E1358] focus:outline-none focus:ring-2 focus:ring-[#12186E]/30 disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
                <FiArrowRight size={16} />
              </button>
              {isLoading ? (
                <div className="flex justify-center">
                  <ActionSpinner label="Signing in" />
                </div>
              ) : null}
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-[#12186E] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
