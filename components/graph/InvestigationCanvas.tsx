'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GraphData, GraphNode, GraphEdge } from '@/lib/types';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
  Pause,
  Play,
  MagnifyingGlass
} from '@phosphor-icons/react';

interface InvestigationCanvasProps {
  data: GraphData;
  onSelectNode: (node: GraphNode) => void;
  onSelectEdge: (edge: GraphEdge) => void;
  selectedNodeId?: string;
  selectedEdgeId?: string;
}

interface SimulatedNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function InvestigationCanvas({
  data,
  onSelectNode,
  onSelectEdge,
  selectedNodeId,
  selectedEdgeId
}: InvestigationCanvasProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [nodes, setNodes] = useState<SimulatedNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [isPhysicsRunning, setIsPhysicsRunning] = useState(true);

  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimulatedNode | null>(null);
  const hoveredNodeRef = useRef<SimulatedNode | null>(null);

  useEffect(() => {
    if (!data.nodes || data.nodes.length === 0) return;

    const width = 900;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const simNodes: SimulatedNode[] = data.nodes.map((n, idx) => {
      const angle = (idx / data.nodes.length) * 2 * Math.PI;
      const dist = n.isIdentity ? 60 : 180 + (idx % 3) * 60;
      return {
        ...n,
        x: centerX + Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
        y: centerY + Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: n.isIdentity ? 24 : Math.max(13, n.val * 0.78)
      };
    });

    setNodes(simNodes);
    setEdges(data.edges);
    transformRef.current = { x: 0, y: 0, k: 1 };
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Navy / Warm Beige Background
      ctx.fillStyle = isDark ? '#0D1424' : '#FAF6F0';
      ctx.fillRect(0, 0, width, height);

      // Canvas Texture Grid Dots
      ctx.save();
      ctx.fillStyle = isDark ? 'rgba(198, 167, 94, 0.12)' : '#E8DCC8';
      for (let x = 0; x < width; x += 24) {
        for (let y = 0; y < height; y += 24) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
      ctx.restore();

      ctx.save();
      const { x, y, k } = transformRef.current;
      ctx.translate(x, y);
      ctx.scale(k, k);

      // Physics Simulation Step
      if (isPhysicsRunning && !draggedNodeRef.current) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = n1.radius + n2.radius + 65;

            if (dist < minDist) {
              const force = ((minDist - dist) / dist) * 0.04;
              n1.vx -= dx * force;
              n1.vy -= dy * force;
              n2.vx += dx * force;
              n2.vy += dy * force;
            }
          }
        }

        edges.forEach((edge) => {
          const sNode = nodes.find((n) => n.id === edge.source);
          const tNode = nodes.find((n) => n.id === edge.target);
          if (sNode && tNode) {
            const dx = tNode.x - sNode.x;
            const dy = tNode.y - sNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = edge.relationshipName === 'RESOLVED_TO' ? 110 : 160;
            const force = (dist - targetDist) * 0.003;
            sNode.vx += dx * force;
            sNode.vy += dy * force;
            tNode.vx -= dx * force;
            tNode.vy -= dy * force;
          }
        });

        nodes.forEach((n) => {
          const gx = width / 2 - n.x;
          const gy = height / 2 - n.y;
          n.vx += gx * 0.0005;
          n.vy += gy * 0.0005;

          n.vx *= 0.88;
          n.vy *= 0.88;
          n.x += n.vx;
          n.y += n.vy;
        });
      }

      const activeHoverId = hoveredNodeRef.current?.id;
      const activeSelectedId = selectedNodeId;

      // Draw Edges
      edges.forEach((edge) => {
        const sNode = nodes.find((n) => n.id === edge.source);
        const tNode = nodes.find((n) => n.id === edge.target);
        if (!sNode || !tNode) return;

        const isConnectedToHover =
          activeHoverId && (edge.source === activeHoverId || edge.target === activeHoverId);
        const isConnectedToSelected =
          activeSelectedId && (edge.source === activeSelectedId || edge.target === activeSelectedId);
        const isSelected = selectedEdgeId === edge.id;

        const isDimmed =
          (activeHoverId && !isConnectedToHover) ||
          (activeSelectedId && !isConnectedToSelected && !isSelected);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(tNode.x, tNode.y);

        if (edge.relationshipName === 'RESOLVED_TO') {
          ctx.strokeStyle = isDimmed
            ? 'rgba(232, 80, 2, 0.2)'
            : '#E85002';
          ctx.lineWidth = isSelected || isConnectedToHover ? 3.5 : 2.5;
          ctx.setLineDash([6, 4]);
        } else if (edge.relationshipName === 'CONTRADICTS') {
          ctx.strokeStyle = isDimmed
            ? 'rgba(193, 8, 1, 0.2)'
            : '#C10801';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = isDimmed
            ? isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)'
            : isConnectedToHover || isConnectedToSelected || isSelected
            ? '#E85002'
            : isDark
            ? 'rgba(255, 255, 255, 0.25)'
            : 'rgba(0, 0, 0, 0.35)';
          ctx.lineWidth = isSelected || isConnectedToHover ? 2.5 : 1.5;
          ctx.setLineDash([]);
        }

        ctx.stroke();

        // Arrow
        const angle = Math.atan2(tNode.y - sNode.y, tNode.x - sNode.x);
        const arrowDist = tNode.radius + 12;
        const arrowX = tNode.x - Math.cos(angle) * arrowDist;
        const arrowY = tNode.y - Math.sin(angle) * arrowDist;

        ctx.beginPath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - 8 * Math.cos(angle - Math.PI / 6),
          arrowY - 8 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - 8 * Math.cos(angle + Math.PI / 6),
          arrowY - 8 * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Edge text badge
        const midX = (sNode.x + tNode.x) / 2;
        const midY = (sNode.y + tNode.y) / 2;

        if (!isDimmed || isConnectedToHover || isSelected) {
          ctx.font = 'bold 9px monospace';
          const text = edge.label || edge.relationshipName;
          const textWidth = ctx.measureText(text).width;

          // Box
          ctx.fillStyle = isDark ? '#121212' : '#FFFFFF';
          ctx.fillRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);
          ctx.strokeStyle = isDark ? '#333333' : '#E2E2E2';
          ctx.lineWidth = 1;
          ctx.strokeRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);

          // Text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle =
            edge.relationshipName === 'RESOLVED_TO'
              ? '#E85002'
              : edge.relationshipName === 'CONTRADICTS'
              ? '#C10801'
              : isDark
              ? '#F9F9F9'
              : '#000000';
          ctx.fillText(text, midX, midY);
        }

        ctx.restore();
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeRef.current?.id === node.id;
        const matchesSearch =
          searchQuery.trim() !== '' &&
          node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
          selectedTypeFilter === 'ALL' || node.type === selectedTypeFilter;

        const isDimmed =
          (selectedTypeFilter !== 'ALL' && !matchesType) ||
          (activeHoverId &&
            activeHoverId !== node.id &&
            !edges.some(
              (e) =>
                (e.source === activeHoverId && e.target === node.id) ||
                (e.target === activeHoverId && e.source === node.id)
            ));

        ctx.save();

        // Branding Orange & Primary Color Mapping
        let nodeColor = '#E85002';
        if (node.type === 'IDENTITY') nodeColor = '#E85002';
        else if (node.type === 'PERSON') nodeColor = isDark ? '#F9F9F9' : '#111111';
        else if (node.type === 'ORGANIZATION') nodeColor = '#3B82F6';
        else if (node.type === 'DEVICE' || node.type === 'DEVICE_IDENTIFIER') nodeColor = '#06B6D4';
        else if (node.type === 'IP_ADDRESS') nodeColor = '#F59E0B';
        else if (node.type === 'TRANSACTION') nodeColor = '#8B5CF6';
        else if (node.type === 'WALLET_ADDRESS') nodeColor = '#D946EF';
        else if (node.type === 'ACCOUNT') nodeColor = '#10B981';
        else if (node.type === 'LOCATION') nodeColor = '#64748B';

        // Pulse ring if Identity, Search Match, or Selected
        if (node.isIdentity || matchesSearch || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, 2 * Math.PI);
          ctx.strokeStyle = '#E85002';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = isDimmed
          ? isDark
            ? 'rgba(51, 51, 51, 0.4)'
            : 'rgba(226, 226, 226, 0.5)'
          : nodeColor;
        ctx.fill();

        // Node Border
        ctx.strokeStyle = isSelected
          ? '#E85002'
          : isHovered
          ? isDark
            ? '#F9F9F9'
            : '#000000'
          : isDark
          ? '#333333'
          : '#E2E2E2';
        ctx.lineWidth = isSelected ? 3 : isHovered ? 2 : 1.5;
        ctx.stroke();

        // Label Pill
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';

        const labelText = node.label;
        const labelWidth = ctx.measureText(labelText).width;

        // Label Box
        ctx.fillStyle = isDark ? '#121212' : '#FFFFFF';
        ctx.fillRect(node.x - labelWidth / 2 - 5, node.y + node.radius + 4, labelWidth + 10, 16);
        ctx.strokeStyle = isDark ? '#333333' : '#E2E2E2';
        ctx.lineWidth = 1;
        ctx.strokeRect(node.x - labelWidth / 2 - 5, node.y + node.radius + 4, labelWidth + 10, 16);

        // Label Text
        ctx.fillStyle = isDimmed
          ? '#646464'
          : isDark
          ? '#F9F9F9'
          : '#000000';
        ctx.fillText(labelText, node.x, node.y + node.radius + 16);

        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, edges, isPhysicsRunning, selectedNodeId, selectedEdgeId, searchQuery, selectedTypeFilter, isDark]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
    const mouseY = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;

    const clickedNode = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      onSelectNode(clickedNode);
      return;
    }

    const clickedEdge = edges.find((edge) => {
      const sNode = nodes.find((n) => n.id === edge.source);
      const tNode = nodes.find((n) => n.id === edge.target);
      if (!sNode || !tNode) return false;

      const dx = tNode.x - sNode.x;
      const dy = tNode.y - sNode.y;
      const lengthSq = dx * dx + dy * dy;
      if (lengthSq === 0) return false;

      const t = Math.max(
        0,
        Math.min(1, ((mouseX - sNode.x) * dx + (mouseY - sNode.y) * dy) / lengthSq)
      );
      const projX = sNode.x + t * dx;
      const projY = sNode.y + t * dy;
      const dist = Math.sqrt((mouseX - projX) ** 2 + (mouseY - projY) ** 2);
      return dist <= 8;
    });

    if (clickedEdge) {
      onSelectEdge(clickedEdge);
      return;
    }

    isDraggingCanvasRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
    const mouseY = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = mouseX;
      draggedNodeRef.current.y = mouseY;
      return;
    }

    if (isDraggingCanvasRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const hovered = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    hoveredNodeRef.current = hovered || null;
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingCanvasRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    handleZoom(zoomFactor);
  };

  const handleZoom = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newScale = Math.max(0.2, Math.min(3.0, transformRef.current.k * factor));
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    transformRef.current.x = cx - (cx - transformRef.current.x) * (newScale / transformRef.current.k);
    transformRef.current.y = cy - (cy - transformRef.current.y) * (newScale / transformRef.current.k);
    transformRef.current.k = newScale;
  };

  const handleResetView = () => {
    transformRef.current = { x: 0, y: 0, k: 1 };
  };

  return (
    <div className="relative w-full h-[680px] rounded-3xl border border-[#E2E2E2] bg-white dark:border-[#333333] dark:bg-[#000000] overflow-hidden shadow-2xl transition-colors duration-200">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Search & Filter */}
        <div className="flex items-center gap-2 pointer-events-auto p-1.5 rounded-2xl border shadow-md backdrop-blur-md bg-white/95 border-[#E2E2E2] text-[#000000] dark:bg-[#121212]/95 dark:border-[#333333] dark:text-[#F9F9F9]">
          <div className="relative">
            <MagnifyingGlass
              size={15}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E85002]"
            />
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] dark:bg-[#000000] text-xs outline-none focus:border-[#E85002] w-48 text-[#000000] dark:text-[#F9F9F9] placeholder-[#646464] dark:placeholder-[#A7A7A7]"
            />
          </div>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E2E2] dark:border-[#333333] bg-[#F0F0F0] dark:bg-[#000000] text-xs font-mono outline-none focus:border-[#E85002] cursor-pointer text-[#000000] dark:text-[#F9F9F9]"
          >
            <option value="ALL">All Entity Types</option>
            <option value="IDENTITY">IDENTITY (Consolidated)</option>
            <option value="PERSON">PERSON</option>
            <option value="ORGANIZATION">ORGANIZATION</option>
            <option value="DEVICE_IDENTIFIER">DEVICE_IDENTIFIER</option>
            <option value="DEVICE">DEVICE</option>
            <option value="IP_ADDRESS">IP_ADDRESS</option>
            <option value="TRANSACTION">TRANSACTION</option>
            <option value="WALLET_ADDRESS">WALLET_ADDRESS</option>
            <option value="ACCOUNT">ACCOUNT</option>
            <option value="LOCATION">LOCATION</option>
          </select>
        </div>

        {/* Right: Camera & Physics Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto p-2 rounded-2xl border shadow-md backdrop-blur-md bg-white/95 border-[#E2E2E2] text-[#000000] dark:bg-[#121212]/95 dark:border-[#333333] dark:text-[#F9F9F9]">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#E2E2E2] text-[#000000] dark:bg-[#1C1C1C] dark:hover:bg-[#2A2A2A] dark:text-[#F9F9F9] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <MagnifyingGlassPlus size={16} weight="bold" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#E2E2E2] text-[#000000] dark:bg-[#1C1C1C] dark:hover:bg-[#2A2A2A] dark:text-[#F9F9F9] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <MagnifyingGlassMinus size={16} weight="bold" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#E2E2E2] text-[#000000] dark:bg-[#1C1C1C] dark:hover:bg-[#2A2A2A] dark:text-[#F9F9F9] transition-colors cursor-pointer"
            title="Reset View"
          >
            <ArrowsOut size={16} weight="bold" />
          </button>
          <button
            onClick={() => setIsPhysicsRunning((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isPhysicsRunning
                ? 'bg-[#E85002] text-white font-bold shadow-md shadow-[#E85002]/25'
                : 'bg-[#F0F0F0] text-[#646464] dark:bg-[#1C1C1C] dark:text-[#A7A7A7]'
            }`}
            title={isPhysicsRunning ? 'Pause Force Physics' : 'Resume Physics'}
          >
            {isPhysicsRunning ? <Pause size={16} weight="bold" /> : <Play size={16} weight="fill" />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={680}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Status Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-xs font-mono">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-md backdrop-blur-md bg-white/95 border-[#E2E2E2] text-[#000000] dark:bg-[#121212]/95 dark:border-[#333333] dark:text-[#F9F9F9]">
          <span>
            Topology: <span className="font-bold text-[#E85002]">{nodes.length}</span> nodes,{' '}
            <span className="font-bold text-[#E85002]">{edges.length}</span> relationships
          </span>
          <span className="text-[#E2E2E2] dark:text-[#333333]">|</span>
          <span className="text-[#E85002] font-bold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#E85002] animate-pulse" />
            1 Consolidated IDENTITY
          </span>
        </div>

        <div className="px-4 py-2 rounded-2xl border shadow-md backdrop-blur-md bg-white/95 border-[#E2E2E2] text-[#646464] dark:bg-[#121212]/95 dark:border-[#333333] dark:text-[#A7A7A7]">
          Click node or edge to inspect attributes
        </div>
      </div>
    </div>
  );
}
