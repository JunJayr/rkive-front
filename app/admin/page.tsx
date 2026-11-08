
'use client';

import { useMemo, useState } from 'react';

import {
  FiUsers,
  FiFileText,
  FiBookOpen,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiX,
  FiCheck,
  FiShield,
  FiTrash2,
  FiSave,
  FiUser,
  FiMail,
  FiLock,
  FiInfo,
} from 'react-icons/fi';

import Sidebar from '@/components/common/admin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useAdminDashboard } from '@/hooks/admin';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white ' +
  'px-4 py-3 text-sm text-slate-800 outline-none ' +
  'transition placeholder:text-slate-400 ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const accountTypes = [
  { value: 'student', label: 'Student/User', description: 'Access to the student workspace, submissions, and repository features.' },
  { value: 'admin', label: 'Admin', description: 'Administrative access (dashboard, user management, and manuscript/review workflows).' },
  { value: 'panel', label: 'Adviser/Panel', description: 'Reviewer access. Link this account to an adviser/panel record to receive assigned nominations, defenses, and manuscripts.' },
] as const;

export default function AdminDashboard() {
  const {
    users,
    documentCount,
    loading,
    selectedUser,
    showModal,
    handleUserClick,
    handleInputChange,
    handleSave,
    handleDelete,
    handleAddUser,
    getAccountType,
    setAccountType,
    setShowModal,
  } = useAdminDashboard();

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    repassword: '',
  });

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return users ?? [];

    return (users ?? []).filter((user) =>
      [
        user.first_name,
        user.last_name,
        user.email,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  const handleAddInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUserClick = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (newUser.password !== newUser.repassword) {
      alert('Passwords do not match!');
      return;
    }

    setIsLoading(true);

    try {
      await handleAddUser(newUser);

      setShowAddModal(false);

      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        repassword: '',
      });
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = async () => {
    if (!selectedUser) return;

    setIsLoading(true);

    try {
      await handleSave();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedUser) return;

    const confirmed = window.confirm(
      `Delete the account of ${selectedUser.first_name} ${selectedUser.last_name}?`
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      await handleDelete();
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const overviewConfig = [
    {
      key: 'accounts',
      label: 'Total Accounts',
      value: users?.length ?? 0,
      icon: FiUsers,
      detail: 'Registered users',
    },
    {
      key: 'manuscripts',
      label: 'Manuscripts',
      value: documentCount?.manuscripts_count ?? 0,
      icon: FiBookOpen,
      detail: 'Repository records',
    },
  ];

  
  const getRoleLabels = (
    user: (typeof filteredUsers)[number]
  ): string[] => {
    if (user.is_staff || user.is_superuser) return ['Admin'];
    if (user.is_faculty) return ['Adviser/Panel'];
    return ['Student/User'];
  };


  return (
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">

            {/* PAGE HEADER */}
            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  RKIVE / Administration
                </p>

                <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78] sm:text-4xl">
                  Admin Dashboard
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                  Manage accounts, permissions, and repository activity.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#103F78]">
                <FiShield size={26} />
              </div>
            </header>

            {/* OVERVIEW CARDS */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {overviewConfig.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#103F78]">
                        <Icon size={23} />
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Overview
                      </span>
                    </div>

                    <p className="text-3xl font-extrabold text-[#103F78]">
                      {loading ? '—' : item.value.toLocaleString()}
                    </p>

                    <h2 className="mt-2 text-sm font-bold text-slate-700">
                      {item.label}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* USER MANAGEMENT */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* SECTION HEADER */}
              <div className="flex flex-col justify-between gap-4 bg-[#103F78] px-6 py-6 sm:flex-row sm:items-center sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                    <FiUsers size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      User Management
                    </h2>

                    <p className="mt-1 text-xs text-blue-100/80">
                      View and manage registered accounts
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FBBF24] px-5 py-3 text-sm font-bold text-[#103F78] transition hover:bg-amber-300"
                >
                  <FiPlus size={18} />
                  Add Account
                </button>
              </div>

              {/* SEARCH */}
              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div className="relative w-full max-w-md">
                  <FiSearch
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    aria-label="Search users"
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <p className="text-xs font-medium text-slate-500">
                  {filteredUsers.length} account(s)
                </p>
              </div>

              {/* USER TABLE */}
              {loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Spinner />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <FiUsers size={35} className="text-slate-300" />

                  <p className="mt-4 font-semibold text-slate-700">
                    No users found
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Try another search or add a new account.
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-4 font-bold">
                          Account
                        </th>
                        <th className="px-6 py-4 font-bold">
                          Status
                        </th>
                        <th className="px-6 py-4 font-bold">
                          Roles
                        </th>
                        <th className="px-6 py-4 text-right font-bold">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.userID}
                          className="transition hover:bg-blue-50/30"
                        >
                          {/* USER */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-[#103F78]">
                                {user.first_name?.charAt(0)}
                                {user.last_name?.charAt(0)}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800">
                                  {user.first_name} {user.last_name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">
                            <span
                              className={`
                                inline-flex items-center gap-2
                                rounded-full px-3 py-1.5
                                text-xs font-semibold
                                ${
                                  user.is_active
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-700'
                                }
                              `}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  user.is_active
                                    ? 'bg-emerald-500'
                                    : 'bg-red-500'
                                }`}
                              />

                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* ROLES */}
                          <td className="px-6 py-4">
                            <div className="flex max-w-sm flex-wrap gap-1.5">
                              {getRoleLabels(user).map((role) => (
                                <span
                                  key={role}
                                  className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#103F78]"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* ACTION */}
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleUserClick(user)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-[#103F78] transition hover:border-blue-200 hover:bg-blue-50"
                            >
                              <FiEdit2 size={14} />
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>

        <Footer />
      </div>

      {/* ADD ACCOUNT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-account-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#103F78] px-6 py-5">
              <div>
                <h2
                  id="add-account-title"
                  className="text-lg font-bold text-white"
                >
                  Add New Account
                </h2>

                <p className="mt-1 text-xs text-blue-100">
                  Create a new RKIVE user account
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
                disabled={isLoading}
                className="rounded-lg p-2 text-white hover:bg-white/10"
              >
                <FiX size={21} />
              </button>
            </div>

            <form
              onSubmit={handleAddUserClick}
              className="space-y-6 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="new-first-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    First Name
                  </label>

                  <input
                    id="new-first-name"
                    name="first_name"
                    value={newUser.first_name}
                    onChange={handleAddInputChange}
                    required
                    className={inputClass}
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-last-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Last Name
                  </label>

                  <input
                    id="new-last-name"
                    name="last_name"
                    value={newUser.last_name}
                    onChange={handleAddInputChange}
                    required
                    className={inputClass}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <FiMail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="new-email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleAddInputChange}
                    required
                    className={`${inputClass} pl-11`}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <FiLock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="new-password"
                      name="password"
                      type="password"
                      value={newUser.password}
                      onChange={handleAddInputChange}
                      required
                      className={`${inputClass} pl-11`}
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="new-repassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="new-repassword"
                    name="repassword"
                    type="password"
                    value={newUser.repassword}
                    onChange={handleAddInputChange}
                    required
                    className={inputClass}
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
                <FiInfo
                  size={18}
                  className="mt-0.5 shrink-0 text-[#103F78]"
                />

                <p className="text-xs leading-6 text-slate-600">
                  Enter accurate account information and
                  confirm the password before creating the user.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isLoading}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FBBF24] px-6 py-3 text-sm font-bold text-[#103F78] hover:bg-amber-300 disabled:opacity-50"
                >
                  <FiPlus size={17} />
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT MODAL */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-account-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#103F78] px-6 py-5">
              <div>
                <h2
                  id="edit-account-title"
                  className="text-lg font-bold text-white"
                >
                  Manage User Account
                </h2>

                <p className="mt-1 text-xs text-blue-100">
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                aria-label="Close"
                className="rounded-lg p-2 text-white hover:bg-white/10"
              >
                <FiX size={21} />
              </button>
            </div>

            <div className="space-y-7 p-6">
              {/* PROFILE DETAILS */}
              <section>
                <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-[#103F78]">
                  <FiUser size={18} />
                  Account Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      name: 'first_name',
                      label: 'First Name',
                      type: 'text',
                    },
                    {
                      name: 'last_name',
                      label: 'Last Name',
                      type: 'text',
                    },
                    {
                      name: 'email',
                      label: 'Email Address',
                      type: 'email',
                    },
                  ].map((field) => (
                    <div
                      key={field.name}
                      className={
                        field.name === 'email'
                          ? 'sm:col-span-2'
                          : ''
                      }
                    >
                      <label
                        htmlFor={`edit-${field.name}`}
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        {field.label}
                      </label>

                      <input
                        id={`edit-${field.name}`}
                        type={field.type}
                        name={field.name}
                        value={
                          selectedUser[
                            field.name as
                              | 'first_name'
                              | 'last_name'
                              | 'email'
                          ]
                        }
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* ACCOUNT TYPE */}
              <section>
                <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-[#103F78]">
                  <FiShield size={18} />
                  Account Type
                </h3>

                <div className="space-y-3">
                  {accountTypes.map((opt) => {
                    const current = getAccountType(selectedUser);
                    const active = current === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition ${
                          active ? 'border-[#103F78] bg-blue-50/60 ring-1 ring-[#103F78]/15' : 'border-slate-200 bg-slate-50 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="account_type"
                          value={opt.value}
                          checked={active}
                          onChange={() => setAccountType(opt.value)}
                          className="mt-1 h-4 w-4 accent-[#103F78]"
                        />
                        <span>
                          <span className="block text-sm font-bold text-slate-800">{opt.label}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-slate-500">{opt.description}</span>
                        </span>
                      </label>
                    );
                  })}

                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-blue-200">
                    <span>
                      <span className="block text-sm font-semibold text-slate-700">Active account</span>
                      <span className="block text-xs text-slate-500">Allow this user to sign in.</span>
                    </span>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={Boolean(selectedUser.is_active)}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded border-slate-300 accent-[#103F78]"
                    />
                  </label>
                </div>
              </section>

              {/* ACTIONS */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <FiTrash2 size={17} />
                  Delete Account
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FBBF24] px-6 py-3 text-sm font-bold text-[#103F78] hover:bg-amber-300 disabled:opacity-50"
                  >
                    <FiSave size={17} />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div
          role="status"
          aria-label="Processing account"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-xl">
            <Spinner />

            <p className="text-sm font-bold text-[#103F78]">
              Processing account...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
