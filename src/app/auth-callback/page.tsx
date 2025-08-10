'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCallback() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // User is authenticated, redirect to home
        router.push('/home');
      } else {
        // User is not authenticated, redirect to sign-in
        router.push('/https://ace-stingray-62.accounts.dev/sign-in');
      }
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-blue-900">
      <div className="text-white text-xl">
        Redirecting...
      </div>
    </div>
  );
}