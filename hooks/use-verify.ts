import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth, finishInitialLoad } from '@/redux/features/authSlice';
import { useVerifyMutation } from '@/redux/features/authApiSlice';

export default function useVerify() {
    const dispatch = useAppDispatch();
    const [verify] = useVerifyMutation();

    useEffect(() => {
        const token = localStorage.getItem('token'); // Get the token from local storage

        if (!token) {
            dispatch(finishInitialLoad()); // Skip verification if no token exists
            return;
        }

        verify(token) // Pass the token to the mutation
            .unwrap()
            .then(() => {
                dispatch(setAuth());
            })
            .catch((error: any) => {
                console.error('Verification failed:', error.data || error.message || error);
            })
            .finally(() => {
                dispatch(finishInitialLoad());
            });
    }, [verify, dispatch]);
}