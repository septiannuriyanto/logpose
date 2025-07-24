// app/(authenticated)/AuthenticatedLayout.tsx
'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from './authContext';
import { useRouter } from 'next/navigation';
import { EnsureProfileFilled } from './ensureProfileFilled';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <EnsureProfileFilled>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </EnsureProfileFilled>
  );
}
