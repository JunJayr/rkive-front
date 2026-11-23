import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { useLoginMutation, useGetUserRoleMutation } from '@/redux/features/authApiSlice';
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

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    try {
      await login({ email, password }).unwrap();
      const roleResponse = await getUserRole({}).unwrap();

      const rawType = (roleResponse.account_type || '').toLowerCase();
      const accountType = rawType === 'panel' ? 'faculty' : rawType;
      const isSuperadmin = Boolean(roleResponse.is_superadmin ?? roleResponse.is_superuser);
      const isDepartmentHead = Boolean(roleResponse.is_department_head)
        || accountType === 'department_head';
      const isAdmin = Boolean(
        roleResponse.is_admin ?? roleResponse.is_staff ?? roleResponse.is_superuser
      ) || accountType === 'superadmin' || accountType === 'admin';
      const isFaculty = Boolean(roleResponse.is_faculty ?? roleResponse.is_panel) || accountType === 'faculty';

      dispatch(setAuthLogin({
        isActive: roleResponse.is_active,
        isStaff: Boolean(roleResponse.is_staff || isSuperadmin || accountType === 'admin'),
        isSuperuser: isSuperadmin,
        isDean: false,
        isHeadDept: isDepartmentHead,
        isDepartmentHead,
        isFaculty,
        isStudent: accountType === 'student' || (!isAdmin && !isFaculty && !isDepartmentHead),
        accountType: isDepartmentHead ? 'department_head' : (accountType as any),
        department: roleResponse.department || '',
        canCreateAccounts: Boolean(roleResponse.can_create_accounts),
        canAssignPanels: Boolean(roleResponse.can_assign_panels),
        canManageSettings: Boolean(roleResponse.can_manage_settings),
      }));

      toast.success('Logged in');

      if (!roleResponse.is_active) {
        toast.error('Your account is not active.');
        return;
      }

      if (isSuperadmin || accountType === 'superadmin') {
        router.push('/superadmin');
      } else if (isDepartmentHead) {
        router.push('/department-head');
      } else if (isAdmin) {
        router.push('/admin');
      } else if (isFaculty) {
        router.push('/panel');
      } else {
        router.push('/user');
      }
    } catch (error: any) {
      if (error.data) {
        Object.keys(error.data).forEach((field) => {
          const messages = error.data[field];
          if (Array.isArray(messages)) {
            messages.forEach((message) => toast.error(`${message}`));
          } else {
            toast.error(`${messages}`);
          }
        });
      } else {
        toast.error('Failed to log in. Please try again later.');
      }
    }
  };

  return {
    email,
    password,
    isLoading,
    errors,
    onChange,
    onSubmit,
  };
}
