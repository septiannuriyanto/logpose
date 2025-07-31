import { createClient } from '@/lib/supabase/client';

export async function register(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  return await supabase.auth.signUp(
    {
      email, password, options: {
        data: {
          first_name: first_name,
          last_name: last_name,
        }
      }
    }
  );
}
