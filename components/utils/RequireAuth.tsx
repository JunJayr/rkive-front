
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/redux/hooks';
import Spinner from '@/components/common/Spinner';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({
  children,
}: RequireAuthProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // This assumes authSlice has isAuthenticated.
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isAuthenticated === false) {
      router.replace('/auth/login');
    }
  }, [mounted, isAuthenticated, router]);

  // Render exactly the same HTML on the server
  // and during the first client render.
  if (!mounted || isAuthenticated !== true) {
    return (
      <div
        role="status"
        aria-label="Checking authentication"
        className="flex min-h-screen items-center justify-center bg-[#F6F8FC]"
      >
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
