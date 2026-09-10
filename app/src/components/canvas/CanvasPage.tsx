import React from 'react';
import { InfiniteCanvas } from './InfiniteCanvas';
import { SEOHead } from '@/components/seo/SEOHead';

export const CanvasPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full relative">
      <SEOHead
        title="Infinite Canvas Workspace | Arcora"
        description="Spatial intelligence canvas with WebGPU acceleration and reactive C2 inter-frame dataflow."
      />
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <InfiniteCanvas />
      </div>
    </div>
  );
};

export default CanvasPage;
