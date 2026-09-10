import React from 'react';
import type { CanvasViewport } from '@arcora/shared';

interface CanvasGridProps {
  viewport: CanvasViewport;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ viewport }) => {
  const gridSize = 40 * viewport.zoom;
  const offsetX = viewport.x % gridSize;
  const offsetY = viewport.y % gridSize;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="canvas-grid-pattern"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <circle
            cx={gridSize / 2}
            cy={gridSize / 2}
            r={1.2 * Math.min(Math.max(viewport.zoom, 0.6), 1.6)}
            className="fill-cyan-500/60 dark:fill-cyan-400/40"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#canvas-grid-pattern)" />
    </svg>
  );
};
