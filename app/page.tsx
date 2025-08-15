import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rkive | Home",
  description: "Rkive Home Page",
};

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Rkive Logo - Thesis Repository System"
            className="h-20 w-20 md:h-24 md:w-24"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#294167]">
          Rkive Web Application
        </h1>

        {/* Description */}
        <p className="mt-6 text-base md:text-lg leading-7 text-[#294167]">
          Rkive is a web-based application designed to manage capstone and thesis
          proposals and defense presentations at CITC-USTP CDO, addressing
          accessibility of previous studies and centralizing the process.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-xl bg-[#294167] px-5 py-3 text-sm md:text-base font-semibold text-white shadow-md hover:bg-[#1f3150] transition"
          >
            Log into your account
          </Link>
          <Link
            href="/auth/register"
            className="text-sm md:text-base font-semibold text-[#FFCC00] hover:opacity-80 transition"
          >
            Or create an account{" "}
            <span aria-hidden="true" className="inline-block">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}