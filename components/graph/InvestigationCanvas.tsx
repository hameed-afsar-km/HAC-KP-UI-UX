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
  dragTargetX?: number;
  dragTargetY?: number;
}

const NODE_ICONS: Record<string, string> = {
  PERSON: '\u{1F464}',
  ORGANIZATION: '\u{1F3E2}',
  DEVICE: '\u{1F4F1}',
  DEVICE_IDENTIFIER: '\u{1F4F1}',
  IP_ADDRESS: '\u{1F310}',
  TRANSACTION: '\u{1F4B0}',
  WALLET_ADDRESS: '\u{1F4B3}',
  EMAIL: '\u{2709}',
  MAIL: '\u{2709}',
  ACCOUNT: '\u{1F4B3}',
  LOCATION: '\u{1F4CD}',
  PHONE_NUMBER: '\u{260E}',
  USERNAME: '\u{1F464}',
  DOCUMENT: '\u{1F4C4}',
  IDENTITY: '\u{2B50}',
};

const NODE_ABBR: Record<string, string> = {
  PERSON: 'P',
  ORGANIZATION: 'O',
  DEVICE: 'D',
  DEVICE_IDENTIFIER: 'D',
  IP_ADDRESS: 'IP',
  TRANSACTION: 'T',
  WALLET_ADDRESS: 'W',
  EMAIL: '@',
  MAIL: '@',
  ACCOUNT: 'A',
  LOCATION: 'L',
  PHONE_NUMBER: '\u{260E}',
  USERNAME: '@',
  DOCUMENT: 'DOC',
  IDENTITY: '\u{2605}',
};

export default function InvestigationCanvas({
  data,
  onSelectNode,
  onSelectEdge,
  selectedNodeId,
  selectedEdgeId
}: InvestigationCanvasProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || true;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [nodes, setNodes] = useState<SimulatedNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [isPhysicsRunning, setIsPhysicsRunning] = useState(false);

  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimulatedNode | null>(null);
  const hoveredNodeRef = useRef<SimulatedNode | null>(null);

  useEffect(() => {
    if (!data.nodes) return;

    setNodes(currentNodes => {
      const width = canvasRef.current?.width || 1400;
      const height = canvasRef.current?.height || 1000;
      const centerX = width / 2;
      const centerY = height / 2;

      const existingMap = new Map(currentNodes.map(n => [n.id, n]));

      const newSimNodes: SimulatedNode[] = data.nodes.map((n) => {
        const existing = existingMap.get(n.id);
        const radius = n.isIdentity ? 26 : Math.max(16, n.val * 0.78);
        
        if (existing) {
          return { ...existing, ...n, radius };
        }
        
        const angle = Math.random() * 2 * Math.PI;
        const dist = 100 + Math.random() * 200;
        return {
          ...n,
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          radius
        };
      });
      
      return newSimNodes;
    });

    setEdges(data.edges);
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

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.fillStyle = '#222222';
      for (let x = 0; x < width; x += 24) {
        for (let y = 0; y < height; y += 24) {
          ctx.fillRect(x, y, 1.2, 1.2);
        }
      }
      ctx.restore();

      ctx.save();
      const { x, y, k } = transformRef.current;
      ctx.translate(x, y);
      ctx.scale(k, k);

      // Apply dragged node position regardless of physics
      if (draggedNodeRef.current) {
        const dn = draggedNodeRef.current;
        if (dn.dragTargetX !== undefined && dn.dragTargetY !== undefined) {
          dn.x = dn.dragTargetX;
          dn.y = dn.dragTargetY;
          dn.vx = 0;
          dn.vy = 0;
        }
      }

      // Physics Simulation Step
      if (isPhysicsRunning) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = n1.radius + n2.radius + 80;

            if (dist < minDist) {
              const force = ((minDist - dist) / dist) * 0.05;
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
            const targetDist = edge.relationshipName === 'RESOLVED_TO' ? 130 : 200;
            const force = (dist - targetDist) * 0.004;
            sNode.vx += dx * force;
            sNode.vy += dy * force;
            tNode.vx -= dx * force;
            tNode.vy -= dy * force;
          }
        });

        nodes.forEach((n) => {
          if (n.id === draggedNodeRef.current?.id) return;

          const gx = width / 2 - n.x;
          const gy = height / 2 - n.y;
          n.vx += gx * 0.0003;
          n.vy += gy * 0.0003;

          n.vx *= 0.85;
          n.vy *= 0.85;
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
          ctx.strokeStyle = isDimmed ? 'rgba(232, 80, 2, 0.15)' : '#E85002';
          ctx.lineWidth = isSelected || isConnectedToHover ? 3.5 : 2.5;
          ctx.setLineDash([6, 4]);
        } else if (edge.relationshipName === 'CONTRADICTS') {
          ctx.strokeStyle = isDimmed ? 'rgba(193, 8, 1, 0.15)' : '#C10801';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = isDimmed
            ? 'rgba(255, 255, 255, 0.05)'
            : (isConnectedToHover || isConnectedToSelected || isSelected)
              ? '#E85002'
              : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = isSelected || isConnectedToHover ? 2.5 : 1.5;
          ctx.setLineDash([]);
        }

        ctx.stroke();

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

        const midX = (sNode.x + tNode.x) / 2;
        const midY = (sNode.y + tNode.y) / 2;

        if (!isDimmed || isConnectedToHover || isSelected) {
          ctx.font = 'bold 9px monospace';
          const text = edge.label || edge.relationshipName;
          const textWidth = ctx.measureText(text).width;

          ctx.fillStyle = '#111111';
          ctx.fillRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 1;
          ctx.strokeRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = edge.relationshipName === 'RESOLVED_TO'
            ? '#E85002'
            : edge.relationshipName === 'CONTRADICTS'
              ? '#C10801'
              : '#F9F9F9';
          ctx.fillText(text, midX, midY);
        }

        ctx.restore();
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeRef.current?.id === node.id;
        const isDragged = draggedNodeRef.current?.id === node.id;
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

        let nodeColor = '#E85002';
        if (node.type === 'IDENTITY') nodeColor = '#E85002';
        else if (node.type === 'PERSON') nodeColor = '#F9F9F9';
        else if (node.type === 'ORGANIZATION') nodeColor = '#3B82F6';
        else if (node.type === 'DEVICE' || node.type === 'DEVICE_IDENTIFIER') nodeColor = '#06B6D4';
        else if (node.type === 'IP_ADDRESS') nodeColor = '#F59E0B';
        else if (node.type === 'TRANSACTION') nodeColor = '#8B5CF6';
        else if (node.type === 'WALLET_ADDRESS' || node.type === 'MAIL' || node.type === 'EMAIL') nodeColor = '#D946EF';
        else if (node.type === 'ACCOUNT') nodeColor = '#10B981';
        else if (node.type === 'LOCATION') nodeColor = '#64748B';
        else if (node.type === 'PHONE_NUMBER') nodeColor = '#EC4899';
        else if (node.type === 'USERNAME') nodeColor = '#EAB308';
        else if (node.type === 'DOCUMENT') nodeColor = '#94A3B8';

        // Selection / identity ring
        if (node.isIdentity || matchesSearch || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, 2 * Math.PI);
          ctx.strokeStyle = '#E85002';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Glow for hovered/dragged
        if (isHovered || isDragged) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, 2 * Math.PI);
          ctx.strokeStyle = `${nodeColor}66`;
          ctx.lineWidth = 6;
          ctx.stroke();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = isDimmed ? 'rgba(51, 51, 51, 0.4)' : nodeColor;
        ctx.fill();

        ctx.strokeStyle = isSelected
          ? '#E85002'
          : isHovered || isDragged
            ? '#F9F9F9'
            : '#333333';
        ctx.lineWidth = isSelected ? 3 : isHovered || isDragged ? 2 : 1.5;
        ctx.stroke();

        // Draw type icon/abbreviation inside node
        const abbr = NODE_ABBR[node.type] || node.type.charAt(0);
        if (node.radius >= 20) {
          ctx.font = `bold ${Math.max(10, node.radius * 0.55)}px system-ui, -apple-system, sans-serif`;
        } else {
          ctx.font = `bold ${Math.max(8, node.radius * 0.6)}px system-ui, -apple-system, sans-serif`;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dark text on light nodes, light text on dark nodes
        const isLightNode = ['PERSON', 'ACCOUNT', 'DOCUMENT', 'PHONE_NUMBER', 'USERNAME'].includes(node.type);
        ctx.fillStyle = isDimmed
          ? 'rgba(0,0,0,0.3)'
          : isLightNode
            ? '#111111'
            : '#000000';
        ctx.fillText(abbr, node.x, node.y + 1);

        // Label below node
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelText = node.label;
        const labelWidth = ctx.measureText(labelText).width;

        ctx.fillStyle = '#111111';
        const labelY = node.y + node.radius + 5;
        ctx.fillRect(node.x - labelWidth / 2 - 5, labelY, labelWidth + 10, 16);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(node.x - labelWidth / 2 - 5, labelY, labelWidth + 10, 16);

        ctx.fillStyle = isDimmed ? '#646464' : '#F9F9F9';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, node.x, labelY + 8);

        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, edges, isPhysicsRunning, selectedNodeId, selectedEdgeId, searchQuery, selectedTypeFilter]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { mouseX: 0, mouseY: 0, rawX: 0, rawY: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const mouseX = (x - transformRef.current.x) / transformRef.current.k;
    const mouseY = (y - transformRef.current.y) / transformRef.current.k;
    
    return { mouseX, mouseY, rawX: x, rawY: y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { mouseX, mouseY, rawX, rawY } = getMousePos(e);

    const clickedNode = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode) {
      clickedNode.dragTargetX = mouseX;
      clickedNode.dragTargetY = mouseY;
      clickedNode.vx = 0;
      clickedNode.vy = 0;
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

      const t = Math.max(0, Math.min(1, ((mouseX - sNode.x) * dx + (mouseY - sNode.y) * dy) / lengthSq));
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
    dragStartRef.current = { x: rawX, y: rawY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { mouseX, mouseY, rawX, rawY } = getMousePos(e);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.dragTargetX = mouseX;
      draggedNodeRef.current.dragTargetY = mouseY;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;

      // Force re-render so canvas updates node position
      setNodes((prev) => [...prev]);
      return;
    }

    if (isDraggingCanvasRef.current) {
      const dx = rawX - dragStartRef.current.x;
      const dy = rawY - dragStartRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragStartRef.current = { x: rawX, y: rawY };
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const hovered = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    hoveredNodeRef.current = hovered || null;
    canvas.style.cursor = hovered ? 'pointer' : (isDraggingCanvasRef.current ? 'grabbing' : 'grab');
  };

  const handleMouseUp = () => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.dragTargetX = undefined;
      draggedNodeRef.current.dragTargetY = undefined;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      draggedNodeRef.current = null;
    }
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

  return (
    <div className="relative w-full h-full bg-[#000000]">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Search & Filter */}
        <div className="flex items-center gap-2 pointer-events-auto p-1.5 rounded-2xl border shadow-md backdrop-blur-md bg-[#111111]/95 border-[#333333] text-[#F9F9F9]">
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
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#333333] bg-[#000000] text-xs outline-none focus:border-[#E85002] w-48 text-[#F9F9F9] placeholder-[#646464]"
            />
          </div>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#333333] bg-[#000000] text-xs font-mono outline-none focus:border-[#E85002] cursor-pointer text-[#F9F9F9]"
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
            <option value="PHONE_NUMBER">PHONE_NUMBER</option>
            <option value="USERNAME">USERNAME</option>
            <option value="DOCUMENT">DOCUMENT</option>
          </select>
        </div>

        {/* Right: Camera & Physics Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto p-2 rounded-2xl border shadow-md backdrop-blur-md bg-[#111111]/95 border-[#333333] text-[#F9F9F9]">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-[#F9F9F9] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <MagnifyingGlassPlus size={16} weight="bold" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-[#F9F9F9] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <MagnifyingGlassMinus size={16} weight="bold" />
          </button>
          <button
            onClick={() => { transformRef.current = { x: 0, y: 0, k: 1 }; }}
            className="p-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-[#F9F9F9] transition-colors cursor-pointer"
            title="Reset View"
          >
            <ArrowsOut size={16} weight="bold" />
          </button>
          <button
            onClick={() => setIsPhysicsRunning((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isPhysicsRunning
                ? 'bg-[#E85002] text-[#000000] font-bold shadow-[0_0_15px_rgba(232,80,2,0.3)] border border-[#E85002]'
                : 'bg-[#222222] text-[#A7A7A7] border border-[#333333]'
            }`}
            title={isPhysicsRunning ? 'Pause Force Layout' : 'Start Force Layout'}
          >
            {isPhysicsRunning ? <Pause size={16} weight="bold" /> : <Play size={16} weight="fill" />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1400}
        height={1000}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Bottom Status Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-xs font-mono">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-md backdrop-blur-md bg-[#111111]/95 border-[#333333] text-[#F9F9F9]">
          <span>
            Topology: <span className="font-bold text-[#E85002]">{nodes.length}</span> nodes,{' '}
            <span className="font-bold text-[#E85002]">{edges.length}</span> relationships
          </span>
          <span className="text-[#646464]">|</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isPhysicsRunning ? 'bg-[#E85002] animate-pulse' : 'bg-[#646464]'}`} />
            {isPhysicsRunning ? 'Physics On' : 'Physics Off'}
          </span>
        </div>

        <div className="px-4 py-2 rounded-2xl border shadow-md backdrop-blur-md bg-[#111111]/95 border-[#333333] text-[#A7A7A7]">
          Click node to inspect · Drag to move
        </div>
      </div>
    </div>
  );
}