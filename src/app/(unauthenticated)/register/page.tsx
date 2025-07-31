"use client";

import { createClient } from '@/lib/supabase/client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import SocialAuth from "../social-auth";
import { register } from './actions';

const supabase = createClient();

const Register = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true)
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const { error: authError } = await register(formData);

    if (authError)
      setError(authError.message);
    else
      router.replace('/dashboard')

    setLoading(false)
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Register
            </h2>
          </div>

          <form ref={formRef} onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="first_name"
                type="text"
                required
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                name="last_name"
                type="text"
                required
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />

             {error && <p style={{ color: 'red' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="  w-full bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? 'Creating an account...' : 'Create Account'}
            </button>
          </form>

          <SocialAuth />

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="w-1/2 hidden lg:flex items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 opacity-80" />
        <img
          src="https://cytspnpaxhjzyqlmkaad.supabase.co/storage/v1/object/public/cdn//register-visual.jpg"
          alt="Visual"
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute z-10 px-10 flex flex-col justify-between h-full">
          <div className="empty__header"></div>
          <div className="middle__text">
            <h1 className="text-4xl font-bold mb-4">Stay organized!</h1>
            <p className="text-lg text-gray-300">Track team productivity</p>
          </div>
          <div className="footer__text opacity-50 text-xs"></div>
        </div>
      </div>
    </div>
  );
};

export default Register;
