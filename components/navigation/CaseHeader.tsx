'use client';

import React from 'react';
import Link from 'next/link';
import { Case } from '@/lib/types';
import Breadcrumbs from './Breadcrumbs';
import { UserCircle, CalendarBlank, Clock, ShareNetwork, ShieldCheck } from '@phosphor-icons/react';

function statusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':  return 'badge badge-green';
    case 'closed':  return 'badge badge-muted';
    case 'pending': return 'badge badge-amber';
    default:        return 'badge badge-green';
  }
}

function categoryStyle(cat: string) {
  switch (cat?.toLowerCase()) {
    case 'fraud':           return 'badge badge-orange';
    case 'kyc':             return 'badge badge-blue';
    case 'payment dispute': return 'badge badge-amber';
    default:                return 'badge badge-muted';
  }
}

export default function CaseHeader({ caseData, currentTabLabel }: { caseData: Case; currentTabLabel?: string }) {
  const crumbs = [
    { label: 'Cases', href: '/cases' },
    { label: `Case #${caseData.id}`, href: `/cases/${caseData.id}` },
    ...(currentTabLabel ? [{ label: currentTabLabel }] : []),
  ];

  return (
    <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm animate-fade-up">
      {/* Top meta bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#E2E6F0] dark:border-[#252D3E] bg-[#F6F7FB]/60 dark:bg-[#0E1117]/30">
        <Breadcrumbs items={crumbs} />
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E85002]">
          <ShieldCheck size={13} weight="fill" />
          <span>Verified Record</span>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2.5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge bg-[#E85002] text-white border-[#E85002] font-mono">
                Case #{caseData.id}
              </span>
              <span className={categoryStyle(caseData.caseCategory)}>
                {caseData.caseCategory}
              </span>
              <span className={statusStyle(caseData.status)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {caseData.status || 'Active'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-[#0D0F14] dark:text-[#EEF0F6] leading-snug max-w-2xl">
              {caseData.caseDescription}
            </h1>

            {/* Meta strip */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] text-[#5A6480] dark:text-[#8B95AD]">
              <span className="flex items-center gap-1.5">
                <UserCircle size={14} weight="regular" className="text-[#E85002]" />
                <span>Lead:</span>
                <span className="font-semibold text-[#0D0F14] dark:text-[#EEF0F6]">{caseData.assignedOfficers}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarBlank size={14} weight="regular" className="text-[#E85002]" />
                <span>Opened:</span>
                <span className="font-medium tabular-nums">{new Date(caseData.dateAdded).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} weight="regular" />
                <span>Updated:</span>
                <span className="font-medium tabular-nums">{new Date(caseData.dateModified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <Link
              href={`/cases/${caseData.id}/graph`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E85002] hover:bg-[#F16001] text-white text-[13px] font-semibold rounded-xl transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-[#E85002]/20 active:scale-95"
            >
              <ShareNetwork size={15} weight="regular" />
              <span>View Connections Map</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
