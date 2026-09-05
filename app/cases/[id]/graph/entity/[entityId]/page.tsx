'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Buildings, MapPin, ShieldCheck, Clock, Hash, Tag, FileText, MagnifyingGlass, DotsThreeVertical, Copy, PencilSimple, Trash, ArrowSquareOut } from '@phosphor-icons/react';

const mockEntities: Record<string, {
  id: string;
  type: string;
  name: string;
  aliases: string[];
  riskLevel: string;
  summary: string;
  attributes: Record<string, string>;
  connections: { id: string; name: string; type: string; relationship: string; strength: string }[];
  timeline: { date: string; event: string; type: string }[];
  documents: { id: string; name: string; type: string; date: string; pages: number }[];
}> = {
  'ENT-001': {
    id: 'ENT-001',
    type: 'Person',
    name: 'Marcus V. Thorne',
    aliases: ['M. Thorne', 'Marcus Thorne', 'M.V. Thorne'],
    riskLevel: 'HIGH',
    summary: 'Primary suspect in unauthorized wire transfer scheme. Linked to 3 shell companies and 12 offshore accounts.',
    attributes: {
      'Date of Birth': '1972-03-14',
      'Nationality': 'British',
      'Passport Number': 'GB1234567',
      'Tax ID': 'GB987654321',
      'Primary Address': '42 Mayfair Mews, London W1J 7NT, UK',
      'Phone': '+44 20 7946 0958',
      'Email': 'm.thorne@thorne-capital.co.uk',
      'Occupation': 'Investment Director',
    },
    connections: [
      { id: 'ENT-003', name: 'Thorne Capital Partners LLP', type: 'Organization', relationship: 'Director Of', strength: 'Strong' },
      { id: 'ENT-007', name: 'Victoria Aster', type: 'Person', relationship: 'Spouse Of', strength: 'Strong' },
      { id: 'ENT-012', name: 'Cayman Holdings Ltd', type: 'Organization', relationship: 'Beneficial Owner', strength: 'Medium' },
    ],
    timeline: [
      { date: '2024-01-15', event: 'Wire transfer initiated: $2.4M to Cayman Holdings', type: 'transaction' },
      { date: '2024-01-18', event: 'Flagged by AML monitoring system', type: 'alert' },
      { date: '2024-01-22', event: 'Case opened: INV-2024-001001', type: 'case' },
      { date: '2024-02-03', event: 'Search warrant executed at Mayfair address', type: 'action' },
    ],
    documents: [
      { id: 'DOC-0442', name: 'Passport Copy', type: 'Identification', date: '2024-01-20', pages: 2 },
      { id: 'DOC-0443', name: 'Company Registry Extract', type: 'Corporate', date: '2024-01-22', pages: 8 },
      { id: 'DOC-0444', name: 'Bank Statements (Redacted)', type: 'Financial', date: '2024-02-01', pages: 47 },
    ],
  },
  'ENT-003': {
    id: 'ENT-003',
    type: 'Organization',
    name: 'Thorne Capital Partners LLP',
    aliases: ['TCP LLP', 'Thorne Capital'],
    riskLevel: 'HIGH',
    summary: 'London-based investment vehicle used as primary conduit for layering illicit funds. No legitimate trading activity detected.',
    attributes: {
      'Registration Number': 'OC423119',
      'Incorporation Date': '2018-06-12',
      'Registered Address': '12 Pall Mall, London SW1Y 5EA, UK',
      'Status': 'Active',
      'SIC Code': '64306 - Financial Leasing',
      'Authorized Capital': '£50,000,000',
    },
    connections: [
      { id: 'ENT-001', name: 'Marcus V. Thorne', type: 'Person', relationship: 'Director Of', strength: 'Strong' },
      { id: 'ENT-012', name: 'Cayman Holdings Ltd', type: 'Organization', relationship: 'Parent Company', strength: 'Strong' },
    ],
    timeline: [
      { date: '2018-06-12', event: 'Incorporated at Companies House', type: 'corporate' },
      { date: '2023-11-01', event: 'First flagged transaction received', type: 'alert' },
      { date: '2024-01-15', event: 'Received $2.4M from unknown source', type: 'transaction' },
    ],
    documents: [
      { id: 'DOC-0450', name: 'Certificate of Incorporation', type: 'Corporate', date: '2018-06-12', pages: 3 },
      { id: 'DOC-0451', name: 'PSC Register', type: 'Corporate', date: '2024-01-15', pages: 5 },
    ],
  },
};

export default function EntityDetailsPage() {
  const params = useParams();
  const entityId = params.entityId as string;
  const caseId = params.id as string;
  const entity = mockEntities[entityId] || mockEntities['ENT-001'];
  const [activeTab, setActiveTab] = useState<'profile' | 'connections' | 'timeline' | 'documents'>('profile');

  const riskColors: Record<string, string> = {
    HIGH: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    LOW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    Person: <User size={18} weight="fill" />,
    Organization: <Buildings size={18} weight="fill" />,
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User, count: Object.keys(entity.attributes).length },
    { id: 'connections' as const, label: 'Connections', icon: MagnifyingGlass, count: entity.connections.length },
    { id: 'timeline' as const, label: 'Timeline', icon: Clock, count: entity.timeline.length },
    { id: 'documents' as const, label: 'Documents', icon: FileText, count: entity.documents.length },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB] dark:bg-[#000000] text-[#0D0F14] dark:text-[#F9F9F9]">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl border-b border-[#E2E6F0] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href={`/cases/${caseId}/graph`}
              className="flex items-center gap-2 text-[#555E6D] hover:text-[#0D0F14] dark:text-[#A7A7A7] dark:hover:text-[#F9F9F9] transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium text-sm">Back to Graph</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${riskColors[entity.riskLevel]}`}>
                <ShieldCheck size={12} />
                <span>{entity.riskLevel} RISK</span>
              </div>
              <span className="text-[10px] font-mono text-[#E85002] px-2.5 py-1 rounded-lg bg-[#E85002]/10 border border-[#E85002]/20 font-bold">#{entityId}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-[#111111] text-[#E85002] border border-[#E2E6F0] dark:border-[#333333] shadow-md flex items-center justify-center">
                {typeIcons[entity.type] || <User size={28} weight="duotone" />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{entity.name}</h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${riskColors[entity.riskLevel]}`}>
                    {entity.type}
                  </span>
                </div>
                <p className="text-[#555E6D] dark:text-[#A7A7A7] mt-1 text-sm">{entity.summary}</p>
                {entity.aliases.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {entity.aliases.map((alias, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#161616] text-[#555E6D] dark:text-[#A7A7A7] border border-[#E2E6F0] dark:border-[#333333]">
                        AKA: {alias}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="p-2 rounded-xl bg-white dark:bg-[#161616] border border-[#E2E6F0] dark:border-[#333333] text-[#555E6D] hover:text-[#0D0F14] dark:text-[#A7A7A7] dark:hover:text-[#F9F9F9] hover:bg-[#F6F7FB] dark:hover:bg-[#222222] transition-colors"><Copy size={16} /></button>
              <button className="p-2 rounded-xl bg-white dark:bg-[#161616] border border-[#E2E6F0] dark:border-[#333333] text-[#555E6D] hover:text-[#0D0F14] dark:text-[#A7A7A7] dark:hover:text-[#F9F9F9] hover:bg-[#F6F7FB] dark:hover:bg-[#222222] transition-colors"><PencilSimple size={16} /></button>
              <button className="p-2 rounded-xl bg-white dark:bg-[#161616] border border-[#E2E6F0] dark:border-[#333333] text-[#555E6D] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash size={16} /></button>
              <button className="p-2 rounded-xl bg-white dark:bg-[#161616] border border-[#E2E6F0] dark:border-[#333333] text-[#555E6D] hover:text-[#0D0F14] dark:text-[#A7A7A7] dark:hover:text-[#F9F9F9] hover:bg-[#F6F7FB] dark:hover:bg-[#222222] transition-colors"><DotsThreeVertical size={16} /></button>
            </div>
          </div>

          <div className="flex gap-1 bg-white dark:bg-[#111111] rounded-xl p-1 border border-[#E2E6F0] dark:border-[#333333] w-fit shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#E85002] text-white shadow-sm'
                    : 'text-[#555E6D] hover:text-[#0D0F14] hover:bg-[#F6F7FB] dark:text-[#A7A7A7] dark:hover:bg-[#1A1A1A] dark:hover:text-[#F9F9F9]'
                }`}
              >
                <tab.icon size={14} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === tab.id ? 'bg-black/20 text-white' : 'bg-[#F6F7FB] text-[#555E6D] dark:bg-[#222222] dark:text-[#A7A7A7]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'profile' && (
              <section className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E2E6F0] dark:border-[#333333] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#0D0F14] dark:text-[#F9F9F9] mb-5 flex items-center gap-2">
                  <Tag size={18} weight="fill" className="text-[#E85002]" /> Attributes
                </h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(entity.attributes).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <dt className="text-[10px] font-mono font-bold uppercase text-[#8B95AD] dark:text-[#A7A7A7] tracking-wider">{key}</dt>
                      <dd className="text-sm font-medium text-[#0D0F14] dark:text-[#F9F9F9] break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {activeTab === 'connections' && (
              <section className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E2E6F0] dark:border-[#333333] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#0D0F14] dark:text-[#F9F9F9] mb-5 flex items-center gap-2">
                  <MagnifyingGlass size={18} weight="fill" className="text-[#E85002]" /> Network Connections
                </h2>
                <div className="space-y-3">
                  {entity.connections.map((conn) => (
                    <Link
                      key={conn.id}
                      href={`/cases/${caseId}/graph/entity/${conn.id}`}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-[#F6F7FB] dark:bg-[#161616] border border-[#E2E6F0] dark:border-[#333333] hover:border-[#E85002] dark:hover:border-[#E85002] transition-all"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${conn.type === 'Person' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {typeIcons[conn.type] || <User size={18} weight="fill" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#0D0F14] dark:text-[#F9F9F9] truncate">{conn.name}</p>
                        <p className="text-[11px] font-mono text-[#8B95AD] dark:text-[#A7A7A7]">{conn.type} • {conn.relationship}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[9px] font-mono font-bold ${conn.strength === 'Strong' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {conn.strength}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'timeline' && (
              <section className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E2E6F0] dark:border-[#333333] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#0D0F14] dark:text-[#F9F9F9] mb-5 flex items-center gap-2">
                  <Clock size={18} weight="fill" className="text-[#E85002]" /> Activity Timeline
                </h2>
                <div className="relative pl-6 border-l border-[#E2E6F0] dark:border-[#333333]">
                  {entity.timeline.map((item, i) => (
                    <div key={i} className="relative pb-8 last:pb-0">
                      <div className="absolute left-[-6px] top-1 h-2.5 w-2.5 rounded-full bg-[#E85002] border-2 border-white dark:border-[#111111] z-10" />
                      <div className="pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-[#E85002] font-bold">{item.date}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${item.type === 'transaction' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : item.type === 'alert' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-[#555E6D] dark:text-[#A7A7A7] ml-7">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'documents' && (
              <section className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E2E6F0] dark:border-[#333333] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#0D0F14] dark:text-[#F9F9F9] mb-5 flex items-center gap-2">
                  <FileText size={18} weight="fill" className="text-[#E85002]" /> Associated Documents
                </h2>
                <div className="space-y-3">
                  {entity.documents.map((doc) => (
                    <div key={doc.id} className="group flex items-center gap-4 p-4 rounded-xl bg-[#F6F7FB] dark:bg-[#161616] border border-[#E2E6F0] dark:border-[#333333] hover:border-[#E85002] dark:hover:border-[#E85002] transition-all">
                      <div className="h-12 w-10 rounded-lg bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-[#E85002]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#0D0F14] dark:text-[#F9F9F9] truncate">{doc.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-[#8B95AD] dark:text-[#A7A7A7]">
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333]">{doc.type}</span>
                          <span>{doc.date}</span>
                          <span>{doc.pages} pages</span>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg text-[#8B95AD] hover:text-[#E85002] hover:bg-white dark:hover:bg-[#222222] transition-colors opacity-0 group-hover:opacity-100">
                        <ArrowSquareOut size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E2E6F0] dark:border-[#333333] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#0D0F14] dark:text-[#F9F9F9] mb-4 flex items-center gap-2">
                <ShieldCheck size={16} weight="fill" className="text-[#E85002]" /> Risk Assessment
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#555E6D] dark:text-[#A7A7A7]">Overall Risk Score</span>
                    <span className="font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{entity.riskLevel === 'HIGH' ? '87/100' : entity.riskLevel === 'MEDIUM' ? '52/100' : '23/100'}</span>
                  </div>
                  <div className="h-2 bg-[#F6F7FB] dark:bg-[#222222] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${entity.riskLevel === 'HIGH' ? 'bg-red-500' : entity.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${entity.riskLevel === 'HIGH' ? 87 : entity.riskLevel === 'MEDIUM' ? 52 : 23}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-[#F6F7FB] dark:bg-[#161616] border border-[#E2E6F0] dark:border-[#333333]">
                    <p className="text-2xl font-bold text-[#E85002]">{entity.connections.length}</p>
                    <p className="text-[10px] font-mono text-[#8B95AD] dark:text-[#A7A7A7]">Connections</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6F7FB] dark:bg-[#161616] border border-[#E2E6F0] dark:border-[#333333]">
                    <p className="text-2xl font-bold text-[#E85002]">{entity.documents.length}</p>
                    <p className="text-[10px] font-mono text-[#8B95AD] dark:text-[#A7A7A7]">Documents</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E2E6F0] dark:border-[#333333] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#0D0F14] dark:text-[#F9F9F9] mb-4 flex items-center gap-2">
                <Hash size={16} weight="fill" className="text-[#E85002]" /> Metadata
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-[#555E6D] dark:text-[#A7A7A7]">Entity ID</dt><dd className="font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{entity.id}</dd></div>
                <div className="flex justify-between"><dt className="text-[#555E6D] dark:text-[#A7A7A7]">Type</dt><dd className="font-medium text-[#0D0F14] dark:text-[#F9F9F9]">{entity.type}</dd></div>
                <div className="flex justify-between"><dt className="text-[#555E6D] dark:text-[#A7A7A7]">Case</dt><dd className="font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9]">#{caseId}</dd></div>
                <div className="flex justify-between"><dt className="text-[#555E6D] dark:text-[#A7A7A7]">First Seen</dt><dd className="font-medium text-[#0D0F14] dark:text-[#F9F9F9]">2024-01-15</dd></div>
                <div className="flex justify-between"><dt className="text-[#555E6D] dark:text-[#A7A7A7]">Source</dt><dd className="font-medium text-[#0D0F14] dark:text-[#F9F9F9]">Extraction Job #JOB-0442</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}