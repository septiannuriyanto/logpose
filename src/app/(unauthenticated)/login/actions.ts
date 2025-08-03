import { createClient } from '@/lib/supabase/client';

export async function login(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  return await supabase.auth.signInWithPassword({ email, password });
}
