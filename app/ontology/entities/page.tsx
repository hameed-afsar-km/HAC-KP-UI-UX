'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getEntityTypes, getEntityAttributes } from '@/lib/api';
import { EntityType, EntityAttribute } from '@/lib/types';
import {
  MagnifyingGlass,
  Funnel,
  CheckCircle,
  CaretRight,
  Database
} from '@phosphor-icons/react';

export default function EntityTypesPage() {
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [attributes, setAttributes] = useState<EntityAttribute[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [types, attrs] = await Promise.all([
        getEntityTypes(),
        getEntityAttributes()
      ]);
      setEntityTypes(types);
      setAttributes(attrs);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const attributeCountMap = useMemo(() => {
    const map = new Map<number, number>();
    attributes.forEach((attr) => {
      map.set(attr.entityId, (map.get(attr.entityId) || 0) + 1);
    });
    return map;
  }, [attributes]);

  const filteredTypes = useMemo(() => {
    return entityTypes.filter((ent) => {
      const matchesSearch =
        ent.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ent.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ent.entityDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || ent.isStandard === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [entityTypes, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="rounded-3xl border transition-colors duration-200 bg-white border-[#E2E2E2] dark:bg-[#121212] dark:border-[#333333] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E85002]"
          />
          <input
            type="text"
            placeholder="Search entity classes, labels, schemas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] dark:bg-[#000000] text-xs text-[#000000] dark:text-[#F9F9F9] placeholder-[#646464] dark:placeholder-[#A7A7A7] outline-none focus:border-[#E85002]"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#E85002] text-white font-bold border-[#E85002]'
                : 'border-[#E2E2E2] dark:border-[#333333] text-[#646464] dark:text-[#A7A7A7]'
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setStatusFilter('Y')}
            className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              statusFilter === 'Y'
                ? 'bg-[#E85002] text-white font-bold border-[#E85002]'
                : 'border-[#E2E2E2] dark:border-[#333333] text-[#646464] dark:text-[#A7A7A7]'
            }`}
          >
            Standard Only
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-xs font-mono text-[#646464] dark:text-[#A7A7A7]">
            Loading entity schema definitions...
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs font-mono text-[#646464] dark:text-[#A7A7A7]">
            No entity types match your search criteria.
          </div>
        ) : (
          filteredTypes.map((ent) => {
            const count = attributeCountMap.get(ent.id) || 0;

            return (
              <Link
                key={ent.id}
                href={`/ontology/entities/${ent.id}`}
                className="p-5 rounded-3xl bg-white hover:border-[#E85002] dark:bg-[#121212] dark:hover:border-[#E85002] border border-[#E2E2E2] dark:border-[#333333] transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30">
                      ID #{ent.id}
                    </span>

                    <span className="text-[10px] font-mono text-[#646464] dark:text-[#A7A7A7]">
                      {count} Attributes
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#000000] dark:text-[#F9F9F9] group-hover:text-[#E85002] transition-colors">
                      {ent.label}
                    </h3>
                    <div className="text-xs font-mono text-[#E85002] font-semibold">
                      {ent.entityName}
                    </div>
                    <p className="text-xs text-[#646464] dark:text-[#A7A7A7] line-clamp-2 leading-relaxed pt-1">
                      {ent.entityDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E2E2E2] dark:border-[#333333] text-xs font-mono text-[#646464] dark:text-[#A7A7A7]">
                  <span>{ent.isStandard === 'Y' ? 'Standard Schema' : 'Custom Extension'}</span>
                  <span className="text-[#E85002] font-bold group-hover:underline flex items-center gap-1">
                    Inspect Schema <CaretRight size={12} weight="bold" />
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
