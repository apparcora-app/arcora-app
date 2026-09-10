import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { CanvasGrid } from './CanvasGrid';
import { CanvasEdge } from './CanvasEdge';
import { CanvasNode } from './CanvasNode';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasMinimap } from './CanvasMinimap';

export const InfiniteCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const {
    nodes,
    edges,
    viewport,
    selectedNodeIds,
    activeTool,
    activeWireSource,
    panBy,
    zoomAt,
    selectNode,
    clearSelection,
    updateNodePosition,
    removeNode,
    removeEdge,
    addEdge,
    setActiveWireSource,
  } = useCanvasStore();

  const [mouseWorldPos, setMouseWorldPos] = useState({ x: 0, y: 0 });

  const isSpacePressedRef = useRef(false);

  // Handle Wheel Zoom & Trackpad Pan
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Pinch-zoom
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        zoomAt(zoomFactor, { x: e.clientX, y: e.clientY });
      } else {
        // Pan
        panBy(-e.deltaX, -e.deltaY);
      }
    },
    [panBy, zoomAt],
  );

  // Background Pointer Events for Canvas Pan
  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    // Only pan if clicking empty canvas space or using pan tool or middle mouse
    if (e.button === 1 || activeTool === 'pan' || isSpacePressedRef.current) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button === 0) {
      if (activeWireSource) {
        setActiveWireSource(null); // Cancel active wire creation
      }
      clearSelection();
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panBy(dx, dy);
    }

    // Update world coordinates for wire preview
    const worldX = (e.clientX - viewport.x) / viewport.zoom;
    const worldY = (e.clientY - viewport.y) / viewport.zoom;
    setMouseWorldPos({ x: worldX, y: worldY });
  };

  const handlePointerUp = () => {
    isPanningRef.current = false;
  };

  // Port Click Handler to create C2 Wires
  const handlePortClick = (nodeId: string, portId: string, portType: 'input' | 'output') => {
    if (!activeWireSource) {
      if (portType === 'output') {
        setActiveWireSource({ nodeId, portId });
      }
      return;
    }

    // Connect wire if clicking on target input
    if (portType === 'input' && activeWireSource.nodeId !== nodeId) {
      addEdge({
        sourceNodeId: activeWireSource.nodeId,
        sourcePortId: activeWireSource.portId,
        targetNodeId: nodeId,
        targetPortId: portId,
        channel: 'canvas_channel',
        animated: true,
        label: 'C2 Bus',
      });
      setActiveWireSource(null);
    } else {
      setActiveWireSource(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = true;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedNodeIds.forEach((id) => removeNode(id));
      }
      if (e.key === 'Escape') {
        clearSelection();
        setActiveWireSource(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeIds, removeNode, clearSelection, setActiveWireSource]);

  // Find node by id helper
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Active wire preview line
  const activeSourceNode = activeWireSource ? nodeMap.get(activeWireSource.nodeId) : null;
  const wirePreviewStartX = activeSourceNode
    ? (activeSourceNode.position.x + activeSourceNode.size.width) * viewport.zoom + viewport.x
    : 0;
  const wirePreviewStartY = activeSourceNode
    ? (activeSourceNode.position.y + activeSourceNode.size.height / 2) * viewport.zoom + viewport.y
    : 0;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 select-none cursor-default"
      style={{
        cursor: isPanningRef.current ? 'grabbing' : activeTool === 'pan' ? 'grab' : 'default',
      }}
    >
      {/* Background Dot Grid */}
      <CanvasGrid viewport={viewport} />

      {/* SVG Layer for Edges and Wire Previews */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {edges.map((edge) => (
          <CanvasEdge
            key={edge.id}
            edge={edge}
            sourceNode={nodeMap.get(edge.sourceNodeId)}
            targetNode={nodeMap.get(edge.targetNodeId)}
            viewport={viewport}
            onRemove={removeEdge}
          />
        ))}

        {/* Temporary Wire Connection Line */}
        {activeWireSource && activeSourceNode && (
          <line
            x1={wirePreviewStartX}
            y1={wirePreviewStartY}
            x2={mouseWorldPos.x * viewport.zoom + viewport.x}
            y2={mouseWorldPos.y * viewport.zoom + viewport.y}
            stroke="#06b6d4"
            strokeWidth={2}
            strokeDasharray="4 4"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* HTML Layer for Draggable Card Nodes */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {nodes.map((node) => (
          <CanvasNode
            key={node.id}
            node={node}
            viewport={viewport}
            isSelected={selectedNodeIds.includes(node.id)}
            onSelect={selectNode}
            onPositionChange={updateNodePosition}
            onRemove={removeNode}
            onPortClick={handlePortClick}
          />
        ))}
      </div>

      {/* Top Floating Controls Dock */}
      <CanvasToolbar />

      {/* Minimap Radar */}
      <CanvasMinimap nodes={nodes} viewport={viewport} />
    </div>
  );
};

export default InfiniteCanvas;
