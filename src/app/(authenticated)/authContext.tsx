'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface UserContextType {
  user: any;
  profile: any;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
    const router = useRouter();

  const pathname = usePathname();
const isPublicRoute = ['/signin', '/signup', '/'].some((path) =>
  pathname.startsWith(path)
);

const signOut = async() => {
    await supabase.auth.signOut()
    router.push('/signin')
}

  const insertProfileIfNeeded = async (userId: string, metadata: any) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
       console.log('[InsertProfile] No existing profile. Inserting...');
      // Ambil dari localStorage (manual form register)
      const firstName = localStorage.getItem('pending_first_name');
      const lastName = localStorage.getItem('pending_last_name');

      // Jika gak ada, fallback dari OAuth metadata
      const name = metadata?.name || '';
      const [fallbackFirst, ...rest] = name.split(' ');
      const fallbackLast = rest.join(' ') || null;

      const { error } = await supabase.from('profiles').insert({
        id: userId,
        first_name: firstName || fallbackFirst || null,
        last_name: lastName || fallbackLast || null,
      });

      if (error) {
        console.error('[Insert profile error]', error.message);
      } else {
        // Bersihkan localStorage kalau insert sukses
        localStorage.removeItem('pending_first_name');
        localStorage.removeItem('pending_last_name');
        localStorage.removeItem('pending_email');
      }
    }
  };

  const fetchSessionAndProfile = async () => {

    setLoading(true);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[Session error]', sessionError.message);
      setLoading(false);
      return;
    }

    const currentUser = session?.user;
    setUser(currentUser);

  console.log('[AuthProvider] isPublicRoute:', isPublicRoute);
  console.log('[Current Route]', window.location.pathname);
  console.log('[AuthProvider] user:', currentUser);

    if (currentUser) {


      await insertProfileIfNeeded(currentUser.id, currentUser.user_metadata);

      const { data: freshProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('[Fetch profile error]', profileError.message);
      }

      setProfile(freshProfile);
    } else {
      setProfile(null);
    }

    setLoading(false);
  };

  const refreshProfile = async () => {
    setLoading(true);
    if (!user) return;

    const { data: freshProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[refreshProfile error]', error.message);
      return;
    }

    setProfile(freshProfile);
  };

  useEffect(() => {
    fetchSessionAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchSessionAndProfile();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
