import { createServerClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookieList) {
          cookieList.forEach(({ name, value, options }) => {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  );
}

export async function getUser(): Promise<User | null> {
  const supabase = await createServer();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user)
    return null;

  return data.user;
}
