'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/theme/ThemeToggle';
import {
  House,
  Briefcase,
  ShareNetwork,
  Compass,
  Database,
  Fingerprint,
  Cpu,
  FileText,
  ShieldCheck,
  CaretRight,
  List,
  X,
  Sparkle,
  HardDrive
} from '@phosphor-icons/react';

interface AppSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function AppSidebar({ isMobileOpen, setIsMobileOpen }: AppSidebarProps) {
  const pathname = usePathname();

  // Extract caseId if inside a case route
  const caseMatch = pathname.match(/\/cases\/([0-9]+)/);
  const activeCaseId = caseMatch ? caseMatch[1] : '1001';

  const navItems = [
    {
      href: '/',
      label: 'Command Center',
      subtext: 'Global Dashboard & Metrics',
      icon: House,
      isActive: pathname === '/'
    },
    {
      href: '/cases',
      label: 'Case Management',
      subtext: 'Active Custody & Intake',
      icon: Briefcase,
      isActive: pathname === '/cases' || (pathname.startsWith('/cases') && !pathname.includes('/ontology'))
    },
    {
      href: '/ontology',
      label: 'Ontology Studio',
      subtext: 'Schema, Entities & Edge Specs',
      icon: ShareNetwork,
      isActive: pathname.startsWith('/ontology')
    }
  ];

  const caseStages = [
    { href: `/cases/${activeCaseId}`, label: 'Case Details', icon: FileText },
    { href: `/cases/${activeCaseId}/upload`, label: 'Upload Files', icon: HardDrive },
    { href: `/cases/${activeCaseId}/evidence`, label: 'Evidence', icon: HardDrive },
    { href: `/cases/${activeCaseId}/jobs`, label: 'Entity Extraction Jobs', icon: Cpu },
    { href: `/cases/${activeCaseId}/extractions`, label: 'Extraction Result Explorer', icon: Database },
    { href: `/cases/${activeCaseId}/quality-review`, label: 'Evidence and Quality Review', icon: ShieldCheck },
    { href: `/cases/${activeCaseId}/resolution-review`, label: 'Entity-Resolution Review', icon: Fingerprint },
    { href: `/cases/${activeCaseId}/graph`, label: 'Investigation Graph', icon: ShareNetwork }
  ];

  const isInsideCase = pathname.startsWith('/cases/') && pathname !== '/cases';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#FAF6F0] border-r border-[#E8DCC8] dark:bg-[#0D1424] dark:border-[#1F2A44] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand & Crest Header */}
        <div className="p-5 border-b border-[#E8DCC8] dark:border-[#1F2A44] flex items-center justify-between bg-white dark:bg-[#162238]/60">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-[#1F2A44] text-[#C6A75E] border border-[#C6A75E]/40 shadow-xs group-hover:scale-105 transition-transform">
              <Compass size={24} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-base text-[#1F2A44] dark:text-[#FAF6F0]">
                  ANTIGRAVITY
                </span>
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#C6A75E] text-[#1F2A44]">
                  T7
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8C733E] tracking-wider uppercase">
                Forensic Intelligence Platform
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-[#5A667E] hover:text-[#1F2A44] dark:text-slate-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Workspaces */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold tracking-wider text-[#8C733E] uppercase px-3 mb-2">
              Command Workspaces
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group ${
                    item.isActive
                      ? 'bg-[#1F2A44] text-[#C6A75E] shadow-sm border border-[#C6A75E]/30 dark:bg-[#162238] dark:border-[#C6A75E]/40'
                      : 'text-[#3E4B65] hover:bg-[#E8DCC8]/50 hover:text-[#1F2A44] dark:text-[#E8DCC8] dark:hover:bg-[#1F2A44]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        item.isActive
                          ? 'bg-[#C6A75E] text-[#1F2A44]'
                          : 'bg-[#F3ECE1] text-[#1F2A44] dark:bg-[#1F2A44] dark:text-[#C6A75E] group-hover:bg-[#C6A75E] group-hover:text-[#1F2A44]'
                      }`}
                    >
                      <Icon size={18} weight={item.isActive ? 'fill' : 'bold'} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${item.isActive ? 'text-[#FAF6F0]' : ''}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#8C733E] font-mono">
                        {item.subtext}
                      </div>
                    </div>
                  </div>

                  {item.isActive && (
                    <CaretRight size={14} weight="bold" className="text-[#C6A75E]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Active Case Context / Quick Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#8C733E] uppercase">
                Active Investigation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8DCC8] text-[#1F2A44] font-bold dark:bg-[#1F2A44] dark:text-[#C6A75E]">
                #{activeCaseId}
              </span>
            </div>

            <div className="rounded-2xl border border-[#E8DCC8] bg-white dark:border-[#1F2A44] dark:bg-[#162238] p-3 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-[#1F2A44] dark:text-[#FAF6F0]">
                  Case #{activeCaseId} - Unauthorized Transaction
                </span>
              </div>

              {/* Stage Links */}
              <div className="space-y-0.5 pt-1">
                {caseStages.map((stage) => {
                  const StageIcon = stage.icon;
                  const isStageActive = pathname === stage.href || pathname.startsWith(stage.href + '/');

                  return (
                    <Link
                      key={stage.href}
                      href={stage.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                        isStageActive
                          ? 'bg-[#FAF6F0] font-bold text-[#1F2A44] border border-[#C6A75E] dark:bg-[#0D1424] dark:text-[#C6A75E]'
                          : 'text-[#5A667E] hover:text-[#1F2A44] hover:bg-[#FAF6F0] dark:text-slate-400 dark:hover:text-[#E8DCC8] dark:hover:bg-[#1F2A44]/40'
                      }`}
                    >
                      <StageIcon size={14} weight={isStageActive ? 'fill' : 'regular'} className={isStageActive ? 'text-[#C6A75E]' : ''} />
                      <span className="truncate">{stage.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Engine Status / Telemetry */}
          <div className="rounded-2xl border border-[#E8DCC8] bg-[#F3ECE1]/70 dark:border-[#1F2A44] dark:bg-[#162238]/40 p-3.5 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8C733E]">
                SYSTEM INTEGRITY
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                <ShieldCheck size={13} weight="fill" />
                ONLINE
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-[#5A667E] dark:text-slate-400">
              <div className="flex justify-between">
                <span>ONTOLOGY SPEC:</span>
                <span className="font-bold text-[#1F2A44] dark:text-[#FAF6F0]">v2.4.0</span>
              </div>
              <div className="flex justify-between">
                <span>GRAPH CLUSTER:</span>
                <span className="font-bold text-[#1F2A44] dark:text-[#FAF6F0]">NEO4J READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile & Theme Toggle Footer */}
        <div className="p-4 border-t border-[#E8DCC8] dark:border-[#1F2A44] bg-white dark:bg-[#162238] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#1F2A44] text-[#C6A75E] border border-[#C6A75E]/30 flex items-center justify-center font-bold text-xs">
              AR
            </div>
            <div>
              <div className="text-xs font-bold text-[#1F2A44] dark:text-[#FAF6F0]">
                Anita Rao
              </div>
              <div className="text-[10px] font-mono text-[#8C733E]">
                Lead Investigator
              </div>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
