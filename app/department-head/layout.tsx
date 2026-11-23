import type { Metadata } from 'next';
import RequireAuth from '@/components/utils/RequireAuth';

export const metadata: Metadata = {
  title: 'Department Head | RKIVE',
  description: 'Department-level defense workflow administration.',
};

export default function DepartmentHeadLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth allow={['department_head', 'superadmin']}>{children}</RequireAuth>;
}
