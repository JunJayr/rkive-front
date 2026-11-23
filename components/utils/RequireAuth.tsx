
'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/redux/hooks';
import Spinner from '@/components/common/Spinner';

type AllowedRole = 'superadmin' | 'admin' | 'department_head' | 'faculty' | 'student';

interface RequireAuthProps {
  children: ReactNode;
  allow?: AllowedRole[];
}

export default function RequireAuth({ children, allow }: RequireAuthProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const auth = useAppSelector((state) => state.auth);
  const isAuthenticated = auth.isAuthenticated;

  const role: AllowedRole | null = useMemo(() => {
    if (auth.isSuperuser) return 'superadmin';
    if (auth.isStaff) return 'admin';
    if (auth.isDepartmentHead || auth.isHeadDept) return 'department_head';
    if (auth.isFaculty) return 'faculty';
    if (auth.isStudent || isAuthenticated) return 'student';
    return null;
  }, [
    auth.isDepartmentHead, auth.isHeadDept, auth.isFaculty, auth.isStaff,
    auth.isStudent, auth.isSuperuser, isAuthenticated,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated === false) {
      router.replace('/auth/login');
      return;
    }
    if (isAuthenticated === true && allow && allow.length > 0 && role && !allow.includes(role)) {
      if (role === 'superadmin') router.replace('/superadmin');
      else if (role === 'admin') router.replace('/admin');
      else if (role === 'department_head') router.replace('/department-head');
      else if (role === 'faculty') router.replace('/panel');
      else router.replace('/user');
    }
  }, [mounted, isAuthenticated, allow, role, router]);

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

  if (allow && allow.length > 0 && role && !allow.includes(role)) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
