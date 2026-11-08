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

export type AccountType = 'student' | 'admin' | 'panel';

// Export the User interface
export interface User {
  userID: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_dean: boolean;
  is_headdept: boolean;
  is_faculty: boolean;
  is_student: boolean;
  account_type?: AccountType;
}

interface AddUserInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  repassword: string;
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
    } catch (error) {
      toast.error('Error adding user');
    }
  };

  const getAccountType = (user: User | null): AccountType => {
    if (!user) return 'student';
    if (user.account_type) return user.account_type;
    if (user.is_staff || user.is_superuser) return 'admin';
    if (user.is_faculty) return 'panel';
    return 'student';
  };

  const setAccountType = (type: AccountType) => {
    if (!selectedUser) return;
    setSelectedUser({
      ...selectedUser,
      account_type: type,
      is_student: type === 'student',
      is_staff: type === 'admin',
      is_superuser: type === 'admin',
      is_faculty: type === 'panel',
      is_dean: false,
      is_headdept: false,
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
          is_staff: account_type === 'admin',
          is_superuser: account_type === 'admin',
          is_faculty: account_type === 'panel',
          is_dean: false,
          is_headdept: false,
        };
        await updateUser({ userID: selectedUser.userID, userData }).unwrap();
        toast.success('User details updated successfully');
        refetch();
        setShowModal(false);
      } catch (error) {
        toast.error('Failed to update user');
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