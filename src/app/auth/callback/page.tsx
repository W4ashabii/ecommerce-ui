'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-black via-gray-900 to-brand-black">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-white mb-2">
          Authenticating...
        </h1>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackContent />
    </Suspense>
  );
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Authentication was cancelled or failed');
      setTimeout(() => router.push('/auth/signin'), 3000);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      setTimeout(() => router.push('/auth/signin'), 3000);
      return;
    }

    // Exchange code for token
    handleCallback(code)
      .then(() => {
        // Check if there was a redirect URL stored
        const redirectUrl = sessionStorage.getItem('auth_redirect') || '/';
        sessionStorage.removeItem('auth_redirect');
        router.push(redirectUrl);
      })
      .catch((err) => {
        console.error('Auth callback error:', err);
        setError('Failed to complete authentication');
        setTimeout(() => router.push('/auth/signin'), 3000);
      });
  }, [searchParams, handleCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-black via-gray-900 to-brand-black">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-500 text-2xl">✕</span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">
              Authentication Failed
            </h1>
            <p className="text-white/60 mb-4">{error}</p>
            <p className="text-white/40 text-sm">Redirecting to sign in...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-white mb-2">
              Completing sign in...
            </h1>
            <p className="text-white/60">Please wait while we authenticate you</p>
          </>
        )}
      </div>
    </div>
  );
}

