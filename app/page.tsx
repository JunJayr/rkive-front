import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RKIVE | Research Repository",
  description: "Manage capstone and thesis proposals, defenses, and approved research manuscripts.",
};

export default function Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F8FC] px-4 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-[#103F78]/10 blur-3xl" />
      <div className="relative w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 md:h-24 md:w-24">
          <img
            src="/logo.png"
            alt="RKIVE logo"
            className="h-14 w-14 md:h-16 md:w-16"
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">CITC · USTP CDO</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#103F78] md:text-6xl">
          RKIVE Research Repository
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
          Manage capstone and thesis proposals, defenses, and officially approved manuscripts in one secure, centralized platform.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#103F78] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b2d57] sm:w-auto"
          >
            Sign in to your account
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-[#103F78] transition hover:bg-slate-50 sm:w-auto"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}