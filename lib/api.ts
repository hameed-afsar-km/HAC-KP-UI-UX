import {
  Case,
  EntityType,
  EntityAttribute,
  RelationshipType,
  RelationshipAttribute,
  EvidenceFile,
  ExtractionJob,
  ExtractedEntity,
  QualityReviewItem,
  ResolutionCandidate,
  GraphData
} from './types';
import {
  INITIAL_CASES,
  MOCK_EVIDENCE_FILES,
  MOCK_EXTRACTION_JOBS,
  MOCK_EXTRACTED_ENTITIES,
  MOCK_QUALITY_REVIEWS,
  MOCK_RESOLUTION_CANDIDATES,
  MOCK_GRAPH_DATA
} from './mock-data';

const BASE_URL = 'https://ui-service-kwry.onrender.com/rest/v1';
const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout<T>(url: string, fallback: T): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[API] Endpoint ${url} returned ${res.status}. Falling back.`);
      return fallback;
    }

    const data = await res.json();
    return data as T;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[API] Error or timeout fetching ${url}:`, err);
    return fallback;
  }
}

// Cases
export async function getCases(): Promise<Case[]> {
  return fetchWithTimeout<Case[]>(`${BASE_URL}/cases`, INITIAL_CASES);
}

export async function getCaseById(id: number | string): Promise<Case | null> {
  const numId = Number(id);
  const fallback = INITIAL_CASES.find((c) => c.id === numId) || null;
  return fetchWithTimeout<Case | null>(`${BASE_URL}/cases/${numId}`, fallback);
}

// Upload URL
export interface UploadUrlResponse {
  uploadUrl: string;
}

export async function getUploadUrl(
  caseId: number | string,
  fileName: string,
  mimeType?: string
): Promise<UploadUrlResponse> {
  const encodedName = encodeURIComponent(fileName);
  const fallback: UploadUrlResponse = {
    uploadUrl: `https://piksttdozycojkhkmnsg.supabase.co/storage/v1/object/upload/sign/files/cases/${caseId}/${Date.now()}-${encodedName}?token=simulated_secure_bearer`
  };
  return fetchWithTimeout<UploadUrlResponse>(
    `${BASE_URL}/cases/${caseId}/upload-url?fileName=${encodedName}`,
    fallback
  );
}

// Entities (Ontology)
export async function getEntityTypes(): Promise<EntityType[]> {
  return fetchWithTimeout<EntityType[]>(`${BASE_URL}/entities`, []);
}

export async function getEntityTypeById(id: number | string): Promise<EntityType | null> {
  return fetchWithTimeout<EntityType | null>(`${BASE_URL}/entities/${id}`, null);
}

export async function getEntityAttributes(entityId?: number | string): Promise<EntityAttribute[]> {
  const allAttrs = await fetchWithTimeout<EntityAttribute[]>(`${BASE_URL}/entity-attributes`, []);
  if (!entityId) return allAttrs;
  const numId = Number(entityId);
  return allAttrs.filter((a) => a.entityId === numId);
}

// Relationships (Ontology)
export async function getRelationshipTypes(): Promise<RelationshipType[]> {
  return fetchWithTimeout<RelationshipType[]>(`${BASE_URL}/relationships`, []);
}

export async function getRelationshipTypeById(id: number | string): Promise<RelationshipType | null> {
  return fetchWithTimeout<RelationshipType | null>(`${BASE_URL}/relationships/${id}`, null);
}

export async function getRelationshipAttributes(
  relationshipId?: number | string
): Promise<RelationshipAttribute[]> {
  const allAttrs = await fetchWithTimeout<RelationshipAttribute[]>(
    `${BASE_URL}/relationship-attributes`,
    []
  );
  if (!relationshipId) return allAttrs;
  const numId = Number(relationshipId);
  return allAttrs.filter((a) => a.relationshipId === numId);
}

// Case-specific investigative data (Mock/Service Layer)
export function getEvidenceFiles(caseId: number | string): EvidenceFile[] {
  const numId = Number(caseId);
  return MOCK_EVIDENCE_FILES[numId] || MOCK_EVIDENCE_FILES[1001] || [];
}

export function getExtractionJobs(caseId: number | string): ExtractionJob[] {
  const numId = Number(caseId);
  return MOCK_EXTRACTION_JOBS[numId] || MOCK_EXTRACTION_JOBS[1001] || [];
}

export function getExtractedEntities(caseId: number | string): ExtractedEntity[] {
  const numId = Number(caseId);
  return MOCK_EXTRACTED_ENTITIES[numId] || MOCK_EXTRACTED_ENTITIES[1001] || [];
}

export function getQualityReviews(caseId: number | string): QualityReviewItem[] {
  const numId = Number(caseId);
  return MOCK_QUALITY_REVIEWS[numId] || MOCK_QUALITY_REVIEWS[1001] || [];
}

export function getResolutionCandidates(caseId: number | string): ResolutionCandidate[] {
  const numId = Number(caseId);
  return MOCK_RESOLUTION_CANDIDATES[numId] || MOCK_RESOLUTION_CANDIDATES[1001] || [];
}

export function getInvestigationGraph(caseId: number | string): GraphData {
  const numId = Number(caseId);
  return MOCK_GRAPH_DATA[numId] || MOCK_GRAPH_DATA[1001];
}
