'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  UserCircle,
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
    { href: `/cases/${currentCaseId}/resolution`,     label: 'Match',        icon: Fingerprint },
    { href: `/cases/${currentCaseId}/graph`,          label: 'Map',          icon: ShareNetwork},
  ];

  return (
    <>
      {/* ── Island Navigation ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 pointer-events-none">
        <div
          className={`
            island-nav pointer-events-auto w-full max-w-[1200px] rounded-2xl border
            ${scrolled
              ? 'bg-[#111111]/95 border-[#333333] shadow-lg shadow-black/40 py-2 px-4'
              : 'bg-[#111111]/85 border-[#333333]/60 shadow-md shadow-black/30 py-2.5 px-5'
            }
            backdrop-blur-xl
          `}
        >
          <div className="flex items-center gap-3">

            {/* ── Brand ─────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 group mr-2"
            >
              {/* New Target Logo */}
              <div className="relative h-8 w-8 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#E85002] to-[#C10801] shadow-sm group-hover:shadow-[0_0_12px_rgba(232,80,2,0.4)] transition-shadow duration-300" />
                <Target size={18} weight="bold" className="absolute inset-0 m-auto text-[#F9F9F9]" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold tracking-tight text-[#F9F9F9] leading-none">
                  ARGUS<span className="text-[#E85002]"> AI</span>
                </div>
                <div className="text-[9px] font-medium text-[#A7A7A7] tracking-widest uppercase leading-none mt-0.5">
                  Investigation Platform
                </div>
              </div>
            </Link>

            {/* ── Divider ───────────────────────────────────────────── */}
            <div className="h-6 w-px bg-[#333333] flex-shrink-0" />

            {/* ── Primary Nav ───────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? isAt(item.href, true) || (item.href === '/' && !isAt('/cases') && !isAt('/ontology'))
                  : item.matchOn
                    ? isAt(item.matchOn)
                    : isAt(item.href) && !(item.skipCaseDetail && currentCaseId);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium
                      transition-all duration-150
                      ${active
                        ? 'text-[#E85002] bg-[#E85002]/10'
                        : 'text-[#A7A7A7] hover:text-[#F9F9F9] hover:bg-[#222222]'
                      }
                    `}
                  >
                    <Icon size={15} weight={active ? 'fill' : 'regular'} />
                    <span>{item.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E85002] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Case context breadcrumb + stage steps ──────────── */}
            {currentCaseId && (
              <>
                <div className="hidden xl:block h-6 w-px bg-[#333333] flex-shrink-0" />
                <div className="hidden xl:flex items-center gap-1 min-w-0 flex-1">
                  {/* Case breadcrumb */}
                  <Link
                    href={`/cases/${currentCaseId}`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#E85002] hover:text-[#F16001] transition-colors flex-shrink-0"
                  >
                    <span className="px-1.5 py-0.5 rounded-md bg-[#E85002]/10 font-mono border border-[#E85002]/20">
                      #{currentCaseId}
                    </span>
                  </Link>
                  <CaretRight size={11} className="text-[#646464] flex-shrink-0" />
                  {/* Steps */}
                  <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
                    {caseSteps.map((step) => {
                      const isActive = pathname?.startsWith(step.href);
                      const Icon = step.icon;
                      return (
                        <Link
                          key={step.href}
                          href={step.href}
                          className={`
                            flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium
                            transition-all duration-150 whitespace-nowrap flex-shrink-0
                            ${isActive
                              ? 'text-[#E85002] bg-[#E85002]/10 border border-[#E85002]/20'
                              : 'text-[#A7A7A7] hover:text-[#F9F9F9] hover:bg-[#222222]'
                            }
                          `}
                        >
                          <Icon size={12} weight={isActive ? 'fill' : 'regular'} />
                          <span>{step.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── Spacer ────────────────────────────────────────────── */}
            {!currentCaseId && <div className="flex-1" />}

            {/* ── Right Controls ────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="
                  flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl
                  bg-[#222222] hover:bg-[#333333]
                  border border-[#333333]
                  text-[#A7A7A7] hover:text-[#F9F9F9]
                  transition-all duration-150 cursor-pointer group
                "
              >
                <MagnifyingGlass size={14} weight="regular" />
                <span className="hidden md:block text-[12px] text-[#A7A7A7]">Search...</span>
                <kbd className="hidden md:block text-[9px] px-1.5 py-0.5 rounded-md bg-[#000000] border border-[#646464] font-mono text-[#A7A7A7]">
                  ⌘K
                </kbd>
              </button>

              {/* User - Hameed Afsar KM */}
              <button className="
                flex items-center gap-1.5 px-2 py-1.5 rounded-xl
                hover:bg-[#222222]
                transition-colors duration-150 cursor-pointer
              ">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#E85002] to-[#C10801] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#F9F9F9] text-[9px] font-bold">HA</span>
                </div>
                <span className="hidden sm:block text-[12px] font-medium text-[#A7A7A7]">
                  Hameed Afsar KM
                </span>
              </button>

              {/* Theme Toggle (Removed since it's a fixed color scheme now, or we can keep it forcing the UI colors) */}
              {/* <ThemeToggle /> */}

              {/* Mobile menu */}
              <button
                onClick={() => setIsMobileOpen((p) => !p)}
                className="
                  p-1.5 rounded-xl lg:hidden
                  bg-[#222222] border border-[#333333]
                  text-[#A7A7A7] hover:text-[#F9F9F9]
                  transition-colors cursor-pointer
                "
              >
                {isMobileOpen ? <X size={16} /> : <List size={16} />}
              </button>
            </div>
          </div>

          {/* ── Mobile Drawer ─────────────────────────────────────────── */}
          {isMobileOpen && (
            <div className="mt-2 pt-3 border-t border-[#333333] lg:hidden animate-slide-in-up">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { href: '/', label: 'Overview', icon: House },
                  { href: '/cases', label: 'Cases', icon: Briefcase },
                  { href: '/ontology/entities', label: 'Knowledge', icon: TreeStructure },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#222222] border border-[#333333] text-[11px] font-medium text-[#A7A7A7] hover:text-[#E85002] transition-colors"
                    >
                      <Icon size={18} weight="regular" className="text-[#E85002]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {currentCaseId && (
                <div className="mt-3 pt-3 border-t border-[#333333]">
                  <div className="text-[10px] font-semibold text-[#A7A7A7] uppercase tracking-widest mb-2">
                    Case #{currentCaseId}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {caseSteps.map((step) => {
                      const Icon = step.icon;
                      const isActive = pathname?.startsWith(step.href);
                      return (
                        <Link
                          key={step.href}
                          href={step.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`
                            flex items-center gap-1.5 p-2.5 rounded-lg text-[11px] font-medium border
                            transition-colors
                            ${isActive
                              ? 'bg-[#E85002] border-[#E85002] text-[#F9F9F9]'
                              : 'bg-[#222222] border-[#333333] text-[#A7A7A7]'
                            }
                          `}
                        >
                          <Icon size={13} weight={isActive ? 'fill' : 'regular'} />
                          <span>{step.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Search Modal ──────────────────────────────────────────────────── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-24 p-4 animate-fade-in"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border bg-[#111111] border-[#333333] shadow-2xl overflow-hidden animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#333333]">
              <MagnifyingGlass size={16} weight="regular" className="text-[#E85002] flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search cases, people, devices, accounts..."
                className="flex-1 bg-transparent text-[14px] text-[#F9F9F9] placeholder-[#A7A7A7] outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-[10px] font-mono px-2 py-1 rounded-lg border border-[#333333] text-[#A7A7A7] hover:text-[#F9F9F9] transition-colors"
              >
                ESC
              </button>
            </div>
            <div className="p-3">
              <div className="text-[10px] font-semibold text-[#646464] uppercase tracking-widest px-2 mb-2">
                Quick Jump
              </div>
              {[
                { label: 'Case #1001 — Fraud Investigation', sub: 'Hameed Afsar KM · Active', href: '/cases/1001' },
                { label: 'Case #1001 — Connections Map', sub: '18 subjects linked', href: '/cases/1001/graph' },
                { label: 'Case #1001 — Possible Matches', sub: '3 candidates awaiting decision', href: '/cases/1001/resolution-review' },
              ].map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#222222] group transition-colors"
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#F9F9F9]">{r.label}</div>
                    <div className="text-[11px] text-[#A7A7A7] mt-0.5">{r.sub}</div>
                  </div>
                  <CaretRight size={14} className="text-[#E85002] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
