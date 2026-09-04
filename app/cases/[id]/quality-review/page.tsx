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
  Cpu
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
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'REJECTED':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    case 'FLAGGED':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    default:
      return 'bg-[#222222] text-[#A7A7A7] border-[#333333]';
  }
}

export default function QualityReviewPage() {
  const params = useParams();
  const caseId = params?.id as string;

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
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl bg-[#111111] border border-[#E85002] text-[#F9F9F9] text-xs font-mono font-bold shadow-2xl shadow-[#E85002]/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check size={16} className="text-[#E85002]" weight="bold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#111111] border border-[#333333] rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="px-8 py-4 border-b border-[#333333] bg-[#000000] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest bg-[#E85002] text-[#000000] px-3 py-1 rounded-md">
              STAGE 04
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#A7A7A7]">
              CASE #{caseId}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              ✓ {stats.approved} Approved
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
              ! {stats.flagged} Flagged
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#222222] border border-[#333333] text-[#A7A7A7] font-bold">
              {stats.pending} Pending
            </span>
          </div>
        </div>

        <div className="px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-black text-[#F9F9F9] tracking-tight">
              Officer Verification &amp; Quality Review
            </h1>
            <p className="text-[14px] text-[#A7A7A7] leading-relaxed">
              Verify machine-extracted entities against original source texts. Confirm accurate tokens, adjust normalized values, or flag ambiguous extractions before advancing to entity resolution.
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

      {/* Main Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Review Queue (4 cols) */}
        <div className="lg:col-span-4 bg-[#111111] border border-[#333333] rounded-[2rem] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#E85002] uppercase tracking-wider">
                Verification Queue
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#222222] text-[#F9F9F9] border border-[#333333]">
                {reviewItems.length}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#A7A7A7]">
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
                    : 'bg-[#000000] text-[#A7A7A7] border-[#333333] hover:border-[#646464] hover:text-[#F9F9F9]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredIndices.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-[#646464]">
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
                        ? 'border-[#E85002] bg-[#1a1410] shadow-[0_0_15px_rgba(232,80,2,0.15)] ring-1 ring-[#E85002]/40'
                        : 'border-[#333333] bg-[#000000] hover:border-[#E85002]/50 hover:bg-[#161616]'
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

                    <div className="font-bold text-sm text-[#F9F9F9] truncate">
                      {item.entityValue}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#A7A7A7] pt-1 border-t border-[#222222]">
                      <span className="text-[#E85002] font-semibold">
                        {(item.confidence * 100).toFixed(0)}% Conf
                      </span>
                      <span className="truncate max-w-[150px] text-[#646464]">
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
          <div className="lg:col-span-8 bg-[#111111] border border-[#333333] rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#333333]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border uppercase tracking-wider ${getEntityTypeBadge(currentItem.entityType)}`}>
                    {currentItem.entityType}
                  </span>
                  <span className="font-mono text-xs text-[#E85002] font-bold tracking-wider">
                    ITEM #{currentItem.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getStatusBadge(currentItem.reviewStatus)}`}>
                    {currentItem.reviewStatus || 'PENDING REVIEW'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#F9F9F9] tracking-tight">
                  {currentItem.entityValue}
                </h2>
              </div>

              <div className="bg-[#000000] border border-[#333333] rounded-xl px-5 py-3 text-right">
                <span className="text-[11px] font-mono text-[#A7A7A7] uppercase tracking-widest block">
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

              <div className="p-5 rounded-2xl bg-[#000000] border border-[#333333] font-mono text-xs leading-relaxed text-[#D4D4D4] whitespace-pre-wrap selection:bg-[#E85002]">
                {(currentItem.surroundingText || currentItem.sourceSnippet || '')
                  .split(currentItem.entityValue)
                  .map((part: string, i: number, arr: string[]) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <mark className="bg-[#E85002]/30 text-[#F9F9F9] px-2 py-0.5 rounded font-bold border border-[#E85002]/60 inline-block mx-0.5">
                          {currentItem.entityValue}
                        </mark>
                      )}
                    </React.Fragment>
                  ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#A7A7A7] px-1">
                <span>
                  Source Artifact:{' '}
                  <strong className="text-[#F9F9F9] font-medium">{currentItem.sourceDocument}</strong>
                </span>
                <span className="text-[#646464]">Byte Offset Range: [1420 - 1465]</span>
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
                  className="w-full px-4 py-3 rounded-xl border border-[#E85002] bg-[#000000] text-sm font-mono font-bold text-[#F9F9F9] outline-none shadow-inner"
                  autoFocus
                />
              ) : (
                <div className="p-4 rounded-xl bg-[#000000] border border-[#333333] text-sm font-mono font-bold text-[#F9F9F9] flex items-center justify-between">
                  <span>{editValue}</span>
                  <span className="text-[10px] text-[#646464] font-normal uppercase tracking-wider">Verified Token</span>
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
                className="w-full px-4 py-3 rounded-xl border border-[#333333] bg-[#000000] text-xs font-mono text-[#F9F9F9] placeholder-[#646464] outline-none focus:border-[#E85002] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Decision Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#333333]">
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedIndex === 0}
                  onClick={() => handleSelect(selectedIndex - 1)}
                  className="p-2.5 rounded-xl bg-[#000000] hover:bg-[#222222] border border-[#333333] disabled:opacity-25 text-[#F9F9F9] cursor-pointer transition-colors"
                  title="Previous Item"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <span className="text-xs font-mono text-[#A7A7A7] px-2">
                  {selectedIndex + 1} / {reviewItems.length}
                </span>
                <button
                  type="button"
                  disabled={selectedIndex === reviewItems.length - 1}
                  onClick={() => handleSelect(selectedIndex + 1)}
                  className="p-2.5 rounded-xl bg-[#000000] hover:bg-[#222222] border border-[#333333] disabled:opacity-25 text-[#F9F9F9] cursor-pointer transition-colors"
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
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Flag size={15} weight="bold" />
                  <span>Flag</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateDecision('REJECTED')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
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
                  <span>Approve Entity</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-[#111111] border border-[#333333] rounded-[2rem] p-12 text-center text-[#A7A7A7] font-mono text-sm">
            Select an item from the verification queue to inspect details.
          </div>
        )}
      </div>
    </div>
  );
}
