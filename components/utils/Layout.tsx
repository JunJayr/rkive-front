
'use client';

import type { ReactNode } from 'react';

import RequireAuth from '@/components/utils/RequireAuth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <RequireAuth>
      {children}
    </RequireAuth>
  );
}
