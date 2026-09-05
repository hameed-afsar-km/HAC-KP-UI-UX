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
  orbitTier?: number;
  targetOrbitRadius?: number;
  dragTargetX?: number;
  dragTargetY?: number;
}

// Forensic Entity Palette
const ENTITY_CONFIG: Record<string, {
  primary: string;
  gradientStart: string;
  gradientEnd: string;
  glow: string;
  label: string;
}> = {
  IDENTITY: {
    primary: '#E85002',
    gradientStart: '#FF7A00',
    gradientEnd: '#B33800',
    glow: 'rgba(232, 80, 2, 0.45)',
    label: 'IDENTITY'
  },
  PERSON: {
    primary: '#0284C7',
    gradientStart: '#38BDF8',
    gradientEnd: '#0369A1',
    glow: 'rgba(2, 132, 199, 0.35)',
    label: 'PERSON'
  },
  ORGANIZATION: {
    primary: '#6366F1',
    gradientStart: '#818CF8',
    gradientEnd: '#4338CA',
    glow: 'rgba(99, 102, 241, 0.35)',
    label: 'ORGANIZATION'
  },
  DEVICE: {
    primary: '#8B5CF6',
    gradientStart: '#A78BFA',
    gradientEnd: '#6D28D9',
    glow: 'rgba(139, 92, 246, 0.35)',
    label: 'DEVICE'
  },
  DEVICE_IDENTIFIER: {
    primary: '#9333EA',
    gradientStart: '#C084FC',
    gradientEnd: '#7E22CE',
    glow: 'rgba(147, 51, 234, 0.35)',
    label: 'HARDWARE ID'
  },
  IP_ADDRESS: {
    primary: '#F59E0B',
    gradientStart: '#FBBF24',
    gradientEnd: '#B45309',
    glow: 'rgba(245, 158, 11, 0.35)',
    label: 'IP ADDRESS'
  },
  TRANSACTION: {
    primary: '#10B981',
    gradientStart: '#34D399',
    gradientEnd: '#047857',
    glow: 'rgba(16, 185, 129, 0.35)',
    label: 'TRANSACTION'
  },
  ACCOUNT: {
    primary: '#0D9488',
    gradientStart: '#2DD4BF',
    gradientEnd: '#0F766E',
    glow: 'rgba(13, 148, 136, 0.35)',
    label: 'ACCOUNT'
  },
  WALLET_ADDRESS: {
    primary: '#EC4899',
    gradientStart: '#F472B6',
    gradientEnd: '#BE185D',
    glow: 'rgba(236, 72, 153, 0.35)',
    label: 'WALLET'
  },
  LOCATION: {
    primary: '#EA580C',
    gradientStart: '#FB923C',
    gradientEnd: '#9A3412',
    glow: 'rgba(234, 88, 12, 0.35)',
    label: 'LOCATION'
  },
  PHONE_NUMBER: {
    primary: '#059669',
    gradientStart: '#10B981',
    gradientEnd: '#047857',
    glow: 'rgba(5, 150, 105, 0.35)',
    label: 'PHONE'
  },
  DOCUMENT: {
    primary: '#64748B',
    gradientStart: '#94A3B8',
    gradientEnd: '#334155',
    glow: 'rgba(100, 116, 139, 0.35)',
    label: 'DOCUMENT'
  },
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (type) {
    case 'IDENTITY': {
      const rOuter = size * 0.92;
      const rInner = size * 0.42;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 - Math.PI / 2;
        const r = i % 2 === 0 ? rOuter : rInner;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, size * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      break;
    }
    case 'PERSON': {
      ctx.beginPath();
      ctx.arc(x, y - size * 0.3, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y + size * 0.7, size * 0.62, Math.PI + 0.35, -0.35);
      ctx.fill();
      break;
    }
    case 'ORGANIZATION': {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.8, y - size * 0.22);
      ctx.lineTo(x, y - size * 0.85);
      ctx.lineTo(x + size * 0.8, y - size * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x - size * 0.8, y + size * 0.55, size * 1.6, size * 0.25);
      const pw = size * 0.22;
      const ph = size * 0.65;
      ctx.fillRect(x - size * 0.65, y - size * 0.15, pw, ph);
      ctx.fillRect(x - pw / 2, y - size * 0.15, pw, ph);
      ctx.fillRect(x + size * 0.65 - pw, y - size * 0.15, pw, ph);
      break;
    }
    case 'DEVICE': {
      const w = size * 0.9;
      const h = size * 1.45;
      drawRoundedRect(ctx, x - w / 2, y - h / 2, w, h, size * 0.22);
      ctx.stroke();
      drawRoundedRect(ctx, x - w / 2 + 2, y - h / 2 + 4, w - 4, h - 8, size * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y + h / 2 - 2, 1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'DEVICE_IDENTIFIER': {
      const w = size * 1.15;
      const h = size * 1.35;
      const cut = size * 0.38;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x + w / 2 - cut, y - h / 2);
      ctx.lineTo(x + w / 2, y - h / 2 + cut);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.lineTo(x - w / 2, y + h / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(x - w * 0.28, y - h * 0.2, w * 0.56, h * 0.45);
      ctx.beginPath();
      ctx.moveTo(x, y - h * 0.2);
      ctx.lineTo(x, y + h * 0.25);
      ctx.moveTo(x - w * 0.28, y);
      ctx.lineTo(x + w * 0.28, y);
      ctx.stroke();
      break;
    }
    case 'IP_ADDRESS': {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - size * 0.78, y);
      ctx.lineTo(x + size * 0.78, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.38, size * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'TRANSACTION': {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.72, 0.4, Math.PI - 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, size * 0.72, Math.PI + 0.4, 2 * Math.PI - 0.4);
      ctx.stroke();
      ctx.font = `bold ${Math.round(size * 0.95)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', x, y + 0.5);
      break;
    }
    case 'ACCOUNT': {
      const w = size * 1.4;
      const h = size * 0.95;
      drawRoundedRect(ctx, x - w / 2, y - h / 2, w, h, 2.5);
      ctx.stroke();
      ctx.fillRect(x - w / 2, y - h / 2 + 2, w, h * 0.25);
      ctx.strokeRect(x - w / 2 + 2.5, y, w * 0.28, h * 0.28);
      break;
    }
    case 'WALLET_ADDRESS': {
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.85);
      ctx.lineTo(x + size * 0.65, y - size * 0.05);
      ctx.lineTo(x, y + size * 0.35);
      ctx.lineTo(x - size * 0.65, y - size * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.48);
      ctx.lineTo(x + size * 0.65, y + size * 0.1);
      ctx.lineTo(x, y + size * 0.9);
      ctx.lineTo(x - size * 0.65, y + size * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'LOCATION': {
      ctx.beginPath();
      ctx.arc(x, y - size * 0.25, size * 0.52, Math.PI, 0);
      ctx.lineTo(x, y + size * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y - size * 0.25, size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      break;
    }
    case 'PHONE_NUMBER': {
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.55, -0.8, 1.8);
      ctx.stroke();
      ctx.fillRect(x + size * 0.1, y - size * 0.65, size * 0.35, size * 0.35);
      ctx.fillRect(x - size * 0.65, y + size * 0.1, size * 0.35, size * 0.35);
      break;
    }
    case 'DOCUMENT': {
      const w = size * 1.1;
      const h = size * 1.4;
      const fold = size * 0.35;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x + w / 2 - fold, y - h / 2);
      ctx.lineTo(x + w / 2, y - h / 2 + fold);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.lineTo(x - w / 2, y + h / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - fold, y - h / 2);
      ctx.lineTo(x + w / 2 - fold, y - h / 2 + fold);
      ctx.lineTo(x + w / 2, y - h / 2 + fold);
      ctx.stroke();
      ctx.fillRect(x - w * 0.3, y - h * 0.1, w * 0.5, 1.5);
      ctx.fillRect(x - w * 0.3, y + h * 0.1, w * 0.6, 1.5);
      ctx.fillRect(x - w * 0.3, y + h * 0.25, w * 0.4, 1.5);
      break;
    }
    default: {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Clean Concentric Radar Layout Calculator
function calculateConcentricLayout(
  rawNodes: GraphNode[],
  rawEdges: GraphEdge[],
  width: number,
  height: number
): SimulatedNode[] {
  if (!rawNodes || rawNodes.length === 0) return [];
  const centerX = width / 2;
  const centerY = height / 2;

  const identityNode = rawNodes.find((n) => n.isIdentity || n.type === 'IDENTITY');
  const otherNodes = rawNodes.filter((n) => n.id !== identityNode?.id);

  const minDim = Math.min(width, height);
  const r1 = Math.max(140, Math.min(190, minDim * 0.25));
  const r2 = Math.max(250, Math.min(320, minDim * 0.42));

  let ring1Nodes: GraphNode[] = [];
  let ring2Nodes: GraphNode[] = [];

  if (otherNodes.length <= 7) {
    ring1Nodes = otherNodes;
    ring2Nodes = [];
  } else {
    const directRelations = new Set<string>();
    if (identityNode) {
      rawEdges.forEach((e) => {
        if (e.source === identityNode.id) directRelations.add(e.target);
        if (e.target === identityNode.id) directRelations.add(e.source);
      });
    }

    // High-priority core suspect resolution attributes
    const tier1Types = new Set([
      'PERSON',
      'DEVICE_IDENTIFIER',
      'IP_ADDRESS',
      'PHONE_NUMBER',
      'WALLET_ADDRESS',
      'USERNAME'
    ]);

    otherNodes.forEach((n) => {
      const isDirect = directRelations.has(n.id);
      if ((isDirect || tier1Types.has(n.type)) && ring1Nodes.length < 6) {
        ring1Nodes.push(n);
      } else {
        ring2Nodes.push(n);
      }
    });

    while (ring1Nodes.length < Math.min(5, otherNodes.length) && ring2Nodes.length > 0) {
      ring1Nodes.push(ring2Nodes.shift()!);
    }
  }

  const result: SimulatedNode[] = [];

  // Anchor Identity Target at center
  if (identityNode) {
    result.push({
      ...identityNode,
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      radius: 36,
      orbitTier: 0,
      targetOrbitRadius: 0
    });
  }

  // Ring 1 (Inner Orbit) nodes
  const n1 = ring1Nodes.length;
  ring1Nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / (n1 || 1) - Math.PI / 2;
    result.push({
      ...node,
      x: centerX + Math.cos(angle) * r1,
      y: centerY + Math.sin(angle) * r1,
      vx: 0,
      vy: 0,
      radius: 28,
      orbitTier: 1,
      targetOrbitRadius: r1
    });
  });

  // Ring 2 (Outer Orbit) nodes
  const n2 = ring2Nodes.length;
  ring2Nodes.forEach((node, i) => {
    const offset = n1 > 0 ? Math.PI / (n1 || 1) : 0;
    const angle = (2 * Math.PI * i) / (n2 || 1) - Math.PI / 2 + offset;
    result.push({
      ...node,
      x: centerX + Math.cos(angle) * r2,
      y: centerY + Math.sin(angle) * r2,
      vx: 0,
      vy: 0,
      radius: 28,
      orbitTier: 2,
      targetOrbitRadius: r2
    });
  });

  return result;
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

  const [nodes, setNodes] = useState<SimulatedNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [isPhysicsRunning, setIsPhysicsRunning] = useState(false);
  const [isReconstructing, setIsReconstructing] = useState(false);

  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimulatedNode | null>(null);
  const hoveredNodeRef = useRef<SimulatedNode | null>(null);
  // Progressive graph reconstruction animation state (1 = identity reveal .. nodes.length = fully built)
  const revealRef = useRef<number>(Number.POSITIVE_INFINITY);
  const edgeRevealProgressRef = useRef<Record<string, number>>({});
  const isReconstructingRef = useRef(false);
  // Target layout for smooth node rearrangement when nodes are enabled/disabled
  const targetNodesRef = useRef<SimulatedNode[] | null>(null);
  const isAnimatingLayoutRef = useRef(false);

  // Synchronize canvas buffer resolution with actual parent container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const handleResize = () => {
      const rect = parent.getBoundingClientRect();
      const w = Math.round(rect.width || parent.clientWidth || 1000);
      const h = Math.round(rect.height || parent.clientHeight || 700);
      if (w > 0 && h > 0) {
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        setDimensions((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
      }
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Reconstruct graph nodes into concentric circles whenever data or dimensions change
  useEffect(() => {
    if (!data.nodes) return;

    const canvas = canvasRef.current;
    const w = dimensions.width || canvas?.width || 1000;
    const h = dimensions.height || canvas?.height || 700;

    setNodes((currentNodes) => {
      // Compute target layout
      const target = calculateConcentricLayout(data.nodes, data.edges, w, h);

      // Preserve current state of nodes still present; animate toward target positions
      const currentMap = new Map(currentNodes.map((n) => [n.id, n]));
      const animated = target.map((tn) => {
        const cur = currentMap.get(tn.id);
        if (!cur) return tn;
        return {
          ...tn,
          x: cur.x,
          y: cur.y,
          vx: 0,
          vy: 0,
        };
      });

      targetNodesRef.current = target;
      isAnimatingLayoutRef.current = true;
      return animated;
    });

    setEdges(data.edges);
    revealRef.current = Number.POSITIVE_INFINITY;
    isReconstructingRef.current = false;
    setIsReconstructing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dimensions]);

  const handleResetLayout = () => {
    transformRef.current = { x: 0, y: 0, k: 1 };
    const canvas = canvasRef.current;
    const w = dimensions.width || canvas?.width || 1000;
    const h = dimensions.height || canvas?.height || 700;
    const newSimNodes = calculateConcentricLayout(data.nodes, data.edges, w, h);
    setNodes(newSimNodes);
    setIsPhysicsRunning(false);
    revealRef.current = Number.POSITIVE_INFINITY;
    edgeRevealProgressRef.current = {};
    isReconstructingRef.current = false;
    setIsReconstructing(false);
  };

  const startReconstruction = () => {
    setIsPhysicsRunning(false);
    // Reset camera and start the reveal from the identity/center node only
    transformRef.current = { x: 0, y: 0, k: 1 };
    revealRef.current = 1;
    edgeRevealProgressRef.current = {};
    isReconstructingRef.current = true;
    setIsReconstructing(true);
  };

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

      ctx.fillStyle = isDark ? '#000000' : '#F6F7FB';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.fillStyle = isDark ? '#222222' : '#E2E6F0';
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

      // Draw subtle Concentric Orbit Guide Rings (Tactical Radar Canvas)
      const centerX = width / 2;
      const centerY = height / 2;
      const minDim = Math.min(width, height);
      const r1 = Math.max(140, Math.min(190, minDim * 0.25));
      const r2 = Math.max(250, Math.min(320, minDim * 0.42));

      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(13, 15, 20, 0.12)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - r2 - 30, centerY);
      ctx.lineTo(centerX + r2 + 30, centerY);
      ctx.moveTo(centerX, centerY - r2 - 30);
      ctx.lineTo(centerX, centerY + r2 + 30);
      ctx.stroke();

      // Concentric rings matching calculated orbit tiers
      const hasTier2 = nodes.some((n) => n.orbitTier === 2);
      const activeOrbits = hasTier2 ? [r1, r2] : [r1];
      activeOrbits.forEach((orbitR, idx) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbitR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.font = 'bold 8.5px monospace';
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(13, 15, 20, 0.45)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
          idx === 0 ? 'ORBIT 01 // DIRECT RESOLUTION' : 'ORBIT 02 // PERIPHERAL LINKAGE',
          centerX + 12,
          centerY - orbitR + 13
        );
        ctx.restore();
      });
      ctx.restore();

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

      // Smooth rearrangement: lerp existing nodes toward their target layout positions
      if (isAnimatingLayoutRef.current && targetNodesRef.current) {
        const targetMap = new Map(targetNodesRef.current.map((tn) => [tn.id, tn]));
        let allSettled = true;
        nodes.forEach((n) => {
          const target = targetMap.get(n.id);
          if (!target) return;
          const dx = target.x - n.x;
          const dy = target.y - n.y;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            allSettled = false;
            n.x += dx * 0.12;
            n.y += dy * 0.12;
            n.vx = 0;
            n.vy = 0;
          } else {
            n.x = target.x;
            n.y = target.y;
          }
        });
        if (allSettled) {
          isAnimatingLayoutRef.current = false;
          targetNodesRef.current = null;
        }
      }

      // Physics Simulation Step
      if (isPhysicsRunning) {
        // Keep central Identity node anchored
        const identityNode = nodes.find((n) => n.isIdentity || n.type === 'IDENTITY');
        if (identityNode && identityNode.id !== draggedNodeRef.current?.id) {
          identityNode.x = centerX;
          identityNode.y = centerY;
          identityNode.vx = 0;
          identityNode.vy = 0;
        }

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = n1.radius + n2.radius + 60;

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
            const targetDist = edge.relationshipName === 'RESOLVED_TO' ? 180 : 250;
            const force = (dist - targetDist) * 0.003;
            sNode.vx += dx * force;
            sNode.vy += dy * force;
            tNode.vx -= dx * force;
            tNode.vy -= dy * force;
          }
        });

        nodes.forEach((n) => {
          if (n.id === draggedNodeRef.current?.id) return;
          if (n.isIdentity || n.type === 'IDENTITY') return;

          // Radial circular orbit attraction matching designated orbit radius
          const dx = n.x - centerX;
          const dy = n.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetOrbit = n.targetOrbitRadius || (n.orbitTier === 2 ? r2 : r1);
          const radialForce = (dist - targetOrbit) * 0.0018;
          n.vx -= (dx / dist) * radialForce;
          n.vy -= (dy / dist) * radialForce;

          n.vx *= 0.85;
          n.vy *= 0.85;
          n.x += n.vx;
          n.y += n.vy;
        });
      }

      // Advance progressive reconstruction: reveal one node at a time with smooth links
      if (isReconstructingRef.current) {
        revealRef.current = Math.min(nodes.length, revealRef.current + 0.04);
        if (revealRef.current >= nodes.length) {
          isReconstructingRef.current = false;
          setIsReconstructing(false);
        }
      }

      // Advance per-edge draw progress: each edge draws from source to target
      // once its source endpoint has been revealed, at 0.08 progress per frame
      const edgeProgress = edgeRevealProgressRef.current;
      edges.forEach((edge) => {
        const sIdx = nodes.findIndex((n) => n.id === edge.source);
        const tIdx = nodes.findIndex((n) => n.id === edge.target);
        const sRevealed = sIdx !== -1 && sIdx < revealRef.current;
        const tRevealed = tIdx !== -1 && tIdx < revealRef.current;
        const current = edgeProgress[edge.id] || 0;
        if (sRevealed && tRevealed) {
          if (current < 1) {
            edgeProgress[edge.id] = Math.min(1, current + 0.08);
          }
        } else if (current > 0 && !sRevealed) {
          edgeProgress[edge.id] = Math.max(0, current - 0.2);
        }
      });

      // Nodes/edges currently visible under the progressive reveal threshold
      const revealThreshold = revealRef.current;
      const revealedIds = new Set<string>();
      nodes.forEach((n, i) => {
        if (i < revealThreshold) revealedIds.add(n.id);
      });

      const activeHoverId = hoveredNodeRef.current?.id;
      const activeSelectedId = selectedNodeId;

      // Draw Edges
      edges.forEach((edge) => {
        if (!revealedIds.has(edge.source) || !revealedIds.has(edge.target)) return;
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

        // Progressive draw: portion of the edge visible from source toward target
        const edgeProg = edgeRevealProgressRef.current[edge.id] ?? 1;
        if (edgeProg <= 0) return;
        const easedProg = edgeProg < 1 ? 1 - Math.pow(1 - edgeProg, 2) : 1;

        const drawX = sNode.x + (tNode.x - sNode.x) * easedProg;
        const drawY = sNode.y + (tNode.y - sNode.y) * easedProg;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(drawX, drawY);

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
            ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')
            : (isConnectedToHover || isConnectedToSelected || isSelected)
              ? '#E85002'
              : (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)');
          ctx.lineWidth = isSelected || isConnectedToHover ? 2.5 : 1.5;
          ctx.setLineDash([]);
        }

        ctx.stroke();

        const angle = Math.atan2(tNode.y - sNode.y, tNode.x - sNode.x);
        const arrowDist = tNode.radius + 12;
        const arrowX = drawX - Math.cos(angle) * arrowDist;
        const arrowY = drawY - Math.sin(angle) * arrowDist;

        // Only draw the arrow once the edge has mostly drawn
        if (easedProg >= 0.9) {
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
        }

        const midX = (sNode.x + drawX) / 2;
        const midY = (sNode.y + drawY) / 2;
        const edgeLength = Math.sqrt((tNode.x - sNode.x) ** 2 + (tNode.y - sNode.y) ** 2);

        // Hide edge labels if edge is very short unless active, to prevent crowding
        const shouldShowLabel =
          (!isDimmed && edgeLength >= 75) || isConnectedToHover || isConnectedToSelected || isSelected;

        if (shouldShowLabel) {
          ctx.font = 'bold 9px monospace';
          const text = edge.label || edge.relationshipName;
          const textWidth = ctx.measureText(text).width;

          ctx.fillStyle = isDark ? '#111111' : '#FFFFFF';
          ctx.fillRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);
          ctx.strokeStyle = isDark ? '#333333' : '#E2E6F0';
          ctx.lineWidth = 1;
          ctx.strokeRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = edge.relationshipName === 'RESOLVED_TO'
            ? '#E85002'
            : edge.relationshipName === 'CONTRADICTS'
              ? '#C10801'
              : isDark ? '#F9F9F9' : '#0D0F14';
          ctx.fillText(text, midX, midY);
        }
        ctx.restore();
      });


      // Draw Nodes
      nodes.forEach((node, nodeIndex) => {
        if (nodeIndex >= revealThreshold) return;
        if (
          !Number.isFinite(node.x) ||
          !Number.isFinite(node.y) ||
          !Number.isFinite(node.radius) ||
          node.radius <= 0
        ) {
          return;
        }
        // Smooth fade-in for the most recently revealed node during reconstruction
        const revealFade = nodeIndex === Math.floor(revealThreshold)
          ? revealThreshold - Math.floor(revealThreshold)
          : 1;
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeRef.current?.id === node.id;
        const isDragged = draggedNodeRef.current?.id === node.id;
        const isSearching = searchQuery.trim() !== '';
        const matchesSearch =
          isSearching &&
          node.label.toLowerCase().includes(searchQuery.trim().toLowerCase());
        const matchesType =
          selectedTypeFilter === 'ALL' || node.type === selectedTypeFilter;

        const isDimmed =
          (isSearching && !matchesSearch) ||
          (selectedTypeFilter !== 'ALL' && !matchesType) ||
          (activeHoverId &&
            activeHoverId !== node.id &&
            !edges.some(
              (e) =>
                (e.source === activeHoverId && e.target === node.id) ||
                (e.target === activeHoverId && e.source === node.id)
            ));

        const conf = ENTITY_CONFIG[node.type] || {
          primary: '#E85002',
          gradientStart: '#FF7A00',
          gradientEnd: '#C10801',
          glow: 'rgba(232, 80, 2, 0.45)',
          label: node.type
        };

        ctx.save();
        if (isDimmed) {
          ctx.globalAlpha = (isDark ? 0.22 : 0.28) * revealFade;
        } else if (revealFade < 1) {
          ctx.globalAlpha = revealFade;
        }

        const orbRadius = node.radius;

        // 1. Ambient Threat / Selection Glow
        if (isSelected || isHovered || node.isIdentity || matchesSearch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, orbRadius + (isSelected ? 14 : 8), 0, Math.PI * 2);
          ctx.fillStyle = isSelected
            ? 'rgba(232, 80, 2, 0.35)'
            : node.isIdentity
              ? 'rgba(232, 80, 2, 0.28)'
              : conf.glow;
          ctx.fill();
        }

        // Search match highlight ring
        if (matchesSearch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, orbRadius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = '#E85002';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 2. Selection Reticle (Tactical Targeting Corner Brackets)
        if (isSelected) {
          const reticleDist = orbRadius + 9;
          const bLen = 7;
          ctx.save();
          ctx.strokeStyle = '#E85002';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';

          // Top-Left
          ctx.beginPath();
          ctx.moveTo(node.x - reticleDist, node.y - reticleDist + bLen);
          ctx.lineTo(node.x - reticleDist, node.y - reticleDist);
          ctx.lineTo(node.x - reticleDist + bLen, node.y - reticleDist);
          ctx.stroke();

          // Top-Right
          ctx.beginPath();
          ctx.moveTo(node.x + reticleDist - bLen, node.y - reticleDist);
          ctx.lineTo(node.x + reticleDist, node.y - reticleDist);
          ctx.lineTo(node.x + reticleDist, node.y - reticleDist + bLen);
          ctx.stroke();

          // Bottom-Left
          ctx.beginPath();
          ctx.moveTo(node.x - reticleDist, node.y + reticleDist - bLen);
          ctx.lineTo(node.x - reticleDist, node.y + reticleDist);
          ctx.lineTo(node.x - reticleDist + bLen, node.y + reticleDist);
          ctx.stroke();

          // Bottom-Right
          ctx.beginPath();
          ctx.moveTo(node.x + reticleDist - bLen, node.y + reticleDist);
          ctx.lineTo(node.x + reticleDist, node.y + reticleDist);
          ctx.lineTo(node.x + reticleDist, node.y + reticleDist - bLen);
          ctx.stroke();

          ctx.restore();
        }

        // 3. Confidence Progress Track & Ring
        const confidenceValue = node.confidence || 0.95;
        const trackRadius = orbRadius + 3.5;

        // Base Track
        ctx.beginPath();
        ctx.arc(node.x, node.y, trackRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Active Confidence Arc
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * Math.min(1, confidenceValue));
        ctx.beginPath();
        ctx.arc(node.x, node.y, trackRadius, startAngle, endAngle);
        ctx.strokeStyle = node.isIdentity ? '#E85002' : conf.primary;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 4. Dimensional Orb Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, orbRadius, 0, Math.PI * 2);
        
        const grad = ctx.createRadialGradient(
          node.x - orbRadius * 0.35,
          node.y - orbRadius * 0.35,
          orbRadius * 0.1,
          node.x,
          node.y,
          orbRadius
        );

        if (isDark) {
          grad.addColorStop(0, '#1E2536');
          grad.addColorStop(0.6, '#121622');
          grad.addColorStop(1, '#090B10');
        } else {
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.7, '#F4F6FB');
          grad.addColorStop(1, '#E5E9F2');
        }
        ctx.fillStyle = grad;
        ctx.fill();

        // Orb Rim Stroke
        ctx.strokeStyle = isSelected
          ? '#E85002'
          : isHovered
            ? conf.primary
            : (isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)');
        ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1.5;
        ctx.stroke();

        // 5. Central Emblem Backing
        const emblemR = orbRadius * 0.62;
        ctx.beginPath();
        ctx.arc(node.x, node.y, emblemR, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
        ctx.fill();
        ctx.strokeStyle = `${conf.primary}44`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 6. Crisp Precision Vector Glyph
        const glyphSize = orbRadius * 0.58;
        drawGlyph(ctx, node.type, node.x, node.y, glyphSize, conf.primary);

        // 7. Upper-Right Threat / Cluster Pill Badge
        if (node.isIdentity || node.attributes?.risk_level === 'CRITICAL') {
          const badgeText = node.isIdentity ? '★ TARGET' : 'CRITICAL';
          ctx.font = '800 8px monospace';
          const bTextW = ctx.measureText(badgeText).width;
          const badgeW = bTextW + 8;
          const badgeH = 14;
          const badgeX = node.x + orbRadius * 0.45;
          const badgeY = node.y - orbRadius * 0.95;

          ctx.fillStyle = '#E85002';
          drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 4);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2 + 0.5);
        }

        // 8. Streamlined Circular Pill Label
        const labelText = node.label;
        ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const labelWidth = ctx.measureText(labelText).width;

        const pillHeight = 20;
        const pillWidth = Math.max(labelWidth + 22, 64);
        const pillX = node.x - pillWidth / 2;
        const pillY = node.y + orbRadius + 6;

        // Pill Background & Subtle Shadow
        if (!isDimmed) {
          ctx.save();
          ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.06)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = isDark ? '#0C0E14' : '#FFFFFF';
          drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 10);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = isDark ? '#0C0E14' : '#FFFFFF';
          drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 10);
          ctx.fill();
        }

        // Pill Border
        ctx.strokeStyle = isSelected
          ? '#E85002'
          : isHovered
            ? conf.primary
            : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)');
        ctx.lineWidth = isSelected ? 1.8 : 1;
        drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 10);
        ctx.stroke();

        // Small Status Dot on Left
        ctx.beginPath();
        ctx.arc(pillX + 8, pillY + pillHeight / 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = conf.primary;
        ctx.fill();

        // Crisp Centered Label Text
        ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDimmed
          ? (isDark ? '#646464' : '#8B95AD')
          : (isDark ? '#F9F9F9' : '#0D0F14');
        ctx.fillText(labelText, node.x + 3, pillY + pillHeight / 2 + 0.5);

        ctx.restore();
      });

      if (nodes.length === 0) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = isDark ? '#646464' : '#8B95AD';
        ctx.fillText('NO ENTITIES ACTIVE // SELECT ENTITIES IN BUILDER OR CLICK [RESET]', centerX, centerY);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, edges, isPhysicsRunning, selectedNodeId, selectedEdgeId, searchQuery, selectedTypeFilter, isDark, theme]);

  // Auto-center the first search match so results are visible
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = nodes.find((n) => n.label.toLowerCase().includes(query));
    if (!match || !Number.isFinite(match.x) || !Number.isFinite(match.y)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;

    transformRef.current.x = width / 2 - match.x * transformRef.current.k;
    transformRef.current.y = height / 2 - match.y * transformRef.current.k;
  }, [searchQuery, nodes]);

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

    // Hit test on both the circular node orb AND the label card
    const clickedNode = nodes.find((n) => {
      // 1. Check circular orb hit
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 6) return true;

      // 2. Check label pill hit
      const pillWidth = Math.max(n.label.length * 6.5 + 22, 64);
      const pillHeight = 22;
      const pillX = n.x - pillWidth / 2;
      const pillY = n.y + n.radius + 4;
      return (
        mouseX >= pillX &&
        mouseX <= pillX + pillWidth &&
        mouseY >= pillY &&
        mouseY <= pillY + pillHeight
      );
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
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 6) return true;

      // 2. Check label pill hit
      const pillWidth = Math.max(n.label.length * 6.5 + 22, 64);
      const pillHeight = 22;
      const pillX = n.x - pillWidth / 2;
      const pillY = n.y + n.radius + 4;
      return (
        mouseX >= pillX &&
        mouseX <= pillX + pillWidth &&
        mouseY >= pillY &&
        mouseY <= pillY + pillHeight
      );
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

  const handleMouseLeave = () => {
    handleMouseUp();
    hoveredNodeRef.current = null;
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
    <div className="relative w-full h-full bg-[#F6F7FB] dark:bg-[#000000]">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Search & Filter */}
        <div className="flex items-center gap-2 pointer-events-auto p-1.5 rounded-2xl border shadow-sm dark:shadow-md backdrop-blur-md bg-white/95 dark:bg-[#111111]/95 border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9]">
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
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] text-xs outline-none focus:border-[#E85002] w-48 text-[#0D0F14] dark:text-[#F9F9F9] placeholder-[#8B95AD] dark:placeholder-[#646464]"
            />
          </div>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E6F0] dark:border-[#333333] bg-[#F6F7FB] dark:bg-[#000000] text-xs font-mono outline-none focus:border-[#E85002] cursor-pointer text-[#0D0F14] dark:text-[#F9F9F9]"
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
        <div className="flex items-center gap-1.5 pointer-events-auto p-2 rounded-2xl border shadow-sm dark:shadow-md backdrop-blur-md bg-white/95 dark:bg-[#111111]/95 border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9]">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#E2E6F0] dark:bg-[#222222] dark:hover:bg-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <MagnifyingGlassPlus size={16} weight="bold" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#E2E6F0] dark:bg-[#222222] dark:hover:bg-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <MagnifyingGlassMinus size={16} weight="bold" />
          </button>
          <button
            onClick={handleResetLayout}
            className="p-2 rounded-xl bg-[#F0F0F0] hover:bg-[#E2E6F0] dark:bg-[#222222] dark:hover:bg-[#333333] text-[#0D0F14] dark:text-[#F9F9F9] transition-colors cursor-pointer"
            title="Reset View & Reconstruct Layout"
          >
            <ArrowsOut size={16} weight="bold" />
          </button>
          <button
            onClick={startReconstruction}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isReconstructing
                ? 'bg-[#E85002] text-[#000000] font-bold shadow-[0_0_15px_rgba(232,80,2,0.3)] border border-[#E85002]'
                : 'bg-[#F0F0F0] hover:bg-[#E2E6F0] text-[#0D0F14] border border-[#E2E6F0] dark:bg-[#222222] dark:text-[#A7A7A7] dark:border-[#333333]'
            }`}
            title={isReconstructing ? 'Reconstructing graph...' : 'Play: reconstruct graph node by node'}
          >
            {isReconstructing ? <Pause size={16} weight="bold" /> : <Play size={16} weight="fill" />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Bottom Status Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-xs font-mono">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm dark:shadow-md backdrop-blur-md bg-white/95 dark:bg-[#111111]/95 border-[#E2E6F0] dark:border-[#333333] text-[#0D0F14] dark:text-[#F9F9F9]">
          <span>
            Topology: <span className="font-bold text-[#E85002]">{nodes.length}</span> nodes,{' '}
            <span className="font-bold text-[#E85002]">{edges.length}</span> relationships
          </span>
          <span className="text-[#8B95AD] dark:text-[#646464]">|</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isPhysicsRunning ? 'bg-[#E85002] animate-pulse' : 'bg-[#8B95AD] dark:bg-[#646464]'}`} />
            {isPhysicsRunning ? 'Physics On' : 'Physics Off'}
          </span>
        </div>

        <div className="px-4 py-2 rounded-2xl border shadow-sm dark:shadow-md backdrop-blur-md bg-white/95 dark:bg-[#111111]/95 border-[#E2E6F0] dark:border-[#333333] text-[#8B95AD] dark:text-[#A7A7A7]">
          Click node to inspect · Drag to move
        </div>
      </div>
    </div>
  );
}