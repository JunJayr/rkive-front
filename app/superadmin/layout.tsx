import { RequireAuth } from '@/components/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireAuth allow={['superadmin']}>{children}</RequireAuth>;
}
