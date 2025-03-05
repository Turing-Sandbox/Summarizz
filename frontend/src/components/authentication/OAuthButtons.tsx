import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../hooks/AuthProvider';

export function OAuthButtons() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const auth = useAuth();
    const router = useRouter();

    const handleOAuthSignIn = async (provider: string) => {
        try {
            setError('');
            setIsLoading(true);

            // Check if we're on mobile - use redirect flow for better mobile experience
            const useRedirect = window.innerWidth < 768;

            // @ts-ignore
            const result = await AuthService[`signInWith${provider.charAt(0).toUpperCase() + provider.slice(1)}`](useRedirect);

            if (result) {
                // Set user session
                auth.login(result.token, result.userUID);

                // Redirect to home page
                router.push('/');
            }
        } catch (error: any) {
            console.error(`${provider} Sign In Error:`, error);
            setError(error.message || `Failed to sign in with ${provider}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='auth-oauth-section'>
            <button
                className='auth-button auth-oauth-button'
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                aria-label="Sign in with Google"
            >
                <img src='/images/google.svg' alt='Google' className='logo' />
                Sign in with Google
            </button>
            <button
                className='auth-button auth-oauth-button'
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                aria-label="Sign in with GitHub"
            >
                <svg
                    className='logo'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                >
                    <path
                        fill='currentColor'
                        d='M20 10.25q0 3.351-1.908 6.027t-4.928 3.703q-.352.068-.514-.093a.54.54 0 0 1-.163-.4V16.67q0-1.295-.677-1.895a9 9 0 0 0 1.335-.24q.591-.16 1.223-.52a3.7 3.7 0 0 0 1.055-.888q.423-.528.69-1.402t.267-2.008q0-1.616-1.028-2.75q.48-1.214-.105-2.723q-.364-.12-1.054.147a7 7 0 0 0-1.198.587l-.495.32a9 9 0 0 0-2.5-.346a9 9 0 0 0-2.5.347a12 12 0 0 0-.553-.36q-.345-.214-1.088-.514q-.741-.3-1.12-.18q-.572 1.507-.09 2.722q-1.03 1.134-1.03 2.75q0 1.134.268 2.002q.267.867.683 1.401a3.5 3.5 0 0 0 1.048.894q.632.36 1.224.52q.593.162 1.335.241q-.52.48-.638 1.375a2.5 2.5 0 0 1-.586.2a3.6 3.6 0 0 1-.742.067q-.43 0-.853-.287q-.423-.288-.723-.834a2.1 2.1 0 0 0-.631-.694q-.384-.267-.645-.32l-.26-.04q-.273 0-.378.06t-.065.153a.7.7 0 0 0 .117.187a1 1 0 0 0 .17.16l.09.066q.287.135.567.508q.28.374.41.68l.13.307q.17.507.574.821q.404.315.872.4q.468.087.905.094q.436.006.723-.047l.299-.053q0 .507.007 1.188l.006.72q0 .24-.17.4q-.168.162-.52.094q-3.021-1.028-4.928-3.703Q0 13.6 0 10.25q0-2.79 1.341-5.145a10.1 10.1 0 0 1 3.64-3.73A9.6 9.6 0 0 1 10 0a9.6 9.6 0 0 1 5.02 1.375a10.1 10.1 0 0 1 3.639 3.73Q20 7.461 20 10.25'
                    />
                </svg>
                Sign in with GitHub
            </button>

            {error && <p className="auth-error">{error}</p>}
        </div>
    );
}