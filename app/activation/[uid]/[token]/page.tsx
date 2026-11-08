'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useActivationMutation } from '@/redux/features/authApiSlice';
import { toast } from 'react-toastify';

interface Props {
  params: Promise<{ uid: string; token: string }>;
}

export default function Page({ params }: Props) {
  const router = useRouter();
  const [activation] = useActivationMutation();
  const { uid, token } = use(params);

  useEffect(() => {
    activation({ uid, token })
      .unwrap()
      .then(() => {
        toast.success('Account activated successfully!');
      })
      .catch(() => {
        toast.error('Failed to activate account. Please try again.');
      })
      .finally(() => {
        router.push('/auth/login');
      });
  }, [uid, token, activation, router]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://pbs.twimg.com/media/Egbd8bVWAAEtEzP?format=jpg&name=4096x4096')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#103F78]/85 via-[#103F78]/65 to-slate-900/70" aria-hidden="true" />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-8 text-center shadow-2xl shadow-slate-900/20 backdrop-blur">
          <img src="/logo.png" alt="RKIVE logo" className="mx-auto h-16 w-auto" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-amber-600">Account Activation</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#103F78]">Activating your account</h1>
          <p className="mt-3 text-sm text-slate-600">Please wait while we verify your activation details. You&apos;ll be redirected to sign in.</p>
          <div className="mt-8 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#103F78]" aria-label="Activating" />
          </div>
        </div>
      </main>
    </div>
  );
}
