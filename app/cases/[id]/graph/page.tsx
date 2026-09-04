'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getInvestigationGraph } from '@/lib/api';
import { GraphData, GraphNode, GraphEdge } from '@/lib/types';
import InvestigationCanvas from '@/components/graph/InvestigationCanvas';
import EntityDetailsDrawer from '@/components/graph/EntityDetailsDrawer';
import RelationshipDetailsDrawer from '@/components/graph/RelationshipDetailsDrawer';
import {
  ArrowLeft,
  CheckSquareOffset,
  Square,
  ArrowsClockwise
} from '@phosphor-icons/react';

export default function InvestigationGraphPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  
  const [enabledNodes, setEnabledNodes] = useState<Set<string>>(new Set());
  const [reconstructKey, setReconstructKey] = useState(0);

  useEffect(() => {
    if (caseId) {
      const data = getInvestigationGraph(caseId);
      setGraphData(data);
      setEnabledNodes(new Set(data.nodes.map(n => n.id)));
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

  const toggleNode = (nodeId: string) => {
    setEnabledNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const toggleAll = (enable: boolean) => {
    if (enable) {
      setEnabledNodes(new Set(graphData.nodes.map(n => n.id)));
    } else {
      setEnabledNodes(new Set());
    }
  };

  const reconstructGraph = () => {
    setReconstructKey(k => k + 1);
  };

  const activeGraphData = useMemo(() => {
    const nodes = graphData.nodes.filter(n => enabledNodes.has(n.id));
    const edges = graphData.edges.filter(e => enabledNodes.has(e.source) && enabledNodes.has(e.target));
    return { nodes, edges };
  }, [graphData, enabledNodes]);

  const legendItems = [
    { label: 'IDENTITY', color: '#E85002', desc: 'Consolidated Identity' },
    { label: 'PERSON', color: '#F9F9F9', desc: 'Human Subject' },
    { label: 'ORGANIZATION', color: '#3B82F6', desc: 'Company / Institution' },
    { label: 'DEVICE', color: '#06B6D4', desc: 'Hardware IMEI / SIM' },
    { label: 'IP ADDRESS', color: '#F59E0B', desc: 'Network Gateway / VPN' },
    { label: 'TRANSACTION', color: '#8B5CF6', desc: 'Financial Settlement' },
    { label: 'MAIL/WALLET', color: '#D946EF', desc: 'Email / Crypto Address' },
    { label: 'ACCOUNT', color: '#10B981', desc: 'Bank Card / Account' },
    { label: 'LOCATION', color: '#64748B', desc: 'Terminal Place' }
  ];

  const groupedNodes = useMemo(() => {
    const groups: Record<string, GraphNode[]> = {};
    graphData.nodes.forEach(n => {
      if (!groups[n.type]) groups[n.type] = [];
      groups[n.type].push(n);
    });
    return groups;
  }, [graphData]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E85002]">
            <span>INVESTIGATION STAGE 06 // FORENSIC KNOWLEDGE GRAPH</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0D0F14] dark:text-[#F9F9F9] mt-1">
            Network Mapping &amp; Link Analysis
          </h2>
          <p className="text-xs text-[#8B95AD] dark:text-[#646464]">
            Interactive topology. Use the builder pane to construct the graph manually.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseId}`}
            className="flex items-center gap-2 rounded-2xl bg-white dark:bg-[#000000] hover:bg-[#F6F7FB] dark:hover:bg-[#222222] border border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] px-4 py-2 text-xs font-bold font-mono transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Case Overview</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[680px]">
        {/* Graph Builder Pane */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm dark:shadow-2xl">
          <div className="p-4 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#111111] flex flex-col gap-3">
            <h3 className="text-[12px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">
              Entity Builder
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAll(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#F6F7FB] dark:bg-[#222222] hover:bg-[#E2E6F0] dark:hover:bg-[#333333] border border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] text-[10px] font-bold font-mono uppercase transition-colors"
              >
                <CheckSquareOffset size={14} /> All
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#F6F7FB] dark:bg-[#222222] hover:bg-[#E2E6F0] dark:hover:bg-[#333333] border border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] text-[10px] font-bold font-mono uppercase transition-colors"
              >
                <Square size={14} /> None
              </button>
              <button
                onClick={reconstructGraph}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#E85002]/20 hover:bg-[#E85002]/30 border border-[#E85002]/50 text-[#E85002] text-[10px] font-bold font-mono uppercase transition-colors"
                title="Reset layout physics"
              >
                <ArrowsClockwise size={14} /> Reset
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-[#E2E6F0] dark:scrollbar-thumb-[#333333]">
            {Object.entries(groupedNodes).map(([type, nodes]) => (
              <div key={type}>
                <h4 className="text-[10px] font-mono font-bold text-[#E85002] uppercase tracking-widest mb-2 px-1">
                  {type} ({nodes.length})
                </h4>
                <div className="space-y-1">
                  {nodes.map(node => {
                    const isChecked = enabledNodes.has(node.id);
                    return (
                      <div
                        key={node.id}
                        onClick={() => toggleNode(node.id)}
                        className="flex items-start gap-2 p-2 rounded-xl hover:bg-[#F6F7FB] dark:hover:bg-[#111111] border border-transparent hover:border-[#E2E6F0] dark:hover:border-[#333333] cursor-pointer transition-colors group"
                      >
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquareOffset size={16} weight="fill" className="text-[#E85002]" />
                          ) : (
                            <Square size={16} className="text-[#8B95AD] dark:text-[#646464] group-hover:text-[#A7A7A7]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] font-bold truncate transition-colors ${isChecked ? 'text-[#0D0F14] dark:text-[#F9F9F9]' : 'text-[#8B95AD] dark:text-[#646464] group-hover:text-[#A7A7A7]'}`}>
                            {node.label}
                          </p>
                          <p className="text-[10px] font-mono text-[#8B95AD] dark:text-[#646464] truncate">
                            {node.id}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Interactive Canvas */}
        <div className="relative flex-1 rounded-3xl overflow-hidden border border-[#E2E6F0] dark:border-[#333333] bg-[#000000]">
          <InvestigationCanvas
            key={reconstructKey}
            data={activeGraphData}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
            selectedNodeId={selectedNode?.id}
            selectedEdgeId={selectedEdge?.id}
          />

          <EntityDetailsDrawer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />

          <RelationshipDetailsDrawer
            edge={selectedEdge}
            onClose={() => setSelectedEdge(null)}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-3xl border bg-white dark:bg-[#000000] border-[#E2E6F0] dark:border-[#333333] p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <span className="font-bold text-[#8B95AD] dark:text-[#A7A7A7] text-[10px] uppercase">
            Ontology Legend:
          </span>

          <div className="flex flex-wrap items-center gap-3">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5" title={item.desc}>
                <span
                  className="h-3 w-3 rounded-full border border-black/20"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-bold text-[#0D0F14] dark:text-[#F9F9F9]">
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