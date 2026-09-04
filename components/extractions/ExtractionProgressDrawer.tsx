'use client';

import React, { useState } from 'react';
import { ExtractionJob, ExtractionStatus } from '@/lib/types';
import {
  cancelBackendExtractionJob,
  retryBackendExtractionJob
} from '@/lib/extractions-api';
import {
  X,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  XCircle,
  DownloadSimple,
  Clock,
  HardDrives
} from '@phosphor-icons/react';

interface ExtractionProgressDrawerProps {
  job: ExtractionJob | null;
  onClose: () => void;
  onJobUpdated: () => void;
}

export default function ExtractionProgressDrawer({
  job,
  onClose,
  onJobUpdated
}: ExtractionProgressDrawerProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRetryConfirm, setShowRetryConfirm] = useState(false);
  const [retryReason, setRetryReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!job) return null;

  const handleCancel = async () => {
    setIsCancelling(true);
    setActionFeedback(null);
    try {
      await cancelBackendExtractionJob(job.id, {
        reason: 'Investigator requested manual halt'
      });
      setActionFeedback('Cancellation request received by worker. Job status is now CANCELLING.');
      setShowCancelConfirm(false);
      onJobUpdated();
    } catch (err: any) {
      setActionFeedback(err.message || 'Failed to cancel job.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setActionFeedback(null);
    try {
      const resp = await retryBackendExtractionJob(job.id, {
        reason: retryReason || 'Investigator requested manual retry after inspection',
        targetSchemaVersion: job.schemaVersion
      });
      setActionFeedback(`New extraction attempt spawned: ${resp.newJob?.id || 'new attempt'}. State set to PENDING.`);
      setShowRetryConfirm(false);
      onJobUpdated();
    } catch (err: any) {
      setActionFeedback(err.message || 'Failed to submit retry attempt.');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStageIndicator = (stage: string) => {
    const isPastOrCurrent =
      (stage === 'FILE_VALIDATION' && job.progressPercent >= 15) ||
      (stage === 'OCR_TEXT_EXTRACTION' && job.progressPercent >= 45) ||
      (stage === 'NER_NORMALIZATION' && job.progressPercent >= 75) ||
      (stage === 'GRAPH_INTEGRATION' && job.progressPercent >= 95) ||
      (stage === 'COMPLETED' && job.progressPercent === 100);

    const isCurrent = job.currentStage === stage;

    return { isPastOrCurrent, isCurrent };
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-[#F9F9F9] border-l border-[#E2E2E2] dark:bg-[#121212] dark:border-[#333333] shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200 text-[#000000] dark:text-[#F9F9F9]">
      {/* Header */}
      <div className="p-6 border-b border-[#E2E2E2] dark:border-[#333333] flex items-start justify-between bg-white dark:bg-[#000000]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#E85002] text-white shadow-xs">
              EXTRACTION PIPELINE
            </span>
            <span className="font-mono text-xs text-[#E85002] font-bold">
              Attempt #{job.attemptNumber || 1}
            </span>
          </div>
          <h3 className="text-base font-bold text-[#000000] dark:text-[#F9F9F9] break-all">
            {job.id}
          </h3>
          <div className="text-xs text-[#646464] dark:text-[#A7A7A7]">
            Target: <strong className="text-[#000000] dark:text-[#F9F9F9]">{job.fileName}</strong>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-[#646464] hover:text-[#000000] hover:bg-[#F0F0F0] dark:hover:bg-[#1C1C1C] dark:hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="p-3.5 rounded-2xl bg-[#E85002]/15 border border-[#E85002]/30 text-xs font-bold text-[#E85002]">
            {actionFeedback}
          </div>
        )}

        {/* Status & Progress Card */}
        <div className="rounded-3xl border border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#000000] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#646464] dark:text-[#A7A7A7] uppercase tracking-wider">
              Server Reported Progress
            </span>
            <span className="text-xl font-bold font-mono text-[#E85002]">
              {job.progressPercent}%
            </span>
          </div>

          <div className="w-full bg-[#F0F0F0] dark:bg-[#1C1C1C] rounded-full h-2.5 overflow-hidden border border-[#E2E2E2] dark:border-[#333333]">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                job.status === 'COMPLETED' || job.status === 'COMPLETED_WITH_WARNINGS'
                  ? 'bg-emerald-500'
                  : job.status === 'FAILED'
                  ? 'bg-rose-500'
                  : job.status === 'CANCELLED'
                  ? 'bg-slate-400'
                  : 'bg-[#E85002]'
              }`}
              style={{ width: `${job.progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">STATUS</span>
              <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{job.status}</span>
            </div>
            <div>
              <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">RECORDS PROCESSED</span>
              <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">
                {job.recordsProcessed || 0} / {job.totalRecords || 0}
              </span>
            </div>
            <div>
              <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">EXTRACTED ENTITIES</span>
              <span className="font-bold text-[#E85002]">{job.entityCount}</span>
            </div>
            <div>
              <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">RELATIONSHIPS LINKED</span>
              <span className="font-bold text-[#E85002]">{job.relationshipCount}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Execution Stages */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-mono font-bold text-[#E85002] tracking-wider">
            Pipeline Execution Stages
          </div>

          <div className="space-y-2">
            {[
              { id: 'FILE_VALIDATION', label: '1. File Cryptographic & Integrity Validation' },
              { id: 'OCR_TEXT_EXTRACTION', label: '2. Multi-Modal Ingestion & OCR Preprocessing' },
              { id: 'NER_NORMALIZATION', label: '3. Neural Entity Extraction & Normalization' },
              { id: 'GRAPH_INTEGRATION', label: '4. Ontological Verification & Relationship Linking' },
              { id: 'COMPLETED', label: '5. Pipeline Manifest Sealed & Available' }
            ].map((st) => {
              const { isPastOrCurrent, isCurrent } = getStageIndicator(st.id);

              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-2xl border text-xs font-mono flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'border-[#E85002] bg-[#E85002]/10 text-[#000000] dark:text-white shadow-xs'
                      : isPastOrCurrent
                      ? 'border-[#E85002]/30 bg-[#E85002]/5 text-[#000000] dark:text-[#F9F9F9]'
                      : 'border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#000000] text-[#646464] opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCurrent ? (
                      <ArrowsClockwise size={16} weight="bold" className="text-[#E85002] animate-spin flex-shrink-0" />
                    ) : isPastOrCurrent ? (
                      <CheckCircle size={16} weight="fill" className="text-[#E85002] flex-shrink-0" />
                    ) : (
                      <Clock size={16} weight="bold" className="text-[#646464] flex-shrink-0" />
                    )}
                    <span className="font-semibold">{st.label}</span>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E85002]">
                      CURRENT
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warnings Section */}
        {job.warningCount && job.warningCount > 0 ? (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <Warning size={16} weight="fill" className="text-amber-500" />
              <span>Non-Fatal Extraction Warnings ({job.warningCount})</span>
            </div>
            <ul className="space-y-1 font-mono text-[11px] text-amber-700 dark:text-amber-400 pl-4 list-disc">
              {job.warningDetails && job.warningDetails.length > 0 ? (
                job.warningDetails.map((w: string, idx: number) => <li key={idx}>{w}</li>)
              ) : (
                <li>Partial OCR ambiguity in evidentiary headers; default fallback applied.</li>
              )}
            </ul>
          </div>
        ) : null}

        {/* Error Details Section (If FAILED) */}
        {job.errorMessage && (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
              <XCircle size={16} weight="fill" className="text-rose-500" />
              <span>Execution Failure Diagnostic</span>
            </div>
            <p className="font-mono text-[11px] text-rose-700 dark:text-rose-400">
              {job.errorMessage}
            </p>
          </div>
        )}

        {/* Metadata Details */}
        <div className="rounded-2xl border border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#000000] p-4 text-xs font-mono space-y-1.5 text-[#646464] dark:text-[#A7A7A7]">
          <div className="flex justify-between">
            <span>Extractor Model:</span>
            <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{job.extractorVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Ontology Schema:</span>
            <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{job.schemaVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Device ID:</span>
            <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{job.deviceId}</span>
          </div>
          <div className="flex justify-between">
            <span>File ID:</span>
            <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{job.fileId}</span>
          </div>
          <div className="flex justify-between">
            <span>Submitted:</span>
            <span>{new Date(job.submittedTime).toLocaleString()}</span>
          </div>
          {job.completedTime && (
            <div className="flex justify-between">
              <span>Finished:</span>
              <span>{new Date(job.completedTime).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Row Actions */}
      <div className="p-4 border-t border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#000000] space-y-3">
        {showCancelConfirm ? (
          <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs space-y-2">
            <p className="font-bold text-rose-900 dark:text-rose-200">
              Confirm cancellation of active extraction job?
            </p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              Cancellation is non-immediate. Partial results and evidential files will remain preserved in audit records.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-3 py-1 rounded-xl bg-white dark:bg-[#1C1C1C] text-[#000000] dark:text-white font-semibold cursor-pointer"
              >
                Keep Running
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold cursor-pointer"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        ) : showRetryConfirm ? (
          <div className="p-3.5 rounded-2xl border border-[#E85002]/40 bg-[#F0F0F0] dark:bg-[#000000] text-xs space-y-2 shadow-sm">
            <p className="font-bold text-[#000000] dark:text-[#F9F9F9]">
              Create new extraction attempt?
            </p>
            <p className="text-[11px] text-[#646464] dark:text-[#A7A7A7]">
              Original attempt #{job.attemptNumber || 1} will be preserved in historical audit records.
            </p>
            <input
              type="text"
              placeholder="Optional retry justification reason..."
              value={retryReason}
              onChange={(e) => setRetryReason(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#121212] text-xs outline-none focus:border-[#E85002]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRetryConfirm(false)}
                className="px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-[#000000] dark:bg-[#1C1C1C] dark:text-white font-bold cursor-pointer border border-[#E2E2E2] dark:border-[#333333]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-3 py-1 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white font-bold cursor-pointer shadow-lg shadow-[#E85002]/25"
              >
                {isRetrying ? 'Launching...' : 'Submit Attempt'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#646464] hover:text-[#000000] bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#000000] dark:text-slate-300 transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              {job.canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border border-rose-500/30 dark:text-rose-300 cursor-pointer"
                >
                  <XCircle size={15} weight="bold" />
                  <span>Cancel Job</span>
                </button>
              )}

              {job.canRetry && (
                <button
                  type="button"
                  onClick={() => setShowRetryConfirm(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E85002] hover:bg-[#F16001] text-white cursor-pointer shadow-lg shadow-[#E85002]/25"
                >
                  <ArrowsClockwise size={15} weight="bold" />
                  <span>Retry Extraction</span>
                </button>
              )}

              {job.canDownloadResult && (
                <a
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(job, null, 2)
                  )}`}
                  download={`extraction_${job.id}_result.json`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F0F0F0] hover:bg-[#E85002]/10 text-[#000000] border border-[#E2E2E2] dark:bg-[#000000] dark:text-[#F9F9F9] dark:border-[#333333]"
                >
                  <DownloadSimple size={15} weight="bold" className="text-[#E85002]" />
                  <span>JSON Result</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
