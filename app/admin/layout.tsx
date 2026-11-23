import { RequireAuth } from '@/components/utils';

interface Props {
	children: React.ReactNode;
}

export default function Layout({ children }: Props) {
	// Research Coordinator (Admin) workspace. Superadmin may access for oversight.
	return <RequireAuth allow={['superadmin', 'admin']}>{children}</RequireAuth>;
}