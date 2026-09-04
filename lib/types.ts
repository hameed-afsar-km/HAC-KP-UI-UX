export interface Case {
  id: number;
  caseDescription: string;
  caseCategory: 'Fraud' | 'KYC' | 'Payment Dispute' | string;
  assignedOfficers: string;
  status: string;
  dateAdded: string;
  dateModified: string;
  addedBy?: string;
  modifiedBy?: string;
}

export interface EntityType {
  id: number;
  entityName: string;
  label: string;
  entityDescription: string;
  isStandard: 'Y' | 'N' | string;
  dateAdded?: string;
  dateModified?: string;
  addedBy?: string;
  modifiedBy?: string;
  attributesCount?: number;
}

export interface EntityAttribute {
  id: number;
  attributeType: string;
  attributeDataType: string;
  attributeDescription: string;
  entityId: number;
  dateAdded?: string;
  dateModified?: string;
  addedBy?: string;
  modifiedBy?: string;
  attributeName?: string;
  label?: string;
  dataType?: string;
  isStandard?: string;
}

export interface RelationshipType {
  id: number;
  relationshipName: string;
  relationshipDescription: string;
  isStandard: 'Y' | 'N' | string;
  dateAdded?: string;
  dateModified?: string;
  addedBy?: string;
  modifiedBy?: string;
  attributesCount?: number;
}

export interface RelationshipAttribute {
  id: number;
  relationshipId: number;
  attributeType: string;
  attributeDataType: string;
  attributeDescription: string;
  dateAdded?: string;
  dateModified?: string;
  addedBy?: string;
  modifiedBy?: string;
  attributeName?: string;
  label?: string;
  dataType?: string;
  isStandard?: string;
}

export interface EvidenceFile {
  id: string;
  caseId: number;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  uploadStatus: 'UPLOADED' | 'PROCESSING' | 'EXTRACTED' | 'FAILED';
  uploadedAt: string;
  uploadedBy?: string;
  sha256Hash: string;
  extractedEntityCount: number;
  mimeType: string;
  previewSnippet?: string;
  deviceId?: string;
  fileSize?: string;
  status?: string;
}

// -------------------------------------------------------------
// EXTRACTION JOBS TYPES
// -------------------------------------------------------------

export type ExtractionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_WARNINGS'
  | 'FAILED'
  | 'CANCELLING'
  | 'CANCELLED'
  | 'QUEUED';

export type ExtractionProgressStage =
  | 'QUEUED'
  | 'LOADING_CONTENT'
  | 'EXTRACTING_ENTITIES'
  | 'EXTRACTING_RELATIONSHIPS'
  | 'NORMALIZING'
  | 'VALIDATING'
  | 'PERSISTING';

export interface ExtractionJob {
  id: string;
  caseId: number;
  fileName: string;
  fileId: string;
  deviceId: string;
  mediaType: string;
  schemaVersion: string;
  extractorVersion: string;
  modelVersion: string;
  status: ExtractionStatus;
  progressPercent: number;
  currentStage?: ExtractionProgressStage;
  recordsProcessed?: number;
  totalRecords?: number;
  entityCount: number;
  relationshipCount: number;
  warningCount: number;
  warnings?: string[];
  warningDetails?: string[];
  submittedTime: string;
  startTime?: string;
  completedTime?: string;
  completionTime?: string;
  durationSeconds?: number;
  errorMessage?: string;
  canCancel?: boolean;
  canRetry?: boolean;
  canDownloadResult?: boolean;
  attemptNumber?: number;
  previousAttemptId?: string;
  idempotencyKey?: string;
  evidenceId?: string;
  evidenceName?: string;
  modelUsed?: string;
  entitiesFound?: number;
}

export type FileEligibilityClassification =
  | 'NEW'
  | 'CHANGED'
  | 'OUTDATED'
  | 'FAILED'
  | 'PROCESSING'
  | 'REUSABLE'
  | 'INELIGIBLE';

export interface EligibleFileItem {
  fileId: string;
  fileName: string;
  deviceId: string;
  fileSizeBytes: number;
  mediaType: string;
  classification: FileEligibilityClassification;
  ineligibilityReason?: string;
  existingJobId?: string;
  existingEntityCount?: number;
  isSelected?: boolean;
}

export interface ExtractionEligibilityPreview {
  caseId: string | number;
  previewVersion: string;
  generatedAt: string;
  targetSchemaVersion: string;
  extractorVersion: string;
  modelVersion: string;
  estimatedJobCount: number;
  files: EligibleFileItem[];
  summary: {
    totalFiles: number;
    eligibleCount: number;
    reusableCount: number;
    processingCount: number;
    ineligibleCount: number;
    requiresExtractionCount: number;
  };
}

export interface ExtractionSubmissionPayload {
  selectedFileIds: string[];
  previewVersion: string;
  idempotencyKey?: string;
  expectedSchemaVersion?: string;
}

// -------------------------------------------------------------
// ENTITY RESOLUTION REVIEW TYPES
// -------------------------------------------------------------

export type ConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW';

export type SignalDirection = 'SUPPORTS' | 'OPPOSES' | 'NEUTRAL';

export type AttributeMatchCategory =
  | 'EXACT_MATCH'
  | 'NORMALIZED_MATCH'
  | 'FUZZY_MATCH'
  | 'CONFLICT'
  | 'MISSING_VALUE';

export interface ResolutionSignal {
  id: string;
  signalName: string;
  leftValue: string;
  rightValue: string;
  similarity: number;
  weight: number;
  contribution: number;
  direction: SignalDirection;
  explanation: string;
  linkedAttributeKey?: string;
}

export interface SupportingSourceRecord {
  recordId: string;
  fileId: string;
  fileName: string;
  deviceId: string;
  recordType: string;
  timestamp: string;
  attributeKey: string;
  rawValue: string;
  normalizedValue: string;
  confidence: number;
  isProtected: boolean;
  isRevealed?: boolean;
  protectedClassification?: string;
  maskedValue?: string;
}

export interface SourceEntityDossier {
  temporaryId: string; // strictly marked temporary e.g. "file_001:e4"
  entityType: string;
  displayLabel: string;
  fileName: string;
  fileId: string;
  deviceId: string;
  caseId: number;
  extractionConfidence: number;
  extractionMethod: string;
  firstObserved: string;
  lastObserved: string;
  attributes: {
    key: string;
    label: string;
    originalValue: string;
    normalizedValue: string;
    confidence: number;
    provenance: string;
    matchCategory: AttributeMatchCategory;
  }[];
  sourceRecords: SupportingSourceRecord[];
}

export interface ProvisionalCanonicalEntity {
  isProvisional: true;
  canonicalIdProposal: string;
  entityType: string;
  displayLabel: string;
  primaryIdentifier: string;
  combinedAttributes: {
    key: string;
    label: string;
    normalizedValue: string;
  }[] | Record<string, any>;
  sourceEntityCount: number;
  deviceCount: number;
  firstObserved: string;
  lastObserved: string;
  conflictsDetected: string[];
  existingCanonicalId?: string;
  relationshipsAffectedCount: number;
  relationshipsSummary: {
    relationshipType: string;
    targetEntityLabel: string;
    isPotentialDuplicate: boolean;
  }[];
}

export interface ConfirmedCanonicalEntity {
  isProvisional: false;
  canonicalId: string;
  entityType: string;
  displayLabel: string;
  primaryIdentifier: string;
  combinedAttributes?: Record<string, any>;
  sourceEntityIds?: string[];
  resolvedEntities?: {
    temporaryId: string;
    fileId: string;
    sourceDocument: string;
    confidence: number;
  }[];
  devices: string[];
  firstObserved: string;
  lastObserved: string;
  activeRelationshipsCount: number;
  createdAt: string;
  version: number;
}

export interface MergeHistoryRecord {
  mergeId: string;
  candidateId: string;
  canonicalEntityId: string;
  sourceTemporaryIds: string[];
  status: 'ACTIVE' | 'REVERSAL_PENDING' | 'REVERSED';
  decidedBy: string;
  decisionTimestamp: string;
  isReversible: boolean;
  notes?: string;
  reversalRequestId?: string;
  reversalSubmittedAt?: string;
  reversalReason?: string;
}

export type ResolutionStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'DEFERRED'
  | 'REOPENED'
  | 'REVERSED'
  | 'PROPOSED'
  | 'CONFIRMED'
  | 'CONFLICTED';

export interface ResolutionCandidate {
  id: string; // e.g. "cand_1001_001"
  caseId: number;
  entityType: string;
  sourceA: SourceEntityDossier;
  sourceB: SourceEntityDossier;
  deviceIdentifiers: string[];
  resolutionConfidence: number; // authoritative backend-provided score
  confidenceBand: ConfidenceBand;
  thresholds: {
    high: number;
    medium: number;
  };
  resolutionModel: string;
  resolutionModelVersion: string;
  candidateGenerationTime: string;
  status: ResolutionStatus;
  assignedReviewer?: string;
  createdTime?: string;
  hasWarnings?: boolean;
  hasContradictions?: boolean;
  warningMessages?: string[];
  contradictionMessages?: string[];
  signals: ResolutionSignal[];
  provisionalCanonical: ProvisionalCanonicalEntity;
  confirmedCanonical?: ConfirmedCanonicalEntity;
  mergeRecord?: MergeHistoryRecord;
  version: number;
  userPermissions: {
    canReview: boolean;
    canAccept: boolean;
    canReject: boolean;
    canDefer: boolean;
    canReopen: boolean;
    canRequestReversal: boolean;
  };
  canonicalEntityIdProposal?: string;
}

// -------------------------------------------------------------
// EXTRACTED ENTITY & QUALITY REVIEW TYPES
// -------------------------------------------------------------

export interface ExtractedEntity {
  id: string;
  caseId: number;
  entityType: string;
  entityValue: string;
  confidence: number;
  sourceEvidence: string;
  sourceDocument?: string;
  pageLocation?: string;
  observedAt?: string;
  attributes: Record<string, any>;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  resolutionStatus?: 'UNRESOLVED' | 'PROPOSED' | 'CONFIRMED' | 'CONFLICTED';
  resolvedToIdentityId?: string;
}

export interface QualityReviewItem {
  id: string;
  caseId: number;
  entityId: string;
  entityType: string;
  entityValue: string;
  sourceDocument: string;
  pageReference: string;
  sourceSnippet: string;
  surroundingText?: string;
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  reviewerComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  attributes: Record<string, any>;
}

// -------------------------------------------------------------
// GRAPH TYPES
// -------------------------------------------------------------

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  val: number;
  radius?: number;
  properties?: Record<string, any>;
  color?: string;
  confidence?: number;
  attributes?: Record<string, any>;
  caseId?: number;
  sourceEvidence?: string;
  isIdentity?: boolean;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationshipName: string;
  label: string;
  confidence?: number;
  evidenceBacked?: boolean;
  sourceEvidence?: string;
  attributes?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
