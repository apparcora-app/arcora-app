import React from 'react';
import type { CanvasNode, CanvasViewport } from '@arcora/shared';

interface CanvasMinimapProps {
  nodes: CanvasNode[];
  viewport: CanvasViewport;
  onNavigate?: (x: number, y: number) => void;
}

export const CanvasMinimap: React.FC<CanvasMinimapProps> = ({ nodes, viewport }) => {
  const mapWidth = 180;
  const mapHeight = 120;

  // Compute bounding box of nodes
  let minX = 0;
  let maxX = 1600;
  let minY = 0;
  let maxY = 1000;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x + node.size.width);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y + node.size.height);
  });

  const spanX = Math.max(maxX - minX + 200, 1000);
  const spanY = Math.max(maxY - minY + 200, 800);

  const scaleX = mapWidth / spanX;
  const scaleY = mapHeight / spanY;
  const scale = Math.min(scaleX, scaleY);

  // Viewport rectangle in minimap coordinates
  const vpWidth = (typeof window !== 'undefined' ? window.innerWidth : 1200) / viewport.zoom;
  const vpHeight = (typeof window !== 'undefined' ? window.innerHeight : 800) / viewport.zoom;
  const vpLeft = (-viewport.x / viewport.zoom - minX) * scale;
  const vpTop = (-viewport.y / viewport.zoom - minY) * scale;
  const vpRectW = vpWidth * scale;
  const vpRectH = vpHeight * scale;

  return (
    <div className="absolute bottom-4 right-4 z-40 p-2 rounded-2xl bg-slate-950/80 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
      <div
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
        className="relative bg-slate-900/80 rounded-xl overflow-hidden border border-slate-800"
      >
        {/* Render Node Dots */}
        {nodes.map((node) => {
          const nx = (node.position.x - minX) * scale;
          const ny = (node.position.y - minY) * scale;
          const nw = Math.max(node.size.width * scale, 4);
          const nh = Math.max(node.size.height * scale, 3);

          return (
            <div
              key={node.id}
              style={{
                left: `${nx}px`,
                top: `${ny}px`,
                width: `${nw}px`,
                height: `${nh}px`,
              }}
              className="absolute rounded-[2px] bg-cyan-400/70 border border-cyan-300/80 shadow-[0_0_4px_rgba(6,182,212,0.5)]"
            />
          );
        })}

        {/* Viewport Indicator Rectangle */}
        <div
          style={{
            left: `${Math.max(0, vpLeft)}px`,
            top: `${Math.max(0, vpTop)}px`,
            width: `${Math.min(mapWidth, vpRectW)}px`,
            height: `${Math.min(mapHeight, vpRectH)}px`,
          }}
          className="absolute border border-cyan-400/90 bg-cyan-500/10 rounded pointer-events-none transition-all"
        />
      </div>
      <div className="mt-1 text-[10px] font-mono text-center text-slate-400">
        Radar Minimap ({(viewport.zoom * 100).toFixed(0)}%)
      </div>
    </div>
  );
};
