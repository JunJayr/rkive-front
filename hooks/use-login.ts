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

      const isAdmin = Boolean(roleResponse.is_admin ?? (roleResponse.is_staff || roleResponse.is_superuser));
      const isPanel = Boolean(roleResponse.is_panel ?? roleResponse.is_faculty);
      const accountType = roleResponse.account_type ?? (isAdmin ? 'admin' : isPanel ? 'panel' : 'student');

      dispatch(setAuthLogin({
        isActive: roleResponse.is_active,
        isStaff: roleResponse.is_staff,
        isSuperuser: roleResponse.is_superuser,
        isDean: false,
        isHeadDept: false,
        isFaculty: roleResponse.is_faculty,
        isStudent: accountType === 'student',
      }));

      toast.success('Logged in');

      if (!roleResponse.is_active) {
        toast.error('Your account is not active.');
        return;
      }

      if (isAdmin) {
        router.push('/admin');
      } else if (isPanel) {
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
