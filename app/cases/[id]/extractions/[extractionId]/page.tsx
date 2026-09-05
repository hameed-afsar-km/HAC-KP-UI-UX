'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Person,
  Phone,
  EnvelopeSimple,
  DeviceMobile,
  WifiHigh,
  Wallet,
  UsersThree,
  LinkSimple,
  MagnifyingGlass,
  Code,
  WarningCircle,
  CheckCircle,
  CaretDown,
  CaretRight,
  Eye,
  ArrowSquareOut,
  Funnel,
  Download,
  Clock
} from '@phosphor-icons/react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
type EntityType = 'PERSON' | 'ACCOUNT' | 'PHONE_NUMBER' | 'EMAIL_ADDRESS' | 'DEVICE' | 'IP_ADDRESS' | 'WALLET_ADDRESS' | 'GROUP';

interface ExtractedEntity {
  tempId: string;
  type: EntityType;
  displayLabel: string;
  confidence: number;
  extractionMethod: string;
  hasWarning: boolean;
  attributes: { attributeType: string; value: string; normalizedValue: string; confidence: number }[];
  temporal?: { firstObservedAt?: string; lastObservedAt?: string };
}

interface ExtractedRelationship {
  tempId: string;
  type: string;
  sourceEntityId: string;
  targetEntityId: string;
  confidence: number;
  direction: 'DIRECTED' | 'UNDIRECTED';
  assertionType: 'EXPLICIT' | 'INFERRED';
}

interface ExtractionResult {
  extractionId: string;
  caseId: string;
  fileId: string;
  fileName: string;
  deviceId: string;
  mediaType: string;
  status: 'COMPLETED' | 'COMPLETED_WITH_WARNINGS';
  schemaVersion: string;
  extractorVersion: string;
  extractorName: string;
  modelName: string;
  completedAt: string;
  summary: { entityCount: number; relationshipCount: number; warningCount: number; contradictionCount: number };
  entities: ExtractedEntity[];
  relationships: ExtractedRelationship[];
}

const MOCK_RESULT: ExtractionResult = {
  extractionId: 'ext_001',
  caseId: 'case_001',
  fileId: 'file_001',
  fileName: 'telegram_export.txt',
  deviceId: 'source_device_001',
  mediaType: 'text/plain',
  status: 'COMPLETED_WITH_WARNINGS',
  schemaVersion: '1.1',
  extractorVersion: '2.4.1',
  extractorName: 'TelegramExtractor',
  modelName: 'gpt-4o-extraction-v2',
  completedAt: '2026-09-01T02:30:28Z',
  summary: { entityCount: 5, relationshipCount: 4, warningCount: 1, contradictionCount: 0 },
  entities: [
    {
      tempId: 'file_001:e1',
      type: 'PERSON',
      displayLabel: 'Person A',
      confidence: 0.94,
      extractionMethod: 'LLM',
      hasWarning: false,
      attributes: [
        { attributeType: 'name', value: 'Person A', normalizedValue: 'person a', confidence: 0.94 },
      ],
      temporal: { firstObservedAt: '2026-02-02T10:20:00Z', lastObservedAt: '2026-02-18T21:45:00Z' },
    },
    {
      tempId: 'file_001:e2',
      type: 'PHONE_NUMBER',
      displayLabel: '+91 98765 43210',
      confidence: 0.99,
      extractionMethod: 'PARSER',
      hasWarning: false,
      attributes: [
        { attributeType: 'phoneNumber', value: '+91 98765 43210', normalizedValue: '+919876543210', confidence: 0.99 },
        { attributeType: 'countryCode', value: 'IN', normalizedValue: 'IN', confidence: 1.0 },
      ],
      temporal: { firstObservedAt: '2026-02-02T10:20:00Z' },
    },
    {
      tempId: 'file_001:e3',
      type: 'DEVICE',
      displayLabel: 'IMEI 356789012345678',
      confidence: 0.94,
      extractionMethod: 'PARSER',
      hasWarning: false,
      attributes: [
        { attributeType: 'imei', value: '356789012345678', normalizedValue: '356789012345678', confidence: 0.94 },
      ],
      temporal: { firstObservedAt: '2026-02-02T10:20:00Z', lastObservedAt: '2026-02-10T15:00:00Z' },
    },
    {
      tempId: 'file_001:e4',
      type: 'ACCOUNT',
      displayLabel: '@sample_user',
      confidence: 0.98,
      extractionMethod: 'PARSER',
      hasWarning: true,
      attributes: [
        { attributeType: 'platform', value: 'Telegram', normalizedValue: 'telegram', confidence: 1.0 },
        { attributeType: 'username', value: '@sample_user', normalizedValue: 'sample_user', confidence: 0.99 },
        { attributeType: 'phoneNumber', value: '+91 98765 43210', normalizedValue: '+919876543210', confidence: 0.99 },
      ],
      temporal: { firstObservedAt: '2026-02-02T10:20:00Z', lastObservedAt: '2026-02-18T21:45:00Z' },
    },
    {
      tempId: 'file_001:e5',
      type: 'WALLET_ADDRESS',
      displayLabel: '1A1zP1eP5...XMFpuMnMJ',
      confidence: 0.89,
      extractionMethod: 'PARSER',
      hasWarning: false,
      attributes: [
        { attributeType: 'address', value: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf..', normalizedValue: '1a1zp1ep5qgefi2dmptftl5slmv7divf', confidence: 0.89 },
        { attributeType: 'currency', value: 'BTC', normalizedValue: 'btc', confidence: 0.95 },
      ],
      temporal: { firstObservedAt: '2026-02-15T12:30:00Z' },
    },
  ],
  relationships: [
    { tempId: 'file_001:r1', type: 'HAS_PHONE', sourceEntityId: 'file_001:e1', targetEntityId: 'file_001:e2', confidence: 0.97, direction: 'DIRECTED', assertionType: 'EXPLICIT' },
    { tempId: 'file_001:r2', type: 'USES_DEVICE', sourceEntityId: 'file_001:e1', targetEntityId: 'file_001:e3', confidence: 0.91, direction: 'DIRECTED', assertionType: 'INFERRED' },
    { tempId: 'file_001:r3', type: 'HAS_ACCOUNT', sourceEntityId: 'file_001:e1', targetEntityId: 'file_001:e4', confidence: 0.96, direction: 'DIRECTED', assertionType: 'EXPLICIT' },
    { tempId: 'file_001:r4', type: 'OWNS_WALLET', sourceEntityId: 'file_001:e4', targetEntityId: 'file_001:e5', confidence: 0.72, direction: 'DIRECTED', assertionType: 'INFERRED' },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ENTITY_TYPE_META: Record<EntityType, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  PERSON:         { icon: Person,         color: 'text-[#F9F9F9]',    bg: 'bg-[#111111]',         border: 'border-[#444444]' },
  ACCOUNT:        { icon: UsersThree,     color: 'text-purple-400',   bg: 'bg-purple-500/10',     border: 'border-purple-500/30' },
  PHONE_NUMBER:   { icon: Phone,          color: 'text-emerald-400',  bg: 'bg-emerald-500/10',    border: 'border-emerald-500/30' },
  EMAIL_ADDRESS:  { icon: EnvelopeSimple, color: 'text-blue-400',     bg: 'bg-blue-500/10',       border: 'border-blue-500/30' },
  DEVICE:         { icon: DeviceMobile,   color: 'text-cyan-400',     bg: 'bg-cyan-500/10',       border: 'border-cyan-500/30' },
  IP_ADDRESS:     { icon: WifiHigh,       color: 'text-amber-400',    bg: 'bg-amber-500/10',      border: 'border-amber-500/30' },
  WALLET_ADDRESS: { icon: Wallet,         color: 'text-orange-400',   bg: 'bg-orange-500/10',     border: 'border-orange-500/30' },
  GROUP:          { icon: UsersThree,     color: 'text-rose-400',     bg: 'bg-rose-500/10',       border: 'border-rose-500/30' },
};

// ─── Entity Details Panel ─────────────────────────────────────────────────────
function EntityDetailsPanel({ entity, relationships, allEntities }: {
  entity: ExtractedEntity;
  relationships: ExtractedRelationship[];
  allEntities: ExtractedEntity[];
}) {
  const meta = ENTITY_TYPE_META[entity.type];
  const Icon = meta.icon;
  const relatedRels = relationships.filter(r => r.sourceEntityId === entity.tempId || r.targetEntityId === entity.tempId);

  return (
    <div className="space-y-5 h-full overflow-y-auto">
      {/* Header */}
      <div className={`p-4 rounded-2xl border ${meta.bg} ${meta.border}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg} border ${meta.border}`}>
            <Icon size={20} className={meta.color} />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${meta.color}`}>{entity.type.replace('_', ' ')}</p>
            <p className="text-[14px] font-black text-[#0D0F14] dark:text-[#F9F9F9]">{entity.displayLabel}</p>
          </div>
          {entity.hasWarning && <WarningCircle size={18} className="text-amber-400 ml-auto" />}
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div><p className="text-[#8B95AD]">Temp ID</p><p className="font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{entity.tempId}</p></div>
          <div><p className="text-[#8B95AD]">Confidence</p><p className="font-bold text-[#E85002]">{(entity.confidence * 100).toFixed(0)}%</p></div>
          <div><p className="text-[#8B95AD]">Method</p><p className="font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{entity.extractionMethod}</p></div>
          <div><p className="text-[#8B95AD]">Relationships</p><p className="font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{relatedRels.length}</p></div>
        </div>
      </div>

      {/* Attributes */}
      <div>
        <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest mb-2">Attributes</p>
        <div className="space-y-2">
          {entity.attributes.map(attr => (
            <div key={attr.attributeType} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] text-[11px]">
              <div>
                <p className="text-[9px] font-mono text-[#8B95AD] uppercase tracking-wider">{attr.attributeType}</p>
                <p className="font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{attr.value}</p>
              </div>
              <p className="font-mono text-[#8B95AD] truncate">{attr.normalizedValue}</p>
              <span className={`text-[10px] font-bold ${attr.confidence >= 0.9 ? 'text-emerald-400' : attr.confidence >= 0.7 ? 'text-amber-400' : 'text-rose-400'}`}>
                {(attr.confidence * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Temporal */}
      {entity.temporal && (
        <div>
          <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest mb-2">Temporal</p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {entity.temporal.firstObservedAt && (
              <div className="p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333]">
                <p className="text-[9px] font-mono text-[#8B95AD] uppercase tracking-wider">First Observed</p>
                <p className="font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{new Date(entity.temporal.firstObservedAt).toLocaleDateString()}</p>
              </div>
            )}
            {entity.temporal.lastObservedAt && (
              <div className="p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333]">
                <p className="text-[9px] font-mono text-[#8B95AD] uppercase tracking-wider">Last Observed</p>
                <p className="font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{new Date(entity.temporal.lastObservedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related Relationships */}
      {relatedRels.length > 0 && (
        <div>
          <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest mb-2">Relationships</p>
          <div className="space-y-2">
            {relatedRels.map(rel => {
              const other = allEntities.find(e => e.tempId === (rel.sourceEntityId === entity.tempId ? rel.targetEntityId : rel.sourceEntityId));
              const isSource = rel.sourceEntityId === entity.tempId;
              return (
                <div key={rel.tempId} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F7FB] dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] text-[11px]">
                  {!isSource && <span className="text-[#8B95AD]">←</span>}
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30`}>{rel.type}</span>
                  {isSource && <span className="text-[#8B95AD]">→</span>}
                  <span className="font-bold text-[#0D0F14] dark:text-[#F9F9F9] truncate">{other?.displayLabel ?? rel.targetEntityId}</span>
                  <span className="ml-auto text-[#E85002] font-bold">{(rel.confidence * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ExtractionResultExplorerPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const extractionId = params?.extractionId as string;

  const result = MOCK_RESULT; // In production: fetch by extractionId
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'RELATIONSHIPS' | 'RAW_JSON'>('ENTITIES');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(result.entities[0]?.tempId ?? null);
  const [entitySearch, setEntitySearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntityType | 'ALL'>('ALL');
  const [showJsonWarning, setShowJsonWarning] = useState(true);

  const filteredEntities = useMemo(() =>
    result.entities.filter(e => {
      const matchSearch = e.displayLabel.toLowerCase().includes(entitySearch.toLowerCase()) ||
                          e.tempId.toLowerCase().includes(entitySearch.toLowerCase());
      const matchType = typeFilter === 'ALL' || e.type === typeFilter;
      return matchSearch && matchType;
    }),
    [result.entities, entitySearch, typeFilter]
  );

  const selectedEntity = useMemo(
    () => result.entities.find(e => e.tempId === selectedEntityId),
    [result.entities, selectedEntityId]
  );

  const uniqueTypes = useMemo(() => [...new Set(result.entities.map(e => e.type))], [result.entities]);

  return (
    <div className="space-y-4">

      {/* ─── Breadcrumb & Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#8B95AD]">
        <Link href={`/cases/${caseId}`} className="hover:text-[#E85002] transition-colors">Case {caseId?.toUpperCase()}</Link>
        <span>/</span>
        <Link href={`/cases/${caseId}/extractions`} className="hover:text-[#E85002] transition-colors">Extractions</Link>
        <span>/</span>
        <span className="text-[#E85002]">{result.extractionId}</span>
      </div>

      {/* ─── Extraction Summary Header ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest bg-[#E85002] text-[#000000] px-3 py-1 rounded-md">
              EXTRACTION RESULT
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
              result.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              {result.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0F0F0] dark:bg-[#222222] border border-[#E2E6F0] dark:border-[#333333] text-[#8B95AD]">
              Schema v{result.schemaVersion}
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E6F0] dark:border-[#333333] text-[11px] font-bold font-mono uppercase tracking-wider text-[#8B95AD] hover:text-[#0D0F14] dark:hover:text-[#F9F9F9] hover:border-[#E85002]/50 transition-colors">
            <Download size={13} /> Export JSON
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'File', value: result.fileName },
              { label: 'Device', value: result.deviceId },
              { label: 'Extractor', value: result.extractorName },
              { label: 'Model', value: result.modelName },
              { label: 'Version', value: result.extractorVersion },
              { label: 'Completed', value: new Date(result.completedAt).toLocaleString() },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[9px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest">{f.label}</p>
                <p className="text-[11px] font-bold text-[#0D0F14] dark:text-[#F9F9F9] mt-0.5 font-mono truncate">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary counters */}
        <div className="grid grid-cols-4 border-t border-[#E2E6F0] dark:border-[#333333]">
          {[
            { label: 'Entities', value: result.summary.entityCount, color: 'text-[#E85002]' },
            { label: 'Relationships', value: result.summary.relationshipCount, color: 'text-purple-400' },
            { label: 'Warnings', value: result.summary.warningCount, color: 'text-amber-400' },
            { label: 'Contradictions', value: result.summary.contradictionCount, color: 'text-rose-400' },
          ].map(s => (
            <div key={s.label} className="p-4 text-center border-r last:border-r-0 border-[#E2E6F0] dark:border-[#333333]">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-mono font-bold text-[#8B95AD] uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Scope Warning ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
        <WarningCircle size={15} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-400 flex-1">
          <strong>Extraction Scope Only:</strong> Temporary IDs (e.g., <code className="font-mono">file_001:e1</code>) are extraction-scoped. They are not canonical entity IDs. Cross-device resolution has not yet occurred for this extraction.
        </p>
      </div>

      {/* ─── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-2xl p-1.5 shadow-sm">
        {([
          { key: 'ENTITIES', label: 'Entities', count: result.summary.entityCount },
          { key: 'RELATIONSHIPS', label: 'Relationships', count: result.summary.relationshipCount },
          { key: 'RAW_JSON', label: 'Raw JSON', count: null },
        ] as const).map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold font-mono uppercase tracking-wider transition-all ${
                isActive ? 'bg-[#E85002] text-white shadow-sm' : 'text-[#8B95AD] hover:text-[#0D0F14] dark:hover:text-[#F9F9F9] hover:bg-[#F6F7FB] dark:hover:bg-[#222222]'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${isActive ? 'bg-white/20' : 'bg-[#F0F0F0] dark:bg-[#222222] text-[#8B95AD]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Entities Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'ENTITIES' && (
        <div className="flex flex-col lg:flex-row gap-5 min-h-[620px]">
          {/* Left: Entity List */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col bg-white dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#111111] space-y-3">
              <div className="relative">
                <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B95AD]" />
                <input
                  value={entitySearch}
                  onChange={e => setEntitySearch(e.target.value)}
                  placeholder="Search entities…"
                  className="w-full pl-8 pr-3 py-2 text-[11px] bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-xl text-[#0D0F14] dark:text-[#F9F9F9] placeholder:text-[#8B95AD] focus:outline-none focus:border-[#E85002]/50"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase border transition-all ${typeFilter === 'ALL' ? 'bg-[#E85002] text-white border-[#E85002]' : 'text-[#8B95AD] border-[#E2E6F0] dark:border-[#333333]'}`}
                >All</button>
                {uniqueTypes.map(t => {
                  const m = ENTITY_TYPE_META[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase border transition-all ${typeFilter === t ? `${m.bg} ${m.color} ${m.border}` : 'text-[#8B95AD] border-[#E2E6F0] dark:border-[#333333]'}`}
                    >{t.replace('_', ' ')}</button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredEntities.map(entity => {
                const meta = ENTITY_TYPE_META[entity.type];
                const Icon = meta.icon;
                const isSelected = entity.tempId === selectedEntityId;
                return (
                  <button
                    key={entity.tempId}
                    onClick={() => setSelectedEntityId(entity.tempId)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isSelected ? 'bg-[#E85002]/8 border-[#E85002]/40' : 'bg-white dark:bg-[#111111] border-[#E2E6F0] dark:border-[#333333] hover:border-[#E85002]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} border ${meta.border}`}>
                        <Icon size={15} className={meta.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#0D0F14] dark:text-[#F9F9F9] truncate">{entity.displayLabel}</p>
                        <p className="text-[10px] font-mono text-[#8B95AD]">{entity.type.replace('_', ' ')} · {(entity.confidence * 100).toFixed(0)}%</p>
                      </div>
                      {entity.hasWarning && <WarningCircle size={14} className="text-amber-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Entity Details */}
          <div className="flex-1 bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl p-5 shadow-sm min-h-[400px] overflow-y-auto">
            {selectedEntity ? (
              <EntityDetailsPanel
                entity={selectedEntity}
                relationships={result.relationships}
                allEntities={result.entities}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-[#8B95AD] font-mono text-[13px]">
                Select an entity to view its details
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Relationships Tab ────────────────────────────────────────────────── */}
      {activeTab === 'RELATIONSHIPS' && (
        <div className="space-y-3">
          {result.relationships.map(rel => {
            const src = result.entities.find(e => e.tempId === rel.sourceEntityId);
            const tgt = result.entities.find(e => e.tempId === rel.targetEntityId);
            const srcMeta = src ? ENTITY_TYPE_META[src.type] : null;
            const tgtMeta = tgt ? ENTITY_TYPE_META[tgt.type] : null;
            return (
              <div key={rel.tempId} className="bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Source */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${srcMeta?.bg} ${srcMeta?.border}`}>
                    {srcMeta && React.createElement(srcMeta.icon, { size: 15, className: srcMeta.color })}
                    <span className="text-[12px] font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{src?.displayLabel ?? rel.sourceEntityId}</span>
                  </div>

                  {/* Relationship label */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30">{rel.type}</span>
                    <span className="text-[9px] font-mono text-[#8B95AD]">→ {rel.assertionType}</span>
                  </div>

                  {/* Target */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${tgtMeta?.bg} ${tgtMeta?.border}`}>
                    {tgtMeta && React.createElement(tgtMeta.icon, { size: 15, className: tgtMeta.color })}
                    <span className="text-[12px] font-bold text-[#0D0F14] dark:text-[#F9F9F9]">{tgt?.displayLabel ?? rel.targetEntityId}</span>
                  </div>

                  {/* Metadata */}
                  <div className="ml-auto flex items-center gap-3 text-[11px]">
                    <span className={`font-bold ${rel.confidence >= 0.9 ? 'text-emerald-400' : rel.confidence >= 0.7 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {(rel.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="font-mono text-[#8B95AD]">{rel.tempId}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Raw JSON Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'RAW_JSON' && (
        <div className="space-y-3">
          {showJsonWarning && (
            <div className="flex items-start gap-2 rounded-2xl border border-[#E85002]/30 bg-[#E85002]/8 px-4 py-3">
              <WarningCircle size={15} className="text-[#E85002] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#E85002] flex-1">Raw extraction JSON is shown for investigative reference. Do not treat extracted entities as canonical identities until entity resolution is complete.</p>
              <button onClick={() => setShowJsonWarning(false)} className="text-[#E85002] text-[11px] font-bold hover:opacity-70 shrink-0">✕</button>
            </div>
          )}
          <div className="bg-white dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#111111]">
              <div className="flex items-center gap-2">
                <Code size={15} className="text-[#E85002]" />
                <span className="text-[11px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">Schema 1.1 JSON</span>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold text-[#8B95AD] hover:text-[#E85002] border border-[#E2E6F0] dark:border-[#333333] rounded-lg transition-colors">
                <Download size={12} /> Download
              </button>
            </div>
            <pre className="p-5 font-mono text-[11px] text-[#0D0F14] dark:text-[#D4D4D4] leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
