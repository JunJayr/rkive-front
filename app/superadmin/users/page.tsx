'use client';

import { useMemo, useState } from 'react';
import {
  FiActivity,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiMail,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUploadCloud,
  FiUserCheck,
  FiUserX,
} from 'react-icons/fi';

import Footer from '@/components/common/Footer';
import {
  ActionSpinner,
  EmptyState,
  Notice,
  StatusBadge,
} from '@/components/common/Feedback';
import Sidebar from '@/components/common/superadmin/Sidebar';
import {
  ACCOUNT_TYPE_LABELS,
  normalizeAccountType,
  useAddUserMutation,
  useDeleteUserMutation,
  useGetAuditLogsQuery,
  useGetUserProfileQuery,
  useImportAccountsMutation,
  useLazyGetAccountTemplateQuery,
  useListUsersQuery,
  usePreviewAccountImportMutation,
  useSendAccountActivationMutation,
  useUpdateUserMutation,
  type AccountImportResult,
  type AccountType,
  type AddUserInput,
} from '@/redux/features/authApiSlice';

const ALL_ROLES: AccountType[] = ['student', 'panel', 'department_head', 'admin', 'superadmin'];
const CREATABLE_ROLES: AccountType[] = ['student', 'panel', 'department_head', 'admin'];

const ROLE_DESCRIPTIONS: Record<AccountType, string> = {
  student: 'Research group workspace: applications, progress, manuscript submission, repository.',
  panel: 'Academic reviewer: adviser, chair, panelist and scoring. Added to the nomination roster automatically.',
  department_head: 'Own department only: scoped accounts, panel assignment, scheduling and clearance.',
  admin: 'Research coordinator: academic operations and document management; no system ownership.',
  superadmin: 'System owner: privileged access, global configuration and audited interventions.',
};

type NoticeState = { tone: 'success' | 'warning' | 'error'; text: string };

type AccountUser = {
  userID: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  program_scope?: string[];
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_headdept?: boolean;
  is_department_head?: boolean;
  is_faculty?: boolean;
  is_student?: boolean;
  account_type?: AccountType;
  role?: AccountType;
  role_label?: string;
  role_needs_review?: boolean;
};

function errorMessage(error: unknown): string {
  const data = (error as { data?: unknown })?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (typeof record.error === 'string') return record.error;
    if (Array.isArray(record.errors)) return record.errors.join(' ');
    if (typeof record.detail === 'string') return record.detail;
  }
  return 'The request could not be completed.';
}

function resolveRole(user: AccountUser): AccountType {
  const canonical = normalizeAccountType(user.role || user.account_type);
  if (canonical !== 'student') return canonical;
  if (user.is_superuser) return 'superadmin';
  if (user.is_staff) return 'admin';
  if (user.is_department_head || user.is_headdept) return 'department_head';
  if (user.is_faculty) return 'panel';
  return 'student';
}

export default function SuperadminUsersPage() {
  const { data: profile } = useGetUserProfileQuery();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<AccountType | ''>('');
  const [program, setProgram] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('');

  const filters = useMemo(() => ({
    search: search.trim(),
    role: role || undefined,
    program: program.trim(),
    status: status || undefined,
  }), [search, role, program, status]);

  const {
    data: users = [],
    isLoading: usersLoading,
    isFetching: usersFetching,
    isError: usersError,
    refetch: refetchUsers,
  } = useListUsersQuery(filters);

  const [addUser, { isLoading: creating }] = useAddUserMutation();
  const [updateUser, { isLoading: savingAccess }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [sendActivation, { isLoading: sendingActivation }] = useSendAccountActivationMutation();
  const [pageNotice, setPageNotice] = useState<NoticeState | null>(null);

  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    account_type: CREATABLE_ROLES[0],
    department: '',
    program_scope: '',
    password: '',
    repassword: '',
    activation_required: true,
  });
  const [createNotice, setCreateNotice] = useState<NoticeState | null>(null);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<AccountImportResult | null>(null);
  const [importNotice, setImportNotice] = useState<NoticeState | null>(null);
  const [getTemplate, { isFetching: downloadingTemplate }] = useLazyGetAccountTemplateQuery();
  const [previewImport, { isLoading: previewing }] = usePreviewAccountImportMutation();
  const [commitImport, { isLoading: importing }] = useImportAccountsMutation();

  const [selectedUser, setSelectedUser] = useState<AccountUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccountUser | null>(null);
  const [accessNotice, setAccessNotice] = useState<NoticeState | null>(null);

  const { data: accountActivity = [], isFetching: activityLoading } = useGetAuditLogsQuery(
    selectedUser ? { target_id: String(selectedUser.userID), limit: 12 } : undefined,
    { skip: !selectedUser },
  );

  const roleCounts = useMemo(() => {
    const counts: Record<AccountType, number> = {
      student: 0, panel: 0, department_head: 0, admin: 0, superadmin: 0,
    };
    users.forEach((user) => { counts[resolveRole(user)] += 1; });
    return counts;
  }, [users]);

  const programOptions = useMemo(() => {
    const values = new Set<string>();
    if (profile?.department) values.add(profile.department);
    users.forEach((user) => {
      if (user.department) values.add(user.department);
      (user.program_scope || []).forEach((item) => values.add(item));
    });
    return Array.from(values).sort();
  }, [profile?.department, users]);

  const openManage = (user: AccountUser) => {
    setSelectedUser({ ...user });
    setAccessNotice(null);
  };

  const toggleActive = async (user: AccountUser) => {
    setPageNotice(null);
    try {
      await updateUser({
        userID: user.userID,
        userData: { is_active: !user.is_active } as never,
      }).unwrap();
      setPageNotice({
        tone: 'success',
        text: `${user.email} is now ${user.is_active ? 'inactive' : 'active'}.`,
      });
      void refetchUsers();
    } catch (error) {
      setPageNotice({ tone: 'error', text: errorMessage(error) });
    }
  };

  const resendActivation = async () => {
    if (!selectedUser) return;
    setAccessNotice(null);
    try {
      const result = await sendActivation(selectedUser.userID).unwrap();
      setAccessNotice({ tone: 'success', text: result.message });
    } catch (error) {
      setAccessNotice({ tone: 'error', text: errorMessage(error) });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setPageNotice(null);
    try {
      const result = await deleteUser(deleteTarget.userID).unwrap();
      setPageNotice({ tone: 'success', text: result.message });
      setDeleteTarget(null);
      if (selectedUser?.userID === deleteTarget.userID) setSelectedUser(null);
      void refetchUsers();
    } catch (error) {
      setPageNotice({ tone: 'error', text: errorMessage(error) });
      setDeleteTarget(null);
    }
  };

  const exportCsv = () => {
    const headers = [
      'userID', 'first_name', 'last_name', 'email', 'account_type',
      'department', 'program_scope', 'is_active',
    ];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [
      headers.join(','),
      ...users.map((user) => [
        user.userID,
        user.first_name,
        user.last_name,
        user.email,
        resolveRole(user),
        user.department || '',
        (user.program_scope || []).join('; '),
        user.is_active ? 'true' : 'false',
      ].map(escape).join(',')),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `rkive-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const saveAccess = async () => {
    if (!selectedUser) return;
    const accountType = resolveRole(selectedUser);
    setAccessNotice(null);
    try {
      await updateUser({
        userID: selectedUser.userID,
        userData: {
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          email: selectedUser.email,
          department: selectedUser.department || '',
          is_active: Boolean(selectedUser.is_active),
          account_type: accountType,
          role: accountType,
          is_staff: accountType === 'admin' || accountType === 'superadmin',
          is_superuser: accountType === 'superadmin',
          is_department_head: accountType === 'department_head',
          is_headdept: accountType === 'department_head',
          is_faculty: accountType === 'panel',
          is_student: accountType === 'student',
          is_dean: false,
        } as never,
      }).unwrap();
      setAccessNotice({ tone: 'success', text: `Access updated for ${selectedUser.email}.` });
      setSelectedUser(null);
      void refetchUsers();
    } catch (error) {
      setAccessNotice({ tone: 'error', text: errorMessage(error) });
    }
  };

  const submitCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateNotice(null);

    if (!createForm.activation_required && createForm.password !== createForm.repassword) {
      setCreateNotice({ tone: 'error', text: 'Passwords do not match.' });
      return;
    }

    const body: AddUserInput = {
      first_name: createForm.first_name.trim(),
      last_name: createForm.last_name.trim(),
      email: createForm.email.trim(),
      account_type: createForm.account_type,
      department: createForm.department.trim() || profile?.department || '',
      program_scope: createForm.program_scope
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      activation_required: createForm.activation_required,
    };
    if (!createForm.activation_required) {
      body.password = createForm.password;
      body.repassword = createForm.repassword;
    }

    try {
      const result = await addUser(body).unwrap();
      setCreateNotice({
        tone: 'success',
        text: `${ACCOUNT_TYPE_LABELS[createForm.account_type]} account created for ${result.email}.`,
      });
      setCreateForm({
        first_name: '',
        last_name: '',
        email: '',
        account_type: CREATABLE_ROLES[0],
        department: '',
        program_scope: '',
        password: '',
        repassword: '',
        activation_required: true,
      });
      void refetchUsers();
    } catch (error) {
      setCreateNotice({ tone: 'error', text: errorMessage(error) });
    }
  };

  const downloadTemplate = async () => {
    try {
      const result = await getTemplate();
      if (!result.data) throw new Error('Template could not be downloaded.');
      const url = URL.createObjectURL(result.data as Blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'rkive-account-template.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setImportNotice({ tone: 'error', text: errorMessage(error) });
    }
  };

  const buildImportForm = (action: 'preview' | 'commit') => {
    const body = new FormData();
    body.append('action', action);
    if (importFile) body.append('file', importFile);
    return body;
  };

  const submitPreview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setImportNotice(null);
    if (!importFile) {
      setImportNotice({ tone: 'error', text: 'Choose a CSV file first.' });
      return;
    }
    try {
      const result = await previewImport(buildImportForm('preview')).unwrap();
      setImportResult(result);
      if (!result.rows.length) {
        setImportNotice({ tone: 'error', text: 'The CSV contained no account rows.' });
      }
    } catch (error) {
      setImportResult(null);
      setImportNotice({ tone: 'error', text: errorMessage(error) });
    }
  };

  const submitCommit = async (rows?: AccountImportResult['rows']) => {
    setImportNotice(null);
    try {
      const result = rows
        ? await commitImport({ action: 'commit', rows }).unwrap()
        : await commitImport(buildImportForm('commit')).unwrap();
      setImportResult(result);
      setImportNotice({
        tone: result.summary.failed ? 'warning' : 'success',
        text: `${result.summary.created ?? 0} account(s) created; ${result.summary.failed ?? 0} failed.`,
      });
      void refetchUsers();
    } catch (error) {
      setImportNotice({ tone: 'error', text: errorMessage(error) });
    }
  };

  const resetFilters = () => {
    setSearch('');
    setRole('');
    setProgram('');
    setStatus('');
  };

  const validPreview = importResult?.rows.filter((row) => row.status === 'valid') || [];
  const failedRows = importResult?.rows.filter((row) => row.status !== 'success') || [];

  return (
    <div className="flex min-h-screen bg-brandSurface text-ink">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brandGold">
                  RKIVE / System Owner
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-brandNavy sm:text-4xl">
                  Accounts &amp; Privileged Access
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-mutedSlate">
                  Directory, privileged roles, activation and CSV imports in one place. Superadmin accounts are provisioned by the system owner and are not created here.
                </p>
              </div>
              <button type="button" className="rk-button-secondary shrink-0" onClick={exportCsv} disabled={usersLoading || !users.length}>
                <FiDownload size={16} aria-hidden="true" />
                Export CSV
              </button>
            </header>

            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ALL_ROLES.map((item) => (
                <div key={item} className="rk-card px-4 py-3">
                  <p className="text-2xl font-bold text-brandNavy">{roleCounts[item]}</p>
                  <p className="mt-1 text-[11px] font-semibold text-mutedSlate">{ACCOUNT_TYPE_LABELS[item]}</p>
                </div>
              ))}
            </div>

            {pageNotice ? (
              <div className="mb-8">
                <Notice
                  tone={pageNotice.tone === 'success' ? 'success' : 'error'}
                  title={pageNotice.tone === 'success' ? 'Done' : 'Account action failed'}
                  message={pageNotice.text}
                />
              </div>
            ) : null}

            {accessNotice ? (
              <div className="mb-8">
                <Notice
                  tone={accessNotice.tone === 'success' ? 'success' : 'error'}
                  title={accessNotice.tone === 'success' ? 'Access updated' : 'Access not updated'}
                  message={accessNotice.text}
                />
              </div>
            ) : null}

            <section className="rk-card mb-8 p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="rk-section-title">Account directory</h2>
                  <p className="mt-1 text-xs text-mutedSlate">
                    Search accounts, review roles, and manage privileged access from the same table.
                  </p>
                </div>
                {usersFetching && !usersLoading ? <ActionSpinner label="Refreshing accounts" /> : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <label className="block lg:col-span-2">
                  <span className="mb-2 block text-xs font-bold text-mutedSlate">Search</span>
                  <div className="relative">
                    <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mutedSlate" aria-hidden="true" />
                    <input
                      className="rk-input pl-10"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Name or email"
                      aria-label="Search accounts"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-mutedSlate">Role</span>
                  <select className="rk-input" value={role} onChange={(event) => setRole(event.target.value as AccountType | '')}>
                    <option value="">All roles</option>
                    {ALL_ROLES.map((item) => (
                      <option key={item} value={item}>{ACCOUNT_TYPE_LABELS[item]}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-mutedSlate">Program</span>
                  <input
                    className="rk-input"
                    value={program}
                    onChange={(event) => setProgram(event.target.value)}
                    placeholder="BSIT, BSCS..."
                    list="rkive-programs"
                  />
                  <datalist id="rkive-programs">
                    {programOptions.map((item) => <option key={item} value={item} />)}
                  </datalist>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-mutedSlate">Status</span>
                  <select
                    className="rk-input"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as 'active' | 'inactive' | '')}
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Awaiting activation</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-mutedSlate">
                  {usersLoading ? 'Loading accounts...' : `${users.length} account(s) found`}
                </p>
                <button type="button" className="rk-button-secondary" onClick={resetFilters}>
                  <FiRefreshCw size={15} aria-hidden="true" />
                  Reset filters
                </button>
              </div>

              {usersError ? (
                <div className="mt-6">
                  <Notice
                    tone="error"
                    title="The account directory could not be loaded."
                    message="Check your connection and retry. No account data was changed."
                    onRetry={() => void refetchUsers()}
                  />
                </div>
              ) : usersLoading ? (
                <div className="mt-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rk-skeleton h-14 w-full" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="No accounts match these filters."
                    description="Adjust the filters or create a new account below."
                    action={<button type="button" className="rk-button-secondary" onClick={resetFilters}>Clear filters</button>}
                  />
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="rk-table min-w-[900px]">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Role</th>
                        <th>Program / Department</th>
                        <th>Status</th>
                        <th>Review</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.userID}>
                          <td>
                            <p className="font-semibold">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-mutedSlate">{user.email}</p>
                            <p className="rk-id">ID {user.userID}</p>
                          </td>
                          <td>
                            <span className="rk-badge bg-brandNavy-50 text-brandNavy">
                              {user.role_label || ACCOUNT_TYPE_LABELS[resolveRole(user)]}
                            </span>
                          </td>
                          <td>
                            <p className="text-sm">{user.department || '—'}</p>
                            {(user.program_scope || []).length ? (
                              <p className="text-xs text-mutedSlate">{(user.program_scope || []).join(', ')}</p>
                            ) : null}
                          </td>
                          <td><StatusBadge status={user.is_active ? 'active' : 'inactive'} /></td>
                          <td>
                            {user.role_needs_review ? (
                              <span className="rk-badge bg-amber-100 text-amber-800">Needs review</span>
                            ) : (
                              <span className="text-xs text-mutedSlate">OK</span>
                            )}
                          </td>
                          <td className="text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button type="button" className="rk-button-secondary" onClick={() => openManage(user)}>
                                Manage
                              </button>
                              <button
                                type="button"
                                className="rk-button-secondary"
                                onClick={() => void toggleActive(user)}
                                disabled={String(user.userID) === String(profile?.userID)}
                                title={String(user.userID) === String(profile?.userID) ? 'You cannot change your own status' : undefined}
                              >
                                {user.is_active ? <FiUserX size={15} aria-hidden="true" /> : <FiUserCheck size={15} aria-hidden="true" />}
                                {user.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                                onClick={() => setDeleteTarget(user)}
                                disabled={String(user.userID) === String(profile?.userID)}
                                title={String(user.userID) === String(profile?.userID) ? 'You cannot delete your own account' : undefined}
                              >
                                <FiTrash2 size={15} aria-hidden="true" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="grid gap-8 xl:grid-cols-2">
              <section className="rk-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="rk-section-title">Create one account</h2>
                    <p className="mt-1 text-xs text-mutedSlate">
                      Assign Student, Panel / Adviser, Department Head or Admin. Superadmin is excluded, and Panel / Adviser accounts are added to the nomination roster automatically.
                    </p>
                  </div>
                  <FiPlus className="shrink-0 text-brandGold" size={24} aria-hidden="true" />
                </div>

                {createNotice ? (
                  <div className="mt-5">
                    <Notice
                      tone={createNotice.tone}
                      title={createNotice.tone === 'success' ? 'Account created' : 'Account not created'}
                      message={createNotice.text}
                    />
                  </div>
                ) : null}

                <form className="mt-6 space-y-5" onSubmit={submitCreate}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-mutedSlate">First name</span>
                      <input required className="rk-input" value={createForm.first_name} onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-mutedSlate">Last name</span>
                      <input required className="rk-input" value={createForm.last_name} onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })} />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-mutedSlate">Email</span>
                    <input required type="email" className="rk-input" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
                  </label>
                  <fieldset>
                    <legend className="mb-2 text-xs font-bold text-mutedSlate">Account role</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {CREATABLE_ROLES.map((item) => (
                        <label
                          key={item}
                          className={`cursor-pointer rounded-xl border px-4 py-3 transition ${
                            createForm.account_type === item
                              ? 'border-brandNavy bg-brandNavy-50'
                              : 'border-slate-200 bg-white hover:border-brandNavy/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="account_type"
                            className="sr-only"
                            checked={createForm.account_type === item}
                            onChange={() => setCreateForm({ ...createForm, account_type: item })}
                          />
                          <span className="block text-sm font-bold text-brandNavy">{ACCOUNT_TYPE_LABELS[item]}</span>
                          <span className="mt-1 block text-[11px] leading-4 text-mutedSlate">{ROLE_DESCRIPTIONS[item]}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-mutedSlate">Department</span>
                      <input
                        className="rk-input"
                        value={createForm.department}
                        onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                        list="create-programs"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-mutedSlate">Program scope</span>
                      <input
                        className="rk-input"
                        value={createForm.program_scope}
                        onChange={(e) => setCreateForm({ ...createForm, program_scope: e.target.value })}
                        placeholder="BSIT; BSCS"
                      />
                    </label>
                  </div>
                  <datalist id="create-programs">
                    {programOptions.map((item) => <option key={item} value={item} />)}
                  </datalist>
                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-brandSurface p-4">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-brandNavy"
                      checked={createForm.activation_required}
                      onChange={(e) => setCreateForm({ ...createForm, activation_required: e.target.checked })}
                    />
                    <span>
                      <span className="block text-sm font-semibold">Send activation email</span>
                      <span className="block text-xs text-mutedSlate">Recommended. The account stays inactive until the user activates it.</span>
                    </span>
                  </label>
                  {!createForm.activation_required ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold text-mutedSlate">Password</span>
                        <input type="password" required className="rk-input" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold text-mutedSlate">Confirm password</span>
                        <input type="password" required className="rk-input" value={createForm.repassword} onChange={(e) => setCreateForm({ ...createForm, repassword: e.target.value })} />
                      </label>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                    {creating ? <ActionSpinner label="Creating account" /> : null}
                    <button type="submit" disabled={creating} className="rk-button-primary">
                      Create account
                    </button>
                  </div>
                </form>
              </section>

              <section className="rk-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="rk-section-title">Bulk account import</h2>
                    <p className="mt-1 text-xs text-mutedSlate">
                      Preview every row before committing. Failed rows can be retried without duplicating successful accounts.
                    </p>
                  </div>
                  <FiFileText className="shrink-0 text-brandGold" size={24} aria-hidden="true" />
                </div>

                {importNotice ? (
                  <div className="mt-5">
                    <Notice
                      tone={importNotice.tone}
                      title={importNotice.tone === 'success' ? 'Import complete' : 'Import needs attention'}
                      message={importNotice.text}
                    />
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className="rk-button-secondary" onClick={() => void downloadTemplate()} disabled={downloadingTemplate}>
                    {downloadingTemplate ? <ActionSpinner label="Preparing template" /> : <FiDownload size={16} aria-hidden="true" />}
                    Download CSV template
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={submitPreview}>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-mutedSlate">CSV file</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="rk-input"
                      onChange={(event) => {
                        setImportFile(event.target.files?.[0] || null);
                        setImportResult(null);
                      }}
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" className="rk-button-primary" disabled={previewing || !importFile}>
                      {previewing ? <ActionSpinner label="Validating rows" /> : <FiUploadCloud size={16} aria-hidden="true" />}
                      Preview import
                    </button>
                    {importResult ? (
                      <button type="button" className="rk-button-secondary" onClick={() => void submitCommit()} disabled={importing || !validPreview.length}>
                        {importing ? <ActionSpinner label="Importing" /> : <FiCheckCircle size={16} aria-hidden="true" />}
                        Commit {validPreview.length} valid row(s)
                      </button>
                    ) : null}
                  </div>
                </form>

                {importResult ? (
                  <div className="mt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brandSurface p-4">
                      <p className="text-xs font-semibold text-brandNavy">
                        {importResult.summary.total} row(s): {importResult.summary.valid ?? 0} valid, {importResult.summary.invalid ?? 0} invalid
                      </p>
                      {failedRows.length ? (
                        <button type="button" className="rk-button-secondary" onClick={() => void submitCommit(failedRows)} disabled={importing}>
                          <FiRefreshCw size={15} aria-hidden="true" />
                          Retry {failedRows.length} failed row(s)
                        </button>
                      ) : null}
                    </div>
                    {importResult.rows.length ? (
                      <div className="mt-4 overflow-x-auto">
                        <table className="rk-table min-w-[640px]">
                          <thead>
                            <tr>
                              <th>Row</th>
                              <th>Account</th>
                              <th>Role</th>
                              <th>Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importResult.rows.map((row, index) => (
                              <tr key={`${row.email || 'row'}-${index}`}>
                                <td className="rk-id">{row._row ?? index + 2}</td>
                                <td>
                                  <p className="font-semibold">{row.first_name} {row.last_name}</p>
                                  <p className="text-xs text-mutedSlate">{row.email}</p>
                                </td>
                                <td>{row.role_label || row.account_type || '—'}</td>
                                <td>
                                  <StatusBadge status={row.status} />
                                  {row.errors.length ? (
                                    <ul className="mt-2 space-y-1 text-[11px] text-rose-700">
                                      {row.errors.map((message) => <li key={message}>{message}</li>)}
                                    </ul>
                                  ) : null}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs text-mutedSlate">
              <FiShield size={14} aria-hidden="true" />
              Every create, import and role decision is written to the audit log.
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {selectedUser ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center gap-2">
              <FiShield className="text-brandNavy" />
              <h3 className="text-lg font-bold text-brandNavy">Manage privileged access</h3>
            </div>
            <p className="text-sm text-slate-600">
              {selectedUser.first_name} {selectedUser.last_name} — {selectedUser.email}
            </p>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mutedSlate">Department</span>
              <input
                className="rk-input"
                value={selectedUser.department || ''}
                onChange={(event) => setSelectedUser({ ...selectedUser, department: event.target.value })}
                placeholder="Department name"
              />
            </label>
            <div className="mt-5 space-y-2">
              {ALL_ROLES.map((item) => (
                <label
                  key={item}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                    resolveRole(selectedUser) === item
                      ? 'border-brandNavy bg-brandNavy-50'
                      : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="access_role"
                    checked={resolveRole(selectedUser) === item}
                    onChange={() => setSelectedUser({
                      ...selectedUser,
                      account_type: item,
                      role: item,
                      is_staff: item === 'admin' || item === 'superadmin',
                      is_superuser: item === 'superadmin',
                      is_department_head: item === 'department_head',
                      is_headdept: item === 'department_head',
                      is_faculty: item === 'panel',
                      is_student: item === 'student',
                    })}
                  />
                  <span className="text-sm font-semibold">{ACCOUNT_TYPE_LABELS[item]}</span>
                </label>
              ))}
            </div>
            <label className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold">Active</span>
              <input
                type="checkbox"
                checked={Boolean(selectedUser.is_active)}
                onChange={(event) => setSelectedUser({ ...selectedUser, is_active: event.target.checked })}
              />
            </label>
            {!selectedUser.is_active ? (
              <button
                type="button"
                className="rk-button-secondary mt-3"
                onClick={() => void resendActivation()}
                disabled={sendingActivation}
              >
                {sendingActivation ? <ActionSpinner label="Sending" /> : <FiMail size={15} aria-hidden="true" />}
                Resend activation link
              </button>
            ) : null}

            <div className="mt-5 rounded-xl border border-slate-200 bg-brandSurface p-4">
              <div className="flex items-center gap-2">
                <FiActivity size={15} className="text-brandNavy" aria-hidden="true" />
                <h4 className="text-sm font-bold text-brandNavy">Recent activity</h4>
              </div>
              {activityLoading ? (
                <div className="mt-3"><ActionSpinner label="Loading activity" /></div>
              ) : accountActivity.length ? (
                <ul className="mt-3 space-y-2">
                  {accountActivity.slice(0, 6).map((log: any) => (
                    <li key={log.logID} className="rounded-lg bg-white px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-brandNavy">{log.action}</span>
                        <span className="text-[10px] text-mutedSlate">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{log.summary || '—'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-mutedSlate">No activity has been recorded for this account yet.</p>
              )}
            </div>

            {accessNotice ? (
              <div className="mt-4">
                <Notice
                  tone={accessNotice.tone}
                  title={accessNotice.tone === 'success' ? 'Done' : 'Access not updated'}
                  message={accessNotice.text}
                />
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="mr-auto inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                onClick={() => {
                  setDeleteTarget(selectedUser);
                  setSelectedUser(null);
                }}
                disabled={String(selectedUser.userID) === String(profile?.userID)}
              >
                <FiTrash2 size={15} aria-hidden="true" />
                Delete account
              </button>
              <button type="button" className="rk-button-secondary" onClick={() => setSelectedUser(null)}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveAccess()}
                disabled={savingAccess}
                className="inline-flex items-center gap-2 rounded-xl bg-brandNavy px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                <FiSave size={16} aria-hidden="true" />
                {savingAccess ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-700">
              <FiTrash2 size={20} aria-hidden="true" />
              <h3 className="text-lg font-bold">Delete this account?</h3>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              <span className="font-semibold">{deleteTarget.first_name} {deleteTarget.last_name}</span> ({deleteTarget.email}) will lose system access immediately. This cannot be undone.
            </p>
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Historical nominations and audit records are preserved. A linked Panel / Adviser roster name remains available for past assignments but is unlinked from this login.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rk-button-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
                onClick={() => void confirmDelete()}
                disabled={deleting}
              >
                {deleting ? <ActionSpinner label="Deleting" /> : <FiTrash2 size={15} aria-hidden="true" />}
                {deleting ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
