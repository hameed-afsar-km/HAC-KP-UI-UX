import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCaseById } from '@/lib/api';
import {
  Files, Cpu, MagnifyingGlass, ShieldCheck, Fingerprint, ShareNetwork, ArrowRight, CheckCircle, Warning, Clock,
} from '@phosphor-icons/react/dist/ssr';

const STAGES = (id: string) => [
  {
    num: '01', title: 'Case Files & Documents',
    desc: 'All uploaded evidence files — reports, logs, and records. Each file is tamper-proof once added.',
    href: `/cases/${id}/evidence`, icon: Files,
    status: 'Complete', statusKind: 'done', count: '4 files',
  },
  {
    num: '02', title: 'Run Analysis',
    desc: 'Let ARGUS AI extract names, devices, accounts, and transactions automatically from your files.',
    href: `/cases/${id}/jobs`, icon: Cpu,
    status: 'In Progress', statusKind: 'running', count: '4 jobs',
  },
  {
    num: '03', title: 'Review Findings',
    desc: 'Browse everything ARGUS AI found — people, SIM cards, bank accounts, IP addresses, and more.',
    href: `/cases/${id}/extractions`, icon: MagnifyingGlass,
    status: 'Ready', statusKind: 'done', count: '14 subjects',
  },
  {
    num: '04', title: 'Officer Verification',
    desc: 'Review what the AI extracted. Approve, reject or flag each item before it\'s used in the case.',
    href: `/cases/${id}/quality-review`, icon: ShieldCheck,
    status: 'Needs Attention', statusKind: 'warn', count: '1 pending',
  },
  {
    num: '05', title: 'Find Possible Matches',
    desc: 'ARGUS AI suggests people who may be the same individual across different devices or accounts.',
    href: `/cases/${id}/resolution-review`, icon: Fingerprint,
    status: 'Action Required', statusKind: 'urgent', count: '3 candidates',
  },
  {
    num: '06', title: 'Connections Map',
    desc: 'See how all subjects, devices, and accounts connect. Spot patterns and follow the money.',
    href: `/cases/${id}/graph`, icon: ShareNetwork,
    status: 'Ready', statusKind: 'done', count: '18 subjects · 22 links',
  },
];

function stageBadge(kind: string) {
  switch (kind) {
    case 'done':    return 'bg-[#E85002]/20 text-[#E85002] border-[#E85002]/50';
    case 'running': return 'bg-blue-600/20 text-blue-500 border-blue-500/50';
    case 'warn':    return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
    case 'urgent':  return 'bg-[#C10801]/20 text-[#C10801] border-[#C10801]/50';
    default:        return 'bg-[#E2E6F0] dark:bg-[#333333] text-[#8B95AD] dark:text-[#A7A7A7] border-[#E2E6F0] dark:border-[#646464]';
  }
}

function stageIcon(kind: string) {
  switch (kind) {
    case 'done':    return CheckCircle;
    case 'running': return Clock;
    case 'warn':    return Warning;
    case 'urgent':  return Warning;
    default:        return Clock;
  }
}

export default async function CaseOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseData = await getCaseById(id);
  if (!caseData) notFound();

  const stages = STAGES(id);

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Workflow Grid */}
      <div className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-[2rem] overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000]">
          <div>
            <h2 className="text-[16px] font-black text-[#0D0F14] dark:text-[#F9F9F9]">Investigation Steps</h2>
            <p className="text-[13px] text-[#8B95AD] dark:text-[#A7A7A7] mt-1">Follow each step in order to build your case</p>
          </div>
          <span className="text-[12px] font-mono font-bold text-[#E85002] uppercase tracking-widest bg-[#E85002]/10 px-3 py-1 rounded-full border border-[#E85002]/30">6 stages</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-x md:divide-y divide-[#E2E6F0] dark:divide-[#333333]">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const StatusIcon = stageIcon(stage.statusKind);
            return (
              <Link
                key={stage.num}
                href={stage.href}
                className={`
                  group flex flex-col p-8 hover:bg-[#F6F7FB] dark:hover:bg-[#000000] transition-all duration-300 relative animate-fade-up overflow-hidden
                  ${idx < 3 ? `stagger-${idx + 1}` : `stagger-${idx - 2}`}
                `}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(232,80,2,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-black font-mono text-[#E85002]">{stage.num}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 ${stageBadge(stage.statusKind)}`}>
                      <StatusIcon size={12} weight={stage.statusKind === 'done' ? 'fill' : 'bold'} />
                      {stage.status}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] group-hover:bg-[#E85002] group-hover:border-[#E85002] transition-colors duration-300">
                    <Icon size={18} weight="regular" className="text-[#8B95AD] dark:text-[#A7A7A7] group-hover:text-white transition-colors" />
                  </div>
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="text-[16px] font-bold text-[#0D0F14] dark:text-[#F9F9F9] group-hover:text-[#E85002] transition-colors leading-snug">
                    {stage.title}
                  </h3>
                  <p className="text-[13px] text-[#8B95AD] dark:text-[#A7A7A7] mt-3 leading-relaxed">{stage.desc}</p>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-[#E2E6F0] dark:border-[#333333]">
                  <span className="text-[12px] font-mono font-bold text-[#8B95AD] dark:text-[#646464]">{stage.count}</span>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#8B95AD] dark:text-[#A7A7A7] group-hover:text-[#E85002] transition-colors uppercase tracking-widest">
                    <span>Open</span>
                    <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}