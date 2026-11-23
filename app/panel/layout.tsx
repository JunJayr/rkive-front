import { RequireAuth } from '@/components/utils';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  // Faculty/adviser/panelist workspace. Admins may monitor in some setups, but the
  // academic approval workspace is faculty-focused; keep admin access for coordination.
  return <RequireAuth allow={['superadmin', 'admin', 'faculty']}>{children}</RequireAuth>;
}
