'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import { GlobalNotificationBanner } from '@/components/common/GlobalNotificationBanner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col">
        <GlobalNotificationBanner />
        {children}
      </div>
    );
  }

  return (
    <>
      <GlobalNotificationBanner />
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}
