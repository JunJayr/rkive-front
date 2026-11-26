// Shared admin dashboard hook using the canonical five-role model.
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useListUsersQuery,
  useGetDocumentCountQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useAddUserMutation,
  normalizeAccountType,
  type AccountType,
  type AddUserInput,
} from '@/redux/features/authApiSlice';

export type { AccountType } from '@/redux/features/authApiSlice';

export interface User {
  userID: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  department_normalized?: string;
  program_scope?: string[];
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_dean: boolean;
  is_headdept: boolean;
  is_department_head?: boolean;
  /** Legacy alias retained for compatibility; canonical role is Panel / Adviser. */
  is_faculty: boolean;
  is_student: boolean;
  account_type?: AccountType;
  role?: AccountType;
  role_label?: string;
  role_needs_review?: boolean;
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
    const canonical = normalizeAccountType(user.role || user.account_type);
    // An explicit non-student assignment always wins; legacy flags only
    // resolve ambiguous/default student records from older data.
    if (canonical !== 'student') return canonical;
    if (user.is_superuser) return 'superadmin';
    if (user.is_staff) return 'admin';
    if (user.is_department_head || user.is_headdept) return 'department_head';
    if (user.is_faculty) return 'panel';
    return 'student';
  };

  const setAccountType = (type: AccountType) => {
    if (!selectedUser) return;
    setSelectedUser({
      ...selectedUser,
      account_type: type,
      role: type,
      is_student: type === 'student',
      is_staff: type === 'admin' || type === 'superadmin',
      is_superuser: type === 'superadmin',
      is_faculty: type === 'panel',
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
          role: account_type,
          is_student: account_type === 'student',
          is_staff: account_type === 'admin' || account_type === 'superadmin',
          is_superuser: account_type === 'superadmin',
          is_faculty: account_type === 'panel',
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
      } catch {
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
