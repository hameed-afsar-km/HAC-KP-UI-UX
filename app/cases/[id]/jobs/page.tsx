'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ExtractionJob, ExtractionStatus } from '@/lib/types';
import {
  getBackendExtractionJobs,
  getBackendEligibility
} from '@/lib/extractions-api';
import ExtractionEligibilityModal from '@/components/extractions/ExtractionEligibilityModal';
import ExtractionProgressDrawer from '@/components/extractions/ExtractionProgressDrawer';
import {
  Cpu,
  Play,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  ArrowRight,
  MagnifyingGlass,
  Funnel,
  ArrowsDownUp,
  DownloadSimple,
  Eye,
  XCircle,
  Clock,
  Database,
  Files,
  ShieldCheck,
  HardDrives
} from '@phosphor-icons/react';

export default function ExtractionJobsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = params?.id as string;

  // Data state
  const [jobs, setJobs] = useState<ExtractionJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Summary counts
  const [summaryCounts, setSummaryCounts] = useState({
    totalFiles: 6,
    eligibleFiles: 3,
    completedJobs: 2,
    processingJobs: 1,
    failedJobs: 1,
    requiresExtraction: 2
  });

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('ALL');
  const [warningsOnly, setWarningsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'submittedTime' | 'fileName' | 'entityCount' | 'warningCount' | 'status'>('submittedTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal / Drawer state
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ExtractionJob | null>(null);

  // Auto-polling state (Poll every 3s while active processing exists)
  const hasActiveJobs = useMemo(
    () => jobs.some((j) => j.status === 'PROCESSING' || j.status === 'PENDING' || j.status === 'CANCELLING'),
    [jobs]
  );

  const fetchJobs = useCallback(async () => {
    if (!caseId) return;
    try {
      const data = await getBackendExtractionJobs(caseId);
      setJobs(data);

      const comp = data.filter((j) => j.status === 'COMPLETED' || j.status === 'COMPLETED_WITH_WARNINGS').length;
      const proc = data.filter((j) => j.status === 'PROCESSING' || j.status === 'PENDING').length;
      const fail = data.filter((j) => j.status === 'FAILED').length;

      setSummaryCounts((prev) => ({
        ...prev,
        completedJobs: comp,
        processingJobs: proc,
        failedJobs: fail
      }));

      // If drawer is open, keep selected job data updated
      if (selectedJob) {
        const fresh = data.find((j) => j.id === selectedJob.id);
        if (fresh) setSelectedJob(fresh);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to fetch extraction jobs from backend.');
    } finally {
      setIsLoading(false);
    }
  }, [caseId, selectedJob]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Polling interval
  useEffect(() => {
    if (!hasActiveJobs) return;
    const interval = setInterval(() => {
      fetchJobs();
    }, 3000);
    return () => clearInterval(interval);
  }, [hasActiveJobs, fetchJobs]);

  // Also check eligibility summary on load
  useEffect(() => {
    if (!caseId) return;
    async function loadElig() {
      try {
        const el = await getBackendEligibility(caseId);
        setSummaryCounts((prev) => ({
          ...prev,
          totalFiles: el.summary.totalFiles,
          eligibleFiles: el.summary.eligibleCount,
          requiresExtraction: el.summary.requiresExtractionCount || el.files.filter((f) => f.classification === 'NEW' || f.classification === 'CHANGED').length
        }));
      } catch {
        // ignore fallback
      }
    }
    loadElig();
  }, [caseId]);

  // Deep linking: open drawer if ?jobId= is present
  useEffect(() => {
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl && jobs.length > 0) {
      const target = jobs.find((j) => j.id === jobIdFromUrl);
      if (target) setSelectedJob(target);
    }
  }, [searchParams, jobs]);

  const openDrawer = (job: ExtractionJob) => {
    setSelectedJob(job);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('jobId', job.id);
    router.replace(`/cases/${caseId}/jobs?${newParams.toString()}`);
  };

  const closeDrawer = () => {
    setSelectedJob(null);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('jobId');
    router.replace(`/cases/${caseId}/jobs?${newParams.toString()}`);
  };

  // Filter and Sort Pipeline
  const filteredAndSortedJobs = useMemo(() => {
    return jobs
      .filter((j) => {
        const matchesSearch =
          j.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.fileId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.deviceId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
        const matchesMedia = mediaTypeFilter === 'ALL' || j.mediaType === mediaTypeFilter;
        const matchesWarnings = !warningsOnly || (j.warningCount && j.warningCount > 0);

        return matchesSearch && matchesStatus && matchesMedia && matchesWarnings;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy];
        let valB: any = b[sortBy];

        if (sortBy === 'entityCount' || sortBy === 'warningCount') {
          return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
        }

        valA = String(valA || '');
        valB = String(valB || '');
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [jobs, searchQuery, statusFilter, mediaTypeFilter, warningsOnly, sortBy, sortOrder]);

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status: ExtractionStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCircle size={13} weight="fill" className="text-emerald-500" />
            COMPLETED
          </span>
        );
      case 'COMPLETED_WITH_WARNINGS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <Warning size={13} weight="fill" className="text-amber-500" />
            WARNINGS
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30">
            <ArrowsClockwise size={13} weight="bold" className="animate-spin text-[#E85002]" />
            PROCESSING
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
            <Clock size={13} weight="bold" />
            PENDING
          </span>
        );
      case 'CANCELLING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-500/20 text-slate-800 dark:text-slate-300 border border-slate-500/30">
            <ArrowsClockwise size={13} weight="bold" className="animate-spin" />
            CANCELLING
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 dark:text-slate-400">
            <XCircle size={13} weight="fill" />
            CANCELLED
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <Warning size={13} weight="fill" />
            FAILED
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl overflow-hidden shadow-sm animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="badge badge-orange font-mono">Step 02</span>
              <span className="badge badge-muted font-mono">Case #{caseId}</span>
            </div>
            <h1 className="text-xl font-bold text-[#0D0F14] dark:text-[#EEF0F6]">
              Analysis Jobs
            </h1>
            <p className="text-[13px] text-[#8B95AD]">
              ARGUS AI reads your files and pulls out names, devices, accounts and transactions. Track each job’s progress here.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsEligibilityOpen(true)}
              disabled={summaryCounts.requiresExtraction === 0}
              className="flex items-center gap-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] disabled:opacity-40 text-white px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-[#E85002]/20 active:scale-95 cursor-pointer"
            >
              <Play size={16} weight="fill" />
              <span>Run Analysis</span>
            </button>

            <Link
              href={`/cases/${caseId}/extractions`}
              className="flex items-center gap-1.5 rounded-xl bg-[#F1F3F9] hover:bg-[#E2E6F0] dark:bg-[#1E2435] dark:hover:bg-[#252D3E] text-[#0D0F14] dark:text-[#EEF0F6] border border-[#E2E6F0] dark:border-[#252D3E] px-4 py-2.5 text-[13px] font-semibold transition-all duration-150"
            >
              <span>View Findings</span>
              <ArrowRight size={14} weight="regular" />
            </Link>
          </div>
        </div>

        {/* Metric row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-[#E2E6F0] dark:divide-[#252D3E] border-t border-[#E2E6F0] dark:border-[#252D3E]">
          {[
            { label: 'Total files',       value: summaryCounts.totalFiles,           dim: false },
            { label: 'Eligible to run',   value: `${summaryCounts.eligibleFiles}`,   accent: true },
            { label: 'Completed',         value: `${summaryCounts.completedJobs}`,   dim: false },
            { label: 'In progress',       value: `${summaryCounts.processingJobs}`,  accent: true },
            { label: 'Failed',            value: `${summaryCounts.failedJobs}`,      red: true },
            { label: 'Incremental',       value: 'Active',                            accent: true },
          ].map((m) => (
            <div key={m.label} className="px-4 py-3">
              <p className="text-[10px] font-semibold text-[#8B95AD] uppercase tracking-wider">{m.label}</p>
              <p className={`text-[15px] font-bold mt-0.5 tabular-nums ${
                m.red ? 'text-rose-500' : m.accent ? 'text-[#E85002]' : 'text-[#0D0F14] dark:text-[#EEF0F6]'
              }`}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#161B27] border border-[#E2E6F0] dark:border-[#252D3E] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E85002]"
          />
          <input
            type="text"
            placeholder="Search by job ID, file name, device ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] dark:bg-[#000000] text-xs text-[#000000] dark:text-[#F9F9F9] placeholder-[#646464] dark:placeholder-[#A7A7A7] outline-none focus:border-[#E85002]"
          />
        </div>

        {/* Filter Badges & Warnings Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] dark:bg-[#000000] text-xs outline-none focus:border-[#E85002] cursor-pointer"
          >
            <option value="ALL">Status: All</option>
            <option value="COMPLETED">Completed</option>
            <option value="COMPLETED_WITH_WARNINGS">Completed w/ Warnings</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={() => setWarningsOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              warningsOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold'
                : 'border-[#E2E2E2] bg-[#F0F0F0] text-[#646464] dark:border-[#333333] dark:bg-[#000000] dark:text-[#A7A7A7]'
            }`}
          >
            <Warning size={14} weight={warningsOnly ? 'fill' : 'bold'} className="text-amber-500" />
            <span>Warnings Only</span>
          </button>

          <button
            type="button"
            onClick={fetchJobs}
            className="p-2 rounded-xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#000000] dark:hover:bg-[#1C1C1C] text-[#000000] dark:text-[#F9F9F9] transition-colors cursor-pointer"
            title="Refresh job status from backend"
          >
            <ArrowsClockwise size={15} weight="bold" className={hasActiveJobs ? 'animate-spin text-[#E85002]' : ''} />
          </button>
        </div>
      </div>

      {/* 3.4 Jobs Execution Table */}
      <div className="rounded-3xl border border-[#E2E2E2] bg-white dark:border-[#333333] dark:bg-[#121212] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E2E2E2] bg-[#F0F0F0] dark:border-[#333333] dark:bg-[#000000] font-mono text-[#000000] dark:text-[#F9F9F9]">
              <tr>
                <th
                  onClick={() => toggleSort('fileName')}
                  className="px-5 py-3.5 font-bold cursor-pointer hover:text-[#E85002]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Evidence File / Job ID</span>
                    <ArrowsDownUp size={12} weight="bold" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-bold">Device Origin</th>
                <th className="px-4 py-3.5 font-bold">Status &amp; Stage</th>
                <th className="px-4 py-3.5 font-bold">Progress</th>
                <th
                  onClick={() => toggleSort('entityCount')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:text-[#E85002]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Entities</span>
                    <ArrowsDownUp size={12} weight="bold" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('warningCount')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:text-[#E85002]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Warnings</span>
                    <ArrowsDownUp size={12} weight="bold" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('submittedTime')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:text-[#E85002]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted</span>
                    <ArrowsDownUp size={12} weight="bold" />
                  </div>
                </th>
                <th className="px-5 py-3.5 font-bold text-right">Row Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2E2] dark:divide-[#333333] text-[#333333] dark:text-[#D4D4D4]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-xs font-mono text-[#646464] dark:text-[#A7A7A7]">
                    Loading extraction execution jobs...
                  </td>
                </tr>
              ) : filteredAndSortedJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-xs font-mono text-[#646464] dark:text-[#A7A7A7]">
                    No extraction jobs match the current filters.
                  </td>
                </tr>
              ) : (
                filteredAndSortedJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => openDrawer(job)}
                    className="hover:bg-[#E85002]/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#000000] dark:text-[#F9F9F9] group-hover:text-[#E85002] transition-colors">
                        {job.fileName}
                      </div>
                      <div className="text-[10px] font-mono text-[#646464] dark:text-[#A7A7A7]">
                        {job.id} {job.attemptNumber && job.attemptNumber > 1 ? `(Attempt #${job.attemptNumber})` : ''}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-[11px] text-[#646464] dark:text-[#A7A7A7]">
                      {job.deviceId}
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {getStatusBadge(job.status)}
                        <div className="text-[10px] font-mono text-[#646464] dark:text-[#A7A7A7]">
                          Stage: {job.currentStage}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] text-[#646464] dark:text-[#A7A7A7]">
                          <span>{job.progressPercent}%</span>
                          <span>{job.recordsProcessed || 0}/{job.totalRecords || 0}</span>
                        </div>
                        <div className="w-full bg-[#F0F0F0] dark:bg-[#000000] rounded-full h-1.5 overflow-hidden border border-[#E2E2E2] dark:border-[#333333]">
                          <div
                            className={`h-full rounded-full transition-all ${
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
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono font-bold text-[#E85002]">
                      {job.entityCount}
                    </td>

                    <td className="px-4 py-4 font-mono">
                      {job.warningCount && job.warningCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 text-[11px]">
                          <Warning size={13} weight="fill" className="text-amber-500" />
                          {job.warningCount}
                        </span>
                      ) : (
                        <span className="text-[#646464] dark:text-[#A7A7A7]">0</span>
                      )}
                    </td>

                    <td className="px-4 py-4 font-mono text-[11px] text-[#646464] dark:text-[#A7A7A7]">
                      {new Date(job.submittedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 font-mono">
                        <button
                          type="button"
                          onClick={() => openDrawer(job)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#F0F0F0] hover:bg-[#E85002] hover:text-white dark:bg-[#1C1C1C] dark:hover:bg-[#E85002] text-[#000000] dark:text-[#F9F9F9] font-bold text-xs transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3.2 Incremental Extraction Eligibility Modal */}
      <ExtractionEligibilityModal
        caseId={caseId}
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
        onJobsStarted={() => {
          fetchJobs();
        }}
      />

      {/* 3.5 Slide-over Progress & Controls Drawer */}
      <ExtractionProgressDrawer
        job={selectedJob}
        onClose={closeDrawer}
        onJobUpdated={() => {
          fetchJobs();
        }}
      />
    </div>
  );
}
