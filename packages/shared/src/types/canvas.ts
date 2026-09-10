/**
 * Spatial Infinite Canvas & Jetro C2 Channel Contracts
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export type CanvasNodeType = 
  | 'document-frame' 
  | 'kpi-metric' 
  | 'chart-analytics' 
  | 'financial-blotter' 
  | 'ai-chat' 
  | 'quick-note'
  | 'custom-frame';

export interface CanvasPort {
  id: string;
  name: string;
  type: 'input' | 'output';
  channel: string;
}

export interface CanvasNodeData {
  title: string;
  subtitle?: string;
  type: CanvasNodeType;
  payload?: Record<string, unknown>;
  inputs?: CanvasPort[];
  outputs?: CanvasPort[];
  htmlContent?: string;
  refreshIntervalMs?: number;
  status?: 'idle' | 'computing' | 'error' | 'synced';
}

export interface CanvasNode {
  id: string;
  position: Point;
  size: Size;
  data: CanvasNodeData;
  zIndex?: number;
  selected?: boolean;
}

export interface CanvasEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId?: string;
  targetNodeId: string;
  targetPortId?: string;
  channel: string;
  bidirectional?: boolean;
  animated?: boolean;
  label?: string;
}

export interface CanvasStateSnapshot {
  id: string;
  name: string;
  viewport: CanvasViewport;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  updatedAt: string;
}

/**
 * Jetro C2 Inter-Frame Reactive Message Event
 */
export interface C2ChannelMessage<T = unknown> {
  channel: string;
  senderId: string;
  targetId?: string;
  timestamp: number;
  payload: T;
}
