// useAdminDashboard.ts
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useListUsersQuery,
  useGetDocumentCountQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useAddUserMutation,
} from '@/redux/features/authApiSlice';

export type AccountType = 'superadmin' | 'admin' | 'department_head' | 'faculty' | 'student' | 'user';

export interface User {
  userID: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_dean: boolean;
  is_headdept: boolean;
  is_department_head?: boolean;
  is_faculty: boolean;
  is_student: boolean;
  account_type?: AccountType | 'panel';
}

interface AddUserInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  repassword: string;
  account_type?: AccountType;
  department?: string;
}

export default function useAdminDashboard() {
  const { data: users, isLoading: isUsersLoading, refetch } = useListUsersQuery();
  const { data: documentCount, isLoading: isDocumentCountLoading } = useGetDocumentCountQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [addUser] = useAddUserMutation();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loading = isUsersLoading || isDocumentCountLoading;

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedUser) {
      const { name, value, type, checked } = e.target;
      const newValue = type === 'checkbox' ? checked : value;
      setSelectedUser({ ...selectedUser, [name]: newValue });
    }
  };

  const handleAddUser = async (newUser: AddUserInput) => {
    try {
      await addUser(newUser).unwrap();
      toast.success('User added successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.error || 'Error adding user');
    }
  };

  const getAccountType = (user: User | null): AccountType => {
    if (!user) return 'student';
    const raw = (user.account_type || '').toLowerCase();
    if (raw === 'panel') return 'faculty';
    if (raw === 'user') return 'student';
    // Canonical precedence: superadmin > admin > department_head > faculty > student.
    if (raw === 'superadmin' || user.is_superuser) return 'superadmin';
    if (raw === 'admin' || user.is_staff) return 'admin';
    if (raw === 'department_head' || user.is_department_head || user.is_headdept) return 'department_head';
    if (raw === 'faculty' || user.is_faculty) return 'faculty';
    return 'student';
  };

  const setAccountType = (type: AccountType) => {
    if (!selectedUser) return;
    setSelectedUser({
      ...selectedUser,
      account_type: type,
      is_student: type === 'student',
      is_staff: type === 'admin' || type === 'superadmin',
      is_superuser: type === 'superadmin',
      is_faculty: type === 'faculty',
      is_dean: false,
      is_department_head: type === 'department_head',
      is_headdept: type === 'department_head',
    });
  };

  const handleSave = async () => {
    if (selectedUser) {
      try {
        const account_type = getAccountType(selectedUser);
        const userData = {
          ...selectedUser,
          account_type,
          is_student: account_type === 'student',
          is_staff: account_type === 'admin' || account_type === 'superadmin',
          is_superuser: account_type === 'superadmin',
          is_faculty: account_type === 'faculty',
          is_dean: false,
          is_department_head: account_type === 'department_head',
          is_headdept: account_type === 'department_head',
        };
        await updateUser({ userID: selectedUser.userID, userData: userData as any }).unwrap();
        toast.success('User details updated successfully');
        refetch();
        setShowModal(false);
      } catch (error: any) {
        toast.error(error?.data?.error || 'Failed to update user');
      }
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.userID).unwrap();
        toast.success('User deleted successfully');
        refetch();
        setShowModal(false);
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  return {
    users,
    documentCount,
    loading,
    selectedUser,
    showModal,
    handleUserClick,
    handleInputChange,
    handleAddUser,
    handleSave,
    handleDelete,
    getAccountType,
    setAccountType,
    setShowModal,
  };
}
