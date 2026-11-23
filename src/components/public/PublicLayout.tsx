import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BookingModal } from './BookingModal';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#040B16] text-slate-100">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BookingModal />
    </div>
  );
}
