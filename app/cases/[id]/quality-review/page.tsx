'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getQualityReviews } from '@/lib/api';
import { QualityReviewItem } from '@/lib/types';
import {
  CheckCircle,
  XCircle,
  Flag,
  PencilSimple,
  FileText,
  ChatCircleDots,
  ShieldCheck,
  ArrowRight,
  CaretRight,
  CaretLeft,
  Sparkle,
  Check,
  WarningCircle,
  Cpu,
  Eye,
  EyeSlash,
  LockSimple,
  Warning,
  ClockCounterClockwise,
  Info,
  Database
} from '@phosphor-icons/react';

function getEntityTypeBadge(type: string) {
  const t = type?.toUpperCase() || '';
  if (t.includes('PERSON')) {
    return 'bg-[#F9F9F9]/10 text-[#F9F9F9] border-[#F9F9F9]/30';
  }
  if (t.includes('DEVICE') || t.includes('IMEI') || t.includes('HARDWARE')) {
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  }
  if (t.includes('IP') || t.includes('NETWORK')) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }
  if (t.includes('USER') || t.includes('HANDLE') || t.includes('MAIL')) {
    return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  }
  if (t.includes('ACCOUNT') || t.includes('BANK')) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
  return 'bg-[#E85002]/15 text-[#E85002] border-[#E85002]/30';
}

function getStatusBadge(status?: string) {
  switch (status) {
    case 'APPROVED':
    case 'REVIEWED':   return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'REJECTED':   return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    case 'FLAGGED':
    case 'IN_REVIEW':  return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'DEFERRED':   return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    default:           return 'bg-[#222222] text-[#A7A7A7] border-[#333333]';
  }
}

// ─── Mock Warning / Contradiction / Evidence Set Data ──────────────────────────
const MOCK_WARNINGS = [
  { id: 'review_001', code: 'AMBIGUOUS_PERSON', severity: 'WARNING', message: 'The account owner could not be identified conclusively.', relatedTempIds: ['file_001:e1', 'file_001:e4'], fileId: 'file_001', fileName: 'telegram_export.txt', detectedAt: '2026-09-01T02:30:00Z', reviewStatus: 'UNREVIEWED', extractionId: 'ext_001' },
  { id: 'review_002', code: 'LOW_CONFIDENCE_PHONE', severity: 'INFO', message: 'Phone number extracted with low confidence.', relatedTempIds: ['file_002:e2'], fileId: 'file_002', fileName: 'contacts.json', detectedAt: '2026-09-01T09:58:00Z', reviewStatus: 'REVIEWED', extractionId: 'ext_001' },
  { id: 'review_003', code: 'POTENTIAL_DATE_CONFLICT', severity: 'INFO', message: 'Different timestamps detected for the same event.', relatedTempIds: ['file_003:e3', 'file_003:e7'], fileId: 'file_003', fileName: 'chat_logs.txt', detectedAt: '2026-09-01T15:04:00Z', reviewStatus: 'REVIEWED', extractionId: 'ext_002' },
];

const MOCK_EVIDENCE_SETS = [
  { id: 'evidence_set_messages_001', fileId: 'file_001', fileName: 'telegram_export.txt', recordType: 'MESSAGE', recordCount: 47, firstRecordId: 'message_001', lastRecordId: 'message_047', extractionId: 'ext_001' },
  { id: 'evidence_set_wallet_001', fileId: 'file_001', fileName: 'telegram_export.txt', recordType: 'TRANSACTION', recordCount: 3, firstRecordId: null, lastRecordId: null, recordIds: ['message_012', 'message_018', 'message_024'], extractionId: 'ext_001' },
];

const MOCK_AUDIT_EVENTS = [
  { id: 'audit_8801', action: 'EVIDENCE_REVEALED', performedBy: 'Investigator User', occurredAt: '2026-09-02T08:40:00Z', previousStatus: null, newStatus: null, session: { ipAddress: '192.0.2.25', workstationId: 'WS-ANALYST-12' } },
  { id: 'audit_8802', action: 'REVIEW_STATUS_CHANGED', performedBy: 'Investigator User', occurredAt: '2026-09-02T08:44:00Z', previousStatus: 'IN_REVIEW', newStatus: 'REVIEWED', session: { ipAddress: '192.0.2.25', workstationId: 'WS-ANALYST-12' } },
];

const MOCK_SOURCE_RECORD = {
  recordId: 'message_001',
  recordType: 'MESSAGE',
  fileName: 'telegram_export.txt',
  deviceId: 'source_device_001',
  observedAt: '2026-02-02T10:20:00Z',
  contentProtected: true,
  contentHash: 'sha256:8c50f4...d913',
  content: 'Person A said they would handle the pickup tomorrow around 3pm.',
  startOffset: 0,
  endOffset: 8,
};

export default function QualityReviewPage() {
  const params = useParams();
  const caseId = params?.id as string;

  // Top tab state
  const [activeTab, setActiveTab] = useState<'WARNINGS' | 'CONTRADICTIONS' | 'EVIDENCE_SETS'>('WARNINGS');

  // Source record viewer
  const [revealedContent, setRevealedContent] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  const handleReveal = () => {
    setRevealing(true);
    setTimeout(() => {
      setRevealedContent(MOCK_SOURCE_RECORD.content);
      setRevealing(false);
    }, 900);
  };

  const [reviewItems, setReviewItems] = useState<QualityReviewItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeComment, setActiveComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED'>('ALL');

  useEffect(() => {
    if (caseId) {
      const items = getQualityReviews(caseId);
      setReviewItems(items);
      if (items.length > 0) {
        setActiveComment(items[0].reviewerComment || '');
        setEditValue(items[0].entityValue);
      }
    }
  }, [caseId]);

  const stats = useMemo(() => {
    const total = reviewItems.length;
    const approved = reviewItems.filter(i => i.reviewStatus === 'APPROVED').length;
    const flagged = reviewItems.filter(i => i.reviewStatus === 'FLAGGED').length;
    const rejected = reviewItems.filter(i => i.reviewStatus === 'REJECTED').length;
    const pending = total - (approved + flagged + rejected);
    return { total, approved, flagged, rejected, pending };
  }, [reviewItems]);

  const filteredIndices = useMemo(() => {
    return reviewItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (filter === 'ALL') return true;
        if (filter === 'PENDING') {
          return !item.reviewStatus || (item.reviewStatus as string) === 'PENDING';
        }
        return item.reviewStatus === filter;
      })
      .map(({ index }) => index);
  }, [reviewItems, filter]);

  const currentItem = reviewItems[selectedIndex] || null;

  const handleSelect = (index: number) => {
    if (index >= 0 && index < reviewItems.length) {
      setSelectedIndex(index);
      setActiveComment(reviewItems[index].reviewerComment || '');
      setEditValue(reviewItems[index].entityValue);
      setIsEditing(false);
    }
  };

  const updateDecision = (status: 'APPROVED' | 'REJECTED' | 'FLAGGED') => {
    if (!currentItem) return;

    const updated = [...reviewItems];
    updated[selectedIndex] = {
      ...currentItem,
      reviewStatus: status,
      reviewerComment: activeComment,
      entityValue: editValue,
      reviewedBy: 'Lead Investigator',
      reviewedAt: new Date().toISOString()
    };

    setReviewItems(updated);
    setToastMessage(`Item #${currentItem.id} marked as ${status}`);
    setTimeout(() => setToastMessage(null), 3500);

    // Auto-advance
    if (selectedIndex < reviewItems.length - 1) {
      handleSelect(selectedIndex + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl bg-white dark:bg-[#111111] border border-[#E85002] text-[#0D0F14] dark:text-[#F9F9F9] text-xs font-mono font-bold shadow-2xl shadow-[#E85002]/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check size={16} className="text-[#E85002]" weight="bold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-[2rem] overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="px-8 py-4 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest bg-[#E85002] text-[#000000] px-3 py-1 rounded-md">
              STAGE 05
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#8B95AD] dark:text-[#A7A7A7]">
              CASE #{caseId}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
              ✓ {stats.approved} Reviewed
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
              ! {stats.flagged} In Review
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F0F0F0] dark:bg-[#222222] border border-[#E2E6F0] dark:border-[#333333] text-[#8B95AD] dark:text-[#A7A7A7] font-bold">
              {stats.pending} Unreviewed
            </span>
          </div>
        </div>

        <div className="px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0D0F14] dark:text-[#F9F9F9] tracking-tight">
              Evidence &amp; Quality Review
            </h1>
            <p className="text-[14px] text-[#8B95AD] dark:text-[#A7A7A7] leading-relaxed">
              Review extraction warnings, contradictions, and evidence sets. Inspect source records, trace provenance, and record auditable review decisions.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href={`/cases/${caseId}/resolution-review`}
              className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-[#E85002] text-white text-xs font-bold font-mono uppercase tracking-widest rounded-xl transition-all duration-300 overflow-hidden shadow-lg shadow-[#E85002]/20 hover:bg-[#F16001]"
            >
              <span>Find Matches</span>
              <ArrowRight size={15} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-2xl p-1.5 shadow-sm overflow-x-auto no-scrollbar">
        {([
          { key: 'WARNINGS', label: 'Warnings', count: MOCK_WARNINGS.filter(w => w.severity === 'WARNING' || w.severity === 'ERROR').length, icon: Warning },
          { key: 'CONTRADICTIONS', label: 'Contradictions', count: 0, icon: Info },
          { key: 'EVIDENCE_SETS', label: 'Evidence Sets', count: MOCK_EVIDENCE_SETS.length, icon: Database },
        ] as const).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#E85002] text-white shadow-sm'
                  : 'text-[#8B95AD] hover:text-[#0D0F14] dark:hover:text-[#F9F9F9] hover:bg-[#F6F7FB] dark:hover:bg-[#222222]'
              }`}
            >
              <Icon size={14} weight={isActive ? 'fill' : 'regular'} />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#F0F0F0] dark:bg-[#222222] text-[#8B95AD]'
              }`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ──────────────────────────────────────────────────────── */}

      {activeTab === 'WARNINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Review Queue (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-[2rem] p-6 shadow-sm dark:shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6F0] dark:border-[#333333]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#E85002] uppercase tracking-wider">
                  Warning Queue
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F0F0F0] dark:bg-[#222222] text-[#0D0F14] dark:text-[#F9F9F9] border border-[#E2E6F0] dark:border-[#333333]">
                  {reviewItems.length}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#8B95AD] dark:text-[#A7A7A7]">
                Item {selectedIndex + 1} of {reviewItems.length}
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {(['ALL', 'PENDING', 'APPROVED', 'FLAGGED'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-[#E85002] text-white border-[#E85002]'
                      : 'bg-white dark:bg-[#000000] text-[#8B95AD] dark:text-[#A7A7A7] border-[#E2E6F0] dark:border-[#333333] hover:border-[#E85002]/50 hover:text-[#0D0F14] dark:hover:text-[#F9F9F9]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredIndices.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-[#8B95AD] dark:text-[#646464]">
                  No items match the selected filter.
                </div>
              ) : (
                filteredIndices.map((idx) => {
                  const item = reviewItems[idx];
                  const isSelected = idx === selectedIndex;
                  const status = item.reviewStatus || 'PENDING';
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                        isSelected
                          ? 'border-[#E85002] bg-[#E85002]/10 shadow-[0_0_15px_rgba(232,80,2,0.15)] ring-1 ring-[#E85002]/40'
                          : 'border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] hover:border-[#E85002]/50 hover:bg-white dark:hover:bg-[#161616]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#E85002]" />
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getEntityTypeBadge(item.entityType)}`}>
                          {item.entityType}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(status)}`}>
                          {status}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-[#0D0F14] dark:text-[#F9F9F9] truncate">
                        {item.entityValue}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-[#8B95AD] dark:text-[#A7A7A7] pt-1 border-t border-[#E2E6F0] dark:border-[#222222]">
                        <span className="text-[#E85002] font-semibold">
                          {(item.confidence * 100).toFixed(0)}% Conf
                        </span>
                        <span className="truncate max-w-[150px] text-[#8B95AD] dark:text-[#646464]">
                          {item.sourceDocument}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Inspection & Decision Console (8 cols) */}
          {currentItem ? (
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-[2rem] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
                {/* Header info */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#E2E6F0] dark:border-[#333333]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border uppercase tracking-wider ${getEntityTypeBadge(currentItem.entityType)}`}>
                        {currentItem.entityType}
                      </span>
                      <span className="font-mono text-xs text-[#E85002] font-bold tracking-wider">
                        ITEM #{currentItem.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getStatusBadge(currentItem.reviewStatus)}`}>
                        {currentItem.reviewStatus || 'UNREVIEWED'}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0D0F14] dark:text-[#F9F9F9] tracking-tight">
                      {currentItem.entityValue}
                    </h2>
                  </div>

                  <div className="bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] rounded-xl px-5 py-3 text-right">
                    <span className="text-[11px] font-mono text-[#8B95AD] dark:text-[#A7A7A7] uppercase tracking-widest block">
                      Model Score
                    </span>
                    <span className="text-2xl font-black font-mono text-[#E85002]">
                      {(currentItem.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Evidential Context Box */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#E85002] uppercase tracking-wider flex items-center gap-2">
                      <FileText size={16} weight="bold" />
                      <span>Raw Evidential Context &amp; Span Annotation</span>
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] font-mono text-xs leading-relaxed text-[#0D0F14] dark:text-[#D4D4D4] whitespace-pre-wrap selection:bg-[#E85002]">
                    {(currentItem.surroundingText || currentItem.sourceSnippet || '')
                      .split(currentItem.entityValue)
                      .map((part: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <mark className="bg-[#E85002]/30 text-[#000000] dark:text-[#F9F9F9] px-2 py-0.5 rounded font-bold border border-[#E85002]/60 inline-block mx-0.5">
                              {currentItem.entityValue}
                            </mark>
                          )}
                        </React.Fragment>
                      ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8B95AD] dark:text-[#A7A7A7] px-1">
                    <span>
                      Source Artifact:{' '}
                      <strong className="text-[#0D0F14] dark:text-[#F9F9F9] font-medium">{currentItem.sourceDocument}</strong>
                    </span>
                    <span className="text-[#8B95AD] dark:text-[#646464]">Byte Offset Range: [1420 - 1465]</span>
                  </div>
                </div>

                {/* Normalized Value Input */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#E85002] uppercase tracking-wider flex items-center gap-2">
                      <PencilSimple size={16} weight="bold" />
                      <span>Verified Normalized Value</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditing((prev) => !prev)}
                      className="text-xs text-[#E85002] hover:text-[#F16001] font-bold cursor-pointer transition-colors"
                    >
                      {isEditing ? '✓ Done Editing' : 'Edit Normalized Value'}
                    </button>
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E85002] bg-[#F6F7FB] dark:bg-[#000000] text-sm font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] outline-none shadow-inner"
                      autoFocus
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] text-sm font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] flex items-center justify-between">
                      <span>{editValue}</span>
                      <span className="text-[10px] text-[#8B95AD] dark:text-[#646464] font-normal uppercase tracking-wider">Verified Token</span>
                    </div>
                  )}
                </div>

                {/* Investigator Audit Notes */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono font-bold text-[#E85002] uppercase tracking-wider flex items-center gap-2">
                    <ChatCircleDots size={16} weight="bold" />
                    <span>Investigator Audit Notes</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter justification, cross-reference document, or context for approval/rejection..."
                    value={activeComment}
                    onChange={(e) => setActiveComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] text-xs font-mono text-[#0D0F14] dark:text-[#F9F9F9] placeholder-[#8B95AD] dark:placeholder-[#646464] outline-none focus:border-[#E85002] transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Decision Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#E2E6F0] dark:border-[#333333]">
                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedIndex === 0}
                      onClick={() => handleSelect(selectedIndex - 1)}
                      className="p-2.5 rounded-xl bg-[#F6F7FB] hover:bg-[#E2E6F0] dark:bg-[#000000] dark:hover:bg-[#222222] border border-[#E2E6F0] dark:border-[#333333] disabled:opacity-25 text-[#0D0F14] dark:text-[#F9F9F9] cursor-pointer transition-colors"
                      title="Previous Item"
                    >
                      <CaretLeft size={16} weight="bold" />
                    </button>
                    <span className="text-xs font-mono text-[#8B95AD] dark:text-[#A7A7A7] px-2">
                      {selectedIndex + 1} / {reviewItems.length}
                    </span>
                    <button
                      type="button"
                      disabled={selectedIndex === reviewItems.length - 1}
                      onClick={() => handleSelect(selectedIndex + 1)}
                      className="p-2.5 rounded-xl bg-[#F6F7FB] hover:bg-[#E2E6F0] dark:bg-[#000000] dark:hover:bg-[#222222] border border-[#E2E6F0] dark:border-[#333333] disabled:opacity-25 text-[#0D0F14] dark:text-[#F9F9F9] cursor-pointer transition-colors"
                      title="Next Item"
                    >
                      <CaretRight size={16} weight="bold" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateDecision('FLAGGED')}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Flag size={15} weight="bold" />
                      <span>Flag</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateDecision('REJECTED')}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <XCircle size={15} weight="bold" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateDecision('APPROVED')}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white text-xs font-bold font-mono uppercase tracking-wider shadow-lg shadow-[#E85002]/25 transition-all cursor-pointer"
                    >
                      <CheckCircle size={16} weight="fill" />
                      <span>Mark Reviewed</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ─ Source Record Viewer ─ */}
              <div className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-[#E85002]" />
                    <h4 className="text-[11px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">Source Record Viewer</h4>
                    <span className="text-[10px] font-mono text-[#8B95AD]">· {MOCK_SOURCE_RECORD.recordId} · {MOCK_SOURCE_RECORD.fileName}</span>
                  </div>
                  {!revealedContent && (
                    <button
                      onClick={handleReveal}
                      disabled={revealing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white text-[11px] font-bold font-mono uppercase tracking-wider transition-colors disabled:opacity-60"
                    >
                      {revealing ? (
                        <><LockSimple size={13} />Revealing…</>
                      ) : (
                        <><Eye size={13} />Reveal Source</>  
                      )}
                    </button>
                  )}
                  {revealedContent && (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400">
                      <Eye size={13} /> Content Revealed — Will clear on close
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-[11px]">
                    {[
                      { label: 'Record ID', value: MOCK_SOURCE_RECORD.recordId },
                      { label: 'Record Type', value: MOCK_SOURCE_RECORD.recordType },
                      { label: 'Observed At', value: new Date(MOCK_SOURCE_RECORD.observedAt).toLocaleString() },
                      { label: 'Device', value: MOCK_SOURCE_RECORD.deviceId },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-[10px] font-mono text-[#8B95AD] uppercase tracking-wider">{f.label}</p>
                        <p className="font-bold text-[#0D0F14] dark:text-[#F9F9F9] mt-0.5 font-mono">{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Content with highlight */}
                  {revealedContent ? (
                    <div className="p-4 rounded-2xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] font-mono text-xs leading-relaxed">
                      <span className="text-[#8B95AD]">[0–8] </span>
                      <mark className="bg-[#E85002]/30 border border-[#E85002]/60 rounded px-1 font-bold text-[#0D0F14] dark:text-[#F9F9F9]">
                        {revealedContent.slice(MOCK_SOURCE_RECORD.startOffset, MOCK_SOURCE_RECORD.endOffset)}
                      </mark>
                      <span className="text-[#0D0F14] dark:text-[#D4D4D4]">{revealedContent.slice(MOCK_SOURCE_RECORD.endOffset)}</span>
                      <p className="text-[10px] text-amber-400 mt-2">Offsets: {MOCK_SOURCE_RECORD.startOffset}–{MOCK_SOURCE_RECORD.endOffset} highlighted</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333]">
                      <LockSimple size={18} className="text-[#8B95AD]" />
                      <p className="text-[12px] text-[#8B95AD] font-mono">Protected content — click Reveal Source to view. Action will be audited.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ─ Audit Trail ─ */}
              <div className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] flex items-center gap-2">
                  <ClockCounterClockwise size={15} className="text-[#E85002]" />
                  <h4 className="text-[11px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">Audit Trail</h4>
                  <span className="text-[10px] text-[#8B95AD] font-mono">(read-only)</span>
                </div>
                <div className="p-4 space-y-3">
                  {MOCK_AUDIT_EVENTS.map(ev => (
                    <div key={ev.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-start text-[11px] py-2 border-b border-[#F0F0F0] dark:border-[#222222] last:border-0">
                      <span className="font-mono text-[#8B95AD] whitespace-nowrap">{new Date(ev.occurredAt).toLocaleString()}</span>
                      <div>
                        <p className="font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{ev.action.replace(/_/g, ' ')}</p>
                        <p className="text-[#8B95AD]">{ev.performedBy}</p>
                      </div>
                      <div className="text-[#8B95AD]">
                        {ev.previousStatus && <p>{ev.previousStatus} → {ev.newStatus}</p>}
                        {ev.session && <p className="text-[10px] font-mono">{ev.session.workstationId}</p>}
                      </div>
                      <span className="text-[10px] font-mono text-[#8B95AD]">{ev.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-[2rem] p-12 text-center text-[#8B95AD] dark:text-[#A7A7A7] font-mono text-sm">
              Select an item from the verification queue to inspect details.
            </div>
          )}
        </div>
      )}

      {/* ─── Contradictions Tab ─────────────────────────────────────────────── */}
      {activeTab === 'CONTRADICTIONS' && (
        <div className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl p-12 text-center shadow-sm">
          <Info size={40} className="text-[#8B95AD] mx-auto mb-4" />
          <p className="text-[15px] font-bold text-[#0D0F14] dark:text-[#F9F9F9]">No Contradictions Found</p>
          <p className="text-[13px] text-[#8B95AD] mt-2">The current extraction result contains an empty contradictions array. When contradictions are detected, each claim will be shown side-by-side for review.</p>
        </div>
      )}

      {/* ─── Evidence Sets Tab ──────────────────────────────────────────────── */}
      {activeTab === 'EVIDENCE_SETS' && (
        <div className="space-y-4">
          {MOCK_EVIDENCE_SETS.map(es => (
            <div key={es.id} className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-mono text-[#8B95AD] uppercase tracking-wider">Evidence Set</p>
                  <p className="text-[13px] font-black text-[#0D0F14] dark:text-[#F9F9F9] font-mono">{es.id}</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30">{es.recordType}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                {[
                  { label: 'File', value: es.fileName },
                  { label: 'Record Count', value: es.recordCount },
                  { label: 'First Record', value: es.firstRecordId ?? '—' },
                  { label: 'Last Record', value: es.lastRecordId ?? `${es.recordIds?.length} explicit IDs` },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-mono text-[#8B95AD] uppercase tracking-wider">{f.label}</p>
                    <p className="font-bold text-[#0D0F14] dark:text-[#F9F9F9] mt-0.5 font-mono">{String(f.value)}</p>
                  </div>
                ))}
              </div>
              {es.recordIds && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {es.recordIds.map(r => (
                    <span key={r} className="text-[10px] font-mono px-2 py-1 bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] rounded-lg text-[#0D0F14] dark:text-[#F9F9F9]">{r}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}