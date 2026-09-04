'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { Cube, GitBranch } from '@phosphor-icons/react';

export default function OntologyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEntities      = pathname?.includes('/ontology/entities');
  const isRelationships = pathname?.includes('/ontology/relationships');

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Header */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-3 border-b border-[#E2E6F0] dark:border-[#252D3E] bg-[#F6F7FB]/50 dark:bg-[#0E1117]/20">
          <Breadcrumbs
            items={[
              { label: 'Knowledge Base', href: '/ontology/entities' },
              ...(isEntities ? [{ label: 'Entity Types' }] : []),
              ...(isRelationships ? [{ label: 'Relationship Types' }] : []),
            ]}
          />
        </div>
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-[#8B95AD] uppercase tracking-widest">Knowledge Base</p>
            <h1 className="text-2xl font-bold text-[#0D0F14] dark:text-[#EEF0F6] mt-1">
              {isEntities ? 'Entity Types' : isRelationships ? 'Relationship Types' : 'Knowledge Base'}
            </h1>
            <p className="text-[13px] text-[#8B95AD] mt-1">
              The categories ARGUS AI uses to identify and classify everything it finds in your files.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-muted">33 entity types</span>
            <span className="badge badge-muted">18 relationship types</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-0 flex items-stretch gap-0 border-t border-[#E2E6F0] dark:border-[#252D3E]">
          {[
            { href: '/ontology/entities',      label: 'Entity Types',      icon: Cube,      active: isEntities      },
            { href: '/ontology/relationships', label: 'Relationships',     icon: GitBranch, active: isRelationships  },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  relative flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium transition-all duration-150
                  ${tab.active
                    ? 'text-[#E85002] border-b-2 border-[#E85002]'
                    : 'text-[#8B95AD] hover:text-[#0D0F14] dark:hover:text-[#EEF0F6] border-b-2 border-transparent'
                  }
                `}
              >
                <Icon size={15} weight={tab.active ? 'fill' : 'regular'} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
