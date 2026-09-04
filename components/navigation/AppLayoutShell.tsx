'use client';

import React from 'react';
import FloatingIslandNav from './FloatingIslandNav';
import HelpModal from '../help/HelpModal';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9] dark:bg-[#000000] text-[#000000] dark:text-[#F9F9F9] transition-colors duration-200 selection:bg-[#E85002] selection:text-white">

      {/* Very subtle background texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #E85002 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient top-right glow in dark mode */}
      <div className="fixed top-0 right-0 w-[600px] h-[400px] pointer-events-none z-0 opacity-0 dark:opacity-100 transition-opacity duration-500"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(232,80,2,0.06) 0%, transparent 70%)' }}
      />

      <FloatingIslandNav />

      <main className="flex-1 w-full pt-24 sm:pt-28 pb-16 relative z-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-[#A7A7A7] dark:border-[#333333] bg-[#F9F9F9]/80 dark:bg-[#111111]/60 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E85002] animate-pulse" />
              <span className="font-semibold text-[#000000] dark:text-[#F9F9F9]">ARGUS AI</span>
            </div>
            <span className="text-[#646464]">·</span>
            <span className="text-[#646464]">Investigation Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#646464]">
            <span>Schema v2.4.0</span>
            <span>·</span>
            <span className="text-[#E85002] font-semibold">Restricted Access</span>
          </div>
        </div>
      </footer>
      <HelpModal />
    </div>
  );
}
