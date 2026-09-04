'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/theme/ThemeToggle';
import {
  Briefcase,
  GitFork,
  Pulse,
  MagnifyingGlass,
  ShareNetwork,
  Compass,
  ShieldCheck
} from '@phosphor-icons/react';

export default function TopNav() {
  const pathname = usePathname();

  const isCurrent = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b transition-colors duration-200 bg-[#FAF6F0]/95 border-[#E8DCC8] text-[#1F2A44] dark:bg-[#0D1424]/95 dark:border-[#1F2A44] dark:text-[#E8DCC8] backdrop-blur-md shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Left Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F2A44] text-[#C6A75E] border border-[#C6A75E]/40 dark:bg-[#162238] dark:text-[#C6A75E] dark:border-[#C6A75E]/50 shadow-xs group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold font-mono tracking-wider text-[#C6A75E] uppercase">
                  FORENSIC MAPPING
                </span>
                <span className="rounded bg-[#E8DCC8]/60 dark:bg-[#1F2A44] px-1.5 py-0.5 text-[10px] font-mono text-[#1F2A44] dark:text-[#C6A75E] border border-[#D4C4AB] dark:border-[#C6A75E]/30 font-semibold">
                  API v1
                </span>
              </div>
              <h1 className="text-sm font-bold tracking-tight text-[#1F2A44] dark:text-[#FAF6F0] group-hover:text-[#C6A75E] transition-colors">
                Cross-Device Entity Resolution
              </h1>
            </div>
          </Link>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-[#E8DCC8] dark:border-[#1F2A44]">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isCurrent('/')
                  ? 'bg-[#E8DCC8] text-[#1F2A44] border border-[#D4C4AB] dark:bg-[#1F2A44] dark:text-[#C6A75E] dark:border-[#C6A75E]/40 shadow-xs'
                  : 'text-[#5A667E] hover:text-[#1F2A44] hover:bg-[#F3ECE1] dark:text-slate-400 dark:hover:text-[#FAF6F0] dark:hover:bg-[#162238]'
              }`}
            >
              <Pulse size={16} weight="bold" className="text-[#C6A75E]" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/cases"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isCurrent('/cases')
                  ? 'bg-[#E8DCC8] text-[#1F2A44] border border-[#D4C4AB] dark:bg-[#1F2A44] dark:text-[#C6A75E] dark:border-[#C6A75E]/40 shadow-xs'
                  : 'text-[#5A667E] hover:text-[#1F2A44] hover:bg-[#F3ECE1] dark:text-slate-400 dark:hover:text-[#FAF6F0] dark:hover:bg-[#162238]'
              }`}
            >
              <Briefcase size={16} weight="bold" className="text-[#C6A75E]" />
              <span>Cases</span>
            </Link>

            <Link
              href="/ontology/entities"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isCurrent('/ontology')
                  ? 'bg-[#E8DCC8] text-[#1F2A44] border border-[#D4C4AB] dark:bg-[#1F2A44] dark:text-[#C6A75E] dark:border-[#C6A75E]/40 shadow-xs'
                  : 'text-[#5A667E] hover:text-[#1F2A44] hover:bg-[#F3ECE1] dark:text-slate-400 dark:hover:text-[#FAF6F0] dark:hover:bg-[#162238]'
              }`}
            >
              <GitFork size={16} weight="bold" className="text-[#C6A75E]" />
              <span>Ontology</span>
            </Link>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-semibold border-[#D4C4AB] bg-[#F3ECE1] text-[#1F2A44] dark:border-[#C6A75E]/30 dark:bg-[#162238] dark:text-[#C6A75E]">
            <span className="h-2 w-2 rounded-full bg-[#C6A75E] animate-pulse" />
            <span>GRAPH ONLINE</span>
          </div>

          {/* Quick Search */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs bg-[#F3ECE1] border-[#D4C4AB] text-[#1F2A44] dark:bg-[#162238] dark:border-[#1F2A44] dark:text-[#E8DCC8]">
            <MagnifyingGlass size={14} weight="bold" className="text-[#8C733E]" />
            <input
              type="text"
              placeholder="Search case, identity..."
              className="bg-transparent border-none outline-none text-[#1F2A44] dark:text-[#FAF6F0] placeholder-[#8C733E] text-xs w-32 focus:w-48 transition-all"
            />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E8DCC8] dark:border-[#1F2A44]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs bg-[#1F2A44] text-[#C6A75E] border border-[#C6A75E]/40 dark:bg-[#162238] dark:text-[#C6A75E]">
              AR
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-[#1F2A44] dark:text-[#FAF6F0]">Anita Rao</div>
              <div className="text-[10px] text-[#8C733E] font-medium">Senior Investigator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
