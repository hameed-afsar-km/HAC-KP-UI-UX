'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getCases } from '@/lib/api';
import { Case } from '@/lib/types';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import {
  MagnifyingGlass,
  ArrowRight,
  Briefcase,
  CalendarBlank,
  UserCircle,
} from '@phosphor-icons/react';

function statusStyle(s?: string) {
  switch (s?.toLowerCase()) {
    case 'active':  return 'bg-[#E85002]/20 text-[#E85002] border-[#E85002]/50';
    case 'closed':  return 'bg-[#E2E6F0] dark:bg-[#333333] text-[#8B95AD] dark:text-[#A7A7A7] border-[#E2E6F0] dark:border-[#646464]';
    case 'pending': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
    default:        return 'bg-[#E85002]/20 text-[#E85002] border-[#E85002]/50';
  }
}

function categoryColor(cat: string) {
  switch (cat?.toLowerCase()) {
    case 'fraud':           return 'bg-[#E85002] text-white border-[#E85002]';
    case 'kyc':             return 'bg-blue-600 text-white border-blue-500';
    case 'payment dispute': return 'bg-amber-500 text-black border-amber-500';
    default:                return 'bg-[#E2E6F0] dark:bg-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] border-[#E2E6F0] dark:border-[#646464]';
  }
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('ALL');
  const [sort, setSort] = useState<'id' | 'dateModified' | 'caseDescription'>('id');
  const [dir, setDir]   = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCases().then((d) => { setCases(d); setLoading(false); });
  }, []);

  const categories = useMemo(() => {
    const s = new Set(cases.map((c) => c.caseCategory).filter(Boolean));
    return ['ALL', ...Array.from(s)];
  }, [cases]);

  const filtered = useMemo(() =>
    cases
      .filter((c) => {
        const q = query.toLowerCase();
        const matchQ = !q || c.caseDescription.toLowerCase().includes(q) || String(c.id).includes(q) || c.assignedOfficers.toLowerCase().includes(q);
        const matchC = cat === 'ALL' || c.caseCategory === cat;
        return matchQ && matchC;
      })
      .sort((a, b) => {
        let va: any = a[sort], vb: any = b[sort];
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        return va < vb ? (dir === 'asc' ? -1 : 1) : va > vb ? (dir === 'asc' ? 1 : -1) : 0;
      }),
  [cases, query, cat, sort, dir]);

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-[2rem] overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000]">
          <Breadcrumbs items={[{ label: 'Cases' }]} />
        </div>
        <div className="px-8 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[12px] font-mono font-bold text-[#8B95AD] dark:text-[#A7A7A7] uppercase tracking-widest">Investigation Portfolio</p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0D0F14] dark:text-[#F9F9F9] mt-2">All Cases</h1>
            <p className="text-[14px] text-[#8B95AD] dark:text-[#646464] mt-2">
              {filtered.length} {filtered.length === 1 ? 'case' : 'cases'} found
            </p>
          </div>
          <Link
            href="/cases/1001"
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[#E85002] text-white text-[13px] font-bold font-mono uppercase tracking-widest rounded-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat group-hover:animate-shimmer" />
            <span className="relative z-10">Open Priority Case</span>
            <ArrowRight size={16} weight="bold" className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95AD] dark:text-[#646464]" />
          <input
            type="text"
            placeholder="Search by ID, title, or investigator..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E6F0] dark:border-[#333333] bg-white dark:bg-[#000000] text-[14px] font-medium text-[#0D0F14] dark:text-[#F9F9F9] placeholder-[#8B95AD] dark:placeholder-[#646464] outline-none focus:border-[#E85002] transition-colors shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`
                px-4 py-2.5 rounded-xl text-[12px] font-bold font-mono uppercase tracking-wider border whitespace-nowrap transition-all duration-200 cursor-pointer
                ${cat === c
                  ? 'bg-[#E85002] border-[#E85002] text-white shadow-[0_0_15px_rgba(232,80,2,0.3)]'
                  : 'bg-white dark:bg-[#111111] border-[#E2E6F0] dark:border-[#333333] text-[#8B95AD] dark:text-[#A7A7A7] hover:border-[#E85002]/50 hover:text-[#0D0F14] dark:hover:text-[#F9F9F9]'
                }
              `}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] animate-pulse" />
          ))
        ) : filtered.map((c, idx) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className={`
              group relative flex flex-col bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl p-6 shadow-sm
              hover:border-[#E85002] transition-all duration-300 overflow-hidden
              animate-fade-up
            `}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(232,80,2,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13px] font-black text-[#E85002]">#{c.id}</span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${categoryColor(c.caseCategory)}`}>
                  {c.caseCategory}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 ${statusStyle(c.status)}`}>
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${c.status?.toLowerCase() === 'active' ? 'bg-[#E85002]' : c.status?.toLowerCase() === 'pending' ? 'bg-amber-500' : 'bg-[#8B95AD]'}`} />
                {c.status || 'Active'}
              </span>
            </div>

            <h3 className="text-[15px] font-bold text-[#0D0F14] dark:text-[#F9F9F9] group-hover:text-[#E85002] transition-colors leading-relaxed mb-6 flex-1">
              {c.caseDescription}
            </h3>

            <div className="relative z-10 flex items-center justify-between gap-3 pt-4 border-t border-[#E2E6F0] dark:border-[#333333]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[12px] font-medium text-[#8B95AD] dark:text-[#A7A7A7]">
                  <UserCircle size={14} weight="bold" className="text-[#8B95AD] dark:text-[#646464]" />
                  <span>{c.assignedOfficers}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-medium text-[#8B95AD] dark:text-[#A7A7A7]">
                  <CalendarBlank size={14} weight="bold" className="text-[#8B95AD] dark:text-[#646464]" />
                  <span className="tabular-nums font-mono">{new Date(c.dateModified).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] group-hover:bg-[#E85002] group-hover:border-[#E85002] transition-colors duration-300">
                <ArrowRight size={16} weight="bold" className="text-[#8B95AD] dark:text-[#A7A7A7] group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl">
            <Briefcase size={48} weight="thin" className="text-[#E2E6F0] dark:text-[#333333] mb-4" />
            <p className="text-[16px] font-bold text-[#0D0F14] dark:text-[#F9F9F9]">No cases found</p>
            <p className="text-[14px] text-[#8B95AD] dark:text-[#646464] mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}