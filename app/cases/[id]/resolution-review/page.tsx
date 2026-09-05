'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowsLeftRight,
  ArrowRight,
  Info,
  Warning,
  Shield,
  User,
  Phone,
  EnvelopeSimple,
  DeviceMobile,
  MapPin,
  Wallet,
  UsersThree,
  CaretDown,
  CaretRight,
  Funnel,
  ArrowsDownUp,
  MagnifyingGlass,
  Eye,
  GitMerge
} from '@phosphor-icons/react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
type CandidateStatus = 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'DEFERRED';
type ConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW';

interface SourceEntity {
  tempId: string;
  type: string;
  displayLabel: string;
  confidence: number;
  extractionMethod: string;
  fileId: string;
  fileName: string;
  deviceId: string;
  firstObservedAt: string;
  lastObservedAt: string;
  attributes: { attributeType: string; value: string; normalizedValue: string; confidence: number }[];
}

interface Signal {
  signalType: string;
  label: string;
  leftValue: string;
  rightValue: string;
  similarity: number;
  weight: number;
  contribution: number;
  direction: 'SUPPORTS' | 'OPPOSES' | 'NEUTRAL';
  explanation: string;
}

interface ResolutionCandidate {
  candidateId: string;
  entityType: string;
  status: CandidateStatus;
  resolutionConfidence: number;
  confidenceBand: ConfidenceBand;
  sourceA: SourceEntity;
  sourceB: SourceEntity;
  signals: Signal[];
  createdAt: string;
  version: number;
  hasWarnings: boolean;
}

const MOCK_CANDIDATES: ResolutionCandidate[] = [
  {
    candidateId: 'candidate_001',
    entityType: 'ACCOUNT',
    status: 'IN_REVIEW',
    resolutionConfidence: 0.92,
    confidenceBand: 'HIGH',
    hasWarnings: false,
    createdAt: '2026-09-02T07:30:00Z',
    version: 1,
    sourceA: {
      tempId: 'file_001:e4',
      type: 'ACCOUNT',
      displayLabel: '@sample_user',
      confidence: 0.98,
      extractionMethod: 'PARSER',
      fileId: 'file_001',
      fileName: 'telegram_export.txt',
      deviceId: 'source_device_001',
      firstObservedAt: '2026-02-02T10:20:00Z',
      lastObservedAt: '2026-02-18T21:45:00Z',
      attributes: [
        { attributeType: 'platform', value: 'Telegram', normalizedValue: 'telegram', confidence: 1.0 },
        { attributeType: 'username', value: '@sample_user', normalizedValue: 'sample_user', confidence: 0.99 },
        { attributeType: 'phoneNumber', value: '+91 98765 43210', normalizedValue: '+919876543210', confidence: 0.99 },
      ],
    },
    sourceB: {
      tempId: 'file_002:e7',
      type: 'ACCOUNT',
      displayLabel: 'sample_user',
      confidence: 0.91,
      extractionMethod: 'PARSER',
      fileId: 'file_002',
      fileName: 'contacts.json',
      deviceId: 'source_device_002',
      firstObservedAt: '2026-02-11T09:58:00Z',
      lastObservedAt: '2026-02-19T08:15:00Z',
      attributes: [
        { attributeType: 'platform', value: 'Telegram', normalizedValue: 'telegram', confidence: 1.0 },
        { attributeType: 'username', value: 'sample_user', normalizedValue: 'sample_user', confidence: 0.94 },
        { attributeType: 'phoneNumber', value: '+91-98765-43210', normalizedValue: '+919876543210', confidence: 0.97 },
      ],
    },
    signals: [
      { signalType: 'EXACT_NORMALIZED_PHONE', label: 'Exact normalized phone', leftValue: '+919876543210', rightValue: '+919876543210', similarity: 1.0, weight: 0.55, contribution: 0.55, direction: 'SUPPORTS', explanation: 'Both records contain the same normalized phone number.' },
      { signalType: 'USERNAME_SIMILARITY', label: 'Username similarity', leftValue: 'sample_user', rightValue: 'sample_user', similarity: 1.0, weight: 0.24, contribution: 0.24, direction: 'SUPPORTS', explanation: 'Normalized usernames are identical.' },
      { signalType: 'TEMPORAL_OVERLAP', label: 'Temporal overlap', leftValue: '2026-02-02/2026-02-18', rightValue: '2026-02-11/2026-02-19', similarity: 0.65, weight: 0.2, contribution: 0.13, direction: 'SUPPORTS', explanation: 'The observation periods overlap.' },
    ],
  },
  {
    candidateId: 'candidate_002',
    entityType: 'PERSON',
    status: 'PENDING',
    resolutionConfidence: 0.76,
    confidenceBand: 'MEDIUM',
    hasWarnings: true,
    createdAt: '2026-09-02T08:00:00Z',
    version: 1,
    sourceA: {
      tempId: 'file_003:e2',
      type: 'PERSON',
      displayLabel: 'Person A',
      confidence: 0.94,
      extractionMethod: 'LLM',
      fileId: 'file_003',
      fileName: 'chat_logs.txt',
      deviceId: 'source_device_001',
      firstObservedAt: '2026-02-05T09:10:00Z',
      lastObservedAt: '2026-02-20T14:30:00Z',
      attributes: [
        { attributeType: 'name', value: 'Person A', normalizedValue: 'person a', confidence: 0.94 },
      ],
    },
    sourceB: {
      tempId: 'file_004:e1',
      type: 'PERSON',
      displayLabel: 'A. Person',
      confidence: 0.88,
      extractionMethod: 'LLM',
      fileId: 'file_004',
      fileName: 'messages.db',
      deviceId: 'source_device_003',
      firstObservedAt: '2026-02-06T08:00:00Z',
      lastObservedAt: '2026-02-21T11:00:00Z',
      attributes: [
        { attributeType: 'name', value: 'A. Person', normalizedValue: 'person a', confidence: 0.88 },
      ],
    },
    signals: [
      { signalType: 'NAME_SIMILARITY', label: 'Name similarity', leftValue: 'person a', rightValue: 'person a', similarity: 0.90, weight: 0.40, contribution: 0.36, direction: 'SUPPORTS', explanation: 'Normalized names are similar.' },
      { signalType: 'TEMPORAL_OVERLAP', label: 'Temporal overlap', leftValue: '2026-02-05/2026-02-20', rightValue: '2026-02-06/2026-02-21', similarity: 0.80, weight: 0.2, contribution: 0.16, direction: 'SUPPORTS', explanation: 'Observation windows overlap significantly.' },
    ],
  },
  {
    candidateId: 'candidate_003',
    entityType: 'DEVICE',
    status: 'PENDING',
    resolutionConfidence: 0.44,
    confidenceBand: 'LOW',
    hasWarnings: false,
    createdAt: '2026-09-02T09:00:00Z',
    version: 1,
    sourceA: {
      tempId: 'file_001:e3',
      type: 'DEVICE',
      displayLabel: 'IMEI 356789012345678',
      confidence: 0.94,
      extractionMethod: 'PARSER',
      fileId: 'file_001',
      fileName: 'telegram_export.txt',
      deviceId: 'source_device_001',
      firstObservedAt: '2026-02-02T10:20:00Z',
      lastObservedAt: '2026-02-10T15:00:00Z',
      attributes: [
        { attributeType: 'imei', value: '356789012345678', normalizedValue: '356789012345678', confidence: 0.94 },
      ],
    },
    sourceB: {
      tempId: 'file_005:e1',
      type: 'DEVICE',
      displayLabel: 'IMEI 356789099999999',
      confidence: 0.88,
      extractionMethod: 'PARSER',
      fileId: 'file_005',
      fileName: 'device_log.txt',
      deviceId: 'source_device_002',
      firstObservedAt: '2026-03-01T08:00:00Z',
      lastObservedAt: '2026-03-10T11:00:00Z',
      attributes: [
        { attributeType: 'imei', value: '356789099999999', normalizedValue: '356789099999999', confidence: 0.88 },
      ],
    },
    signals: [
      { signalType: 'IMEI_PREFIX', label: 'IMEI manufacturer prefix', leftValue: '35678901', rightValue: '35678909', similarity: 0.44, weight: 0.60, contribution: 0.26, direction: 'NEUTRAL', explanation: 'First 8 digits match (same manufacturer), but device differs.' },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function confidenceColor(band: ConfidenceBand) {
  if (band === 'HIGH') return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: '#10B981' };
  if (band === 'MEDIUM') return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: '#F59E0B' };
  return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: '#F43F5E' };
}

function statusBadge(status: CandidateStatus) {
  switch (status) {
    case 'PENDING': return 'bg-[#8B95AD]/15 text-[#8B95AD] border-[#8B95AD]/30';
    case 'IN_REVIEW': return 'bg-[#E85002]/15 text-[#E85002] border-[#E85002]/30';
    case 'ACCEPTED': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'REJECTED': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    case 'DEFERRED': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }
}

function AttributeMatchRow({ attrA, attrB }: { attrA?: { value: string; normalizedValue: string; confidence: number }; attrB?: { value: string; normalizedValue: string; confidence: number } }) {
  const match = attrA && attrB && attrA.normalizedValue === attrB.normalizedValue;
  const conflict = attrA && attrB && attrA.normalizedValue !== attrB.normalizedValue;
  return (
    <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] border ${match ? 'border-emerald-500/30 bg-emerald-500/5' : conflict ? 'border-rose-500/30 bg-rose-500/5' : 'border-[#E2E6F0]/0 bg-transparent'}`}>
      <span className={`flex-1 truncate font-mono ${attrA ? 'text-[#0D0F14] dark:text-[#F9F9F9]' : 'text-[#8B95AD] italic'}`}>{attrA?.value ?? '—'}</span>
      <span className={`mx-1 ${match ? 'text-emerald-400' : conflict ? 'text-rose-400' : 'text-[#8B95AD]'}`}>
        {match ? '✓' : conflict ? '≠' : '·'}
      </span>
      <span className={`flex-1 truncate font-mono text-right ${attrB ? 'text-[#0D0F14] dark:text-[#F9F9F9]' : 'text-[#8B95AD] italic'}`}>{attrB?.value ?? '—'}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EntityResolutionReviewPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [candidates] = useState<ResolutionCandidate[]>(MOCK_CANDIDATES);
  const [selectedId, setSelectedId] = useState<string>(MOCK_CANDIDATES[0].candidateId);
  const [localStatuses, setLocalStatuses] = useState<Record<string, CandidateStatus>>({});
  const [confirmAction, setConfirmAction] = useState<'ACCEPT' | 'REJECT' | null>(null);
  const [confirmNote, setConfirmNote] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const selected = useMemo(
    () => candidates.find(c => c.candidateId === selectedId),
    [candidates, selectedId]
  );

  const effectiveStatus = (c: ResolutionCandidate): CandidateStatus =>
    localStatuses[c.candidateId] ?? c.status;

  const filteredCandidates = useMemo(() =>
    candidates.filter(c =>
      c.candidateId.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.entityType.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.sourceA.displayLabel.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.sourceB.displayLabel.toLowerCase().includes(searchQ.toLowerCase())
    ), [candidates, searchQ]);

  const summary = useMemo(() => ({
    total: candidates.length,
    pending: candidates.filter(c => effectiveStatus(c) === 'PENDING').length,
    inReview: candidates.filter(c => effectiveStatus(c) === 'IN_REVIEW').length,
    accepted: candidates.filter(c => effectiveStatus(c) === 'ACCEPTED').length,
    rejected: candidates.filter(c => effectiveStatus(c) === 'REJECTED').length,
    high: candidates.filter(c => c.confidenceBand === 'HIGH').length,
    medium: candidates.filter(c => c.confidenceBand === 'MEDIUM').length,
    low: candidates.filter(c => c.confidenceBand === 'LOW').length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [candidates, localStatuses]);

  const handleDecision = (action: 'ACCEPT' | 'REJECT' | 'DEFER') => {
    if (action === 'ACCEPT' || action === 'REJECT') {
      setConfirmAction(action);
      return;
    }
    setLocalStatuses(prev => ({ ...prev, [selectedId]: 'DEFERRED' }));
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    setLocalStatuses(prev => ({
      ...prev,
      [selectedId]: confirmAction === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'
    }));
    setConfirmAction(null);
    setConfirmNote('');
  };

  const selStatus = selected ? effectiveStatus(selected) : null;
  const isDecided = selStatus === 'ACCEPTED' || selStatus === 'REJECTED';
  const colors = selected ? confidenceColor(selected.confidenceBand) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#E85002] uppercase tracking-widest">
            <span>INVESTIGATION STAGE 04 // ENTITY RESOLUTION REVIEW</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0D0F14] dark:text-[#F9F9F9] mt-1">
            Entity Resolution Review
          </h2>
          <p className="text-xs font-medium text-[#8B95AD] dark:text-[#A7A7A7] mt-1">
            Review identity-match candidates. Accept to merge, reject if different, or defer for later.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest">Case ID</p>
            <p className="text-[13px] font-bold text-[#0D0F14] dark:text-[#F9F9F9] font-mono">{caseId?.toUpperCase() ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: summary.total, cls: 'text-[#0D0F14] dark:text-[#F9F9F9]' },
          { label: 'Pending', value: summary.pending, cls: 'text-[#8B95AD]' },
          { label: 'In Review', value: summary.inReview, cls: 'text-[#E85002]' },
          { label: 'Accepted', value: summary.accepted, cls: 'text-emerald-400' },
          { label: 'Rejected', value: summary.rejected, cls: 'text-rose-400' },
          { label: 'High Conf.', value: summary.high, cls: 'text-emerald-400' },
          { label: 'Low Conf.', value: summary.low, cls: 'text-rose-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#111111] border border-[#C9D1E0] dark:border-[#333333] rounded-2xl p-3 text-center shadow-sm">
            <p className={`text-xl font-black ${s.cls}`}>{s.value}</p>
            <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-5 min-h-[780px]">

        {/* ─── Left: Candidate Queue ─────────────────────────────────────────── */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col bg-white dark:bg-[#000000] border border-[#C9D1E0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#C9D1E0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#111111]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">
                Candidate Queue
              </h3>
              <span className="text-[10px] font-mono font-bold bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30 px-2 py-0.5 rounded-md">
                {filteredCandidates.length}
              </span>
            </div>
            <div className="relative">
              <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B95AD]" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search candidates…"
                className="w-full pl-8 pr-3 py-2 text-[11px] bg-white dark:bg-[#111111] border border-[#C9D1E0] dark:border-[#333333] rounded-xl text-[#0D0F14] dark:text-[#F9F9F9] placeholder:text-[#8B95AD] focus:outline-none focus:border-[#E85002]/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCandidates.map(c => {
              const st = effectiveStatus(c);
              const cc = confidenceColor(c.confidenceBand);
              const isActive = c.candidateId === selectedId;
              return (
                <button
                  key={c.candidateId}
                  onClick={() => setSelectedId(c.candidateId)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-[#E85002]/8 border-[#E85002]/40 shadow-sm'
                      : 'bg-white dark:bg-[#111111] border-[#C9D1E0] dark:border-[#333333] hover:border-[#E85002]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${cc.bg} ${cc.text} ${cc.border}`}>
                      {(c.resolutionConfidence * 100).toFixed(0)}%
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${statusBadge(st)}`}>
                      {st.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold text-[#0D0F14] dark:text-[#F9F9F9] truncate">{c.sourceA.displayLabel}</p>
                  <p className="text-[10px] text-[#8B95AD] flex items-center gap-1">
                    <ArrowsLeftRight size={10} /> {c.sourceB.displayLabel}
                  </p>
                  <p className="text-[10px] font-mono text-[#8B95AD] mt-1">{c.candidateId} · {c.entityType}</p>
                  {c.hasWarnings && <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-amber-400"><Warning size={10} /> Has Warnings</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Right: Detail Panel ───────────────────────────────────────────── */}
        {selected && colors && (
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            {/* ─ Confidence Banner ─ */}
            <div className="bg-white dark:bg-[#111111] border border-[#C9D1E0] dark:border-[#333333] rounded-3xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest">Resolution Confidence</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className={`text-4xl font-black ${colors.text}`}>
                      {(selected.resolutionConfidence * 100).toFixed(0)}%
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {selected.confidenceBand} CONFIDENCE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B95AD] mt-1">{selected.entityType} · {selected.candidateId}</p>
                </div>
                {/* Progress bar */}
                <div className="w-full sm:w-64">
                  <div className="h-2 bg-[#F6F7FB] dark:bg-[#222222] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${selected.resolutionConfidence * 100}%`, backgroundColor: colors.glow }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#8B95AD] mt-1">
                    <span>0%</span>
                    <span>Medium 60%</span>
                    <span>High 85%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─ Reversibility Notice ─ */}
            <div className="flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
              <Info size={15} className="text-amber-600 dark:text-amber-300 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                <strong>Reversible Decision Notice:</strong> Accepting or rejecting this candidate is reversible. You can undo this action or re-open the candidate from the Audit log.
              </p>
            </div>

            {/* ─ Source Comparison ─ */}
            <div className="bg-white dark:bg-[#111111] border border-[#C9D1E0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-[1fr_auto_1fr] border-b border-[#C9D1E0] dark:border-[#333333]">
                <div className="p-4 border-r border-[#C9D1E0] dark:border-[#333333]">
                  <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest">Source A</p>
                  <p className="text-[13px] font-black text-[#0D0F14] dark:text-[#F9F9F9] mt-1">{selected.sourceA.displayLabel}</p>
                  <p className="text-[11px] text-[#8B95AD] font-mono">{selected.sourceA.deviceId}</p>
                </div>
                <div className="flex items-center justify-center px-4">
                  <ArrowsLeftRight size={20} className="text-[#E85002]" />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest">Source B</p>
                  <p className="text-[13px] font-black text-[#0D0F14] dark:text-[#F9F9F9] mt-1">{selected.sourceB.displayLabel}</p>
                  <p className="text-[11px] text-[#8B95AD] font-mono">{selected.sourceB.deviceId}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {/* Field comparison grid */}
                {['platform', 'username', 'phoneNumber', 'imei', 'name'].map(attr => {
                  const a = selected.sourceA.attributes.find(x => x.attributeType === attr);
                  const b = selected.sourceB.attributes.find(x => x.attributeType === attr);
                  if (!a && !b) return null;
                  return (
                    <div key={attr}>
                      <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-wider mb-1">{attr}</p>
                      <AttributeMatchRow attrA={a} attrB={b} />
                    </div>
                  );
                })}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#C9D1E0] dark:border-[#333333] mt-2">
                  {[
                    { label: 'File', a: selected.sourceA.fileName, b: selected.sourceB.fileName },
                    { label: 'Confidence', a: `${(selected.sourceA.confidence * 100).toFixed(0)}%`, b: `${(selected.sourceB.confidence * 100).toFixed(0)}%` },
                    { label: 'First Seen', a: new Date(selected.sourceA.firstObservedAt).toLocaleDateString(), b: new Date(selected.sourceB.firstObservedAt).toLocaleDateString() },
                    { label: 'Last Seen', a: new Date(selected.sourceA.lastObservedAt).toLocaleDateString(), b: new Date(selected.sourceB.lastObservedAt).toLocaleDateString() },
                  ].map(row => (
                    <div key={row.label} className="col-span-2 grid grid-cols-[1fr_auto_1fr] gap-2 text-[11px]">
                      <span className="text-[#0D0F14] dark:text-[#F9F9F9] font-mono">{row.a}</span>
                      <span className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase w-16 text-center">{row.label}</span>
                      <span className="text-[#0D0F14] dark:text-[#F9F9F9] font-mono text-right">{row.b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─ Weighted Rationale ─ */}
            <div className="bg-white dark:bg-[#111111] border border-[#C9D1E0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#C9D1E0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#111111]">
                <h4 className="text-[11px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">Weighted Match Rationale</h4>
              </div>
              <div className="p-4 space-y-2">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-2 text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-wider px-1 mb-2">
                  <span>Signal</span><span>Left Value</span><span>Right Value</span><span className="text-center">Sim.</span><span className="text-center">Wt.</span><span className="text-right">Contrib.</span>
                </div>
                {selected.signals.map(sig => (
                  <div key={sig.signalType} className={`grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-2 items-center rounded-xl px-2 py-2 text-[11px] border ${
                    sig.direction === 'SUPPORTS' ? 'border-emerald-500/20 bg-emerald-500/5' :
                    sig.direction === 'OPPOSES' ? 'border-rose-500/20 bg-rose-500/5' :
                    'border-[#C9D1E0] dark:border-[#333333]'
                  }`}>
                    <div>
                      <p className="font-bold text-[#0D0F14] dark:text-[#F9F9F9] truncate">{sig.label}</p>
                      <p className="text-[9px] text-[#8B95AD] truncate">{sig.explanation}</p>
                    </div>
                    <span className="font-mono text-[#0D0F14] dark:text-[#F9F9F9] truncate">{sig.leftValue}</span>
                    <span className="font-mono text-[#0D0F14] dark:text-[#F9F9F9] truncate">{sig.rightValue}</span>
                    <span className={`text-center font-bold ${sig.similarity >= 0.8 ? 'text-emerald-400' : sig.similarity >= 0.5 ? 'text-amber-400' : 'text-rose-400'}`}>{sig.similarity.toFixed(2)}</span>
                    <span className="text-center text-[#8B95AD]">{sig.weight.toFixed(2)}</span>
                    <span className={`text-right font-bold ${sig.direction === 'SUPPORTS' ? 'text-emerald-400' : sig.direction === 'OPPOSES' ? 'text-rose-400' : 'text-[#8B95AD]'}`}>
                      {sig.direction === 'SUPPORTS' ? '+' : sig.direction === 'OPPOSES' ? '-' : ''}{sig.contribution.toFixed(2)}
                    </span>
                  </div>
                ))}
                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-[#C9D1E0] dark:border-[#333333]">
                  <span className="text-[11px] font-mono font-bold text-[#8B95AD] uppercase">Total Confidence</span>
                  <span className={`text-[15px] font-black ${colors.text}`}>{selected.resolutionConfidence.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* ─ Canonical Entity Preview ─ */}
            <div className="bg-white dark:bg-[#111111] border border-[#C9D1E0] dark:border-[#333333] rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-[11px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">Canonical Entity Preview</h4>
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md">PREVIEW ONLY</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {[
                  { label: 'Proposed Label', value: selected.sourceA.displayLabel },
                  { label: 'Entity Type', value: selected.entityType },
                  { label: 'Sources', value: '2 sources' },
                  { label: 'Devices', value: '2 devices' },
                  { label: 'First Observed', value: new Date(Math.min(new Date(selected.sourceA.firstObservedAt).getTime(), new Date(selected.sourceB.firstObservedAt).getTime())).toLocaleDateString() },
                  { label: 'Last Observed', value: new Date(Math.max(new Date(selected.sourceA.lastObservedAt).getTime(), new Date(selected.sourceB.lastObservedAt).getTime())).toLocaleDateString() },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-mono text-[#8B95AD] uppercase tracking-wider">{f.label}</p>
                    <p className="font-bold text-[#0D0F14] dark:text-[#F9F9F9] mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─ Action Buttons ─ */}
            {!isDecided ? (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleDecision('ACCEPT')}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[13px] transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle size={18} weight="fill" />
                  Accept Match
                </button>
                <button
                  onClick={() => handleDecision('REJECT')}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-[13px] transition-colors shadow-lg shadow-rose-500/20"
                >
                  <XCircle size={18} weight="fill" />
                  Reject Match
                </button>
                <button
                  onClick={() => handleDecision('DEFER')}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white dark:bg-[#111111] hover:bg-[#F6F7FB] dark:hover:bg-[#222222] border border-[#C9D1E0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] font-bold text-[13px] transition-colors"
                >
                  <Clock size={18} />
                  Defer
                </button>
              </div>
            ) : (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${selStatus === 'ACCEPTED' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                {selStatus === 'ACCEPTED' ? <CheckCircle size={20} weight="fill" className="text-emerald-400" /> : <XCircle size={20} weight="fill" className="text-rose-400" />}
                <div>
                  <p className={`font-bold text-[13px] ${selStatus === 'ACCEPTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Decision recorded: {selStatus}
                  </p>
                  <p className="text-[11px] text-[#8B95AD]">This decision is reversible. View the audit log for details.</p>
                </div>
              </div>
            )}

            {/* ─ Merge History ─ */}
            <div className="bg-white dark:bg-[#111111] border border-[#C9D1E0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-[#F6F7FB] dark:hover:bg-[#111111] transition-colors"
                onClick={() => setShowHistory(h => !h)}
              >
                <h4 className="text-[11px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">Merge &amp; Decision History</h4>
                <CaretDown size={14} className={`text-[#8B95AD] transition-transform ${showHistory ? '' : '-rotate-90'}`} />
              </button>
              {showHistory && (
                <div className="p-4 border-t border-[#C9D1E0] dark:border-[#333333] space-y-3">
                  {[
                    { date: '18 May 2024, 23:10', action: 'Candidate Created', by: 'System', detail: `${selected.candidateId} created` },
                    { date: '18 May 2024, 23:12', action: 'Under Review', by: 'Investigator User', detail: 'Opened for review' },
                    selStatus !== 'IN_REVIEW' && selStatus !== 'PENDING'
                      ? { date: new Date().toLocaleString(), action: selStatus ?? '—', by: 'Investigator User', detail: 'Decision recorded' }
                      : null,
                  ].filter(Boolean).map((ev, i) => (
                    <div key={i} className="grid grid-cols-[auto_1fr_1fr_1fr] gap-3 text-[11px]">
                      <span className="text-[#8B95AD] font-mono whitespace-nowrap">{(ev as any).date}</span>
                      <span className="font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{(ev as any).action}</span>
                      <span className="text-[#8B95AD]">{(ev as any).by}</span>
                      <span className="text-[#8B95AD]">{(ev as any).detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Confirm Modal ──────────────────────────────────────────────────── */}
      {confirmAction && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#111111] border border-[#C9D1E0] dark:border-[#333333] rounded-3xl shadow-2xl p-6 mx-4 space-y-4">
            <h3 className="text-[15px] font-black text-[#0D0F14] dark:text-[#F9F9F9]">
              {confirmAction === 'ACCEPT' ? '✓ Confirm: Accept Match' : '✕ Confirm: Reject Match'}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#F6F7FB] dark:bg-[#000000] rounded-2xl p-3">
              <div><p className="text-[#8B95AD]">Source A</p><p className="font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{selected.sourceA.displayLabel}</p></div>
              <div><p className="text-[#8B95AD]">Source B</p><p className="font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{selected.sourceB.displayLabel}</p></div>
            </div>
            {confirmAction === 'ACCEPT' && (
              <p className="text-[11px] text-[#8B95AD]">
                Accepting will merge these records into a single canonical entity. This action is reversible via the Audit log.
              </p>
            )}
            {confirmAction === 'REJECT' && (
              <p className="text-[11px] text-[#8B95AD]">
                Rejecting marks these as different entities. The same candidate pair may be suppressed from future generation.
              </p>
            )}
            <div>
              <label className="text-[11px] font-bold text-[#8B95AD] uppercase tracking-wider block mb-1">Note (optional)</label>
              <textarea
                value={confirmNote}
                onChange={e => setConfirmNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-[12px] bg-[#F6F7FB] dark:bg-[#000000] border border-[#C9D1E0] dark:border-[#333333] rounded-xl text-[#0D0F14] dark:text-[#F9F9F9] focus:outline-none focus:border-[#E85002]/50 resize-none"
                placeholder="Optional reason for this decision…"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white transition-colors ${confirmAction === 'ACCEPT' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
              >
                {confirmAction === 'ACCEPT' ? 'Accept Match' : 'Reject Match'}
              </button>
              <button
                onClick={() => { setConfirmAction(null); setConfirmNote(''); }}
                className="flex-1 py-2.5 rounded-xl border border-[#C9D1E0] dark:border-[#333333] font-bold text-[13px] text-[#0D0F14] dark:text-[#F9F9F9] hover:bg-[#F6F7FB] dark:hover:bg-[#222222] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
