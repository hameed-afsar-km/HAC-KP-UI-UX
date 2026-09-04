'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Info,
  CloudArrowUp,
  Files,
  Cpu,
  MagnifyingGlass,
  ShieldCheck,
  Fingerprint,
  ShareNetwork,
} from '@phosphor-icons/react';

const navItems = (caseId: string | number) => [
  { label: 'Case Details',       step: 0, href: `/cases/${caseId}`,                   icon: Info,             exact: true  },
  { label: 'Upload',             step: 1, href: `/cases/${caseId}/upload`,            icon: CloudArrowUp,     exact: false },
  { label: 'Evidence',           step: 2, href: `/cases/${caseId}/evidence`,          icon: Files,            exact: false },
  { label: 'Extraction Jobs',    step: 3, href: `/cases/${caseId}/jobs`,              icon: Cpu,              exact: false },
  { label: 'Explorer',           step: 4, href: `/cases/${caseId}/extractions`,       icon: MagnifyingGlass,  exact: false },
  { label: 'Quality Review',     step: 5, href: `/cases/${caseId}/quality-review`,    icon: ShieldCheck,      exact: false },
  { label: 'Resolution Review',  step: 6, href: `/cases/${caseId}/resolution-review`, icon: Fingerprint,      exact: false },
  { label: 'Graph',              step: 7, href: `/cases/${caseId}/graph`,             icon: ShareNetwork,     exact: false },
];

export default function CaseSubNav({ caseId }: { caseId: string | number }) {
  const pathname = usePathname();

  const items = navItems(caseId);
  const isActive = (item: ReturnType<typeof navItems>[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex items-stretch bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm min-w-max">
        {items.map((item, idx) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-[12px] font-medium
                  transition-all duration-150 whitespace-nowrap group
                  ${active
                    ? 'text-[#E85002] bg-[#E85002]/5 dark:bg-[#E85002]/8'
                    : 'text-[#5A6480] dark:text-[#8B95AD] hover:text-[#0D0F14] dark:hover:text-[#EEF0F6] hover:bg-[#F1F3F9] dark:hover:bg-[#1E2435]'
                  }
                `}
              >
                <span className={`
                  w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0
                  transition-colors duration-150
                  ${active
                    ? 'bg-[#E85002] text-white'
                    : 'bg-[#F1F3F9] dark:bg-[#1E2435] text-[#8B95AD] group-hover:bg-[#E85002]/10 group-hover:text-[#E85002]'
                  }
                `}>
                  {item.step}
                </span>
                <Icon size={14} weight={active ? 'fill' : 'regular'} />
                <span>{item.label}</span>

                {/* Sliding bottom indicator */}
                <span className={`
                  absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#E85002]
                  transition-all duration-200
                  ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                `} />
              </Link>
              {idx < items.length - 1 && (
                <div className="w-px self-stretch bg-[#E2E6F0] dark:bg-[#252D3E] flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
