'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Case } from '@/lib/types';
import {
  UserCircle,
  CalendarBlank,
  Clock,
  ShareNetwork,
  ShieldCheck,
  CaretRight,
  House,
  Briefcase
} from '@phosphor-icons/react';

function statusDot(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':  return 'bg-[#E85002] shadow-[0_0_8px_rgba(232,80,2,0.5)]';
    case 'closed':  return 'bg-[#646464]';
    case 'pending': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    default:        return 'bg-[#E85002]';
  }
}

function statusLabel(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':  return 'text-[#E85002] bg-[#E85002]/10 border-[#E85002]/30';
    case 'closed':  return 'text-[#A7A7A7] bg-[#333333] border-[#646464]/30';
    case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    default:        return 'text-[#E85002] bg-[#E85002]/10 border-[#E85002]/30';
  }
}

function categoryLabel(cat?: string) {
  switch (cat?.toLowerCase()) {
    case 'fraud':           return 'text-[#000000] bg-[#E85002] border-[#E85002]';
    case 'kyc':             return 'text-white bg-blue-600 border-blue-500';
    case 'payment dispute': return 'text-black bg-amber-500 border-amber-500';
    default:                return 'text-[#F9F9F9] bg-[#333333] border-[#646464]';
  }
}

export default function CaseHeader({ caseData }: { caseData: Case }) {
  const pathname = usePathname();

  // Determine current page label for breadcrumb
  const pageLabels: Record<string, string> = {
    'evidence': 'Files',
    'upload': 'Upload',
    'jobs': 'Analysis',
    'extractions': 'Findings',
    'quality-review': 'Verify',
    'resolution-review': 'Match',
    'graph': 'Map',
  };
  const segments = pathname?.split('/') || [];
  const lastSeg = segments[segments.length - 1];
  const currentPage = pageLabels[lastSeg] || null;

  return (
    <div className="bg-[#111111] border border-[#333333] rounded-[2rem] overflow-hidden shadow-2xl">
      {/* Breadcrumb bar */}
      <div className="flex items-center justify-between px-8 py-3.5 border-b border-[#333333] bg-[#000000]">
        <nav className="flex items-center gap-2 text-[12px] font-mono text-[#646464]">
          <Link href="/" className="flex items-center gap-1.5 hover:text-[#F9F9F9] transition-colors">
            <House size={13} weight="bold" className="text-[#E85002]" />
            <span>Home</span>
          </Link>
          <CaretRight size={11} className="text-[#444444]" />
          <Link href="/cases" className="hover:text-[#F9F9F9] transition-colors">
            Cases
          </Link>
          <CaretRight size={11} className="text-[#444444]" />
          <Link href={`/cases/${caseData.id}`} className="hover:text-[#E85002] transition-colors font-bold text-[#E85002]">
            Case #{caseData.id}
          </Link>
          {currentPage && (
            <>
              <CaretRight size={11} className="text-[#444444]" />
              <span className="text-[#A7A7A7] font-bold">{currentPage}</span>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#E85002] bg-[#E85002]/10 px-3 py-1 rounded-md border border-[#E85002]/25">
          <ShieldCheck size={13} weight="fill" />
          <span>Verified Record</span>
        </div>
      </div>

      {/* Main case info */}
      <div className="px-8 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-3 min-w-0">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-[11px] font-mono font-black uppercase tracking-wider bg-[#E85002] text-[#000000]">
              Case #{caseData.id}
            </span>
            {caseData.caseCategory && (
              <span className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider border ${categoryLabel(caseData.caseCategory)}`}>
                {caseData.caseCategory}
              </span>
            )}
            <span className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider border flex items-center gap-2 ${statusLabel(caseData.status)}`}>
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${statusDot(caseData.status)}`} />
              {caseData.status || 'Active'}
            </span>
          </div>

          {/* Case title */}
          <h1 className="text-xl sm:text-2xl font-black text-[#F9F9F9] leading-snug">
            {caseData.caseDescription}
          </h1>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-5 text-[12px] text-[#A7A7A7]">
            <span className="flex items-center gap-2">
              <UserCircle size={15} weight="bold" className="text-[#E85002]" />
              <span>Lead:</span>
              <span className="font-bold text-[#F9F9F9]">{caseData.assignedOfficers}</span>
            </span>
            <span className="flex items-center gap-2">
              <CalendarBlank size={15} weight="bold" className="text-[#E85002]" />
              <span>Opened:</span>
              <span className="font-mono font-bold text-[#F9F9F9]">
                {new Date(caseData.dateAdded).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <Clock size={15} weight="bold" className="text-[#646464]" />
              <span>Updated:</span>
              <span className="font-mono font-bold text-[#F9F9F9]">
                {new Date(caseData.dateModified).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <Link
            href={`/cases/${caseData.id}/graph`}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 bg-[#E85002] text-[#000000] text-[12px] font-black font-mono uppercase tracking-widest rounded-xl transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(232,80,2,0.3)] hover:shadow-[0_0_25px_rgba(232,80,2,0.5)] active:scale-95"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat group-hover:animate-shimmer" />
            <ShareNetwork size={16} weight="bold" className="relative z-10" />
            <span className="relative z-10">View Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
