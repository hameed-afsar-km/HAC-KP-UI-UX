'use client';

import React, { useState } from 'react';
import { ResolutionCandidate, ResolutionStatus } from '@/lib/types';
import {
  X,
  CheckCircle,
  Warning,
  GitMerge,
  ShieldWarning,
  Clock,
  ArrowsClockwise
} from '@phosphor-icons/react';

interface ResolutionDecisionModalProps {
  isOpen: boolean;
  candidate: ResolutionCandidate;
  actionType: 'ACCEPT' | 'REJECT' | 'DEFER' | 'REOPEN' | 'REVERSAL';
  onClose: () => void;
  onConfirm: (data: {
    decision: 'ACCEPT' | 'REJECT' | 'DEFER' | 'REOPEN';
    justification: string;
    overrideWarningsAcknowledged?: boolean;
    contradictionAcknowledged?: boolean;
    reversalReason?: string;
  }) => void;
}

export default function ResolutionDecisionModal({
  isOpen,
  candidate,
  actionType,
  onClose,
  onConfirm
}: ResolutionDecisionModalProps) {
  const [justification, setJustification] = useState('');
  const [overrideWarnings, setOverrideWarnings] = useState(false);
  const [overrideContradiction, setOverrideContradiction] = useState(false);
  const [reversalReason, setReversalReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (actionType === 'REVERSAL') {
      onConfirm({
        decision: 'REOPEN',
        justification: reversalReason || justification,
        reversalReason: reversalReason || justification
      });
      onClose();
      return;
    }

    onConfirm({
      decision: actionType,
      justification,
      overrideWarningsAcknowledged: overrideWarnings,
      contradictionAcknowledged: overrideContradiction
    });
    onClose();
  };

  const isAccept = actionType === 'ACCEPT';
  const isReject = actionType === 'REJECT';
  const isDefer = actionType === 'DEFER';
  const isReopen = actionType === 'REOPEN';
  const isReversal = actionType === 'REVERSAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border bg-white border-[#E2E2E2] dark:bg-[#121212] dark:border-[#333333] p-6 sm:p-8 shadow-2xl space-y-6 text-[#000000] dark:text-[#F9F9F9] animate-in fade-in zoom-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E2E2] dark:border-[#333333] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  isAccept
                    ? 'bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30'
                    : isReject
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                    : isDefer
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                    : isReversal
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                    : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                }`}
              >
                {isAccept
                  ? 'CONFIRM RESOLUTION ACCEPTANCE'
                  : isReject
                  ? 'CONFIRM CANDIDATE REJECTION'
                  : isDefer
                  ? 'DEFER RESOLUTION REVIEW'
                  : isReversal
                  ? 'SUBMIT MERGE REVERSAL REQUEST'
                  : 'REOPEN CANDIDATE'}
              </span>
              <span className="font-mono text-xs text-[#646464] dark:text-[#A7A7A7]">
                Candidate #{candidate.id}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#000000] dark:text-[#F9F9F9]">
              {isAccept
                ? 'Merge Entities into Canonical Identity'
                : isReject
                ? 'Suppress Candidate Match Pair'
                : isDefer
                ? 'Place Candidate in Deferred Review Queue'
                : isReversal
                ? 'Request Formal Asynchronous Merge Reversal'
                : 'Reopen Candidate for Re-investigation'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#646464] hover:text-[#000000] hover:bg-[#F0F0F0] dark:hover:bg-[#1C1C1C] dark:hover:text-white cursor-pointer transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {isAccept && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] space-y-2">
              <div className="font-bold text-[#000000] dark:text-[#F9F9F9] flex items-center gap-1.5">
                <GitMerge size={16} weight="bold" className="text-[#E85002]" />
                <span>Impact Assessment &amp; Graph Mutations:</span>
              </div>
              <ul className="space-y-1.5 text-[#646464] dark:text-[#A7A7A7] list-disc list-inside">
                <li>
                  <strong className="text-[#000000] dark:text-[#F9F9F9]">Affected Sources:</strong>{' '}
                  <code className="text-[#E85002] font-bold">{candidate.sourceA.temporaryId}</code> &amp;{' '}
                  <code className="text-[#E85002] font-bold">{candidate.sourceB.temporaryId}</code>
                </li>
                <li>
                  <strong className="text-[#000000] dark:text-[#F9F9F9]">Provisional Target Identity:</strong>{' '}
                  {candidate.provisionalCanonical.canonicalIdProposal}
                </li>
                <li>
                  <strong className="text-[#000000] dark:text-[#F9F9F9]">Relationships Affected:</strong>{' '}
                  {candidate.provisionalCanonical.relationshipsAffectedCount} edges reassigned
                </li>
                <li>
                  <strong className="text-[#000000] dark:text-[#F9F9F9]">Reversibility:</strong>{' '}
                  Fully auditable and reversible through authorized reversal request flow.
                </li>
              </ul>
            </div>

            {/* If warnings exist */}
            {candidate.hasWarnings && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Warning size={16} weight="fill" className="text-amber-500 flex-shrink-0" />
                  <span>Warnings Acknowledgment Required</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  This candidate has flagged quality review anomalies or low attribute overlap. You must explicitly acknowledge this condition to proceed.
                </p>
                <label className="flex items-center gap-2 pt-1 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideWarnings}
                    onChange={(e) => setOverrideWarnings(e.target.checked)}
                    className="rounded h-4 w-4 accent-[#E85002] cursor-pointer"
                  />
                  <span>I have inspected the warning conditions and authorize canonical resolution.</span>
                </label>
              </div>
            )}

            {/* If contradictions exist */}
            {candidate.hasContradictions && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldWarning size={16} weight="fill" className="text-rose-500 flex-shrink-0" />
                  <span>CRITICAL CONTRADICTION OVERRIDE</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">
                  Contradictory attributes exist between Source A and Source B. Merging requires explicit confirmation and mandatory justification notes.
                </p>
                <label className="flex items-center gap-2 pt-1 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideContradiction}
                    onChange={(e) => setOverrideContradiction(e.target.checked)}
                    className="rounded h-4 w-4 accent-rose-600 cursor-pointer"
                  />
                  <span>I acknowledge the conflicting attributes and confirm manual override resolution.</span>
                </label>
              </div>
            )}
          </div>
        )}

        {isReject && (
          <div className="p-4 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-xs font-mono space-y-2">
            <p className="font-bold text-[#000000] dark:text-[#F9F9F9]">Rejection Impact:</p>
            <p className="text-[#646464] dark:text-[#A7A7A7]">
              The candidate match pair will be suppressed from future automated pairing suggestions. Entities will remain separate identities in the investigation topology.
            </p>
          </div>
        )}

        {isDefer && (
          <div className="p-4 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-xs font-mono space-y-2">
            <p className="font-bold text-[#000000] dark:text-[#F9F9F9]">Deferral Terms:</p>
            <p className="text-[#646464] dark:text-[#A7A7A7]">
              The candidate will be moved to the deferred queue pending further evidential collection. No graph mutations will be executed.
            </p>
          </div>
        )}

        {isReversal && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 space-y-2">
              <p className="font-bold">Asynchronous Reversal Request</p>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">
                This will submit a formal merge reversal request to the backend worker. Canonical entity links will be restored to their prior independent states after async verification.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold block text-[#000000] dark:text-[#F9F9F9]">
                Reversal Justification Reason (Mandatory):
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain why this canonical identity merge must be reversed..."
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] dark:bg-[#000000] outline-none focus:border-[#E85002] text-xs text-[#000000] dark:text-[#F9F9F9]"
              />
            </div>
          </div>
        )}

        {!isReversal && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-xs font-mono">
              <label className="font-bold block text-[#000000] dark:text-[#F9F9F9]">
                Investigator Justification Note:
              </label>
              <textarea
                rows={3}
                required={candidate.hasContradictions && isAccept}
                placeholder="Document your investigative reasoning, corroborating documents, or evidence IDs..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] dark:bg-[#000000] outline-none focus:border-[#E85002] text-xs text-[#000000] dark:text-[#F9F9F9]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E2E2] dark:border-[#333333]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#646464] hover:text-[#000000] bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#000000] dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  (candidate.hasWarnings && isAccept && !overrideWarnings) ||
                  (candidate.hasContradictions && isAccept && !overrideContradiction)
                }
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                  isAccept
                    ? 'bg-[#E85002] hover:bg-[#F16001] text-white shadow-[#E85002]/25'
                    : isReject
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-700/20'
                    : isDefer
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-700/20'
                    : 'bg-[#E85002] hover:bg-[#F16001] text-white'
                } disabled:opacity-40`}
              >
                {isAccept
                  ? 'Confirm & Merge Identity'
                  : isReject
                  ? 'Confirm Rejection'
                  : isDefer
                  ? 'Confirm Deferral'
                  : 'Submit Decision'}
              </button>
            </div>
          </form>
        )}

        {isReversal && (
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E2E2] dark:border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#646464] hover:text-[#000000] bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#000000] dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!reversalReason.trim()}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-purple-700/20 cursor-pointer transition-all"
            >
              Submit Reversal Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
