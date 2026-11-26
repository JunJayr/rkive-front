
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AccountType =
  | 'student'
  | 'panel'
  | 'department_head'
  | 'admin'
  | 'superadmin';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperuser: boolean;
  isStaff: boolean;
  isActive: boolean;
  isDean: boolean;
  isHeadDept: boolean;
  isDepartmentHead: boolean;
  /** Legacy alias for the canonical Panel / Adviser role. */
  isFaculty: boolean;
  isPanel: boolean;
  isStudent: boolean;
  accountType: AccountType;
  department: string;
  programScope: string[];
  canCreateAccounts: boolean;
  canManageAccounts: boolean;
  canImportAccounts: boolean;
  canAssignPanels: boolean;
  canManageSettings: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isSuperuser: false,
  isStaff: false,
  isActive: false,
  isDean: false,
  isHeadDept: false,
  isDepartmentHead: false,
  isFaculty: false,
  isPanel: false,
  isStudent: false,
  accountType: 'student',
  department: '',
  programScope: [],
  canCreateAccounts: false,
  canManageAccounts: false,
  canImportAccounts: false,
  canAssignPanels: false,
  canManageSettings: false,
};

type LoginRoles = Pick<
  AuthState,
  | 'isSuperuser'
  | 'isStaff'
  | 'isActive'
  | 'isDean'
  | 'isHeadDept'
  | 'isDepartmentHead'
  | 'isFaculty'
  | 'isPanel'
  | 'isStudent'
  | 'accountType'
  | 'department'
  | 'programScope'
  | 'canCreateAccounts'
  | 'canManageAccounts'
  | 'canImportAccounts'
  | 'canAssignPanels'
  | 'canManageSettings'
>;

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    restoreAuth: (
      state,
      action: PayloadAction<Partial<AuthState>>
    ) => {
      const saved = action.payload;

      state.isAuthenticated = saved.isAuthenticated === true;
      state.isSuperuser = saved.isSuperuser === true;
      state.isStaff = saved.isStaff === true;
      state.isActive = saved.isActive === true;
      state.isDean = saved.isDean === true;
      state.isHeadDept = saved.isHeadDept === true || saved.isDepartmentHead === true;
      state.isDepartmentHead = saved.isDepartmentHead === true || state.isHeadDept;
      state.isFaculty = saved.isFaculty === true || saved.accountType === 'panel';
      state.isPanel = saved.isPanel === true || state.isFaculty;
      state.isStudent = saved.isStudent === true;
      state.accountType = saved.accountType || (state.isDepartmentHead ? 'department_head' : state.accountType);
      state.department = saved.department || '';
      state.programScope = saved.programScope || [];
      state.canCreateAccounts = saved.canCreateAccounts === true;
      state.canManageAccounts = saved.canManageAccounts === true;
      state.canImportAccounts = saved.canImportAccounts === true;
      state.canAssignPanels = saved.canAssignPanels === true;
      state.canManageSettings = saved.canManageSettings === true;

      state.isLoading = false;
    },

    setAuth: (state) => {
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    setAuthLogin: (
      state,
      action: PayloadAction<LoginRoles>
    ) => {
      state.isAuthenticated = true;
      state.isLoading = false;

      state.isSuperuser = action.payload.isSuperuser;
      state.isStaff = action.payload.isStaff;
      state.isActive = action.payload.isActive;
      state.isDean = action.payload.isDean;
      state.isHeadDept = action.payload.isDepartmentHead || action.payload.isHeadDept;
      state.isDepartmentHead = action.payload.isDepartmentHead;
      state.isFaculty = action.payload.isFaculty || action.payload.accountType === 'panel';
      state.isPanel = action.payload.isPanel || state.isFaculty;
      state.isStudent = action.payload.isStudent;
      state.accountType = action.payload.accountType;
      state.department = action.payload.department || '';
      state.programScope = action.payload.programScope || [];
      state.canCreateAccounts = action.payload.canCreateAccounts;
      state.canManageAccounts = action.payload.canManageAccounts;
      state.canImportAccounts = action.payload.canImportAccounts;
      state.canAssignPanels = action.payload.canAssignPanels;
      state.canManageSettings = action.payload.canManageSettings;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isSuperuser = false;
      state.isStaff = false;
      state.isActive = false;
      state.isDean = false;
      state.isHeadDept = false;
      state.isDepartmentHead = false;
      state.isFaculty = false;
      state.isPanel = false;
      state.isStudent = false;
      state.accountType = 'student';
      state.department = '';
      state.programScope = [];
      state.canCreateAccounts = false;
      state.canManageAccounts = false;
      state.canImportAccounts = false;
      state.canAssignPanels = false;
      state.canManageSettings = false;
    },

    finishInitialLoad: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  restoreAuth,
  setAuth,
  setAuthLogin,
  logout,
  finishInitialLoad,
} = authSlice.actions;

export default authSlice.reducer;
