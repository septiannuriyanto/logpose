"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SocialAuth from "../register/socialAuth";
import { useAuth } from "@/app/(authenticated)/authContext";

const SignIn = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi login sukses
    router.push("/dashboard");
  };

   if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Left Panel (Visual) */}
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
            <h1 className="text-4xl font-bold mb-4">Welcome</h1>
            <p className="text-lg text-gray-300">
              The accurate timing is now in your grasp
            </p>
          </div>
          <div className="footer__text opacity-50 text-xs">
            <div>
              Photo by{" "}
              <a className="underline" href="https://unsplash.com/@krakenimages?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                krakenimages
              </a>{" "}
              on{" "}
              <a className="underline" href="https://unsplash.com/photos/person-in-black-long-sleeve-shirt-holding-persons-hand-Y5bvRlcCx8k?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Unsplash
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (Login) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="appearance-none relative block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                className="appearance-none relative block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                Sign in
              </button>
            </div>
          </form>
          <SocialAuth />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Didn't have account yet?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
