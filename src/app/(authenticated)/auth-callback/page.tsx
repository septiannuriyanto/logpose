'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.error('No session found after OAuth login');
        return;
      }

      const userId = session.user.id;

      // Cek apakah profile sudah ada
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return;
      }

      if (!profile) {
        // Belum ada profile, redirect ke form lengkapi profil
        router.replace('/complete-profile');
      } else {
        // Sudah ada, langsung ke dashboard
        router.replace('/dashboard');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Signing you in...</p>
    </div>
  );
}
