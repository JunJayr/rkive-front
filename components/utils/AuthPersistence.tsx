
'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import {
  restoreAuth,
  finishInitialLoad,
} from '@/redux/features/authSlice';

export default function AuthPersistence() {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('authState');

      if (storedAuth) {
        dispatch(restoreAuth(JSON.parse(storedAuth)));
      } else {
        dispatch(finishInitialLoad());
      }
    } catch {
      localStorage.removeItem('authState');
      dispatch(finishInitialLoad());
    }

    initialized.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!initialized.current || auth.isLoading) {
      return;
    }

    if (auth.isAuthenticated) {
      localStorage.setItem('authState', JSON.stringify(auth));
    } else {
      localStorage.removeItem('authState');
    }
  }, [auth]);

  return null;
}
