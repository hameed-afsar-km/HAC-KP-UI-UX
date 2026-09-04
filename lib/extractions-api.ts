import {
  ExtractionJob,
  ExtractionEligibilityPreview,
  EligibleFileItem,
  ExtractionSubmissionPayload,
  ExtractionStatus
} from './types';

// In-memory persistent state for simulated backend operations during investigator session
let eligibilityState: Record<number, ExtractionEligibilityPreview> = {
  1001: {
    caseId: 1001,
    previewVersion: 'pv_20260903_1001_v1',
    generatedAt: '2026-09-03T13:45:00Z',
    targetSchemaVersion: 'v2.4.0-ontology',
    extractorVersion: 'v4.2.1-ner',
    modelVersion: 'roberta-graph-v3',
    estimatedJobCount: 2,
    files: [
      {
        fileId: 'ev-1001-01',
        fileName: 'unauthorized_tx_report_signed.pdf',
        deviceId: 'DEV-POS-ZURICH-8849',
        fileSizeBytes: 2458120,
        mediaType: 'application/pdf',
        classification: 'CHANGED',
        existingEntityCount: 14,
        isSelected: true
      },
      {
        fileId: 'ev-1001-02',
        fileName: 'gateway_telemetry_dump.json',
        deviceId: 'DEV-SRV-FRANKFURT-04',
        fileSizeBytes: 1840900,
        mediaType: 'application/json',
        classification: 'REUSABLE',
        existingJobId: 'JOB-EX-1001-02',
        existingEntityCount: 22,
        isSelected: false
      },
      {
        fileId: 'ev-1001-03',
        fileName: 'device_sensor_packet.pcap',
        deviceId: 'DEV-MOB-S23-019',
        fileSizeBytes: 8912400,
        mediaType: 'application/vnd.tcpdump.pcap',
        classification: 'NEW',
        existingEntityCount: 0,
        isSelected: true
      },
      {
        fileId: 'ev-1001-04',
        fileName: 'sim_swap_carrier_subpoena.pdf',
        deviceId: 'DEV-SIM-SWISSCOM-99',
        fileSizeBytes: 3120500,
        mediaType: 'application/pdf',
        classification: 'NEW',
        existingEntityCount: 0,
        isSelected: true
      },
      {
        fileId: 'ev-1001-05',
        fileName: 'encrypted_firmware_blob.bin',
        deviceId: 'DEV-UNKNOWN',
        fileSizeBytes: 14200000,
        mediaType: 'application/octet-stream',
        classification: 'INELIGIBLE',
        ineligibilityReason: 'Binary payload lacks cryptographic decryption key or supported parser spec.',
        existingEntityCount: 0,
        isSelected: false
      },
      {
        fileId: 'ev-1001-06',
        fileName: 'corrupted_packet_fragment.tmp',
        deviceId: 'DEV-MOB-S23-019',
        fileSizeBytes: 10480,
        mediaType: 'application/octet-stream',
        classification: 'FAILED',
        ineligibilityReason: 'Prior extraction attempt failed with CRC-32 checksum error. Repair required.',
        existingJobId: 'JOB-EX-1001-04',
        existingEntityCount: 0,
        isSelected: false
      }
    ],
    summary: {
      totalFiles: 6,
      eligibleCount: 3,
      reusableCount: 1,
      processingCount: 0,
      ineligibleCount: 1,
      requiresExtractionCount: 3
    }
  }
};

let jobsState: Record<number, ExtractionJob[]> = {
  1001: [
    {
      id: 'JOB-EX-1001-01',
      caseId: 1001,
      fileName: 'unauthorized_tx_report_signed.pdf',
      fileId: 'ev-1001-01',
      deviceId: 'DEV-POS-ZURICH-8849',
      mediaType: 'application/pdf',
      schemaVersion: 'v2.4.0-ontology',
      extractorVersion: 'v4.2.1-ner',
      modelVersion: 'roberta-graph-v3',
      status: 'COMPLETED',
      progressPercent: 100,
      currentStage: 'PERSISTING',
      recordsProcessed: 48,
      totalRecords: 48,
      entityCount: 14,
      relationshipCount: 9,
      warningCount: 0,
      warnings: [],
      submittedTime: '2026-08-25T10:15:00Z',
      completedTime: '2026-08-25T10:16:42Z',
      durationSeconds: 102,
      canCancel: false,
      canRetry: false,
      canDownloadResult: true,
      attemptNumber: 1
    },
    {
      id: 'JOB-EX-1001-02',
      caseId: 1001,
      fileName: 'gateway_telemetry_dump.json',
      fileId: 'ev-1001-02',
      deviceId: 'DEV-SRV-FRANKFURT-04',
      mediaType: 'application/json',
      schemaVersion: 'v2.4.0-ontology',
      extractorVersion: 'v4.2.1-ner',
      modelVersion: 'roberta-graph-v3',
      status: 'COMPLETED_WITH_WARNINGS',
      progressPercent: 100,
      currentStage: 'PERSISTING',
      recordsProcessed: 840,
      totalRecords: 840,
      entityCount: 22,
      relationshipCount: 18,
      warningCount: 2,
      warnings: [
        'Timestamp format in record #412 has ambiguous timezone; normalized to UTC.',
        'Non-standard MAC address syntax normalized to IEEE 802 standard.'
      ],
      submittedTime: '2026-08-26T14:35:00Z',
      completedTime: '2026-08-26T14:38:15Z',
      durationSeconds: 195,
      canCancel: false,
      canRetry: false,
      canDownloadResult: true,
      attemptNumber: 1
    },
    {
      id: 'JOB-EX-1001-03',
      caseId: 1001,
      fileName: 'device_sensor_packet.pcap',
      fileId: 'ev-1001-03',
      deviceId: 'DEV-MOB-S23-019',
      mediaType: 'application/vnd.tcpdump.pcap',
      schemaVersion: 'v2.4.0-ontology',
      extractorVersion: 'v4.2.1-ner',
      modelVersion: 'roberta-graph-v3',
      status: 'PROCESSING',
      progressPercent: 68,
      currentStage: 'EXTRACTING_RELATIONSHIPS',
      recordsProcessed: 1420,
      totalRecords: 2088,
      entityCount: 18,
      relationshipCount: 12,
      warningCount: 1,
      warnings: ['Transient packet retransmission encountered at offset 0x4F02.'],
      submittedTime: '2026-08-27T08:16:00Z',
      canCancel: true,
      canRetry: false,
      canDownloadResult: false,
      attemptNumber: 1
    },
    {
      id: 'JOB-EX-1001-04',
      caseId: 1001,
      fileName: 'corrupted_packet_fragment.tmp',
      fileId: 'ev-1001-06',
      deviceId: 'DEV-MOB-S23-019',
      mediaType: 'application/octet-stream',
      schemaVersion: 'v2.4.0-ontology',
      extractorVersion: 'v4.2.1-ner',
      modelVersion: 'roberta-graph-v3',
      status: 'FAILED',
      progressPercent: 32,
      currentStage: 'LOADING_CONTENT',
      recordsProcessed: 12,
      totalRecords: 240,
      entityCount: 0,
      relationshipCount: 0,
      warningCount: 0,
      errorMessage: 'FATAL_CORRUPTION: Stream terminated abruptly. Checksum CRC-32 does not match evidential manifest.',
      submittedTime: '2026-08-27T09:00:00Z',
      completedTime: '2026-08-27T09:00:18Z',
      durationSeconds: 18,
      canCancel: false,
      canRetry: true,
      canDownloadResult: false,
      attemptNumber: 1
    }
  ]
};

// GET /api/v1/cases/{caseId}/entity-extractions/eligibility
export async function getBackendEligibility(
  caseId: number | string
): Promise<ExtractionEligibilityPreview> {
  const numId = Number(caseId);
  const existing = eligibilityState[numId];
  if (existing) return JSON.parse(JSON.stringify(existing));

  // Fallback for cases without customized preview
  const defaultPreview: ExtractionEligibilityPreview = {
    caseId: numId,
    previewVersion: `pv_${Date.now()}_${numId}`,
    generatedAt: new Date().toISOString(),
    targetSchemaVersion: 'v2.4.0-ontology',
    extractorVersion: 'v4.2.1-ner',
    modelVersion: 'roberta-graph-v3',
    estimatedJobCount: 1,
    files: [
      {
        fileId: `ev-${numId}-01`,
        fileName: 'case_intake_dossier.pdf',
        deviceId: 'DEV-INTERNAL-01',
        fileSizeBytes: 1024000,
        mediaType: 'application/pdf',
        classification: 'NEW',
        isSelected: true
      }
    ],
    summary: {
      totalFiles: 1,
      eligibleCount: 1,
      reusableCount: 0,
      processingCount: 0,
      ineligibleCount: 0,
      requiresExtractionCount: 1
    }
  };
  eligibilityState[numId] = defaultPreview;
  return defaultPreview;
}

// POST /api/v1/cases/{caseId}/entity-extractions
export async function submitBackendExtractionJobs(
  caseId: number | string,
  payload: ExtractionSubmissionPayload
): Promise<{ success: boolean; createdJobs: ExtractionJob[]; error?: string; code?: number }> {
  const numId = Number(caseId);
  const currentPreview = eligibilityState[numId];

  // Concurrency check: If preview version does not match, return 409
  if (currentPreview && payload.previewVersion !== currentPreview.previewVersion) {
    return {
      success: false,
      createdJobs: [],
      error: '409 Conflict: Extraction eligibility preview was superseded. Refreshing latest eligibility state.',
      code: 409
    };
  }

  if (!payload.selectedFileIds || payload.selectedFileIds.length === 0) {
    return {
      success: false,
      createdJobs: [],
      error: '400 Bad Request: No eligible files selected for extraction.',
      code: 400
    };
  }

  const newJobs: ExtractionJob[] = payload.selectedFileIds.map((fileId, idx) => {
    const fileMeta = currentPreview?.files.find((f) => f.fileId === fileId);
    return {
      id: `JOB-EX-${numId}-${Date.now().toString().slice(-4)}${idx}`,
      caseId: numId,
      fileName: fileMeta?.fileName || `evidence_artifact_${fileId}.dat`,
      fileId: fileId,
      deviceId: fileMeta?.deviceId || 'DEV-AUTO-ASSIGNED',
      mediaType: fileMeta?.mediaType || 'application/octet-stream',
      schemaVersion: currentPreview?.targetSchemaVersion || 'v2.4.0-ontology',
      extractorVersion: currentPreview?.extractorVersion || 'v4.2.1-ner',
      modelVersion: currentPreview?.modelVersion || 'roberta-graph-v3',
      status: 'PROCESSING',
      progressPercent: 10,
      currentStage: 'QUEUED',
      recordsProcessed: 0,
      totalRecords: 100,
      entityCount: 0,
      relationshipCount: 0,
      warningCount: 0,
      submittedTime: new Date().toISOString(),
      canCancel: true,
      canRetry: false,
      canDownloadResult: false,
      attemptNumber: 1,
      idempotencyKey: payload.idempotencyKey
    };
  });

  if (!jobsState[numId]) {
    jobsState[numId] = [];
  }
  jobsState[numId] = [...newJobs, ...jobsState[numId]];

  // Invalidate preview version to demonstrate 409 guard
  if (currentPreview) {
    currentPreview.previewVersion = `pv_${Date.now()}_${numId}_updated`;
  }

  return { success: true, createdJobs: newJobs };
}

// GET /api/v1/cases/{caseId}/entity-extractions
export async function getBackendExtractionJobs(
  caseId: number | string
): Promise<ExtractionJob[]> {
  const numId = Number(caseId);
  return jobsState[numId] ? JSON.parse(JSON.stringify(jobsState[numId])) : [];
}

// POST /api/v1/entity-extractions/{extractionId}/cancel
export async function cancelBackendExtractionJob(
  extractionId: string,
  options?: { reason?: string }
): Promise<{ success: boolean; job?: ExtractionJob; error?: string }> {
  for (const caseId of Object.keys(jobsState)) {
    const numId = Number(caseId);
    const jobIndex = jobsState[numId].findIndex((j) => j.id === extractionId);
    if (jobIndex !== -1) {
      const current = jobsState[numId][jobIndex];
      if (current.status !== 'PROCESSING' && current.status !== 'PENDING') {
        return { success: false, error: `Job is already in terminal status ${current.status}.` };
      }

      // Transition to CANCELLING then CANCELLED, preserving partial results
      current.status = 'CANCELLED';
      current.canCancel = false;
      current.canRetry = true;
      current.completedTime = new Date().toISOString();
      return { success: true, job: { ...current } };
    }
  }
  return { success: false, error: 'Job not found.' };
}

// POST /api/v1/entity-extractions/{extractionId}/retry
export async function retryBackendExtractionJob(
  extractionId: string,
  optionsOrKey?: string | { reason?: string; targetSchemaVersion?: string },
  retryReason?: string
): Promise<{ success: boolean; newJob?: ExtractionJob; error?: string }> {
  const key = typeof optionsOrKey === 'string' ? optionsOrKey : `idem_${Date.now()}`;
  for (const caseId of Object.keys(jobsState)) {
    const numId = Number(caseId);
    const target = jobsState[numId].find((j) => j.id === extractionId);
    if (target) {
      const newAttemptId = `JOB-EX-${numId}-ATTEMPT-${Date.now().toString().slice(-4)}`;
      const newJob: ExtractionJob = {
        ...target,
        id: newAttemptId,
        previousAttemptId: target.id,
        attemptNumber: (target.attemptNumber || 1) + 1,
        status: 'PROCESSING',
        progressPercent: 5,
        currentStage: 'QUEUED',
        recordsProcessed: 0,
        errorMessage: undefined,
        submittedTime: new Date().toISOString(),
        completedTime: undefined,
        canCancel: true,
        canRetry: false,
        canDownloadResult: false,
        idempotencyKey: key
      };

      // Add as new attempt without deleting original historical state
      jobsState[numId].unshift(newJob);
      return { success: true, newJob };
    }
  }
  return { success: false, error: 'Job not found.' };
}

export async function startIncrementalExtraction(
  caseId: number | string,
  payload: {
    fileIds: string[];
    previewVersion: string;
    expectedSchemaVersion: string;
  }
): Promise<{ success: boolean; createdJobs: ExtractionJob[]; error?: string }> {
  const res = await submitBackendExtractionJobs(caseId, {
    selectedFileIds: payload.fileIds,
    previewVersion: payload.previewVersion,
    expectedSchemaVersion: payload.expectedSchemaVersion
  });
  if (!res.success) {
    const error: any = new Error(res.error || 'Extraction failed');
    error.status = res.code || 500;
    throw error;
  }
  return res;
}

