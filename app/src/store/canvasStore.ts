import { create } from 'zustand';
import type {
  CanvasNode,
  CanvasEdge,
  CanvasViewport,
  Point,
  C2ChannelMessage,
} from '@arcora/shared';
import { webGpuLayoutEngine } from '@/modules/canvas/webgpu/webgpuLayoutEngine';

export interface CanvasStore {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: CanvasViewport;
  selectedNodeIds: string[];
  activeTool: 'select' | 'pan' | 'wire';
  isLayoutRunning: boolean;
  activeWireSource: { nodeId: string; portId?: string } | null;

  // Viewport operations
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (factor: number, center: Point) => void;
  resetViewport: () => void;

  // Node operations
  addNode: (node: Omit<CanvasNode, 'id'> & { id?: string }) => string;
  updateNodePosition: (id: string, position: Point) => void;
  updateNodeData: (id: string, data: Partial<CanvasNode['data']>) => void;
  removeNode: (id: string) => void;

  // Edge & Wire operations
  addEdge: (edge: Omit<CanvasEdge, 'id'>) => void;
  removeEdge: (id: string) => void;
  setActiveWireSource: (source: { nodeId: string; portId?: string } | null) => void;

  // Selection & Tools
  selectNode: (id: string, isMulti?: boolean) => void;
  clearSelection: () => void;
  setActiveTool: (tool: 'select' | 'pan' | 'wire') => void;

  // WebGPU Physics Simulation
  runGpuForceLayout: () => Promise<void>;

  // Jetro C2 Inter-Frame Reactive Messaging
  sendC2: <T = unknown>(channel: string, payload: T, senderId: string) => void;
  subscribeC2: (channel: string, callback: (msg: C2ChannelMessage) => void) => () => void;
}

const c2Listeners = new Map<string, Set<(msg: C2ChannelMessage) => void>>();

const INITIAL_NODES: CanvasNode[] = [
  {
    id: 'node-doc-vault',
    position: { x: 100, y: 150 },
    size: { width: 340, height: 260 },
    data: {
      title: 'Smart Document Pipeline',
      subtitle: 'ModernBERT ONNX + Tesseract OCR',
      type: 'document-frame',
      outputs: [{ id: 'out-docs', name: 'extracted-entities', type: 'output', channel: 'document_feed' }],
      status: 'synced',
    },
  },
  {
    id: 'node-kpi-bills',
    position: { x: 550, y: 80 },
    size: { width: 320, height: 220 },
    data: {
      title: 'Monthly Cash Flow Blotter',
      subtitle: 'Active Utility & Recurring Liabilities',
      type: 'financial-blotter',
      inputs: [{ id: 'in-bills', name: 'raw-docs', type: 'input', channel: 'document_feed' }],
      outputs: [{ id: 'out-expenses', name: 'cashflow-delta', type: 'output', channel: 'financial_metrics' }],
      status: 'synced',
    },
  },
  {
    id: 'node-analytics-chart',
    position: { x: 960, y: 140 },
    size: { width: 380, height: 280 },
    data: {
      title: 'Expense Forecast & Horizon',
      subtitle: 'Predictive 90-day cashflow runway',
      type: 'chart-analytics',
      inputs: [{ id: 'in-metrics', name: 'stream-data', type: 'input', channel: 'financial_metrics' }],
      status: 'idle',
    },
  },
  {
    id: 'node-ai-copilot',
    position: { x: 420, y: 450 },
    size: { width: 440, height: 260 },
    data: {
      title: 'Multi-LLM Sovereign Copilot',
      subtitle: 'Gemini 2.0 Flash + OpenAI Orchestration',
      type: 'ai-chat',
      inputs: [{ id: 'in-chat-ctx', name: 'active-context', type: 'input', channel: 'document_feed' }],
      status: 'synced',
    },
  },
];

const INITIAL_EDGES: CanvasEdge[] = [
  {
    id: 'edge-1',
    sourceNodeId: 'node-doc-vault',
    sourcePortId: 'out-docs',
    targetNodeId: 'node-kpi-bills',
    targetPortId: 'in-bills',
    channel: 'document_feed',
    animated: true,
    label: 'Extracted Invoices',
  },
  {
    id: 'edge-2',
    sourceNodeId: 'node-kpi-bills',
    sourcePortId: 'out-expenses',
    targetNodeId: 'node-analytics-chart',
    targetPortId: 'in-metrics',
    channel: 'financial_metrics',
    animated: true,
    label: 'Reconciled Ledger',
  },
];

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeIds: [],
  activeTool: 'select',
  isLayoutRunning: false,
  activeWireSource: null,

  setViewport: (nextViewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...nextViewport },
    })),

  panBy: (dx, dy) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        x: state.viewport.x + dx,
        y: state.viewport.y + dy,
      },
    })),

  zoomAt: (factor, center) =>
    set((state) => {
      const currentZoom = state.viewport.zoom;
      const targetZoom = Math.min(Math.max(currentZoom * factor, 0.2), 3.0);
      const ratio = targetZoom / currentZoom;
      const newX = center.x - (center.x - state.viewport.x) * ratio;
      const newY = center.y - (center.y - state.viewport.y) * ratio;

      return {
        viewport: { x: newX, y: newY, zoom: targetZoom },
      };
    }),

  resetViewport: () =>
    set({
      viewport: { x: 0, y: 0, zoom: 1 },
    }),

  addNode: (nodeData) => {
    const id = nodeData.id || `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullNode: CanvasNode = {
      ...nodeData,
      id,
    };
    set((state) => ({
      nodes: [...state.nodes, fullNode],
    }));
    return id;
  },

  updateNodePosition: (id, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, position } : node,
      ),
    })),

  updateNodeData: (id, partialData) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...partialData } }
          : node,
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.sourceNodeId !== id && e.targetNodeId !== id),
      selectedNodeIds: state.selectedNodeIds.filter((selId) => selId !== id),
    })),

  addEdge: (edgeData) => {
    const id = `edge-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      edges: [...state.edges, { ...edgeData, id }],
    }));
  },

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

  setActiveWireSource: (source) =>
    set({ activeWireSource: source }),

  selectNode: (id, isMulti = false) =>
    set((state) => ({
      selectedNodeIds: isMulti
        ? state.selectedNodeIds.includes(id)
          ? state.selectedNodeIds.filter((nId) => nId !== id)
          : [...state.selectedNodeIds, id]
        : [id],
    })),

  clearSelection: () => set({ selectedNodeIds: [] }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  runGpuForceLayout: async () => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;

    set({ isLayoutRunning: true });
    try {
      const positions = await webGpuLayoutEngine.computeLayout(nodes, edges);
      set((state) => ({
        nodes: state.nodes.map((n) => {
          const updatedPos = positions.get(n.id);
          return updatedPos ? { ...n, position: updatedPos } : n;
        }),
      }));
    } finally {
      set({ isLayoutRunning: false });
    }
  },

  sendC2: (channel, payload, senderId) => {
    const message: C2ChannelMessage = {
      channel,
      senderId,
      timestamp: Date.now(),
      payload,
    };
    const listeners = c2Listeners.get(channel);
    if (listeners) {
      listeners.forEach((callback) => callback(message));
    }
  },

  subscribeC2: (channel, callback) => {
    if (!c2Listeners.has(channel)) {
      c2Listeners.set(channel, new Set());
    }
    const setGroup = c2Listeners.get(channel)!;
    setGroup.add(callback);

    return () => {
      setGroup.delete(callback);
      if (setGroup.size === 0) {
        c2Listeners.delete(channel);
      }
    };
  },
}));
