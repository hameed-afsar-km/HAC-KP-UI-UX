'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import ThemeToggle from '@/components/theme/ThemeToggle';
import {
  Target,
  Briefcase,
  TreeStructure,
  MagnifyingGlass,
  Files,
  Cpu,
  ShieldCheck,
  Fingerprint,
  ShareNetwork,
  List,
  X,
  House,
  CaretRight,
} from '@phosphor-icons/react';

export default function FloatingIslandNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [isSearchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((p) => !p);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const caseMatch = pathname?.match(/\/cases\/(\d+)/);
  const currentCaseId = caseMatch ? caseMatch[1] : null;

  const isAt = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname?.startsWith(path);
  };

  const mainNav = [
    { href: '/', label: 'Overview', icon: House, exact: true },
    { href: '/cases', label: 'Cases', icon: Briefcase, exact: false, skipCaseDetail: true },
    { href: '/ontology/entities', label: 'Knowledge', icon: TreeStructure, exact: false, matchOn: '/ontology' },
  ];

  const caseSteps = [
    { href: `/cases/${currentCaseId}/evidence`, label: 'Files', icon: Files },
    { href: `/cases/${currentCaseId}/jobs`, label: 'Analysis', icon: Cpu },
    { href: `/cases/${currentCaseId}/extractions`, label: 'Findings', icon: MagnifyingGlass },
    { href: `/cases/${currentCaseId}/quality-review`, label: 'Verify', icon: ShieldCheck },
    { href: `/cases/${currentCaseId}/resolution-review`, label: 'Match', icon: Fingerprint },
    { href: `/cases/${currentCaseId}/graph`, label: 'Map', icon: ShareNetwork },
  ];

  const isDark = theme === 'dark';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
        <div className={`pointer-events-auto flex flex-col w-full max-w-6xl transition-all duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-1'}`}>

          {/* Main Island Pill */}
          <div className={`
            flex items-center justify-between gap-4 rounded-[2rem] border transition-all duration-500
            ${scrolled
              ? isDark
                ? 'bg-[#000000]/70 backdrop-blur-3xl border-[#333333]/80 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8)] py-2.5 px-4'
                : 'bg-white/70 backdrop-blur-3xl border-[#E2E6F0]/80 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.1)] py-2.5 px-4'
              : isDark
                ? 'bg-[#111111]/90 backdrop-blur-2xl border-[#333333] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] py-3 px-5'
                : 'bg-white/90 backdrop-blur-2xl border-[#E2E6F0] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] py-3 px-5'
            }
          `}>

            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className={`relative h-9 w-9 rounded-full border flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-[#E85002]/50 transition-colors ${isDark ? 'bg-[#111111] border-[#333333]' : 'bg-[#F6F7FB] border-[#E2E6F0]'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,80,2,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Target size={18} weight="bold" className={`group-hover:text-[#E85002] transition-colors relative z-10 ${isDark ? 'text-[#F9F9F9]' : 'text-[#0D0F14]'}`} />
              </div>
              <div className="hidden md:block">
                <div className={`text-[13px] font-black tracking-tight leading-none uppercase ${isDark ? 'text-[#F9F9F9]' : 'text-[#0D0F14]'}`}>
                  ARGUS<span className="text-[#E85002]"> AI</span>
                </div>
              </div>
            </Link>

            {/* Primary Nav / Case Context */}
            <div className={`hidden lg:flex items-center rounded-full p-1 border ${isDark ? 'bg-[#000000] border-[#333333]' : 'bg-[#F6F7FB] border-[#E2E6F0]'}`}>
              {currentCaseId ? (
                <div className="flex items-center pl-3 pr-1">
                  <Link
                    href="/"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider border border-transparent transition-all duration-200 mr-1 ${isDark ? 'text-[#646464] hover:text-[#F9F9F9] hover:bg-[#111111]/50' : 'text-[#8B95AD] hover:text-[#0D0F14] hover:bg-[#E2E6F0]/50'}`}
                  >
                    <House size={14} weight="regular" />
                    <span className="hidden xl:inline">Home</span>
                  </Link>
                  <div className={`w-px h-4 mr-2 ${isDark ? 'bg-[#333333]' : 'bg-[#E2E6F0]'}`} />
                  <div className="flex items-center gap-2 mr-3">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isDark ? 'text-[#646464]' : 'text-[#8B95AD]'}`}>Case</span>
                    <span className="text-[11px] font-mono font-bold text-[#E85002]">#{currentCaseId}</span>
                  </div>
                  <div className={`w-px h-4 mr-2 ${isDark ? 'bg-[#333333]' : 'bg-[#E2E6F0]'}`} />
                  <div className="flex items-center gap-1">
                    {caseSteps.map((step) => {
                      const isActive = pathname?.startsWith(step.href);
                      const Icon = step.icon;
                      return (
                        <Link
                          key={step.href}
                          href={step.href}
                          className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider
                            transition-all duration-200
                            ${isActive
                              ? isDark
                                ? 'bg-[#111111] text-[#F9F9F9] border border-[#333333] shadow-sm'
                                : 'bg-white text-[#0D0F14] border border-[#E2E6F0] shadow-sm'
                              : isDark
                                ? 'text-[#646464] hover:text-[#A7A7A7] border border-transparent hover:bg-[#111111]/50'
                                : 'text-[#8B95AD] hover:text-[#0D0F14] border border-transparent hover:bg-[#E2E6F0]/50'
                            }
                          `}
                        >
                          <Icon size={14} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-[#E85002]' : ''} />
                          <span className={!isActive ? 'hidden xl:inline' : ''}>{step.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <nav className="flex items-center gap-1">
                  {mainNav.map((item) => {
                    const Icon = item.icon;
                    const active = item.exact
                      ? isAt(item.href, true) || (item.href === '/' && !isAt('/cases') && !isAt('/ontology'))
                      : item.matchOn
                        ? isAt(item.matchOn)
                        : isAt(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider
                          transition-all duration-200
                          ${active
                            ? isDark
                              ? 'bg-[#111111] text-[#F9F9F9] border border-[#333333] shadow-sm'
                              : 'bg-white text-[#0D0F14] border border-[#E2E6F0] shadow-sm'
                            : isDark
                              ? 'text-[#646464] hover:text-[#A7A7A7] border border-transparent hover:bg-[#111111]/50'
                              : 'text-[#8B95AD] hover:text-[#0D0F14] border border-transparent hover:bg-[#E2E6F0]/50'
                          }
                        `}
                      >
                        <Icon size={14} weight={active ? 'fill' : 'regular'} className={active ? 'text-[#E85002]' : ''} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer group ${isDark ? 'bg-[#111111] border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9] hover:border-[#646464]' : 'bg-[#F6F7FB] border-[#E2E6F0] text-[#8B95AD] hover:text-[#0D0F14] hover:border-[#A7A7A7]'}`}
                aria-label="Search"
              >
                <MagnifyingGlass size={14} weight="bold" className="group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${isDark ? 'border-[#333333] text-[#646464]' : 'border-[#E2E6F0] text-[#8B95AD]'}`}>
                  ⌘K
                </span>
              </button>

              <ThemeToggle />

              <button className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all cursor-pointer group ${isDark ? 'bg-[#111111] border-[#333333] hover:border-[#646464]' : 'bg-[#F6F7FB] border-[#E2E6F0] hover:border-[#A7A7A7]'}`}>
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#E85002] to-[#C10801] flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_12px_rgba(232,80,2,0.4)] transition-shadow">
                  <span className="text-white text-[10px] font-black tracking-tighter">HA</span>
                </div>
                <span className={`hidden sm:block text-[11px] font-bold transition-colors ${isDark ? 'text-[#A7A7A7] group-hover:text-[#F9F9F9]' : 'text-[#5A6480] group-hover:text-[#0D0F14]'}`}>
                  Hameed
                </span>
              </button>

              <button
                onClick={() => setIsMobileOpen((p) => !p)}
                className={`w-9 h-9 flex items-center justify-center rounded-full lg:hidden border transition-colors cursor-pointer ${isDark ? 'bg-[#111111] border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9]' : 'bg-[#F6F7FB] border-[#E2E6F0] text-[#8B95AD] hover:text-[#0D0F14]'}`}
              >
                {isMobileOpen ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {isMobileOpen && (
            <div className="mt-2 lg:hidden animate-slide-in-up">
              <div className={`backdrop-blur-2xl rounded-3xl border shadow-2xl p-4 flex flex-col gap-2 ${isDark ? 'bg-[#111111]/95 border-[#333333]' : 'bg-white/95 border-[#E2E6F0]'}`}>
                {!currentCaseId ? (
                  mainNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-[12px] font-bold uppercase tracking-wider transition-colors ${isDark ? 'bg-[#000000] border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9] hover:border-[#E85002]' : 'bg-[#F6F7FB] border-[#E2E6F0] text-[#5A6480] hover:text-[#0D0F14] hover:border-[#E85002]'}`}
                      >
                        <Icon size={18} weight="bold" className="text-[#E85002]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })
                ) : (
                  <>
                    <div className="px-3 py-1 flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isDark ? 'text-[#646464]' : 'text-[#8B95AD]'}`}>Case</span>
                      <span className="text-[11px] font-mono font-bold text-[#E85002]">#{currentCaseId}</span>
                    </div>
                    <Link
                      href="/"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-[12px] font-bold uppercase tracking-wider transition-colors mt-1 ${isDark ? 'bg-[#000000] border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9] hover:border-[#E85002]' : 'bg-[#F6F7FB] border-[#E2E6F0] text-[#5A6480] hover:text-[#0D0F14] hover:border-[#E85002]'}`}
                    >
                      <House size={18} weight="bold" className="text-[#E85002]" />
                      <span>Home</span>
                    </Link>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {caseSteps.map((step) => {
                        const Icon = step.icon;
                        const isActive = pathname?.startsWith(step.href);
                        return (
                          <Link
                            key={step.href}
                            href={step.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`
                              flex flex-col items-center gap-2 p-4 rounded-2xl border transition-colors
                              ${isActive
                                ? 'bg-[#E85002]/10 border-[#E85002]/30 text-[#F9F9F9]'
                                : isDark
                                  ? 'bg-[#000000] border-[#333333] text-[#646464]'
                                  : 'bg-[#F6F7FB] border-[#E2E6F0] text-[#8B95AD]'
                              }
                            `}
                          >
                            <Icon size={20} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-[#E85002]' : ''} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{step.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-32 p-4 animate-fade-in"
          style={{ background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(12px)' }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className={`w-full max-w-2xl rounded-[2rem] border backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,1)] overflow-hidden animate-slide-in-up ${isDark ? 'bg-[#111111]/90 border-[#333333]' : 'bg-white/90 border-[#E2E6F0]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center gap-4 px-6 py-5 border-b ${isDark ? 'border-[#333333]' : 'border-[#E2E6F0]'}`}>
              <MagnifyingGlass size={20} weight="bold" className="text-[#E85002] flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search cases, people, devices, accounts..."
                className={`flex-1 bg-transparent text-[16px] font-medium outline-none ${isDark ? 'text-[#F9F9F9] placeholder-[#646464]' : 'text-[#0D0F14] placeholder-[#8B95AD]'}`}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className={`text-[11px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${isDark ? 'bg-[#000000] border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9] hover:border-[#646464]' : 'bg-[#F6F7FB] border-[#E2E6F0] text-[#8B95AD] hover:text-[#0D0F14] hover:border-[#A7A7A7]'}`}
              >
                ESC
              </button>
            </div>
            <div className="p-4">
              <div className={`text-[10px] font-mono font-bold uppercase tracking-widest px-4 mb-3 ${isDark ? 'text-[#646464]' : 'text-[#8B95AD]'}`}>
                Quick Jump
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Case #1001 — Fraud Investigation', sub: 'Hameed Afsar KM · Active', href: '/cases/1001' },
                  { label: 'Case #1001 — Connections Map', sub: '18 subjects linked', href: '/cases/1001/graph' },
                  { label: 'Case #1001 — Possible Matches', sub: '3 candidates awaiting decision', href: '/cases/1001/resolution-review' },
                ].map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    onClick={() => setIsSearchOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl group transition-all border ${isDark ? 'hover:bg-[#000000] border-transparent hover:border-[#333333]' : 'hover:bg-[#F6F7FB] border-transparent hover:border-[#E2E6F0]'}`}
                  >
                    <div>
                      <div className={`text-[13px] font-bold transition-colors ${isDark ? 'text-[#A7A7A7] group-hover:text-[#F9F9F9]' : 'text-[#5A6480] group-hover:text-[#0D0F14]'}`}>{r.label}</div>
                      <div className={`text-[11px] mt-1 font-mono ${isDark ? 'text-[#646464]' : 'text-[#8B95AD]'}`}>{r.sub}</div>
                    </div>
                    <CaretRight size={16} weight="bold" className={`transition-colors ${isDark ? 'text-[#646464] group-hover:text-[#E85002]' : 'text-[#8B95AD] group-hover:text-[#E85002]'}`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}