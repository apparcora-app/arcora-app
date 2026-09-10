import React from 'react';
import type { CanvasEdge as ICanvasEdge, CanvasNode, CanvasViewport } from '@arcora/shared';

interface CanvasEdgeProps {
  edge: ICanvasEdge;
  sourceNode?: CanvasNode;
  targetNode?: CanvasNode;
  viewport: CanvasViewport;
  onRemove?: (id: string) => void;
}

export const CanvasEdge: React.FC<CanvasEdgeProps> = ({
  edge,
  sourceNode,
  targetNode,
  viewport,
  onRemove,
}) => {
  if (!sourceNode || !targetNode) return null;

  // Calculate anchor points (source right edge, target left edge)
  const x1 = (sourceNode.position.x + sourceNode.size.width) * viewport.zoom + viewport.x;
  const y1 = (sourceNode.position.y + sourceNode.size.height / 2) * viewport.zoom + viewport.y;

  const x2 = targetNode.position.x * viewport.zoom + viewport.x;
  const y2 = (targetNode.position.y + targetNode.size.height / 2) * viewport.zoom + viewport.y;

  // Cubic Bezier control points
  const dx = Math.abs(x2 - x1) * 0.5;
  const cx1 = x1 + dx;
  const cy1 = y1;
  const cx2 = x2 - dx;
  const cy2 = y2;

  const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g className="group pointer-events-auto">
      {/* Invisible thicker path for easier hovering/clicking */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        className="cursor-pointer"
        onClick={() => onRemove?.(edge.id)}
      />

      {/* Main visible curve */}
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-cyan-500/70 dark:text-cyan-400/80 transition-colors duration-150 group-hover:text-red-400 group-hover:stroke-[3px]"
      />

      {/* Animated data-pulse marker */}
      {edge.animated && (
        <circle r={3.5} className="fill-cyan-300 shadow-glow">
          <animateMotion
            path={pathData}
            dur="2.5s"
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      )}

      {/* Channel Label */}
      {edge.label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-edge.label.length * 3.5 - 6}
            y={-10}
            width={edge.label.length * 7 + 12}
            height={20}
            rx={10}
            className="fill-slate-900/90 stroke stroke-slate-700/60 backdrop-blur-sm"
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            className="text-[10px] font-mono tracking-wider fill-cyan-300 select-none"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
};
