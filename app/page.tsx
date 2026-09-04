import React from 'react';
import Link from 'next/link';
import { getCases } from '@/lib/api';
import { BeamsBackground } from '@/components/ui/beams-background';
import {
  Briefcase,
  Fingerprint,
  Cpu,
  TreeStructure,
  ArrowRight,
  ShieldCheck,
  ShareNetwork,
  MagnifyingGlass,
  Files,
  ArrowUpRight,
  ChartLineUp
} from '@phosphor-icons/react/dist/ssr';

function MetricNode({ label, value, sub, icon: Icon, accent }: any) {
  return (
    <div className="relative group overflow-hidden bg-black border border-[#333333] rounded-2xl p-5 hover:border-[#646464] transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${accent ? 'from-[#E85002]/20' : 'from-[#333333]/40'} to-transparent rounded-bl-full opacity-50 -z-0 group-hover:scale-110 transition-transform duration-500`} />
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex items-center justify-between">
          <div className={`p-2.5 rounded-xl bg-[#111111] border border-[#333333] ${accent ? 'text-[#E85002] border-[#E85002]/30' : 'text-[#F9F9F9]'}`}>
            <Icon size={18} weight={accent ? 'bold' : 'regular'} />
          </div>
          <ArrowUpRight size={14} className="text-[#646464] group-hover:text-[#F9F9F9] transition-colors" />
        </div>
        
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-4xl font-extrabold tracking-tighter ${accent ? 'text-[#E85002]' : 'text-[#F9F9F9]'}`}>{value}</span>
            {accent && <ChartLineUp size={14} weight="bold" className="text-[#E85002]" />}
          </div>
          <p className="text-[11px] font-mono font-bold text-[#A7A7A7] uppercase tracking-widest">{label}</p>
          <p className="text-[12px] text-[#646464] mt-1 line-clamp-1">{sub}</p>
        </div>
      </div>
    </div>
  );
}

const QUICK_TOOLS = [
  { title: 'Connections Map',   sub: 'Visualise the network',        href: '/cases/1001/graph',          icon: ShareNetwork },
  { title: 'Knowledge Base',    sub: 'Ontology and entity types',    href: '/ontology/entities',         icon: TreeStructure },
  { title: 'Extraction Jobs',   sub: 'Run analysis on new files',    href: '/cases/1001/jobs',           icon: Cpu },
  { title: 'Case Files',        sub: 'Upload and manage evidence',   href: '/cases/1001/evidence',       icon: Files },
];

const ACTIVITY = [
  { time: '2m ago',  icon: Fingerprint,  label: 'Match Found',             desc: '96.4% confidence — Anita Rao linked across Zurich POS and Frankfurt VPN.', type: 'resolved' },
  { time: '14m ago', icon: Cpu,          label: 'Analysis Finished',       desc: 'Job #JOB-EX-1001-01 extracted 14 subjects from 4 documents.',               type: 'done'     },
  { time: '1h ago',  icon: ShieldCheck,  label: 'Verification Complete',   desc: 'Officer signed off on identity document for KYC review.',                    type: 'done'     },
  { time: '3h ago',  icon: Files,        label: 'Evidence Uploaded',       desc: '3 new financial ledgers added to Case #1001.',                              type: 'done'     },
  { time: '5h ago',  icon: MagnifyingGlass, label: 'Search Executed',      desc: 'Global entity search for "Cayman Holdings Ltd" yielded 12 results.',        type: 'done'     },
];

export default async function DashboardPage() {
  const cases = await getCases();
  const active = cases.filter((c) => c.status?.toLowerCase() === 'active').length;
  const total  = cases.length;

  return (
    <BeamsBackground intensity="subtle">
    <div className="space-y-8 pb-20 mt-4 px-4 sm:px-6 lg:px-8">

      {/* ── Welcome Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-in-up">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#333333] text-[10px] font-mono font-bold text-[#A7A7A7] uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E85002] animate-pulse" />
            System Online • Hameed Afsar KM
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#F9F9F9] tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-[#A7A7A7] max-w-xl leading-relaxed">
            Real-time telemetry across {active} active investigations. Currently monitoring {total} total cases globally.
          </p>
        </div>
        
        <Link
          href="/cases/1001"
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black border border-[#E85002] text-[#E85002] hover:bg-[#E85002] hover:text-black font-bold rounded-xl transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat group-hover:animate-shimmer" />
          <span className="relative z-10">Launch Priority Case</span>
          <ArrowRight size={16} weight="bold" className="relative z-10 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* ── Split Layout ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Stat Cards - 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricNode label="Active Cases"         value={active}  sub={`${total} total on record`}        icon={Briefcase} />
            <MetricNode label="Awaiting Decision"    value={3}       sub="Possible matches to review"        icon={Fingerprint} accent />
            <MetricNode label="Analysis Running"     value={1}       sub="Processing now"                    icon={Cpu} />
            <MetricNode label="Known Entity Types"   value={33}      sub="People, devices, accounts & more"  icon={TreeStructure} />
          </div>

          {/* Activity Log (Terminal Style) */}
          <div className="bg-[#111111] border border-[#333333] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#333333] bg-[#000000]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#333333]" />
                  <div className="w-3 h-3 rounded-full bg-[#333333]" />
                  <div className="w-3 h-3 rounded-full bg-[#333333]" />
                </div>
                <h2 className="text-[12px] font-mono font-bold text-[#A7A7A7] uppercase tracking-widest ml-2">System Log</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="relative border-l-2 border-[#333333] ml-3 pl-6 space-y-8 py-2">
                {ACTIVITY.map((ev, idx) => {
                  const Icon = ev.icon;
                  const isResolved = ev.type === 'resolved';
                  
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#111111] ${isResolved ? 'bg-[#E85002]' : 'bg-[#646464] group-hover:bg-[#A7A7A7]'} transition-colors`} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[13px] font-bold ${isResolved ? 'text-[#E85002]' : 'text-[#F9F9F9]'}`}>{ev.label}</span>
                            <span className="text-[10px] font-mono text-[#646464] bg-[#000000] px-2 py-0.5 rounded-md border border-[#333333]">{ev.time}</span>
                          </div>
                          <p className="text-[13px] text-[#A7A7A7] leading-relaxed">{ev.desc}</p>
                        </div>
                        <div className={`flex-shrink-0 p-2 rounded-xl border ${isResolved ? 'bg-[#E85002]/10 border-[#E85002]/30 text-[#E85002]' : 'bg-[#000000] border-[#333333] text-[#646464]'}`}>
                          <Icon size={16} weight={isResolved ? 'bold' : 'regular'} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick Tools */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[12px] font-mono font-bold text-[#A7A7A7] uppercase tracking-widest">Quick Actions</h2>
            </div>
            <div className="flex flex-col gap-3">
              {QUICK_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.title}
                    href={tool.href}
                    className="group relative flex items-center justify-between p-4 bg-[#111111] border border-[#333333] hover:border-[#E85002]/50 rounded-2xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-[#000000] border border-[#333333] group-hover:bg-[#E85002] group-hover:border-[#E85002] transition-colors duration-300">
                        <Icon size={18} weight="regular" className="text-[#A7A7A7] group-hover:text-black transition-colors" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#F9F9F9] group-hover:text-[#E85002] transition-colors">{tool.title}</p>
                        <p className="text-[11px] text-[#646464] mt-0.5">{tool.sub}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-[#646464] group-hover:text-[#E85002] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Active Cases (Mini List) */}
          <div className="bg-[#111111] border border-[#333333] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 p-1">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-[12px] font-mono font-bold text-[#A7A7A7] uppercase tracking-widest">Active Cases</h2>
              <Link href="/cases" className="text-[10px] font-mono font-bold text-[#E85002] hover:text-[#F16001] transition-colors uppercase">
                View All →
              </Link>
            </div>
            <div className="flex flex-col gap-1 px-2 pb-2">
              {cases.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="group flex flex-col p-4 bg-[#000000] hover:bg-[#222222] rounded-2xl border border-transparent hover:border-[#333333] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-mono text-[11px] font-bold text-[#E85002]">#{c.id}</span>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#111111] text-[#A7A7A7] border border-[#333333]">{c.caseCategory}</span>
                  </div>
                  <h3 className="text-[13px] font-medium text-[#F9F9F9] group-hover:text-[#F9F9F9] leading-snug line-clamp-2">
                    {c.caseDescription}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
    </BeamsBackground>
  );
}
