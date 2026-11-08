'use client';

import Link from 'next/link';
import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import { useRegister } from '@/hooks';

export default function RegisterForm() {
  const {
    first_name,
    last_name,
    email,
    password,
    re_password,
    isLoading,
    onChange,
    onSubmit,
  } = useRegister();

  const inputClass =
    'block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#103F78] focus:ring-2 focus:ring-[#103F78]/15';

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
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Research Repository</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Create your account</h1>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur sm:p-8">
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="sr-only">First name</label>
                  <input id="first_name" name="first_name" type="text" placeholder="First name" onChange={onChange} value={first_name} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="last_name" className="sr-only">Last name</label>
                  <input id="last_name" name="last_name" type="text" placeholder="Last name" onChange={onChange} value={last_name} required className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="Email address" onChange={onChange} value={email} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Password" onChange={onChange} value={password} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="re_password" className="sr-only">Confirm password</label>
                <input id="re_password" name="re_password" type="password" autoComplete="new-password" placeholder="Confirm password" onChange={onChange} value={re_password} required className={inputClass} />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#103F78] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b2d57] disabled:opacity-60"
              >
                {isLoading ? <Spinner sm /> : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-[#103F78] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
