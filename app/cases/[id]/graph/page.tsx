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
  ArrowsClockwise,
  CaretDown
} from '@phosphor-icons/react';

// Custom pill-style entity toggle
function EntityToggle({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-[18px] w-[32px] flex-shrink-0 rounded-full border transition-colors duration-200 ease-in-out ${
        checked
          ? 'bg-[#E85002] border-[#E85002]'
          : 'bg-[#D1D5DB] dark:bg-[#333333] border-[#CDD2E1] dark:border-[#444444]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow-sm ring-0 transition-all duration-200 ease-in-out ${
          checked ? 'translate-x-[16px]' : 'translate-x-[2px]'
        } mt-[2px]`}
      />
      {checked && (
        <span className="absolute inset-0 flex items-center justify-start pl-[3px]">
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="opacity-90">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  );
}

export default function InvestigationGraphPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  
  const [enabledNodes, setEnabledNodes] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [reconstructKey, setReconstructKey] = useState(0);

  useEffect(() => {
    if (caseId) {
      const data = getInvestigationGraph(caseId);
      setGraphData(data);
      setEnabledNodes(new Set(data.nodes.map(n => n.id)));
      // Collapse all category groups by default
      const allTypes = new Set(data.nodes.map(n => n.type));
      setCollapsedGroups(allTypes);
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

  const toggleGroup = (type: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const reconstructGraph = () => {
    setEnabledNodes(new Set(graphData.nodes.map(n => n.id)));
    setCollapsedGroups(new Set());
    setSelectedNode(null);
    setSelectedEdge(null);
    setReconstructKey(k => k + 1);
  };

  const activeGraphData = useMemo(() => {
    const nodes = graphData.nodes.filter(n => enabledNodes.has(n.id));
    const edges = graphData.edges.filter(e => enabledNodes.has(e.source) && enabledNodes.has(e.target));
    return { nodes, edges };
  }, [graphData, enabledNodes]);

  const legendItems = [
    { label: 'IDENTITY', color: '#E85002', desc: 'Consolidated Identity' },
    { label: 'PERSON', color: '#0284C7', desc: 'Human Subject' },
    { label: 'ORGANIZATION', color: '#6366F1', desc: 'Company / Institution' },
    { label: 'DEVICE', color: '#8B5CF6', desc: 'Hardware IMEI / SIM' },
    { label: 'HARDWARE ID', color: '#9333EA', desc: 'Device Chip / IMEI' },
    { label: 'IP ADDRESS', color: '#F59E0B', desc: 'Network Gateway / VPN' },
    { label: 'TRANSACTION', color: '#10B981', desc: 'Financial Settlement' },
    { label: 'ACCOUNT', color: '#0D9488', desc: 'Bank Card / Account' },
    { label: 'WALLET', color: '#EC4899', desc: 'Crypto Wallet Address' },
    { label: 'LOCATION', color: '#EA580C', desc: 'Terminal / Geo Place' }
  ];

  const groupedNodes = useMemo(() => {
    const groups: Record<string, GraphNode[]> = {};
    graphData.nodes.forEach(n => {
      if (!groups[n.type]) groups[n.type] = [];
      groups[n.type].push(n);
    });
    return groups;
  }, [graphData]);

  const categoriesCount = Object.keys(groupedNodes).length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#E85002] uppercase tracking-widest">
            <span>INVESTIGATION STAGE 06 // FORENSIC KNOWLEDGE GRAPH</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0D0F14] dark:text-[#F9F9F9] mt-1">
            Network Mapping &amp; Link Analysis
          </h2>
          <p className="text-xs font-medium text-[#8B95AD] dark:text-[#A7A7A7] mt-1">
            Interactive topology. Use the builder pane to construct the graph manually.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseId}`}
            className="flex items-center gap-2 rounded-xl bg-white hover:bg-[#F6F7FB] dark:bg-[#111111] dark:hover:bg-[#222222] border border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] px-4 py-2.5 text-[12px] font-bold font-mono uppercase tracking-wider transition-colors shadow-sm"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Case Overview</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[720px]">
        {/* Graph Builder Pane */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-[#000000] border border-[#E2E6F0] dark:border-[#333333] rounded-3xl overflow-hidden shadow-sm dark:shadow-2xl">
          <div className="p-5 border-b border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#111111] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-mono font-bold text-[#0D0F14] dark:text-[#F9F9F9] uppercase tracking-widest">
                Entity Builder
              </h3>
              <span className="text-[10px] font-mono font-bold bg-[#E85002]/20 text-[#E85002] border border-[#E85002]/30 px-2 py-0.5 rounded-md">
                {categoriesCount} Categories
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAll(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-white hover:bg-[#F0F0F0] dark:bg-[#000000] dark:hover:bg-[#222222] border border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] text-[10px] font-bold font-mono uppercase transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.5" y="0.5" width="12" height="12" rx="2.5" stroke="currentColor"/><path d="M3 6.5l2.5 2.5L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> All
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-white hover:bg-[#F0F0F0] dark:bg-[#000000] dark:hover:bg-[#222222] border border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] text-[10px] font-bold font-mono uppercase transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.5" y="0.5" width="12" height="12" rx="2.5" stroke="currentColor"/></svg> None
              </button>
              <button
                onClick={reconstructGraph}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-[#E85002]/10 hover:bg-[#E85002]/20 border border-[#E85002]/50 text-[#E85002] text-[10px] font-bold font-mono uppercase transition-colors"
                title="Reset layout physics"
              >
                <ArrowsClockwise size={14} /> Reset
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#CDD2E1] dark:scrollbar-thumb-[#333333]">
            {Object.entries(groupedNodes).map(([type, nodes]) => {
              const isCollapsed = collapsedGroups.has(type);
              const typeCheckedCount = nodes.filter(n => enabledNodes.has(n.id)).length;
              
              return (
                <div key={type} className="border border-[#E2E6F0] dark:border-[#333333] rounded-2xl overflow-hidden bg-white dark:bg-[#111111]">
                  <button 
                    onClick={() => toggleGroup(type)}
                    className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-[#111111] hover:bg-[#F6F7FB] dark:hover:bg-[#222222] transition-colors"
                  >
                    <h4 className="text-[11px] font-mono font-bold text-[#E85002] uppercase tracking-widest flex items-center gap-2">
                      {type}
                      <span className="text-[#8B95AD] dark:text-[#A7A7A7] text-[10px]">({typeCheckedCount}/{nodes.length})</span>
                    </h4>
                    <CaretDown size={14} weight="bold" className={`text-[#8B95AD] dark:text-[#646464] transform transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out origin-top ${isCollapsed ? 'max-h-0 opacity-0 scale-y-0' : 'max-h-[800px] opacity-100 scale-y-100'}`}>
                    <div className="p-2 space-y-1 bg-[#F6F7FB] dark:bg-[#000000] border-t border-[#E2E6F0] dark:border-[#333333]">
                      {nodes.map(node => {
                        const isChecked = enabledNodes.has(node.id);
                        return (
                          <div
                            key={node.id}
                            onClick={() => toggleNode(node.id)}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-[#111111] border border-transparent hover:border-[#E2E6F0] dark:hover:border-[#333333] cursor-pointer transition-colors group"
                          >
                            <EntityToggle checked={isChecked} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-[12px] font-bold truncate transition-colors ${isChecked ? 'text-[#0D0F14] dark:text-[#F9F9F9]' : 'text-[#8B95AD] dark:text-[#A7A7A7] group-hover:text-[#0D0F14] dark:group-hover:text-[#F9F9F9]'}`}>
                                {node.label}
                              </p>
                              <p className="text-[10px] font-mono text-[#8B95AD] dark:text-[#646464] truncate mt-0.5">
                                {node.id}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Canvas Container */}
        <div className="relative flex-1 rounded-3xl overflow-hidden border border-[#E2E6F0] dark:border-[#333333] bg-white dark:bg-[#000000] shadow-sm dark:shadow-2xl">
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

      {/* Legend & Multi-Modal Type Bar */}
      <div className="rounded-2xl border bg-white dark:bg-[#111111] border-[#E2E6F0] dark:border-[#333333] p-5 shadow-sm dark:shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <span className="font-bold text-[#8B95AD] dark:text-[#A7A7A7] text-[11px] uppercase tracking-widest">
            Ontology Legend:
          </span>

          <div className="flex flex-wrap items-center gap-4">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2" title={item.desc}>
                <span
                  className="h-3 w-3 rounded-md border border-black/10 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
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