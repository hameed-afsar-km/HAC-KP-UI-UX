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
    <div className="w-full overflow-x-auto no-scrollbar py-4">
      <div className="flex items-stretch bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-[1.5rem] overflow-hidden shadow-sm dark:shadow-2xl min-w-max">
        {items.map((item, idx) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className={`
                  relative flex items-center gap-2.5 px-6 py-4 text-[13px] font-bold font-mono uppercase tracking-widest
                  transition-all duration-300 whitespace-nowrap group
                  ${active
                    ? 'text-[#000000] bg-[#E85002] shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]'
                    : 'text-[#8B95AD] hover:text-[#0D0F14] hover:bg-[#F6F7FB] dark:text-[#646464] dark:hover:text-[#F9F9F9] dark:hover:bg-[#222222]'
                  }
                `}
              >
                <span className={`
                  w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black flex-shrink-0
                  transition-colors duration-300
                  ${active
                    ? 'bg-[#000000] text-[#E85002]'
                    : 'bg-[#F0F0F0] text-[#8B95AD] group-hover:bg-[#E2E6F0] group-hover:text-[#0D0F14] dark:bg-[#222222] dark:text-[#A7A7A7] dark:group-hover:bg-[#333333] dark:group-hover:text-[#F9F9F9]'
                  }
                `}>
                  {item.step}
                </span>
                <Icon size={16} weight={active ? 'bold' : 'regular'} className={active ? 'text-[#000000]' : ''} />
                <span>{item.label}</span>
              </Link>
              {idx < items.length - 1 && (
                <div className="w-px self-stretch bg-[#E2E6F0] dark:bg-[#333333] flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
