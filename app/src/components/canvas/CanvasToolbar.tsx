import React from 'react';
import {
  MousePointer,
  Hand,
  Share2,
  Plus,
  Cpu,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  DollarSign,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';

export const CanvasToolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    runGpuForceLayout,
    isLayoutRunning,
    zoomAt,
    resetViewport,
    addNode,
    nodes,
    edges,
  } = useCanvasStore();

  const handleAddCard = (type: 'document-frame' | 'financial-blotter' | 'chart-analytics' | 'ai-chat') => {
    const titles = {
      'document-frame': 'Document Ingestion Node',
      'financial-blotter': 'Live Financial Blotter',
      'chart-analytics': 'Cashflow Runway Analytics',
      'ai-chat': 'Autonomous Reasoning Agent',
    };

    addNode({
      position: {
        x: Math.round(200 + Math.random() * 300),
        y: Math.round(150 + Math.random() * 200),
      },
      size: { width: 340, height: 240 },
      data: {
        title: titles[type],
        type,
        status: 'synced',
        inputs: [{ id: `in-${Date.now()}`, name: 'data-in', type: 'input', channel: 'canvas_bus' }],
        outputs: [{ id: `out-${Date.now()}`, name: 'events-out', type: 'output', channel: 'canvas_bus' }],
      },
    });
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-700/60 shadow-2xl backdrop-blur-2xl">
      {/* Tool Selection */}
      <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
        <button
          onClick={() => setActiveTool('select')}
          className={`p-2 rounded-xl text-xs font-medium transition-all ${
            activeTool === 'select'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Select & Move Nodes (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool('pan')}
          className={`p-2 rounded-xl text-xs font-medium transition-all ${
            activeTool === 'pan'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Hand Pan Canvas (H / Space+Drag)"
        >
          <Hand className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool('wire')}
          className={`p-2 rounded-xl text-xs font-medium transition-all ${
            activeTool === 'wire'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Connect Inter-Frame C2 Wires (W)"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Add Frame Buttons */}
      <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
        <button
          onClick={() => handleAddCard('document-frame')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/30 transition-colors"
          title="Add Document Pipeline Frame"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Doc</span>
        </button>
        <button
          onClick={() => handleAddCard('financial-blotter')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-950/40 border border-amber-900/30 transition-colors"
          title="Add Financial Blotter Frame"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Bills</span>
        </button>
        <button
          onClick={() => handleAddCard('chart-analytics')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-cyan-400 hover:bg-cyan-950/40 border border-cyan-900/30 transition-colors"
          title="Add Analytics Forecast Chart"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trend</span>
        </button>
        <button
          onClick={() => handleAddCard('ai-chat')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-purple-400 hover:bg-purple-950/40 border border-purple-900/30 transition-colors"
          title="Add Multi-Model AI Agent"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Agent</span>
        </button>
      </div>

      {/* WebGPU Optimization Trigger */}
      <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
        <button
          onClick={runGpuForceLayout}
          disabled={isLayoutRunning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            isLayoutRunning
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 animate-pulse'
              : 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-300 border border-cyan-500/40'
          }`}
          title="Simulate Physics & Arrange Spatial Topology with WebGPU"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isLayoutRunning ? 'WebGPU Computing...' : 'WebGPU Layout'}</span>
        </button>
      </div>

      {/* Zoom and Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => zoomAt(1.2, { x: window.innerWidth / 2, y: window.innerHeight / 2 })}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => zoomAt(0.8, { x: window.innerWidth / 2, y: window.innerHeight / 2 })}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetViewport}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Reset Viewport"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Node and Edge Count Stats */}
      <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-[11px] font-mono text-slate-400">
        <span>{nodes.length} Nodes</span>
        <span>•</span>
        <span>{edges.length} Wires</span>
      </div>
    </div>
  );
};
