'use client';

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const SocialAuth = () => {
  const handleOAuthLogin = async (provider: 'google' | 'github' | 'linkedin' | 'zoom') => {
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.log(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="social__auth flex items-center justify-center gap-3 flex-wrap">
      <button
        onClick={() => handleOAuthLogin('google')}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <img src="/icons/google.svg" alt="Google" className="w-4 h-4" /> Sign in with Google
      </button>

      <button
        onClick={() => handleOAuthLogin('github')}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <img src="/icons/github.svg" alt="GitHub" className="w-4 h-4 dark:invert" /> Sign in with Github
      </button>
    </div>
  );
};

export default SocialAuth;
