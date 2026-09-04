import {
  ResolutionCandidate,
  ResolutionStatus,
  MergeHistoryRecord,
  ConfirmedCanonicalEntity
} from './types';

// In-memory persistent resolution state for investigation session
let candidatesState: Record<number, ResolutionCandidate[]> = {
  1001: [
    {
      id: 'cand_1001_001',
      caseId: 1001,
      entityType: 'PERSON',
      version: 1,
      status: 'IN_REVIEW',
      assignedReviewer: 'Anita Rao',
      createdTime: '2026-08-28T14:22:00Z',
      hasWarnings: true,
      hasContradictions: true,
      warningMessages: [
        'Device IMEI is linked to 2 previous fraud flags in secondary European banking network.',
        'Session timestamp delta between Zurich POS debit and VPN tunnel establishment is 1.42 seconds.'
      ],
      contradictionMessages: [
        'Geographical Contradiction: Cellular mast location in Zurich Enge contradicts IP exit node location in Frankfurt.'
      ],
      // Authoritative backend-provided confidence (Frontend NEVER calculates this)
      resolutionConfidence: 0.964,
      confidenceBand: 'HIGH',
      thresholds: {
        high: 0.85,
        medium: 0.60
      },
      resolutionModel: 'MultiModal-SimNet-GraphER',
      resolutionModelVersion: '4.2.0-prod',
      candidateGenerationTime: '2026-08-28T14:20:15Z',
      deviceIdentifiers: [
        'IMEI: 354892019482012 (Samsung Galaxy S23 Ultra)',
        'MAC: 00:1A:2B:3C:4D:5E (Zurich Gateway Interface)',
        'IP: 198.51.100.42 (M247 Frankfurt VPN Exit Node)'
      ],
      userPermissions: {
        canReview: true,
        canAccept: true,
        canReject: true,
        canDefer: true,
        canReopen: true,
        canRequestReversal: true
      },

      // Source A Dossier
      sourceA: {
        temporaryId: 'file_001:e14', // strictly marked temporary
        entityType: 'PERSON',
        displayLabel: 'Rao, Anita (Dispute Signatory)',
        fileName: 'unauthorized_tx_report_signed.pdf',
        fileId: 'ev-1001-01',
        deviceId: 'DEV-POS-ZURICH-8849',
        caseId: 1001,
        extractionConfidence: 0.985,
        extractionMethod: 'LayoutLMv3-ZeroShot-NER',
        firstObserved: '2026-08-24T22:18:38Z',
        lastObserved: '2026-08-25T09:30:00Z',
        attributes: [
          {
            key: 'legal_name',
            label: 'Legal Full Name',
            originalValue: 'Mrs. Anita Rao',
            normalizedValue: 'ANITA RAO',
            confidence: 0.99,
            provenance: 'Header declaration block 1',
            matchCategory: 'NORMALIZED_MATCH'
          },
          {
            key: 'phone_number',
            label: 'Primary Contact Mobile',
            originalValue: '+41 79 402 91 82',
            normalizedValue: '+41794029182',
            confidence: 0.96,
            provenance: 'Signatory contact box',
            matchCategory: 'NORMALIZED_MATCH'
          },
          {
            key: 'account_pan',
            label: 'Payment Account Number (PAN)',
            originalValue: '4532-****-****-9941',
            normalizedValue: '45329941',
            confidence: 0.995,
            provenance: 'Card summary line',
            matchCategory: 'EXACT_MATCH'
          },
          {
            key: 'billing_address',
            label: 'Billing Residence',
            originalValue: 'Bahnhofstrasse 45, 8001 Zurich, Switzerland',
            normalizedValue: 'BAHNHOFSTRASSE 45 8001 ZURICH CH',
            confidence: 0.94,
            provenance: 'Affidavit residence field',
            matchCategory: 'NORMALIZED_MATCH'
          },
          {
            key: 'hardware_imei',
            label: 'Authorized Mobile IMEI',
            originalValue: '354892019482012',
            normalizedValue: '354892019482012',
            confidence: 0.97,
            provenance: 'Registered Banking 2FA Device Token',
            matchCategory: 'EXACT_MATCH'
          }
        ],
        sourceRecords: [
          {
            recordId: 'rec-001-a',
            fileId: 'ev-1001-01',
            fileName: 'unauthorized_tx_report_signed.pdf',
            deviceId: 'DEV-POS-ZURICH-8849',
            recordType: 'PDF_FORM_FIELD',
            timestamp: '2026-08-25T10:14:00Z',
            attributeKey: 'legal_name',
            rawValue: 'Mrs. Anita Rao',
            normalizedValue: 'ANITA RAO',
            confidence: 0.99,
            isProtected: false
          },
          {
            recordId: 'rec-002-a',
            fileId: 'ev-1001-01',
            fileName: 'unauthorized_tx_report_signed.pdf',
            deviceId: 'DEV-POS-ZURICH-8849',
            recordType: 'KYC_PROTECTED_RECORD',
            timestamp: '2026-08-25T10:14:00Z',
            attributeKey: 'national_id',
            rawValue: 'CH-ID-8849102-SECRET',
            normalizedValue: 'CHID8849102',
            confidence: 0.995,
            isProtected: true,
            isRevealed: false,
            protectedClassification: 'RESTRICTED_GOVERNMENT_PII'
          }
        ]
      },

      // Source B Dossier
      sourceB: {
        temporaryId: 'file_002:e22', // strictly marked temporary
        entityType: 'PERSON',
        displayLabel: 'Rao, Anita (Gateway Session Subject)',
        fileName: 'gateway_telemetry_dump.json',
        fileId: 'ev-1001-02',
        deviceId: 'DEV-SRV-FRANKFURT-04',
        caseId: 1001,
        extractionConfidence: 0.974,
        extractionMethod: 'JSON-Telemetry-Extractor',
        firstObserved: '2026-08-24T22:18:39.120Z',
        lastObserved: '2026-08-24T22:19:04.880Z',
        attributes: [
          {
            key: 'legal_name',
            label: 'Legal Full Name',
            originalValue: 'ANITA RAO',
            normalizedValue: 'ANITA RAO',
            confidence: 0.98,
            provenance: 'POS telemetry payload auth_owner',
            matchCategory: 'EXACT_MATCH'
          },
          {
            key: 'phone_number',
            label: 'Primary Contact Mobile',
            originalValue: '+41-79-402-9182',
            normalizedValue: '+41794029182',
            confidence: 0.97,
            provenance: 'Carrier SIM IMSI cross-reference',
            matchCategory: 'NORMALIZED_MATCH'
          },
          {
            key: 'account_pan',
            label: 'Payment Account Number (PAN)',
            originalValue: '4532-9941-POS-EMV',
            normalizedValue: '45329941',
            confidence: 0.99,
            provenance: 'Terminal EMV chip cryptogram dump',
            matchCategory: 'NORMALIZED_MATCH'
          },
          {
            key: 'billing_address',
            label: 'Billing Residence',
            originalValue: 'Bahnhofstr. 45, 8001 Zurich',
            normalizedValue: 'BAHNHOFSTRASSE 45 8001 ZURICH CH',
            confidence: 0.91,
            provenance: 'Address Verification Service (AVS) Response Code 00',
            matchCategory: 'NORMALIZED_MATCH'
          },
          {
            key: 'hardware_imei',
            label: 'Authorized Mobile IMEI',
            originalValue: '354892019482012',
            normalizedValue: '354892019482012',
            confidence: 0.994,
            provenance: 'GSM Network Registration Frame',
            matchCategory: 'EXACT_MATCH'
          }
        ],
        sourceRecords: [
          {
            recordId: 'rec-003-b',
            fileId: 'ev-1001-02',
            fileName: 'gateway_telemetry_dump.json',
            deviceId: 'DEV-SRV-FRANKFURT-04',
            recordType: 'SESSION_LOG',
            timestamp: '2026-08-24T22:18:39.120Z',
            attributeKey: 'hardware_imei',
            rawValue: '354892019482012',
            normalizedValue: '354892019482012',
            confidence: 0.994,
            isProtected: false
          },
          {
            recordId: 'rec-004-b',
            fileId: 'ev-1001-02',
            fileName: 'gateway_telemetry_dump.json',
            deviceId: 'DEV-SRV-FRANKFURT-04',
            recordType: 'CARRIER_PROTECTED_CDR',
            timestamp: '2026-08-24T22:18:40.000Z',
            attributeKey: 'sim_imsi_full',
            rawValue: '228019283746199-CONFIDENTIAL',
            normalizedValue: '228019283746199',
            confidence: 0.998,
            isProtected: true,
            isRevealed: false,
            protectedClassification: 'CARRIER_SUBPOENA_RESTRICTED'
          }
        ]
      },

      // Backend Provided Signals (Frontend NEVER calculates these)
      signals: [
        {
          id: 'sig-01',
          signalName: 'Exact Normalized Hardware IMEI Match',
          leftValue: '354892019482012',
          rightValue: '354892019482012',
          similarity: 1.0,
          weight: 0.40,
          contribution: 0.40,
          direction: 'SUPPORTS',
          explanation: 'Hardware device fingerprint extracted from Zurich terminal log matches victim mobile handset token exactly.',
          linkedAttributeKey: 'hardware_imei'
        },
        {
          id: 'sig-02',
          signalName: 'Synchronous Session Window Correlation',
          leftValue: 'Timestamp 22:18:38.000Z',
          rightValue: 'Timestamp 22:18:39.120Z',
          similarity: 0.98,
          weight: 0.25,
          contribution: 0.245,
          direction: 'SUPPORTS',
          explanation: 'Events occurred within 1.12 seconds of POS swipe event across cellular mast and POS server.',
          linkedAttributeKey: 'session_time'
        },
        {
          id: 'sig-03',
          signalName: 'E.164 Normalized Phone Match',
          leftValue: '+41794029182',
          rightValue: '+41794029182',
          similarity: 1.0,
          weight: 0.20,
          contribution: 0.20,
          direction: 'SUPPORTS',
          explanation: 'Swisscom cellular mobile subscriber identity aligns across dispute affidavit and SIM routing dump.',
          linkedAttributeKey: 'phone_number'
        },
        {
          id: 'sig-04',
          signalName: 'Carrier Tower vs IP GeoIP Distance Anomaly',
          leftValue: 'Tower: Zurich Enge Mast #4',
          rightValue: 'IP GeoIP: Frankfurt Data Center',
          similarity: 0.15,
          weight: 0.15,
          contribution: -0.12,
          direction: 'OPPOSES',
          explanation: 'IP traffic was proxied through Frankfurt VPN, causing geographical discrepancy with physical tower in Zurich.',
          linkedAttributeKey: 'billing_address'
        }
      ],

      // Provisional Canonical Entity Preview (Marked strictly provisional)
      provisionalCanonical: {
        isProvisional: true,
        canonicalIdProposal: 'CANONICAL-ID-RAO-ANITA-001',
        entityType: 'PERSON',
        displayLabel: 'Anita Rao [CONSOLIDATED IDENTITY]',
        primaryIdentifier: 'IMEI-354892019482012 / MSISDN-+41794029182',
        combinedAttributes: {
          legal_name: 'ANITA RAO',
          phone_number: '+41794029182',
          account_pan: '45329941',
          primary_imei: '354892019482012',
          residence_city: 'Zurich',
          kyc_status: 'VERIFIED_COMPLIANT'
        },
        sourceEntityCount: 2,
        deviceCount: 3,
        firstObserved: '2026-08-24T22:18:38Z',
        lastObserved: '2026-08-25T10:14:00Z',
        conflictsDetected: [
          'Frankfurt VPN Exit IP 198.51.100.42 flagged as proxy overlay.'
        ],
        relationshipsAffectedCount: 5,
        relationshipsSummary: [
          {
            relationshipType: 'OWNS_DEVICE',
            targetEntityLabel: 'Samsung Galaxy S23 Ultra (IMEI 354892019482012)',
            isPotentialDuplicate: false
          },
          {
            relationshipType: 'USED_IDENTIFIER',
            targetEntityLabel: '+41-79-402-9182 (Swisscom SIM)',
            isPotentialDuplicate: false
          },
          {
            relationshipType: 'TRANSACTED_AT',
            targetEntityLabel: 'Zurich POS Gateway Terminal #8849',
            isPotentialDuplicate: true
          }
        ]
      }
    },

    {
      id: 'cand_1001_002',
      caseId: 1001,
      entityType: 'DEVICE_IDENTIFIER',
      version: 1,
      status: 'PENDING',
      assignedReviewer: 'David Thomas',
      createdTime: '2026-08-29T09:15:00Z',
      hasWarnings: false,
      hasContradictions: false,
      resolutionConfidence: 0.725,
      confidenceBand: 'MEDIUM',
      thresholds: {
        high: 0.85,
        medium: 0.60
      },
      resolutionModel: 'MultiModal-SimNet-GraphER',
      resolutionModelVersion: '4.2.0-prod',
      candidateGenerationTime: '2026-08-29T09:12:00Z',
      deviceIdentifiers: [
        'MAC: 00:1A:2B:3C:4D:5E',
        'TLS Ja3: a0e9f5d64349fb13191bc781f81f42e1'
      ],
      userPermissions: {
        canReview: true,
        canAccept: true,
        canReject: true,
        canDefer: true,
        canReopen: false,
        canRequestReversal: false
      },
      sourceA: {
        temporaryId: 'file_002:e41',
        entityType: 'DEVICE_IDENTIFIER',
        displayLabel: 'Gateway Interface MAC 00:1A:2B:3C:4D:5E',
        fileName: 'gateway_telemetry_dump.json',
        fileId: 'ev-1001-02',
        deviceId: 'DEV-SRV-FRANKFURT-04',
        caseId: 1001,
        extractionConfidence: 0.94,
        extractionMethod: 'RegexTokenizer',
        firstObserved: '2026-08-24T22:18:39Z',
        lastObserved: '2026-08-24T22:19:00Z',
        attributes: [
          {
            key: 'mac_address',
            label: 'Ethernet MAC Address',
            originalValue: '00:1a:2b:3c:4d:5e',
            normalizedValue: '001A2B3C4D5E',
            confidence: 0.98,
            provenance: 'Network Interface Descriptor',
            matchCategory: 'NORMALIZED_MATCH'
          }
        ],
        sourceRecords: []
      },
      sourceB: {
        temporaryId: 'file_003:e19',
        entityType: 'DEVICE_IDENTIFIER',
        displayLabel: 'Packet Header MAC 00-1A-2B-3C-4D-5E',
        fileName: 'device_sensor_packet.pcap',
        fileId: 'ev-1001-03',
        deviceId: 'DEV-MOB-S23-019',
        caseId: 1001,
        extractionConfidence: 0.91,
        extractionMethod: 'PCAP-Parser',
        firstObserved: '2026-08-24T22:18:40Z',
        lastObserved: '2026-08-24T22:18:45Z',
        attributes: [
          {
            key: 'mac_address',
            label: 'Ethernet MAC Address',
            originalValue: '00-1A-2B-3C-4D-5E',
            normalizedValue: '001A2B3C4D5E',
            confidence: 0.95,
            provenance: 'Ethernet Frame Header #1042',
            matchCategory: 'NORMALIZED_MATCH'
          }
        ],
        sourceRecords: []
      },
      signals: [
        {
          id: 'sig-05',
          signalName: 'Standard Normalized MAC Match',
          leftValue: '001A2B3C4D5E',
          rightValue: '001A2B3C4D5E',
          similarity: 1.0,
          weight: 0.70,
          contribution: 0.70,
          direction: 'SUPPORTS',
          explanation: 'Physical hardware layer MAC matches across network capture and server dump.'
        }
      ],
      provisionalCanonical: {
        isProvisional: true,
        canonicalIdProposal: 'CANONICAL-DEV-MAC-8812',
        entityType: 'DEVICE_IDENTIFIER',
        displayLabel: 'MAC 00:1A:2B:3C:4D:5E [HARDWARE FINGERPRINT]',
        primaryIdentifier: '00:1A:2B:3C:4D:5E',
        combinedAttributes: {
          mac: '001A2B3C4D5E',
          vendor_oui: 'Samsung Electronics Co Ltd'
        },
        sourceEntityCount: 2,
        deviceCount: 2,
        firstObserved: '2026-08-24T22:18:39Z',
        lastObserved: '2026-08-24T22:19:00Z',
        conflictsDetected: [],
        relationshipsAffectedCount: 2,
        relationshipsSummary: []
      }
    }
  ]
};

// GET /api/v1/cases/{caseId}/resolution/candidates
export async function getBackendResolutionCandidates(
  caseId: number | string
): Promise<ResolutionCandidate[]> {
  const numId = Number(caseId);
  return candidatesState[numId] ? JSON.parse(JSON.stringify(candidatesState[numId])) : [];
}

// POST /api/v1/cases/{caseId}/resolution/{candidateId}/decision
export async function submitBackendResolutionDecision(
  candidateId: string,
  decisionOrPayload:
    | 'ACCEPT'
    | 'REJECT'
    | 'DEFER'
    | 'REOPEN'
    | {
        decision: 'ACCEPT' | 'REJECT' | 'DEFER' | 'REOPEN';
        justification?: string;
        expectedCurrentStatus?: string;
        overrideWarningsAcknowledged?: boolean;
        contradictionAcknowledged?: boolean;
        expectedVersion?: number;
        notes?: string;
      },
  expectedVersionParam?: number,
  idempotencyKeyParam?: string,
  notesParam?: string,
  reasonCodeParam?: string
): Promise<{
  success: boolean;
  updatedCandidate?: ResolutionCandidate;
  error?: string;
  code?: number;
  status?: string;
}> {
  const isObj = typeof decisionOrPayload === 'object';
  const decision = isObj ? decisionOrPayload.decision : decisionOrPayload;
  const notes = isObj ? decisionOrPayload.justification || decisionOrPayload.notes : notesParam;

  for (const caseId of Object.keys(candidatesState)) {
    const numId = Number(caseId);
    const candidate = candidatesState[numId].find((c) => c.id === candidateId);
    if (candidate) {
      const expectedVersion = isObj ? decisionOrPayload.expectedVersion : expectedVersionParam;
      if (expectedVersion !== undefined && candidate.version !== expectedVersion) {
        return {
          success: false,
          code: 409,
          error:
            '409 Conflict: This candidate was updated by another investigator. The latest decision has been loaded. Review the candidate again before taking another action.'
        };
      }

      candidate.version = (candidate.version || 1) + 1;

      if (decision === 'ACCEPT') {
        candidate.status = 'ACCEPTED';
        candidate.confirmedCanonical = {
          isProvisional: false,
          canonicalId:
            candidate.provisionalCanonical.canonicalIdProposal ||
            `IDENTITY-CANONICAL-${numId}-99`,
          entityType: candidate.entityType,
          primaryIdentifier:
            candidate.provisionalCanonical.primaryIdentifier,
          displayLabel: candidate.provisionalCanonical.displayLabel,
          resolvedEntities: [
            {
              temporaryId: candidate.sourceA.temporaryId,
              fileId: candidate.sourceA.fileId,
              sourceDocument: candidate.sourceA.fileName,
              confidence: candidate.sourceA.extractionConfidence
            },
            {
              temporaryId: candidate.sourceB.temporaryId,
              fileId: candidate.sourceB.fileId,
              sourceDocument: candidate.sourceB.fileName,
              confidence: candidate.sourceB.extractionConfidence
            }
          ],
          devices: candidate.deviceIdentifiers,
          firstObserved: candidate.sourceA.firstObserved,
          lastObserved: candidate.sourceB.lastObserved,
          activeRelationshipsCount:
            candidate.provisionalCanonical.relationshipsAffectedCount,
          createdAt: new Date().toISOString(),
          version: candidate.version
        };

        candidate.mergeRecord = {
          mergeId: `merge_${candidate.id}_${Date.now().toString().slice(-4)}`,
          candidateId: candidate.id,
          canonicalEntityId: candidate.confirmedCanonical.canonicalId,
          sourceTemporaryIds: [
            candidate.sourceA.temporaryId,
            candidate.sourceB.temporaryId
          ],
          status: 'ACTIVE',
          decidedBy: 'anita.rao',
          decisionTimestamp: new Date().toISOString(),
          isReversible: true,
          notes
        };
      } else if (decision === 'REJECT') {
        candidate.status = 'REJECTED';
      } else if (decision === 'DEFER') {
        candidate.status = 'DEFERRED';
      } else if (decision === 'REOPEN') {
        candidate.status = 'REOPENED';
      }

      return { success: true, status: candidate.status, updatedCandidate: { ...candidate } };
    }
  }

  return { success: false, error: 'Candidate not found.' };
}

// POST /api/v1/entity-merges/{mergeId}/reversal-requests
export async function submitBackendMergeReversal(
  mergeIdOrCandidateId: string,
  payloadOrReason?:
    | string
    | {
        reason?: string;
        expectedCurrentStatus?: string;
        reasonCode?: string;
        expectedCanonicalVersion?: number;
      },
  reasonExplanation?: string,
  expectedCanonicalVersion?: number
): Promise<{
  success: boolean;
  reversalRequestId?: string;
  status?: string;
  error?: string;
}> {
  const reasonText =
    typeof payloadOrReason === 'object'
      ? payloadOrReason.reason || 'Investigator requested reversal'
      : payloadOrReason || reasonExplanation || 'Investigator requested reversal';

  for (const caseId of Object.keys(candidatesState)) {
    const numId = Number(caseId);
    const candidate = candidatesState[numId].find(
      (c) =>
        c.mergeRecord?.mergeId === mergeIdOrCandidateId ||
        c.id === mergeIdOrCandidateId
    );
    if (candidate && candidate.mergeRecord) {
      const requestId = `REV-REQ-${Date.now().toString().slice(-6)}`;
      candidate.mergeRecord.status = 'REVERSAL_PENDING';
      candidate.mergeRecord.reversalRequestId = requestId;
      candidate.mergeRecord.reversalSubmittedAt = new Date().toISOString();
      candidate.mergeRecord.reversalReason = reasonText;

      return {
        success: true,
        reversalRequestId: requestId,
        status: 'PENDING_APPROVAL'
      };
    }
  }

  return { success: false, error: 'Merge record not found.' };
}

// Reveal protected evidence (Audited with countdown reveal)
export async function revealProtectedRecord(
  candidateIdOrParams:
    | string
    | {
        candidateId: string;
        sourceSide: 'A' | 'B';
        recordId: string;
        justification?: string;
      },
  sourceSideParam?: 'A' | 'B',
  recordIdParam?: string
): Promise<{ success: boolean; revealedValue?: string; expiresInSeconds: number; error?: string }> {
  const isObj = typeof candidateIdOrParams === 'object';
  const candidateId = isObj ? candidateIdOrParams.candidateId : candidateIdOrParams;
  const sourceSide = isObj ? candidateIdOrParams.sourceSide : sourceSideParam!;
  const recordId = isObj ? candidateIdOrParams.recordId : recordIdParam!;

  for (const caseId of Object.keys(candidatesState)) {
    const numId = Number(caseId);
    const candidate = candidatesState[numId].find((c) => c.id === candidateId);
    if (candidate) {
      const source = sourceSide === 'A' ? candidate.sourceA : candidate.sourceB;
      const rec = source.sourceRecords.find((r) => r.recordId === recordId);
      if (rec) {
        rec.isRevealed = true;
        console.info(
          `[AUDIT] Protected evidence ${recordId} in candidate ${candidateId} revealed by investigator Anita Rao.`
        );
        return { success: true, revealedValue: rec.rawValue, expiresInSeconds: 60 };
      }
    }
  }
  return { success: false, expiresInSeconds: 0, error: 'Record not found or access denied.' };
}
