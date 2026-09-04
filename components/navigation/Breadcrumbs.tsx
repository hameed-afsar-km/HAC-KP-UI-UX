'use client';

import React from 'react';
import Link from 'next/link';
import { CaretRight, House } from '@phosphor-icons/react';

export interface BreadcrumbItem { label: string; href?: string; }

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] text-[#8B95AD] dark:text-[#596070]">
      <Link href="/" className="flex items-center gap-1 hover:text-[#0D0F14] dark:hover:text-[#EEF0F6] transition-colors">
        <House size={13} weight="regular" className="text-[#E85002]" />
        <span>Home</span>
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            <CaretRight size={11} className="text-[#CDD2E1] dark:text-[#252D3E]" />
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-[#0D0F14] dark:hover:text-[#EEF0F6] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-[#E85002]">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
