'use client';

import React from 'react';
import { GraphEdge } from '@/lib/types';
import {
  X,
  ArrowRight,
  ShieldCheck,
  FileText
} from '@phosphor-icons/react';

interface RelationshipDetailsDrawerProps {
  edge: GraphEdge | null;
  onClose: () => void;
}

export default function RelationshipDetailsDrawer({
  edge,
  onClose
}: RelationshipDetailsDrawerProps) {
  if (!edge) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-[#F9F9F9] border-l border-[#E2E2E2] dark:bg-[#121212] dark:border-[#333333] shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200 text-[#000000] dark:text-[#F9F9F9]">
      {/* Header */}
      <div className="p-6 border-b border-[#E2E2E2] dark:border-[#333333] flex items-start justify-between bg-white dark:bg-[#000000]">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30">
            RELATIONSHIP LINKAGE
          </span>
          <h3 className="text-base font-bold text-[#000000] dark:text-[#F9F9F9] break-words">
            {edge.relationshipName || edge.label}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-[#646464] hover:text-[#000000] hover:bg-[#F0F0F0] dark:hover:bg-[#1C1C1C] dark:hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Source -> Target Connected Visualizer */}
        <div className="rounded-3xl border border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#000000] p-5 space-y-3.5 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#E85002] font-bold tracking-wider">
            Connected Topology
          </div>

          <div className="flex items-center justify-between gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-[#F0F0F0] dark:bg-[#1C1C1C] flex-1 text-center font-bold text-[#000000] dark:text-[#F9F9F9] truncate">
              {edge.source}
            </div>
            <ArrowRight size={16} weight="bold" className="text-[#E85002] flex-shrink-0" />
            <div className="p-3 rounded-2xl bg-[#F0F0F0] dark:bg-[#1C1C1C] flex-1 text-center font-bold text-[#000000] dark:text-[#F9F9F9] truncate">
              {edge.target}
            </div>
          </div>
        </div>

        {/* Edge Attributes */}
        <div className="rounded-3xl border border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#000000] p-4 text-xs font-mono space-y-2">
          <div className="text-[10px] font-bold text-[#E85002] uppercase tracking-wider">
            Linkage Metadata
          </div>
          <div className="space-y-1.5 text-[#333333] dark:text-[#D4D4D4]">
            <div className="flex justify-between">
              <span className="text-[#646464] dark:text-[#A7A7A7]">Edge ID:</span>
              <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{edge.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#646464] dark:text-[#A7A7A7]">Relationship Type:</span>
              <span className="font-bold text-[#E85002]">{edge.relationshipName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#646464] dark:text-[#A7A7A7]">Confidence:</span>
              <span className="font-bold text-[#E85002]">
                {edge.confidence ? `${(edge.confidence * 100).toFixed(0)}%` : 'Authoritative Link'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#000000]">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-[#E85002] hover:bg-[#F16001] text-white font-bold text-xs shadow-lg shadow-[#E85002]/25 transition-all cursor-pointer"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
