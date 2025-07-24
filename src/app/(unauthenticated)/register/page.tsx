"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import SocialAuth from "./socialAuth";

const SignUpScreen = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!firstName || !lastName || !email || !password) {
      alert("Semua field wajib diisi.");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Gagal daftar: " + error.message);
      return;
    }

    // Simpan sementara ke localStorage
    localStorage.setItem("pending_first_name", firstName);
    localStorage.setItem("pending_last_name", lastName);
    localStorage.setItem("pending_email", email);

    alert("Registrasi berhasil! Silakan cek email kamu untuk konfirmasi.");
    form.reset(); // ✅ aman karena pakai ref
    router.push("/signin");
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Left Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Register
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please fill out this form
            </p>
          </div>

          <form ref={formRef} onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="firstName"
                type="text"
                required
                placeholder="First Name"
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                name="lastName"
                type="text"
                required
                placeholder="Last Name"
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition"
            >
              Create Account
            </button>
          </form>

          <SocialAuth />

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Already have an account?{" "}
            <Link href="/signin" className="text-indigo-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel */}
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
            <h1 className="text-4xl font-bold mb-4">Join us Today</h1>
          <p className="text-lg text-gray-300">And get all your benefits</p>
          </div>
          <div className="footer__text opacity-50 text-xs">
            Photo by{" "}
            <a className="underline" href="https://unsplash.com/@priscilladupreez?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
              Priscilla Du Preez 🇨🇦
            </a>{" "}
            on{" "}
            <a className="underline" href="https://unsplash.com/photos/a-couple-of-men-sitting-at-a-table-with-laptops-NjirplnVra8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
              Unsplash
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
