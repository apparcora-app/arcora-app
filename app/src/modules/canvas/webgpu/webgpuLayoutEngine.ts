/**
 * WebGPU Accelerated Spatial Force-Directed Graph Layout Engine
 * Runs physics-based spatial distribution on GPU compute shaders
 * with automatic, seamless fallback to CPU Euler/Verlet integration.
 */

import type { CanvasNode, CanvasEdge, Point } from '@arcora/shared';

// WebGPU Interface Shims for cross-environment type safety
type GPUDeviceAny = any;

const GPUBufferUsage = {
  MAP_READ: 0x0001,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  UNIFORM: 0x0040,
  STORAGE: 0x0080,
};

const GPUMapMode = {
  READ: 0x0001,
  WRITE: 0x0002,
};

export interface LayoutSimulationOptions {
  iterations?: number;
  repulsionForce?: number;
  springLength?: number;
  springStrength?: number;
  damping?: number;
}

const DEFAULT_OPTIONS: Required<LayoutSimulationOptions> = {
  iterations: 60,
  repulsionForce: 25000,
  springLength: 220,
  springStrength: 0.05,
  damping: 0.88,
};

/**
 * WGSL Compute Shader for 2D Node Repulsion and Force Calculation
 */
const LAYOUT_WGSL = /* wgsl */ `
struct Node {
  pos: vec2<f32>,
  vel: vec2<f32>,
};

struct Params {
  nodeCount: u32,
  repulsion: f32,
  damping: f32,
  dt: f32,
};

@group(0) @binding(0) var<storage, read_write> nodes: array<Node>;
@group(0) @binding(1) var<uniform> params: Params;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.nodeCount) {
    return;
  }

  var myPos = nodes[idx].pos;
  var force = vec2<f32>(0.0, 0.0);

  // Pairwise N-body repulsion
  for (var i = 0u; i < params.nodeCount; i = i + 1u) {
    if (i == idx) {
      continue;
    }
    let otherPos = nodes[i].pos;
    let delta = myPos - otherPos;
    let distSq = max(delta.x * delta.x + delta.y * delta.y, 400.0);
    let dist = sqrt(distSq);
    let f = params.repulsion / distSq;
    force = force + (delta / dist) * f;
  }

  // Update velocity and integrate position
  var vel = (nodes[idx].vel + force * params.dt) * params.damping;
  nodes[idx].vel = vel;
  nodes[idx].pos = myPos + vel * params.dt;
}
`;

export class WebGpuLayoutEngine {
  private device: GPUDeviceAny | null = null;
  private isWebGpuSupported: boolean = false;
  private initPromise: Promise<boolean> | null = null;

  constructor() {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      this.initPromise = this.initDevice();
    } else {
      this.isWebGpuSupported = false;
    }
  }

  private async initDevice(): Promise<boolean> {
    try {
      const nav = navigator as any;
      if (!nav.gpu) return false;
      const adapter = await nav.gpu.requestAdapter();
      if (!adapter) return false;
      this.device = await adapter.requestDevice();
      this.isWebGpuSupported = true;
      return true;
    } catch (err) {
      console.warn('WebGPU layout initialization fallback to CPU:', err);
      this.isWebGpuSupported = false;
      return false;
    }
  }

  public async computeLayout(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    options: LayoutSimulationOptions = {},
  ): Promise<Map<string, Point>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const n = nodes.length;
    if (n === 0) return new Map();

    if (this.initPromise) {
      await this.initPromise;
    }

    if (this.isWebGpuSupported && this.device && n >= 8) {
      try {
        return await this.runGpuCompute(nodes, edges, opts);
      } catch (err) {
        console.warn('WebGPU compute execution failed, using CPU fallback:', err);
      }
    }

    return this.runCpuCompute(nodes, edges, opts);
  }

  private async runGpuCompute(
    nodes: CanvasNode[],
    _edges: CanvasEdge[],
    opts: Required<LayoutSimulationOptions>,
  ): Promise<Map<string, Point>> {
    const device = this.device!;
    const nodeCount = nodes.length;

    // Buffer structure: [posX, posY, velX, velY] per node = 4 float32 (16 bytes)
    const nodeArray = new Float32Array(nodeCount * 4);
    nodes.forEach((node, i) => {
      nodeArray[i * 4 + 0] = node.position.x;
      nodeArray[i * 4 + 1] = node.position.y;
      nodeArray[i * 4 + 2] = 0; // velX
      nodeArray[i * 4 + 3] = 0; // velY
    });

    const storageBuffer = device.createBuffer({
      size: nodeArray.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(storageBuffer, 0, nodeArray);

    const readBuffer = device.createBuffer({
      size: nodeArray.byteLength,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    // Uniform buffer: [nodeCount, repulsion, damping, dt]
    const uniformArray = new Float32Array([nodeCount, opts.repulsionForce, opts.damping, 0.016]);
    const uniformBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    const shaderModule = device.createShaderModule({ code: LAYOUT_WGSL });
    const computePipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: shaderModule, entryPoint: 'main' },
    });

    const bindGroup = device.createBindGroup({
      layout: computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: storageBuffer } },
        { binding: 1, resource: { buffer: uniformBuffer } },
      ],
    });

    const workgroups = Math.ceil(nodeCount / 64);

    for (let iter = 0; iter < opts.iterations; iter++) {
      const commandEncoder = device.createCommandEncoder();
      const pass = commandEncoder.beginComputePass();
      pass.setPipeline(computePipeline);
      pass.setBindGroup(0, bindGroup);
      pass.dispatchWorkgroups(workgroups);
      pass.end();

      if (iter === opts.iterations - 1) {
        commandEncoder.copyBufferToBuffer(storageBuffer, 0, readBuffer, 0, nodeArray.byteLength);
      }
      device.queue.submit([commandEncoder.finish()]);
    }

    await readBuffer.mapAsync(GPUMapMode.READ);
    const output = new Float32Array(readBuffer.getMappedRange());
    const positions = new Map<string, Point>();

    nodes.forEach((node, i) => {
      positions.set(node.id, {
        x: Math.round(output[i * 4 + 0]),
        y: Math.round(output[i * 4 + 1]),
      });
    });

    readBuffer.unmap();
    storageBuffer.destroy();
    readBuffer.destroy();
    uniformBuffer.destroy();

    return positions;
  }

  private runCpuCompute(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    opts: Required<LayoutSimulationOptions>,
  ): Map<string, Point> {
    const nodeCount = nodes.length;
    const nodeMap = new Map<string, number>();
    const pos = nodes.map((n, i) => {
      nodeMap.set(n.id, i);
      return { x: n.position.x, y: n.position.y, vx: 0, vy: 0 };
    });

    const dt = 0.02;

    for (let iter = 0; iter < opts.iterations; iter++) {
      // 1. Repulsion
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = pos[i].x - pos[j].x;
          const dy = pos[i].y - pos[j].y;
          const distSq = Math.max(dx * dx + dy * dy, 400);
          const dist = Math.sqrt(distSq);
          const force = opts.repulsionForce / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          pos[i].vx += fx * dt;
          pos[i].vy += fy * dt;
          pos[j].vx -= fx * dt;
          pos[j].vy -= fy * dt;
        }
      }

      // 2. Spring attraction along edges
      for (const edge of edges) {
        const i = nodeMap.get(edge.sourceNodeId);
        const j = nodeMap.get(edge.targetNodeId);
        if (i === undefined || j === undefined) continue;

        const dx = pos[j].x - pos[i].x;
        const dy = pos[j].y - pos[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - opts.springLength;
        const force = displacement * opts.springStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        pos[i].vx += fx * dt;
        pos[i].vy += fy * dt;
        pos[j].vx -= fx * dt;
        pos[j].vy -= fy * dt;
      }

      // 3. Integrate position & damping
      for (let i = 0; i < nodeCount; i++) {
        pos[i].vx *= opts.damping;
        pos[i].vy *= opts.damping;
        pos[i].x += pos[i].vx * dt;
        pos[i].y += pos[i].vy * dt;
      }
    }

    const resultMap = new Map<string, Point>();
    nodes.forEach((n, i) => {
      resultMap.set(n.id, {
        x: Math.round(pos[i].x),
        y: Math.round(pos[i].y),
      });
    });

    return resultMap;
  }
}

export const webGpuLayoutEngine = new WebGpuLayoutEngine();
