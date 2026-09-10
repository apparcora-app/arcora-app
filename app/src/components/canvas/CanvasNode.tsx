import React, { useRef } from 'react';
import type { CanvasNode as ICanvasNode, CanvasViewport } from '@arcora/shared';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface CanvasNodeProps {
  node: ICanvasNode;
  viewport: CanvasViewport;
  isSelected: boolean;
  onSelect: (id: string, isMulti: boolean) => void;
  onPositionChange: (id: string, newPos: { x: number; y: number }) => void;
  onRemove: (id: string) => void;
  onPortClick: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
}

export const CanvasNode: React.FC<CanvasNodeProps> = ({
  node,
  viewport,
  isSelected,
  onSelect,
  onPositionChange,
  onRemove,
  onPortClick,
}) => {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const screenX = node.position.x * viewport.zoom + viewport.x;
  const screenY = node.position.y * viewport.zoom + viewport.y;
  const screenWidth = node.size.width * viewport.zoom;
  const screenHeight = node.size.height * viewport.zoom;

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.node-port, .node-action-btn')) {
      return;
    }
    e.stopPropagation();
    onSelect(node.id, e.shiftKey || e.metaKey);

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      nodeX: node.position.x,
      nodeY: node.position.y,
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = (moveEv.clientX - dragStartRef.current.x) / viewport.zoom;
      const dy = (moveEv.clientY - dragStartRef.current.y) / viewport.zoom;
      onPositionChange(node.id, {
        x: Math.round(dragStartRef.current.nodeX + dx),
        y: Math.round(dragStartRef.current.nodeY + dy),
      });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const getNodeIcon = () => {
    switch (node.data.type) {
      case 'document-frame':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'financial-blotter':
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case 'chart-analytics':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'ai-chat':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (node.data.status) {
      case 'synced':
        return (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Live
          </span>
        );
      case 'computing':
        return (
          <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded-full animate-pulse">
            <Cpu className="w-3 h-3" /> Compute
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800/50 px-1.5 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" /> Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/60 border border-slate-700/50 px-1.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Idle
          </span>
        );
    }
  };

  return (
    <div
      style={{
        transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        zIndex: isSelected ? 40 : 10,
      }}
      className={`absolute left-0 top-0 select-none rounded-xl border backdrop-blur-xl transition-shadow duration-200 cursor-grab active:cursor-grabbing ${
        isSelected
          ? 'border-cyan-500/90 bg-slate-900/90 shadow-[0_0_25px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/50'
          : 'border-slate-700/60 bg-slate-950/80 hover:border-slate-600 shadow-xl'
      }`}
      onPointerDown={handlePointerDown}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/40 rounded-t-xl">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1 rounded bg-slate-800/80">{getNodeIcon()}</div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-100 truncate">
              {node.data.title}
            </h4>
            {node.data.subtitle && (
              <p className="text-[10px] text-slate-400 truncate">
                {node.data.subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {getStatusBadge()}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(node.id);
            }}
            className="node-action-btn p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded transition-colors"
            title="Delete Frame"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Node Body Content */}
      <div className="p-3 text-xs text-slate-300 space-y-2 overflow-auto h-[calc(100%-54px)]">
        {node.data.type === 'document-frame' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Classified Tier:</span>
              <span className="text-emerald-400 font-mono">ModernBERT (ONNX)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Hardware Accel:</span>
              <span className="text-cyan-400 font-mono">WebGPU (Device 0)</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60 font-mono text-[10px] text-slate-400">
              Confidence Score: 0.984 | Latency: 12ms
            </div>
          </div>
        )}

        {node.data.type === 'financial-blotter' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Pending Liabilities:</span>
              <span className="text-amber-400 font-mono font-semibold">$1,420.50</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Reconciliation:</span>
              <span className="text-slate-200">100% Deterministic</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60 text-[10px] text-slate-400">
              FESCO Electricity & PTCL Fiber bills auto-scheduled.
            </div>
          </div>
        )}

        {node.data.type === 'chart-analytics' && (
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Runway Forecast:</span>
              <span className="text-cyan-400 font-mono">8.4 Months</span>
            </div>
            <div className="h-16 flex items-end gap-1 px-1 bg-slate-900/60 rounded border border-slate-800/60 pb-1">
              {[40, 65, 30, 85, 55, 70, 95].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm opacity-80"
                />
              ))}
            </div>
          </div>
        )}

        {node.data.type === 'ai-chat' && (
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Active Orchestrator:</span>
              <span className="text-purple-400 font-mono">Gemini 2.0 Flash</span>
            </div>
            <div className="p-2 bg-purple-950/20 border border-purple-800/30 rounded text-[11px] text-purple-200">
              "Identified $180 annual recurring savings across 3 unused subscriptions."
            </div>
          </div>
        )}
      </div>

      {/* Input Ports (Left edge) */}
      {node.data.inputs?.map((port, idx) => (
        <button
          key={port.id}
          onClick={(e) => {
            e.stopPropagation();
            onPortClick(node.id, port.id, 'input');
          }}
          style={{ top: `${(idx + 1) * 28 + 36}px` }}
          className="node-port absolute -left-2.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-400/80 hover:bg-cyan-400 hover:scale-125 transition-all flex items-center justify-center cursor-pointer shadow-md"
          title={`Input: ${port.name} (${port.channel})`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pointer-events-none" />
        </button>
      ))}

      {/* Output Ports (Right edge) */}
      {node.data.outputs?.map((port, idx) => (
        <button
          key={port.id}
          onClick={(e) => {
            e.stopPropagation();
            onPortClick(node.id, port.id, 'output');
          }}
          style={{ top: `${(idx + 1) * 28 + 36}px` }}
          className="node-port absolute -right-2.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-emerald-400/80 hover:bg-emerald-400 hover:scale-125 transition-all flex items-center justify-center cursor-pointer shadow-md"
          title={`Output: ${port.name} (${port.channel})`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pointer-events-none" />
        </button>
      ))}
    </div>
  );
};
