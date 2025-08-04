import AuthProvider from '@/components/AuthProvider';
import { Sidebar } from '@/components/layout/sidebar';
import Timer from '@/components/ui/timer/Timer';
import { getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider initialUser={user}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-100">
          <Timer userId={user.id} projectId='' />
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
