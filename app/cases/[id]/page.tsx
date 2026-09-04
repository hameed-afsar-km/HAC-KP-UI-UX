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
    case 'done':    return 'badge badge-green';
    case 'running': return 'badge badge-blue';
    case 'warn':    return 'badge badge-amber';
    case 'urgent':  return 'badge badge-orange';
    default:        return 'badge badge-muted';
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

      {/* ── Workflow Grid ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E6F0] dark:border-[#252D3E]">
          <div>
            <h2 className="text-[15px] font-bold text-[#0D0F14] dark:text-[#EEF0F6]">Investigation Steps</h2>
            <p className="text-[12px] text-[#8B95AD] mt-0.5">Follow each step in order to build your case</p>
          </div>
          <span className="text-[11px] font-semibold text-[#8B95AD]">6 stages</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-x md:divide-y divide-[#E2E6F0] dark:divide-[#252D3E]">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const StatusIcon = stageIcon(stage.statusKind);
            return (
              <Link
                key={stage.num}
                href={stage.href}
                className={`
                  group flex flex-col p-6 hover:bg-[#F6F7FB] dark:hover:bg-[#1E2435]
                  transition-all duration-150 relative animate-fade-up
                  ${idx < 3 ? `stagger-${idx + 1}` : `stagger-${idx - 2}`}
                `}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold font-mono text-[#8B95AD]">{stage.num}</span>
                    <span className={stageBadge(stage.statusKind)}>
                      <StatusIcon size={11} weight={stage.statusKind === 'done' ? 'fill' : 'regular'} />
                      {stage.status}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F1F3F9] dark:bg-[#0E1117] group-hover:bg-[#E85002]/10 transition-colors">
                    <Icon size={16} weight="regular" className="text-[#8B95AD] group-hover:text-[#E85002] transition-colors" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-[14px] font-bold text-[#0D0F14] dark:text-[#EEF0F6] group-hover:text-[#E85002] transition-colors leading-snug">
                  {stage.title}
                </h3>
                <p className="text-[12px] text-[#8B95AD] mt-2 leading-relaxed flex-1">{stage.desc}</p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E6F0] dark:border-[#252D3E]">
                  <span className="text-[11px] font-semibold text-[#8B95AD]">{stage.count}</span>
                  <div className="flex items-center gap-1 text-[12px] font-semibold text-[#8B95AD] group-hover:text-[#E85002] transition-colors">
                    <span>Open</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
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
