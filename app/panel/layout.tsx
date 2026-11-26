import { RequireAuth } from '@/components/utils';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  // Panel / Adviser workspace. Admin access is retained for academic coordination.
  return <RequireAuth allow={['superadmin', 'admin', 'panel']}>{children}</RequireAuth>;
}
