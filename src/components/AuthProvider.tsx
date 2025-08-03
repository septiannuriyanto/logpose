'use client';

import { createClient } from '@/lib/supabase/client';
import { User, UserMetadata } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface Context {
  user: User | null;
  profile: UserMetadata | null;
  loading: boolean;
}

const AuthContext = createContext<Context>({ user: null, profile: null, loading: true });
export const useAuth = () => useContext(AuthContext);

const supabase = createClient();

export default function AuthProvider({ children, initialUser }: { initialUser: User | null; children: ReactNode }) {
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(initialUser?.user_metadata ?? null);
  const [loading, setLoading] = useState(!initialUser);

  // const mounted = useRef(false);
  // useEffect(() => {
  //   if (mounted.current) return;
  //   mounted.current = true;

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
  //     setUser(session?.user ?? null);
  //     setProfile(session?.user.user_metadata ?? null);
  //     setLoading(false);
  //   });
  //   return () => subscription.unsubscribe();
  // }, []);

  const value = useMemo(() => ({ user, profile, loading }), [user, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
