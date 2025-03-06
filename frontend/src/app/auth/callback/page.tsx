"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/hooks/AuthProvider';

export default function CallbackPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();

    useEffect(() => {
        const processCallbackData = async () => {
            try {
                const token = searchParams.get('token');
                const uid = searchParams.get('uid');
                const errorMsg = searchParams.get('error');

                if (errorMsg) {
                    setError(decodeURIComponent(errorMsg));
                    return;
                }

                if (!token || !uid) {
                    setError('Invalid authentication data received');
                    return;
                }

                // Verify token with backend
                const result = await AuthService.handleCallbackResult(token, uid);

                // Login and redirect
                auth.login(result.token, result.userUID);
                router.push('/');
            } catch (err: any) {
                setError(err.message || 'Authentication failed');
            }
        };

        processCallbackData();
    }, [auth, router, searchParams]);

    // If this is a popup callback, we need to send the data back to the opener window
    useEffect(() => {
        if (window.opener) {
            const token = searchParams.get('token');
            const uid = searchParams.get('uid');
            const errorMsg = searchParams.get('error');

            if (errorMsg) {
                window.opener.postMessage({ error: decodeURIComponent(errorMsg) }, window.location.origin);
            } else if (token && uid) {
                window.opener.postMessage({ token, uid }, window.location.origin);
            } else {
                window.opener.postMessage({ error: 'Invalid authentication data received' }, window.location.origin);
            }

            // Close the popup
            window.close();
        }
    }, [searchParams]);

    return (
        <div className="auth-callback-container">
        <div className="auth-callback-content">
            <h1>Authentication in progress...</h1>
    {error ? (
        <div className="auth-callback-error">
            <p>Authentication failed: {error}</p>
    <button onClick={() => router.push('/authentication/login')}>
        Back to Login
    </button>
    </div>
    ) : (
        <p>Please wait while we complete your authentication.</p>
    )}
    </div>
    </div>
);
}