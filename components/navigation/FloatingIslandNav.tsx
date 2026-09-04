'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    { href: '/',                   label: 'Overview',    icon: House,          exact: true  },
    { href: '/cases',              label: 'Cases',       icon: Briefcase,      exact: false, skipCaseDetail: true },
    { href: '/ontology/entities',  label: 'Knowledge',   icon: TreeStructure,  exact: false, matchOn: '/ontology' },
  ];

  const caseSteps = [
    { href: `/cases/${currentCaseId}/evidence`,       label: 'Files',        icon: Files       },
    { href: `/cases/${currentCaseId}/jobs`,           label: 'Analysis',     icon: Cpu         },
    { href: `/cases/${currentCaseId}/extractions`,    label: 'Findings',     icon: MagnifyingGlass },
    { href: `/cases/${currentCaseId}/quality-review`, label: 'Verify',       icon: ShieldCheck },
    { href: `/cases/${currentCaseId}/resolution-review`, label: 'Match',        icon: Fingerprint },
    { href: `/cases/${currentCaseId}/graph`,          label: 'Map',          icon: ShareNetwork},
  ];

  return (
    <>
      {/* ── Island Navigation ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
        <div
          className={`
            pointer-events-auto flex flex-col w-full max-w-6xl transition-all duration-300
            ${scrolled ? 'translate-y-0' : 'translate-y-1'}
          `}
        >
          {/* Main Island Pill */}
          <div className={`
            flex items-center justify-between gap-4 rounded-[2rem] border transition-all duration-500
            ${scrolled 
              ? 'bg-[#000000]/70 backdrop-blur-3xl border-[#333333]/80 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8)] py-2.5 px-4' 
              : 'bg-[#111111]/90 backdrop-blur-2xl border-[#333333] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] py-3 px-5'
            }
          `}>
            
            {/* ── Brand ─────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="relative h-9 w-9 rounded-full bg-[#111111] border border-[#333333] flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-[#E85002]/50 transition-colors">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,80,2,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Target size={18} weight="bold" className="text-[#F9F9F9] group-hover:text-[#E85002] transition-colors relative z-10" />
              </div>
              <div className="hidden md:block">
                <div className="text-[13px] font-black tracking-tight text-[#F9F9F9] leading-none uppercase">
                  ARGUS<span className="text-[#E85002]"> AI</span>
                </div>
              </div>
            </Link>

            {/* ── Primary Nav / Case Context ───────────────────────────────────────── */}
            <div className="hidden lg:flex items-center bg-[#000000] rounded-full p-1 border border-[#333333]">
              {currentCaseId ? (
                // Case Context Mode
                <div className="flex items-center pl-3 pr-1">
                  <div className="flex items-center gap-2 mr-3">
                    <span className="text-[10px] font-mono font-bold text-[#646464] uppercase tracking-widest">Case</span>
                    <span className="text-[11px] font-mono font-bold text-[#E85002]">#{currentCaseId}</span>
                  </div>
                  <div className="w-px h-4 bg-[#333333] mr-2" />
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
                              ? 'bg-[#111111] text-[#F9F9F9] border border-[#333333] shadow-sm'
                              : 'text-[#646464] hover:text-[#A7A7A7] border border-transparent hover:bg-[#111111]/50'
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
                // Standard Mode
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
                            ? 'bg-[#111111] text-[#F9F9F9] border border-[#333333] shadow-sm'
                            : 'text-[#646464] hover:text-[#A7A7A7] border border-transparent hover:bg-[#111111]/50'
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

            {/* ── Right Controls ────────────────────────────────────── */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-auto lg:ml-0">
              
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#111111] border border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9] hover:border-[#646464] transition-all cursor-pointer group"
                aria-label="Search"
              >
                <MagnifyingGlass size={16} weight="bold" className="group-hover:scale-110 transition-transform" />
              </button>

              {/* User Profile */}
              <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#111111] border border-[#333333] hover:border-[#646464] transition-all cursor-pointer group">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#E85002] to-[#C10801] flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_12px_rgba(232,80,2,0.4)] transition-shadow">
                  <span className="text-white text-[10px] font-black tracking-tighter">HA</span>
                </div>
                <span className="hidden sm:block text-[11px] font-bold text-[#A7A7A7] group-hover:text-[#F9F9F9] transition-colors">
                  Hameed
                </span>
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setIsMobileOpen((p) => !p)}
                className="w-9 h-9 flex items-center justify-center rounded-full lg:hidden bg-[#111111] border border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9] transition-colors cursor-pointer"
              >
                {isMobileOpen ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
              </button>
            </div>
          </div>

          {/* ── Mobile Drawer ─────────────────────────────────────────── */}
          {isMobileOpen && (
            <div className="mt-2 lg:hidden animate-slide-in-up">
              <div className="bg-[#111111]/95 backdrop-blur-2xl rounded-3xl border border-[#333333] shadow-2xl p-4 flex flex-col gap-2">
                {!currentCaseId ? (
                  mainNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#000000] border border-[#333333] text-[12px] font-bold uppercase tracking-wider text-[#A7A7A7] hover:text-[#F9F9F9] hover:border-[#E85002] transition-colors"
                      >
                        <Icon size={18} weight="bold" className="text-[#E85002]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })
                ) : (
                  <>
                    <div className="px-3 py-1 flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#646464] uppercase tracking-widest">Case</span>
                      <span className="text-[11px] font-mono font-bold text-[#E85002]">#{currentCaseId}</span>
                    </div>
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
                              flex flex-col items-center gap-2 p-4 rounded-2xl border
                              transition-colors
                              ${isActive
                                ? 'bg-[#E85002]/10 border-[#E85002]/30 text-[#F9F9F9]'
                                : 'bg-[#000000] border-[#333333] text-[#646464]'
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

      {/* ── Search Modal ──────────────────────────────────────────────────── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-32 p-4 animate-fade-in"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-[2rem] border bg-[#111111]/90 backdrop-blur-3xl border-[#333333] shadow-[0_32px_64px_-16px_rgba(0,0,0,1)] overflow-hidden animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 px-6 py-5 border-b border-[#333333]">
              <MagnifyingGlass size={20} weight="bold" className="text-[#E85002] flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search cases, people, devices, accounts..."
                className="flex-1 bg-transparent text-[16px] font-medium text-[#F9F9F9] placeholder-[#646464] outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-[11px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-[#000000] border border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9] hover:border-[#646464] transition-colors"
              >
                ESC
              </button>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-mono font-bold text-[#646464] uppercase tracking-widest px-4 mb-3">
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
                    className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-[#000000] group transition-all border border-transparent hover:border-[#333333]"
                  >
                    <div>
                      <div className="text-[13px] font-bold text-[#A7A7A7] group-hover:text-[#F9F9F9] transition-colors">{r.label}</div>
                      <div className="text-[11px] text-[#646464] mt-1 font-mono">{r.sub}</div>
                    </div>
                    <CaretRight size={16} weight="bold" className="text-[#646464] group-hover:text-[#E85002] transition-colors" />
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
