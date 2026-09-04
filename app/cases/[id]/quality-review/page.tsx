'use client';

import React, { useState, useEffect } from 'react';
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
  User,
  ArrowRight,
  Sparkle,
  CaretRight,
  CaretLeft,
  FloppyDisk
} from '@phosphor-icons/react';

export default function QualityReviewPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [reviewItems, setReviewItems] = useState<QualityReviewItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeComment, setActiveComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const currentItem = reviewItems[selectedIndex] || null;

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setActiveComment(reviewItems[index].reviewerComment || '');
    setEditValue(reviewItems[index].entityValue);
    setIsEditing(false);
  };

  const updateDecision = (status: 'APPROVED' | 'REJECTED' | 'FLAGGED') => {
    if (!currentItem) return;

    const updated = [...reviewItems];
    updated[selectedIndex] = {
      ...currentItem,
      reviewStatus: status,
      reviewerComment: activeComment,
      entityValue: editValue,
      reviewedBy: 'Anita Rao (Lead Officer)',
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
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#E85002] text-white text-xs font-mono font-bold shadow-2xl shadow-[#E85002]/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          ✓ {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="badge badge-orange font-mono">Step 04</span>
              <span className="badge badge-muted font-mono">Case #{caseId}</span>
            </div>
            <h1 className="text-xl font-bold text-[#0D0F14] dark:text-[#EEF0F6]">
              Officer Verification
            </h1>
            <p className="text-[13px] text-[#8B95AD]">
              Review what ARGUS AI found in each file. Approve what’s correct, reject mistakes, or flag anything uncertain.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href={`/cases/${caseId}/resolution-review`}
              className="flex items-center gap-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-[#E85002]/20 active:scale-95"
            >
              <span>Find Matches</span>
              <ArrowRight size={14} weight="regular" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Review Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E2E2] dark:border-[#333333]">
            <span className="text-xs font-mono font-bold text-[#E85002] uppercase tracking-wider">
              Verification Queue ({reviewItems.length})
            </span>
            <span className="text-[10px] font-mono text-[#646464] dark:text-[#A7A7A7]">
              Index {selectedIndex + 1} of {reviewItems.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {reviewItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'border-[#E85002] bg-[#E85002]/10 text-[#000000] dark:text-white shadow-xs'
                      : 'border-[#E2E2E2] bg-[#F0F0F0] dark:border-[#333333] dark:bg-[#000000] text-[#646464] dark:text-[#A7A7A7] hover:border-[#E85002]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#E85002]/15 text-[#E85002]">
                      {item.entityType}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        item.reviewStatus === 'APPROVED'
                          ? 'text-emerald-600'
                          : item.reviewStatus === 'REJECTED'
                          ? 'text-rose-600'
                          : item.reviewStatus === 'FLAGGED'
                          ? 'text-amber-600'
                          : 'text-[#646464]'
                      }`}
                    >
                      {item.reviewStatus}
                    </span>
                  </div>

                  <div className="font-bold text-xs truncate text-[#000000] dark:text-[#F9F9F9]">
                    {item.entityValue}
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-[#646464] dark:text-[#A7A7A7]">
                    <span>{(item.confidence * 100).toFixed(0)}% Model Conf</span>
                    <span>{item.sourceDocument}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspection & Decision Console (8 cols) */}
        {currentItem && (
          <div className="lg:col-span-8 rounded-3xl border border-[#E2E2E2] bg-white dark:border-[#333333] dark:bg-[#121212] p-6 sm:p-8 shadow-xs space-y-6">
            {/* Item Details Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E2E2] dark:border-[#333333]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-[#E85002] text-white">
                    {currentItem.entityType}
                  </span>
                  <span className="font-mono text-xs text-[#E85002] font-bold">
                    ITEM #{currentItem.id}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#000000] dark:text-[#F9F9F9]">
                  {currentItem.entityValue}
                </h2>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="text-[#646464] dark:text-[#A7A7A7] block">Model Score</span>
                <span className="text-lg font-bold text-[#E85002]">
                  {(currentItem.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Snippet Context Highlight Card */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#E85002] uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={16} weight="bold" />
                Raw Evidential Context &amp; Span Annotation
              </span>

              <div className="p-5 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] font-mono text-xs leading-relaxed text-[#333333] dark:text-[#D4D4D4] whitespace-pre-wrap">
                {(currentItem.surroundingText || currentItem.sourceSnippet || '')
                  .split(currentItem.entityValue)
                  .map((part: string, i: number, arr: string[]) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <mark className="bg-[#E85002]/30 text-[#000000] dark:text-white px-1.5 py-0.5 rounded font-bold border border-[#E85002]/40">
                          {currentItem.entityValue}
                        </mark>
                      )}
                    </React.Fragment>
                  ))}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#646464] dark:text-[#A7A7A7] pt-1">
                <span>Source Artifact: <strong className="text-[#000000] dark:text-[#F9F9F9]">{currentItem.sourceDocument}</strong></span>
                <span>Byte Offset: [1420 - 1465]</span>
              </div>
            </div>

            {/* Editable Normalized Value */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#E85002] uppercase tracking-wider flex items-center gap-1.5">
                  <PencilSimple size={16} weight="bold" />
                  Verified Normalized Value
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing((prev) => !prev)}
                  className="text-[#E85002] hover:underline font-bold cursor-pointer"
                >
                  {isEditing ? 'Done Editing' : 'Edit Token Value'}
                </button>
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E85002] bg-[#F0F0F0] dark:bg-[#000000] text-xs font-mono font-bold text-[#000000] dark:text-[#F9F9F9] outline-none"
                />
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-xs font-mono font-bold text-[#000000] dark:text-[#F9F9F9]">
                  {editValue}
                </div>
              )}
            </div>

            {/* Auditor Justification Notes */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#E85002] uppercase tracking-wider flex items-center gap-1.5">
                <ChatCircleDots size={16} weight="bold" />
                Investigator Audit Notes
              </label>
              <textarea
                rows={2}
                placeholder="Add audit rationale, document reference, or reason for rejection..."
                value={activeComment}
                onChange={(e) => setActiveComment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] dark:bg-[#000000] text-xs font-mono text-[#000000] dark:text-[#F9F9F9] placeholder-[#646464] dark:placeholder-[#A7A7A7] outline-none focus:border-[#E85002]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E2E2E2] dark:border-[#333333]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedIndex === 0}
                  onClick={() => handleSelect(selectedIndex - 1)}
                  className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#000000] dark:hover:bg-[#1C1C1C] disabled:opacity-30 text-[#000000] dark:text-[#F9F9F9] cursor-pointer"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  disabled={selectedIndex === reviewItems.length - 1}
                  onClick={() => handleSelect(selectedIndex + 1)}
                  className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#000000] dark:hover:bg-[#1C1C1C] disabled:opacity-30 text-[#000000] dark:text-[#F9F9F9] cursor-pointer"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => updateDecision('FLAGGED')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold font-mono transition-colors cursor-pointer"
                >
                  <Flag size={15} weight="bold" />
                  <span>Flag</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateDecision('REJECTED')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold font-mono transition-colors cursor-pointer"
                >
                  <XCircle size={15} weight="bold" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateDecision('APPROVED')}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#E85002] hover:bg-[#F16001] text-white text-xs font-bold font-mono shadow-lg shadow-[#E85002]/25 transition-all cursor-pointer"
                >
                  <CheckCircle size={16} weight="fill" />
                  <span>Approve Entity</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
