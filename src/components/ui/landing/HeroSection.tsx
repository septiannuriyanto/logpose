'use client';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      <h1 className="text-5xl font-bold mb-4 leading-tight">
        A New Intuitive Way to Manage Your Team's Time and Projects
      </h1>
      <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300 mb-8">
        Precision monitoring of work hours, projects, and remote team collaboration with a single integrated platform.
        Perfect for startups, freelancers, and modern remote teams.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full items-center align-middle justify-center">
        <button
          onClick={() => router.push('/signin')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-lg font-medium transition w-full md:w-fit"
        >
          Get Started
        </button>
        <button
          onClick={() => router.push('/register')}
          className="bg-white dark:bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 px-6 py-3 rounded-md text-lg font-medium transition w-full md:w-fit"
        >
          Try For Free
        </button>
      </div>
    </section>
  );
}
