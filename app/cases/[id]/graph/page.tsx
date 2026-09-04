'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getInvestigationGraph } from '@/lib/api';
import { GraphData, GraphNode, GraphEdge } from '@/lib/types';
import InvestigationCanvas from '@/components/graph/InvestigationCanvas';
import EntityDetailsDrawer from '@/components/graph/EntityDetailsDrawer';
import RelationshipDetailsDrawer from '@/components/graph/RelationshipDetailsDrawer';
import {
  ShareNetwork,
  ArrowLeft
} from '@phosphor-icons/react';

export default function InvestigationGraphPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  useEffect(() => {
    if (caseId) {
      setGraphData(getInvestigationGraph(caseId));
    }
  }, [caseId]);

  const handleSelectNode = (node: GraphNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleSelectEdge = (edge: GraphEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const legendItems = [
    { label: 'IDENTITY', color: '#E85002', desc: 'Consolidated Identity' },
    { label: 'PERSON', color: '#F9F9F9', desc: 'Human Subject' },
    { label: 'ORGANIZATION', color: '#3B82F6', desc: 'Company / Institution' },
    { label: 'DEVICE / ID', color: '#06B6D4', desc: 'Hardware IMEI / SIM' },
    { label: 'IP ADDRESS', color: '#F59E0B', desc: 'Network Gateway / VPN' },
    { label: 'TRANSACTION', color: '#8B5CF6', desc: 'Financial Settlement' },
    { label: 'WALLET', color: '#D946EF', desc: 'Crypto Address' },
    { label: 'ACCOUNT', color: '#10B981', desc: 'Bank Card / Account' },
    { label: 'LOCATION', color: '#64748B', desc: 'Terminal Place' }
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E85002]">
            <span>INVESTIGATION STAGE 06 // FORENSIC KNOWLEDGE GRAPH</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#000000] dark:text-[#F9F9F9] mt-1">
            Network Mapping &amp; Link Analysis Topology
          </h2>
          <p className="text-xs text-[#646464] dark:text-[#A7A7A7]">
            Interactive canvas with physics force layout, cross-device entity correlation, and node inspection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseId}`}
            className="flex items-center gap-2 rounded-2xl bg-[#F0F0F0] hover:bg-[#E2E2E2] dark:bg-[#1C1C1C] dark:hover:bg-[#2A2A2A] border border-[#E2E2E2] dark:border-[#333333] text-[#000000] dark:text-[#F9F9F9] px-4 py-2 text-xs font-bold font-mono transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Case Overview</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Canvas Container */}
      <div className="relative">
        <InvestigationCanvas
          data={graphData}
          onSelectNode={handleSelectNode}
          onSelectEdge={handleSelectEdge}
        />

        {/* Slide-over Inspection Drawers */}
        <EntityDetailsDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />

        <RelationshipDetailsDrawer
          edge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
        />
      </div>

      {/* Legend & Multi-Modal Type Bar */}
      <div className="rounded-3xl border border-[#E2E2E2] bg-white dark:border-[#333333] dark:bg-[#121212] p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <span className="font-bold text-[#646464] dark:text-[#A7A7A7] text-[10px] uppercase">
            Ontology Legend:
          </span>

          <div className="flex flex-wrap items-center gap-3">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5" title={item.desc}>
                <span
                  className="h-3 w-3 rounded-full border border-black/20"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-bold text-[#000000] dark:text-[#F9F9F9]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
