"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SocialAuth from "../social-auth";
import { login } from "./actions";

const supabase = createClient();

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const { error: authError } = await login(formData);

    if (authError) {
      setError(authError.message);
    } else {
      router.replace("/dashboard");
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <SocialAuth />

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <div className="w-1/2 hidden lg:flex items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 opacity-80" />
        <img
          src="https://cytspnpaxhjzyqlmkaad.supabase.co/storage/v1/object/public/cdn//login-visual.jpg"
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
}
