'use client';

import React from 'react';
import { GraphNode } from '@/lib/types';
import {
  X,
  FileText,
  ShareNetwork,
  Tag,
  ShieldCheck,
  Fingerprint
} from '@phosphor-icons/react';

interface EntityDetailsDrawerProps {
  node: GraphNode | null;
  onClose: () => void;
}

export default function EntityDetailsDrawer({
  node,
  onClose
}: EntityDetailsDrawerProps) {
  if (!node) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-[#F9F9F9] border-l border-[#E2E2E2] dark:bg-[#121212] dark:border-[#333333] shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200 text-[#000000] dark:text-[#F9F9F9]">
      {/* Header */}
      <div className="p-6 border-b border-[#E2E2E2] dark:border-[#333333] flex items-start justify-between bg-white dark:bg-[#000000]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#E85002]/15 text-[#E85002] border border-[#E85002]/30">
              {node.type}
            </span>
            {node.isIdentity && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#E85002] text-white">
                CONSOLIDATED IDENTITY
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-[#000000] dark:text-[#F9F9F9] break-words">{node.label}</h3>
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
        {/* Core Properties Card */}
        <div className="rounded-3xl border border-[#E2E2E2] dark:border-[#333333] bg-white dark:bg-[#000000] p-4 text-xs font-mono space-y-2">
          <div className="text-[10px] font-bold text-[#E85002] uppercase tracking-wider">
            Topology Node Properties
          </div>
          <div className="space-y-1.5 text-[#333333] dark:text-[#D4D4D4]">
            <div className="flex justify-between">
              <span className="text-[#646464] dark:text-[#A7A7A7]">Node ID:</span>
              <span className="font-bold text-[#000000] dark:text-[#F9F9F9]">{node.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#646464] dark:text-[#A7A7A7]">Ontology Type:</span>
              <span className="font-bold text-[#E85002]">{node.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#646464] dark:text-[#A7A7A7]">Visual Radius:</span>
              <span>{node.radius}px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#646464] dark:text-[#A7A7A7]">Resolution Status:</span>
              <span className="font-bold text-[#E85002]">
                {node.isIdentity ? 'CONSOLIDATED' : 'PROVISIONAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Attributes */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-mono font-bold text-[#E85002] tracking-wider">
            Forensic Attributes ({Object.keys(node.properties || {}).length})
          </div>

          <div className="rounded-2xl border border-[#E2E2E2] dark:border-[#333333] overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <tbody className="divide-y divide-[#E2E2E2] dark:divide-[#333333]">
                {Object.entries(node.properties || {}).map(([key, val]) => (
                  <tr key={key}>
                    <td className="px-3.5 py-2.5 font-bold text-[#646464] dark:text-[#A7A7A7] bg-[#F0F0F0] dark:bg-[#1C1C1C] w-1/3">
                      {key}
                    </td>
                    <td className="px-3.5 py-2.5 text-[#000000] dark:text-[#F9F9F9] break-all">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
