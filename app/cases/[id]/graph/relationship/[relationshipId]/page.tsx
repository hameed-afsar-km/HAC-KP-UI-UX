'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowsLeftRight, User, Building, ShieldCheck, Clock, FileText } from '@phosphor-icons/react';

const mockRelationships: Record<string, {
  id: string;
  type: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  targetId: string;
  targetName: string;
  targetType: string;
  strength: string;
  evidence: { docName: string; page: number; excerpt: string }[];
  attributes: Record<string, string>;
  timeline: { date: string; event: string; type: string }[];
}> = {
  'REL-001': {
    id: 'REL-001',
    type: 'Funds Transfer',
    sourceId: 'ENT-001',
    sourceName: 'Marcus V. Thorne',
    sourceType: 'Person',
    targetId: 'ENT-003',
    targetName: 'Thorne Capital Partners LLP',
    targetType: 'Organization',
    strength: 'Strong',
    evidence: [
      { docName: 'Bank Statements', page: 12, excerpt: 'Wire initiated by signatory M. Thorne referencing TCP LLA contract #2024-0115-A' },
      { docName: 'Wire Transfer Records', page: 1, excerpt: 'Originating account: GB82 WEST 1234 5678 9012 34 — Marcus V. Thorne' },
    ],
    attributes: {
      'Transaction Reference': 'TXN-2024-01150042',
      'Amount': '$2,400,000 USD',
      'Date': '2024-01-15',
      'Status': 'Completed',
      'Channel': 'SWIFT MT103',
      'Originating Bank': 'Westminster Bank plc',
      'Beneficiary Bank': 'Zurich Trust AG',
    },
    timeline: [
      { date: '2024-01-14', event: 'Payment instruction drafted by M. Thorne via secure portal', type: 'action' },
      { date: '2024-01-15', event: 'SWIFT MT103 transmitted — $2,400,000 to TCP LLP', type: 'transaction' },
      { date: '2024-01-15', event: 'Funds received at beneficiary account', type: 'transaction' },
      { date: '2024-01-18', event: 'AML alert triggered — high-risk corridor (UK → CH)', type: 'alert' },
    ],
  },
};

export default function RelationshipDetailsPage() {
  const params = useParams();
  const relId = params.relationshipId as string;
  const caseId = params.id as string;
  const rel = mockRelationships[relId] || mockRelationships['REL-001'];

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#0D1424]">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#162238]/80 backdrop-blur-xl border-b border-[#E8DCC8] dark:border-[#1F2A44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href={`/cases/${caseId}/graph`}
              className="flex items-center gap-2 text-[#5A667E] hover:text-[#1F2A44] dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium text-sm">Back to Graph</span>
            </Link>
            <span className="text-[10px] font-mono text-[#8C733E] px-2 py-1 rounded bg-[#F3ECE1] dark:bg-[#1F2A44]">#{relId}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Visual arrow between nodes */}
        <div className="mb-8">
          <div className="bg-white dark:bg-[#162238] rounded-2xl border border-[#E8DCC8] dark:border-[#1F2A44] p-6">
            <div className="flex items-center gap-4">
              <Link
                href={`/cases/${caseId}/graph/entity/${rel.sourceId}`}
                className="flex-1 p-4 rounded-xl bg-[#FAF6F0] dark:bg-[#0D1424] border border-[#E8DCC8] dark:border-[#1F2A44] hover:border-[#C6A75E] transition-all flex items-center gap-3 group"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  {rel.sourceType === 'Person' ? <User size={20} weight="fill" /> : <Building size={20} weight="fill" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#1F2A44] dark:text-[#FAF6F0] truncate group-hover:text-[#C6A75E] transition-colors">{rel.sourceName}</p>
                  <p className="text-[10px] font-mono text-[#8C733E]">{rel.sourceType} • {rel.sourceId}</p>
                </div>
              </Link>

              <div className="flex flex-col items-center gap-1.5 shrink-0 px-2">
                <div className="h-10 w-10 rounded-xl bg-[#C6A75E] text-[#1F2A44] flex items-center justify-center shadow-lg">
                  <ArrowsLeftRight size={20} weight="fill" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase bg-[#1F2A44] text-[#C6A75E] border border-[#C6A75E]/30">
                  {rel.strength}
                </span>
              </div>

              <Link
                href={`/cases/${caseId}/graph/entity/${rel.targetId}`}
                className="flex-1 p-4 rounded-xl bg-[#FAF6F0] dark:bg-[#0D1424] border border-[#E8DCC8] dark:border-[#1F2A44] hover:border-[#C6A75E] transition-all flex items-center gap-3 group"
              >
                <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  {rel.targetType === 'Person' ? <User size={20} weight="fill" /> : <Building size={20} weight="fill" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#1F2A44] dark:text-[#FAF6F0] truncate group-hover:text-[#C6A75E] transition-colors">{rel.targetName}</p>
                  <p className="text-[10px] font-mono text-[#8C733E]">{rel.targetType} • {rel.targetId}</p>
                </div>
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-3 px-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#8C733E]">Relationship Type:</span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#1F2A44] text-[#C6A75E]">{rel.type}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-[#162238] rounded-2xl border border-[#E8DCC8] dark:border-[#1F2A44] p-6">
              <h2 className="text-lg font-bold text-[#1F2A44] dark:text-[#FAF6F0] mb-5 flex items-center gap-2">
                <FileText size={18} weight="fill" className="text-[#C6A75E]" /> Transaction Details
              </h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(rel.attributes).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <dt className="text-[10px] font-mono font-bold uppercase text-[#8C733E] tracking-wider">{key}</dt>
                    <dd className="text-sm font-medium text-[#1F2A44] dark:text-[#FAF6F0] break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="bg-white dark:bg-[#162238] rounded-2xl border border-[#E8DCC8] dark:border-[#1F2A44] p-6">
              <h2 className="text-lg font-bold text-[#1F2A44] dark:text-[#FAF6F0] mb-5 flex items-center gap-2">
                <ShieldCheck size={18} weight="fill" className="text-[#C6A75E]" /> Supporting Evidence
              </h2>
              <div className="space-y-3">
                {rel.evidence.map((ev, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#FAF6F0] dark:bg-[#0D1424] border border-[#E8DCC8] dark:border-[#1F2A44]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-[#C6A75E]" />
                      <span className="font-medium text-sm text-[#1F2A44] dark:text-[#FAF6F0]">{ev.docName}</span>
                      <span className="text-[10px] font-mono text-[#8C733E]">p.{ev.page}</span>
                    </div>
                    <p className="text-sm text-[#3E4B65] dark:text-[#E8DCC8] italic border-l-2 border-[#C6A75E] pl-3">&ldquo;{ev.excerpt}&rdquo;</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-[#162238] rounded-2xl border border-[#E8DCC8] dark:border-[#1F2A44] p-6">
              <h2 className="text-lg font-bold text-[#1F2A44] dark:text-[#FAF6F0] mb-5 flex items-center gap-2">
                <Clock size={18} weight="fill" className="text-[#C6A75E]" /> Relationship Timeline
              </h2>
              <div className="relative pl-6 border-l border-[#E8DCC8] dark:border-[#1F2A44]">
                {rel.timeline.map((item, i) => (
                  <div key={i} className="relative pb-8 last:pb-0">
                    <div className="absolute left-[-6px] top-1 h-2.5 w-2.5 rounded-full bg-[#C6A75E] border-2 border-white dark:border-[#162238] z-10" />
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-[#C6A75E] font-bold">{item.date}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${item.type === 'transaction' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : item.type === 'alert' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-[#3E4B65] dark:text-[#E8DCC8] ml-7">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#162238] rounded-2xl border border-[#E8DCC8] dark:border-[#1F2A44] p-6">
              <h3 className="text-sm font-bold text-[#1F2A44] dark:text-[#FAF6F0] mb-4 flex items-center gap-2">
                <ArrowsLeftRight size={16} weight="fill" className="text-[#C6A75E]" /> Relationship Metadata
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-[#5A667E] dark:text-slate-400">Relationship ID</dt><dd className="font-mono font-bold text-[#1F2A44] dark:text-[#FAF6F0]">{rel.id}</dd></div>
                <div className="flex justify-between"><dt className="text-[#5A667E] dark:text-slate-400">Type</dt><dd className="font-medium text-[#1F2A44] dark:text-[#FAF6F0]">{rel.type}</dd></div>
                <div className="flex justify-between"><dt className="text-[#5A667E] dark:text-slate-400">Strength</dt><dd className="font-medium text-[#1F2A44] dark:text-[#FAF6F0]">{rel.strength}</dd></div>
                <div className="flex justify-between"><dt className="text-[#5A667E] dark:text-slate-400">Case</dt><dd className="font-mono font-bold text-[#1F2A44] dark:text-[#FAF6F0]">#{caseId}</dd></div>
                <div className="flex justify-between"><dt className="text-[#5A667E] dark:text-slate-400">Evidence Count</dt><dd className="font-medium text-[#1F2A44] dark:text-[#FAF6F0]">{rel.evidence.length}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}