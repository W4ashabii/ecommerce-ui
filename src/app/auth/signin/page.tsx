'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Chrome } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const { user, isLoading, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (!isLoading && user) {
      router.push(callbackUrl);
    }
  }, [user, isLoading, router, callbackUrl]);

  // Store callback URL for after OAuth redirect
  useEffect(() => {
    if (callbackUrl && callbackUrl !== '/') {
      sessionStorage.setItem('auth_redirect', callbackUrl);
    }
  }, [callbackUrl]);

  const handleSignIn = () => {
    signIn();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-black via-gray-900 to-brand-black relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              <span className="text-brand-pink">AMI</span>
            </h1>
            <p className="text-white/60">Sign in to continue</p>
          </div>

          {/* Google Sign In Button */}
          <Button
            onClick={handleSignIn}
            variant="outline"
            size="xl"
            className="w-full bg-white text-gray-900 hover:bg-gray-100 border-0"
          >
            <Chrome className="mr-3 h-5 w-5" />
            Continue with Google
          </Button>

          {/* Terms */}
          <p className="mt-6 text-center text-sm text-white/40">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-brand-pink hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-brand-pink hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Back to home */}
        <p className="mt-6 text-center">
          <a
            href="/"
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Back to store
          </a>
        </p>
      </motion.div>
    </div>
  );
}

