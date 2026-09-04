'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getRelationshipTypes, getRelationshipAttributes } from '@/lib/api';
import { RelationshipType, RelationshipAttribute } from '@/lib/types';
import {
  MagnifyingGlass,
  CaretRight,
} from '@phosphor-icons/react';

export default function RelationshipTypesPage() {
  const [relationships, setRelationships] = useState<RelationshipType[]>([]);
  const [attributes, setAttributes] = useState<RelationshipAttribute[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [rels, attrs] = await Promise.all([
        getRelationshipTypes(),
        getRelationshipAttributes()
      ]);
      setRelationships(rels);
      setAttributes(attrs);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const attributeCountMap = useMemo(() => {
    const map = new Map<number, number>();
    attributes.forEach((attr) => {
      map.set(attr.relationshipId, (map.get(attr.relationshipId) || 0) + 1);
    });
    return map;
  }, [attributes]);

  const filteredRelationships = useMemo(() => {
    return relationships.filter((rel) => {
      const matchesSearch =
        rel.relationshipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rel.relationshipDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || rel.isStandard === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [relationships, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="rounded-[2rem] border transition-colors duration-200 bg-white dark:bg-[#111111] border-[#E2E6F0] dark:border-[#333333] p-4 sm:p-5 shadow-sm dark:shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95AD] dark:text-[#646464]"
          />
          <input
            type="text"
            placeholder="Search relationship types, schemas, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] text-[13px] text-[#0D0F14] dark:text-[#F9F9F9] placeholder-[#8B95AD] dark:placeholder-[#646464] outline-none focus:border-[#E85002] shadow-inner transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2.5 rounded-xl border uppercase tracking-wider font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#E85002] text-white border-[#E85002] shadow-[0_0_15px_rgba(232,80,2,0.3)]'
                : 'bg-white dark:bg-[#000000] border-[#E2E6F0] dark:border-[#333333] text-[#8B95AD] dark:text-[#A7A7A7] hover:border-[#E85002]/50 hover:text-[#0D0F14] dark:hover:text-[#F9F9F9]'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setStatusFilter('Y')}
            className={`px-4 py-2.5 rounded-xl border uppercase tracking-wider font-bold transition-all cursor-pointer ${
              statusFilter === 'Y'
                ? 'bg-[#E85002] text-white border-[#E85002] shadow-[0_0_15px_rgba(232,80,2,0.3)]'
                : 'bg-white dark:bg-[#000000] border-[#E2E6F0] dark:border-[#333333] text-[#8B95AD] dark:text-[#A7A7A7] hover:border-[#E85002]/50 hover:text-[#0D0F14] dark:hover:text-[#F9F9F9]'
            }`}
          >
            Standard Only
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-[12px] font-mono font-bold text-[#8B95AD] dark:text-[#646464] uppercase tracking-widest">
            Loading relationship schema definitions...
          </div>
        ) : filteredRelationships.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[12px] font-mono font-bold text-[#8B95AD] dark:text-[#646464] uppercase tracking-widest">
            No relationship types match your search criteria.
          </div>
        ) : (
          filteredRelationships.map((rel) => {
            const count = attributeCountMap.get(rel.id) || 0;

            return (
              <Link
                key={rel.id}
                href={`/ontology/relationships/${rel.id}`}
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] hover:border-[#E85002] transition-all duration-300 shadow-sm dark:shadow-xl overflow-hidden animate-fade-up"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(232,80,2,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E85002]/20 text-[#E85002] border border-[#E85002]/50">
                      ID #{rel.id}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#8B95AD] dark:text-[#646464] bg-[#F6F7FB] dark:bg-[#000000] px-2.5 py-1 rounded-md border border-[#E2E6F0] dark:border-[#333333]">
                      {count} Attributes
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-[16px] font-bold text-[#0D0F14] dark:text-[#F9F9F9] group-hover:text-[#E85002] transition-colors leading-snug">
                      {rel.relationshipName}
                    </h3>
                    <p className="text-[13px] text-[#8B95AD] dark:text-[#A7A7A7] line-clamp-2 leading-relaxed pt-2">
                      {rel.relationshipDescription}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-[#E2E6F0] dark:border-[#333333] text-[11px] font-mono font-bold text-[#8B95AD] dark:text-[#646464] uppercase tracking-wider">
                  <span>{rel.isStandard === 'Y' ? 'Standard Schema' : 'Custom Extension'}</span>
                  <span className="text-[#E85002] font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Inspect <CaretRight size={14} weight="bold" />
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}