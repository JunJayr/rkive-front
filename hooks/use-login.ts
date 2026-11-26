import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import {
  useLoginMutation,
  useGetUserRoleMutation,
  normalizeAccountType,
} from '@/redux/features/authApiSlice';
import { setAuthLogin } from '@/redux/features/authSlice';
import { toast } from 'react-toastify';

export default function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [getUserRole] = useGetUserRoleMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setSubmitError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setSubmitError(null);

    try {
      await login({ email, password }).unwrap();
      const roleResponse = await getUserRole({}).unwrap();

      const accountType = normalizeAccountType(
        roleResponse.role || roleResponse.account_type
      );
      const isSuperadmin = accountType === 'superadmin'
        || Boolean(roleResponse.is_superadmin ?? roleResponse.is_superuser);
      const isDepartmentHead = accountType === 'department_head'
        || Boolean(roleResponse.is_department_head);
      const isAdmin = accountType === 'admin' || accountType === 'superadmin'
        || Boolean(roleResponse.is_admin ?? roleResponse.is_research_admin);
      const isPanel = accountType === 'panel'
        || Boolean(roleResponse.is_panel ?? roleResponse.is_faculty);

      dispatch(setAuthLogin({
        isActive: roleResponse.is_active,
        isStaff: isAdmin,
        isSuperuser: isSuperadmin,
        isDean: false,
        isHeadDept: isDepartmentHead,
        isDepartmentHead,
        isFaculty: isPanel,
        isPanel,
        isStudent: accountType === 'student',
        accountType,
        department: roleResponse.department || '',
        programScope: roleResponse.program_scope || [],
        canCreateAccounts: Boolean(roleResponse.can_create_accounts),
        canManageAccounts: Boolean(roleResponse.can_manage_accounts),
        canImportAccounts: Boolean(roleResponse.can_import_accounts),
        canAssignPanels: Boolean(roleResponse.can_assign_panels),
        canManageSettings: Boolean(roleResponse.can_manage_settings),
      }));

      toast.success('Logged in');

      if (!roleResponse.is_active) {
        toast.error('Your account is not active.');
        return;
      }

      if (isSuperadmin) {
        router.push('/superadmin');
      } else if (isDepartmentHead) {
        router.push('/department-head');
      } else if (isAdmin) {
        router.push('/admin');
      } else if (isPanel) {
        router.push('/panel');
      } else {
        router.push('/user');
      }
    } catch (error: any) {
      const messages: string[] = [];
      if (error.data) {
        Object.keys(error.data).forEach((field) => {
          const value = error.data[field];
          if (Array.isArray(value)) {
            value.forEach((message) => messages.push(`${message}`));
          } else {
            messages.push(`${value}`);
          }
        });
      }
      const message = messages.length
        ? messages.join(' ')
        : 'Failed to log in. Please try again later.';
      setSubmitError(message);
      toast.error(message);
    }
  };

  return {
    email,
    password,
    isLoading,
    errors,
    submitError,
    onChange,
    onSubmit,
  };
}
