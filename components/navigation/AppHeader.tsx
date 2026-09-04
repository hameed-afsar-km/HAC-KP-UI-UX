'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  List,
  MagnifyingGlass,
  Bell,
  ShieldWarning,
  CaretRight,
  ShieldCheck,
  HardDrive
} from '@phosphor-icons/react';

interface AppHeaderProps {
  onToggleMobileSidebar: () => void;
}

export default function AppHeader({ onToggleMobileSidebar }: AppHeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from path
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#E8DCC8] dark:bg-[#0D1424]/90 dark:border-[#1F2A44] transition-colors duration-200 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation sidebar"
          className="lg:hidden p-2 rounded-xl border border-[#E8DCC8] bg-white text-[#1F2A44] hover:bg-[#FAF6F0] dark:bg-[#162238] dark:border-[#1F2A44] dark:text-[#E8DCC8] cursor-pointer"
        >
          <List size={20} weight="bold" />
        </button>

        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <Link
            href="/"
            className="text-[#8C733E] hover:text-[#C6A75E] transition-colors font-bold"
          >
            COMMAND
          </Link>

          {pathSegments.map((segment, idx) => {
            const pathUrl = `/${pathSegments.slice(0, idx + 1).join('/')}`;
            const isLast = idx === pathSegments.length - 1;

            return (
              <React.Fragment key={pathUrl}>
                <CaretRight size={10} className="text-[#8C733E]" />
                {isLast ? (
                  <span className="font-bold text-[#1F2A44] dark:text-[#C6A75E] uppercase truncate max-w-[160px] sm:max-w-none">
                    {segment.replace(/-/g, ' ')}
                  </span>
                ) : (
                  <Link
                    href={pathUrl}
                    className="text-[#5A667E] hover:text-[#1F2A44] dark:text-slate-400 dark:hover:text-white uppercase transition-colors"
                  >
                    {segment.replace(/-/g, ' ')}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Right: Omni Search & Classification Badge */}
      <div className="flex items-center gap-3">
        {/* Omni Search */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-[#8C733E]" weight="bold" />
          <input
            type="text"
            placeholder="Search entities, evidence, or MAC/IP..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[#E8DCC8] dark:border-[#1F2A44] bg-white dark:bg-[#162238] text-xs text-[#1F2A44] dark:text-[#FAF6F0] placeholder-[#8C733E] focus:outline-none focus:border-[#C6A75E] transition-colors"
          />
          <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#8C733E] bg-[#FAF6F0] dark:bg-[#0D1424] border border-[#E8DCC8] dark:border-[#1F2A44]">
            ⌘K
          </kbd>
        </div>

        {/* Security Classification Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F3ECE1] dark:bg-[#162238] border border-[#E8DCC8] dark:border-[#1F2A44] text-[10px] font-mono font-bold text-[#1F2A44] dark:text-[#C6A75E]">
          <ShieldWarning size={14} weight="fill" className="text-[#C6A75E]" />
          <span>RESTRICTED // INVESTIGATION CUSTODY</span>
        </div>

        {/* Alert Notifications */}
        <button
          type="button"
          aria-label="System notifications"
          className="relative p-2 rounded-xl border border-[#E8DCC8] bg-white text-[#1F2A44] hover:bg-[#FAF6F0] dark:bg-[#162238] dark:border-[#1F2A44] dark:text-[#E8DCC8] cursor-pointer"
        >
          <Bell size={18} weight="bold" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C6A75E]" />
        </button>
      </div>
    </header>
  );
}
