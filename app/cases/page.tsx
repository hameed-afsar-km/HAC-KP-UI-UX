'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getCases } from '@/lib/api';
import { Case } from '@/lib/types';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import {
  MagnifyingGlass,
  Funnel,
  ArrowRight,
  ArrowsDownUp,
  ArrowUp,
  ArrowDown,
  Briefcase,
  CalendarBlank,
  UserCircle,
  DotsThree,
} from '@phosphor-icons/react';

function statusStyle(s?: string) {
  switch (s?.toLowerCase()) {
    case 'active':  return 'badge badge-green';
    case 'closed':  return 'badge badge-muted';
    case 'pending': return 'badge badge-amber';
    default:        return 'badge badge-green';
  }
}

function categoryColor(cat: string) {
  switch (cat?.toLowerCase()) {
    case 'fraud':           return 'badge badge-orange';
    case 'kyc':             return 'badge badge-blue';
    case 'payment dispute': return 'badge badge-amber';
    default:                return 'badge badge-muted';
  }
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('ALL');
  const [sort, setSort] = useState<'id' | 'dateModified' | 'caseDescription'>('id');
  const [dir, setDir]   = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'card'>('card');

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

  const handleSort = (f: typeof sort) => {
    if (sort === f) setDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSort(f); setDir('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sort }) =>
    sort !== field ? <ArrowsDownUp size={11} className="opacity-30" /> :
    dir === 'asc'  ? <ArrowUp size={11} className="text-[#E85002]" /> :
                     <ArrowDown size={11} className="text-[#E85002]" />;

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-3 border-b border-[#E2E6F0] dark:border-[#252D3E] bg-[#F6F7FB]/50 dark:bg-[#0E1117]/20">
          <Breadcrumbs items={[{ label: 'Cases' }]} />
        </div>
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-[#8B95AD] uppercase tracking-widest">Investigation Portfolio</p>
            <h1 className="text-2xl font-bold text-[#0D0F14] dark:text-[#EEF0F6] mt-1">All Cases</h1>
            <p className="text-[13px] text-[#8B95AD] mt-1">
              {filtered.length} {filtered.length === 1 ? 'case' : 'cases'} found
            </p>
          </div>
          <Link
            href="/cases/1001"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-[#E85002] hover:bg-[#F16001] text-white text-[13px] font-semibold rounded-xl transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-[#E85002]/20 active:scale-95"
          >
            Open Priority Case <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={15} weight="regular" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B95AD]" />
          <input
            type="text"
            placeholder="Search by ID, title, or investigator..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E6F0] dark:border-[#252D3E] bg-white dark:bg-[#161B27] text-[13px] text-[#0D0F14] dark:text-[#EEF0F6] placeholder-[#8B95AD] outline-none focus:border-[#E85002] dark:focus:border-[#E85002] transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`
                px-3.5 py-2 rounded-xl text-[12px] font-semibold border whitespace-nowrap transition-all duration-150 cursor-pointer
                ${cat === c
                  ? 'bg-[#E85002] border-[#E85002] text-white shadow-sm'
                  : 'bg-white dark:bg-[#161B27] border-[#E2E6F0] dark:border-[#252D3E] text-[#5A6480] dark:text-[#8B95AD] hover:border-[#E85002] hover:text-[#E85002]'
                }
              `}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cases — Card Grid ────────────────────────────────────────────── */}
      {view === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl skeleton" />
            ))
          ) : filtered.map((c, idx) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className={`
                group bg-white dark:bg-[#161B27]
                border border-[#E2E6F0] dark:border-[#252D3E]
                rounded-2xl p-5 shadow-sm card-hover
                hover:border-[#E85002]/30 dark:hover:border-[#E85002]/30
                animate-fade-up
                ${idx < 3 ? `stagger-${idx + 1}` : ''}
              `}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-bold text-[#E85002]">#{c.id}</span>
                  <span className={categoryColor(c.caseCategory)}>{c.caseCategory}</span>
                </div>
                <span className={`badge badge-green flex items-center gap-1`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {c.status || 'Active'}
                </span>
              </div>

              <h3 className="text-[14px] font-semibold text-[#0D0F14] dark:text-[#EEF0F6] group-hover:text-[#E85002] transition-colors leading-snug mb-3">
                {c.caseDescription}
              </h3>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E2E6F0] dark:border-[#252D3E]">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8B95AD]">
                    <UserCircle size={12} weight="regular" />
                    <span>{c.assignedOfficers}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8B95AD]">
                    <CalendarBlank size={12} weight="regular" />
                    <span className="tabular-nums">{new Date(c.dateModified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#F1F3F9] dark:bg-[#1E2435] group-hover:bg-[#E85002] transition-colors">
                  <ArrowRight size={14} className="text-[#8B95AD] group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <Briefcase size={40} weight="thin" className="text-[#8B95AD] mb-3" />
              <p className="text-[15px] font-semibold text-[#5A6480] dark:text-[#8B95AD]">No cases found</p>
              <p className="text-[13px] text-[#8B95AD] mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
