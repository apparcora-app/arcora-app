import { z } from 'zod';

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export const CanvasViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().positive(),
});

export const CanvasNodeTypeSchema = z.enum([
  'document-frame',
  'kpi-metric',
  'chart-analytics',
  'financial-blotter',
  'ai-chat',
  'quick-note',
  'custom-frame',
]);

export const CanvasPortSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['input', 'output']),
  channel: z.string(),
});

export const CanvasNodeDataSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  type: CanvasNodeTypeSchema,
  payload: z.record(z.string(), z.unknown()).optional(),
  inputs: z.array(CanvasPortSchema).optional(),
  outputs: z.array(CanvasPortSchema).optional(),
  htmlContent: z.string().optional(),
  refreshIntervalMs: z.number().optional(),
  status: z.enum(['idle', 'computing', 'error', 'synced']).optional(),
});

export const CanvasNodeSchema = z.object({
  id: z.string(),
  position: PointSchema,
  size: SizeSchema,
  data: CanvasNodeDataSchema,
  zIndex: z.number().optional(),
  selected: z.boolean().optional(),
});

export const CanvasEdgeSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  sourcePortId: z.string().optional(),
  targetNodeId: z.string(),
  targetPortId: z.string().optional(),
  channel: z.string(),
  bidirectional: z.boolean().optional(),
  animated: z.boolean().optional(),
  label: z.string().optional(),
});
