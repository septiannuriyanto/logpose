// app/(authenticated)/layout.tsx
import React from 'react';
import AuthenticatedLayout from './authenticatedlayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
