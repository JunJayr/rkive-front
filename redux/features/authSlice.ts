
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperuser: boolean;
  isStaff: boolean;
  isActive: boolean;
  isDean: boolean;
  isHeadDept: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isSuperuser: false,
  isStaff: false,
  isActive: false,
  isDean: false,
  isHeadDept: false,
  isFaculty: false,
  isStudent: false,
};

type LoginRoles = Pick<
  AuthState,
  | 'isSuperuser'
  | 'isStaff'
  | 'isActive'
  | 'isDean'
  | 'isHeadDept'
  | 'isFaculty'
  | 'isStudent'
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
      state.isHeadDept = saved.isHeadDept === true;
      state.isFaculty = saved.isFaculty === true;
      state.isStudent = saved.isStudent === true;

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
      state.isHeadDept = action.payload.isHeadDept;
      state.isFaculty = action.payload.isFaculty;
      state.isStudent = action.payload.isStudent;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isSuperuser = false;
      state.isStaff = false;
      state.isActive = false;
      state.isDean = false;
      state.isHeadDept = false;
      state.isFaculty = false;
      state.isStudent = false;
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
