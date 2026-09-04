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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="bg-[#111111] border border-[#333333] rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#333333] bg-[#000000]">
          <Breadcrumbs
            items={[
              { label: 'Knowledge Base', href: '/ontology/entities' },
              ...(isEntities ? [{ label: 'Entity Types' }] : []),
              ...(isRelationships ? [{ label: 'Relationship Types' }] : []),
            ]}
          />
        </div>
        <div className="px-8 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[12px] font-mono font-bold text-[#A7A7A7] uppercase tracking-widest">Knowledge Base</p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#F9F9F9] mt-2">
              {isEntities ? 'Entity Types' : isRelationships ? 'Relationship Types' : 'Knowledge Base'}
            </h1>
            <p className="text-[14px] text-[#646464] mt-2 max-w-xl">
              The categories ARGUS AI uses to identify and classify everything it finds in your files.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-[#000000] text-[#A7A7A7] border border-[#333333]">33 entity types</span>
            <span className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-[#000000] text-[#A7A7A7] border border-[#333333]">18 relationship types</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 pb-0 flex items-stretch gap-6 border-t border-[#333333] bg-[#000000]">
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
                  relative flex items-center gap-2 py-4 text-[13px] font-bold font-mono uppercase tracking-widest transition-all duration-300
                  ${tab.active
                    ? 'text-[#E85002] border-b-2 border-[#E85002]'
                    : 'text-[#646464] hover:text-[#F9F9F9] border-b-2 border-transparent'
                  }
                `}
              >
                <Icon size={16} weight={tab.active ? 'fill' : 'bold'} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div>{children}</div>
    </div>
    </div>
  );
}
