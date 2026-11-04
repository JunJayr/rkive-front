
'use client';

import { store } from './store';
import { Provider } from 'react-redux';
import AuthPersistence from '@/components/utils/AuthPersistence';

interface Props {
  children: React.ReactNode;
}

export default function CustomProvider({ children }: Props) {
  return (
    <Provider store={store}>
      <AuthPersistence />
      {children}
    </Provider>
  );
}
