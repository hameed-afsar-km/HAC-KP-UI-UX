'use client';

import React, { useState, useEffect } from 'react';
import {
  getBackendEligibility,
  startIncrementalExtraction
} from '@/lib/extractions-api';
import { ExtractionEligibilityPreview, EligibleFileItem } from '@/lib/types';
import {
  X,
  Play,
  CheckCircle,
  Warning,
  ArrowsClockwise,
  Clock,
  ShieldCheck,
  Info
} from '@phosphor-icons/react';

interface ExtractionEligibilityModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onJobsStarted: () => void;
}

export default function ExtractionEligibilityModal({
  caseId,
  isOpen,
  onClose,
  onJobsStarted
}: ExtractionEligibilityModalProps) {
  const [preview, setPreview] = useState<ExtractionEligibilityPreview | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [concurrencyConflict, setConcurrencyConflict] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadEligibility() {
      setIsLoading(true);
      setErrorMessage(null);
      setConcurrencyConflict(false);
      try {
        const data = await getBackendEligibility(caseId);
        setPreview(data);

        // Pre-select files requiring extraction (NEW or CHANGED)
        const defaultSelected = data.files
          .filter((f) => f.classification === 'NEW' || f.classification === 'CHANGED')
          .map((f) => f.fileId);
        setSelectedFileIds(defaultSelected);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load authoritative eligibility preview from backend.');
      } finally {
        setIsLoading(false);
      }
    }

    loadEligibility();
  }, [caseId, isOpen]);

  if (!isOpen) return null;

  const toggleSelectFile = (fileId: string, classification: EligibleFileItem['classification']) => {
    if (classification === 'INELIGIBLE' || classification === 'PROCESSING') return;

    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleStartExtraction = async () => {
    if (selectedFileIds.length === 0 || !preview) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setConcurrencyConflict(false);

    try {
      await startIncrementalExtraction(caseId, {
        fileIds: selectedFileIds,
        previewVersion: preview.previewVersion,
        expectedSchemaVersion: preview.targetSchemaVersion
      });

      onJobsStarted();
      onClose();
    } catch (err: any) {
      if (err.status === 409) {
        setConcurrencyConflict(true);
        setErrorMessage(
          'Eligibility preview state is outdated (409 Conflict). Another investigator or process has modified case evidence. Refreshing authoritative state...'
        );
        try {
          const freshData = await getBackendEligibility(caseId);
          setPreview(freshData);
          setSelectedFileIds(
            freshData.files
              .filter((f) => f.classification === 'NEW' || f.classification === 'CHANGED')
              .map((f) => f.fileId)
          );
        } catch {
          // ignore
        }
      } else {
        setErrorMessage(err.message || 'Failed to trigger extraction execution on backend.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClassificationBadge = (classification: EligibleFileItem['classification']) => {
    switch (classification) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E85002] text-white">
            <CheckCircle size={13} weight="fill" />
            NEW
          </span>
        );
      case 'CHANGED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <ArrowsClockwise size={13} weight="bold" className="text-amber-500" />
            CHANGED
          </span>
        );
      case 'REUSABLE':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
            <ShieldCheck size={13} weight="fill" className="text-[#E85002]" />
            REUSABLE
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 border border-rose-500/30">
            <Warning size={13} weight="fill" />
            FAILED
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 border border-blue-500/30">
            <Clock size={13} weight="bold" className="animate-spin" />
            PROCESSING
          </span>
        );
      case 'INELIGIBLE':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 dark:text-slate-400">
            <X size={13} weight="bold" />
            INELIGIBLE
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl border bg-white border-[#E2E2E2] dark:bg-[#121212] dark:border-[#333333] p-6 sm:p-8 shadow-2xl space-y-6 text-[#000000] dark:text-[#F9F9F9] animate-in fade-in zoom-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E2E2] dark:border-[#333333] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#E85002] text-white shadow-xs">
                EXTRACTION ELIGIBILITY PREVIEW
              </span>
              <span className="font-mono text-xs text-[#E85002] font-bold">
                Target Case #{caseId}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#000000] dark:text-[#F9F9F9]">
              Incremental Extraction Launch Validation
            </h2>
            <p className="text-xs text-[#646464] dark:text-[#A7A7A7]">
              Authoritative backend validation of changed evidence artifacts. Reusable outputs are preserved without redundant reprocessing.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#646464] hover:text-[#000000] hover:bg-[#F0F0F0] dark:hover:bg-[#1C1C1C] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Error / Conflict Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <Warning size={16} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-500" />
            <div className="space-y-1 flex-1">
              <div className="font-bold">Execution Precondition Notice</div>
              <div>{errorMessage}</div>
              {concurrencyConflict && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                  Automatic resubmission is prohibited. Please inspect the updated file statuses below.
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <ArrowsClockwise size={32} weight="bold" className="text-[#E85002] animate-spin mx-auto" />
            <div className="text-xs font-mono text-[#646464] dark:text-[#A7A7A7]">
              Querying backend eligibility preview (/api/v1/cases/{caseId}/entity-extractions/eligibility)...
            </div>
          </div>
        ) : preview ? (
          <>
            {/* Metadata Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F0F0F0] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-xs font-mono">
              <div>
                <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">PREVIEW VERSION</span>
                <span className="font-bold text-[#E85002]">{preview.previewVersion}</span>
              </div>
              <div>
                <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">ONTOLOGY SCHEMA</span>
                <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{preview.targetSchemaVersion}</span>
              </div>
              <div>
                <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">EXTRACTOR MODEL</span>
                <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{preview.extractorVersion}</span>
              </div>
              <div>
                <span className="text-[#646464] dark:text-[#A7A7A7] text-[10px] block font-bold">ESTIMATED JOBS</span>
                <span className="font-bold text-[#E85002]">{selectedFileIds.length} to launch</span>
              </div>
            </div>

            {/* Counts overview */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-[#F0F0F0] border border-[#E2E2E2] dark:bg-[#000000] dark:border-[#333333]">
                Total Files: <strong className="text-[#000000] dark:text-[#F9F9F9]">{preview.summary.totalFiles}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#E85002]/15 text-[#E85002] font-bold border border-[#E85002]/30">
                Eligible: {preview.summary.eligibleCount}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
                Reusable: {preview.summary.reusableCount}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-500/10 text-slate-500 dark:text-slate-400">
                Ineligible: {preview.summary.ineligibleCount}
              </span>
            </div>

            {/* Files Classification Table */}
            <div className="rounded-2xl border border-[#E2E2E2] dark:border-[#333333] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E2E2E2] bg-[#F0F0F0] dark:border-[#333333] dark:bg-[#000000] font-mono text-[#000000] dark:text-[#F9F9F9]">
                  <tr>
                    <th className="px-4 py-3 font-bold w-10">Select</th>
                    <th className="px-4 py-3 font-bold">Evidence Artifact</th>
                    <th className="px-4 py-3 font-bold">Device Origin</th>
                    <th className="px-4 py-3 font-bold">Size</th>
                    <th className="px-4 py-3 font-bold">Classification</th>
                    <th className="px-4 py-3 font-bold">Backend Assessment / Ineligibility Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2E2] dark:divide-[#333333] text-[#333333] dark:text-[#D4D4D4]">
                  {preview.files.map((file) => {
                    const isEligible = file.classification !== 'INELIGIBLE' && file.classification !== 'PROCESSING';
                    const isChecked = selectedFileIds.includes(file.fileId);

                    return (
                      <tr
                        key={file.fileId}
                        onClick={() => toggleSelectFile(file.fileId, file.classification)}
                        className={`transition-colors ${
                          isEligible ? 'cursor-pointer hover:bg-[#E85002]/5' : 'opacity-60 bg-slate-50 dark:bg-slate-900/30'
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!isEligible}
                            onChange={() => toggleSelectFile(file.fileId, file.classification)}
                            className="rounded h-4 w-4 accent-[#E85002] cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-[#000000] dark:text-[#F9F9F9]">{file.fileName}</div>
                          <div className="text-[10px] font-mono text-[#646464] dark:text-[#A7A7A7]">ID: {file.fileId}</div>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[11px] text-[#646464] dark:text-[#A7A7A7]">
                          {file.deviceId}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[#646464] dark:text-[#A7A7A7]">
                          {(file.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </td>

                        <td className="px-4 py-3.5">
                          {getClassificationBadge(file.classification)}
                        </td>

                        <td className="px-4 py-3.5 text-[11px]">
                          {file.ineligibilityReason ? (
                            <span className="text-rose-700 dark:text-rose-400 font-medium">
                              {file.ineligibilityReason}
                            </span>
                          ) : file.classification === 'REUSABLE' ? (
                            <span className="text-[#646464] dark:text-[#A7A7A7] font-mono">
                              Cached from {file.existingJobId} ({file.existingEntityCount} entities verified)
                            </span>
                          ) : (
                            <span className="text-[#E85002] font-semibold font-mono">
                              Eligible for neural parsing &amp; relationship linking
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E2E2E2] dark:border-[#333333]">
              <div className="flex items-center gap-2 text-xs text-[#646464] dark:text-[#A7A7A7]">
                <Info size={16} weight="bold" className="text-[#E85002] flex-shrink-0" />
                <span>Selected: <strong className="text-[#000000] dark:text-[#F9F9F9]">{selectedFileIds.length}</strong> files for incremental queueing.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#646464] hover:text-[#000000] bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#000000] dark:text-slate-300 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={selectedFileIds.length === 0 || isSubmitting}
                  onClick={handleStartExtraction}
                  className="flex items-center gap-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] disabled:opacity-40 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-[#E85002]/25 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <ArrowsClockwise size={16} weight="bold" className="animate-spin" />
                  ) : (
                    <Play size={16} weight="fill" className="text-white" />
                  )}
                  <span>{isSubmitting ? 'Queueing Jobs...' : `Start Extraction (${selectedFileIds.length} Files)`}</span>
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
