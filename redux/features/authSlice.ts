
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AccountType =
  | 'superadmin'
  | 'admin'
  | 'department_head'
  | 'faculty'
  | 'student';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperuser: boolean;
  isStaff: boolean;
  isActive: boolean;
  isDean: boolean;
  isHeadDept: boolean;
  isDepartmentHead: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  accountType: AccountType;
  department: string;
  canCreateAccounts: boolean;
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
  isStudent: false,
  accountType: 'student',
  department: '',
  canCreateAccounts: false,
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
  | 'isStudent'
  | 'accountType'
  | 'department'
  | 'canCreateAccounts'
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
      state.isFaculty = saved.isFaculty === true;
      state.isStudent = saved.isStudent === true;
      state.accountType = saved.accountType || (state.isDepartmentHead ? 'department_head' : state.accountType);
      state.department = saved.department || '';
      state.canCreateAccounts = saved.canCreateAccounts === true;
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
      state.isFaculty = action.payload.isFaculty;
      state.isStudent = action.payload.isStudent;
      state.accountType = action.payload.accountType;
      state.department = action.payload.department || '';
      state.canCreateAccounts = action.payload.canCreateAccounts;
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
      state.isStudent = false;
      state.accountType = 'student';
      state.department = '';
      state.canCreateAccounts = false;
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
