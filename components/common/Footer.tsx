'use client';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 sm:px-6">
        <p className="text-center text-xs font-medium text-slate-500">
          &copy; {year} RKIVE Research Repository. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
