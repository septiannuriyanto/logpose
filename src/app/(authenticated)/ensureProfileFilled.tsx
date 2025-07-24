'use client';

import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export const EnsureProfileFilled = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  // Hitung apakah profile lengkap
  const isProfileComplete = useMemo(() => {
  return Boolean(
    profile &&
    typeof profile === 'object' &&
    profile.first_name &&
    profile.last_name
  );
}, [profile]);


  useEffect(() => {
    console.log('[EnsureProfileFilled] profile:', profile);
console.log('[EnsureProfileFilled] typeof profile:', typeof profile);
console.log('[EnsureProfileFilled] first_name:', profile?.first_name);
console.log('[EnsureProfileFilled] last_name:', profile?.last_name);
console.log('[EnsureProfileFilled] isProfileComplete:', isProfileComplete);

// Kalau user tidak ada, logout dan redirect
  if (!loading && !user) {
    signOut();
  }


    if (!loading && user && !isProfileComplete) {
      router.replace('/complete-profile');
    }
  }, [loading, user, isProfileComplete, router]);

  // Tampilkan loading screen jika masih cek atau redirect akan terjadi
  if (loading || (user && !isProfileComplete)) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Checking profile...
      </div>
    );
  }

  // Lanjut render isi jika aman
  return <>{children}</>;
};
