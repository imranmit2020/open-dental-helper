import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Slider } from '@/components/ui/slider';

interface CBCTViewerProps {
  slices?: string[]; // URLs for axial slices; optional for now
  height?: number;
}

const SlicePlane: React.FC<{ url: string }> = ({ url }) => {
  // Simple textured plane for a single slice
  const texture = useMemo(() => {
    const tex = new Image();
    tex.src = url;
    return url;
  }, [url]);
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      {/* We keep a neutral material until we wire a proper texture loader (MVP placeholder) */}
      <meshBasicMaterial color="#cccccc" />
    </mesh>
  );
};

export const CBCTViewer: React.FC<CBCTViewerProps> = ({ slices = [], height = 380 }) => {
  const [index, setIndex] = useState<number[]>([0]);
  const current = Math.min(Math.max(index[0], 0), Math.max(slices.length - 1, 0));

  return (
    <div className="space-y-3">
      <div className="w-full rounded border bg-muted/30 overflow-hidden" style={{ height }}>
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} intensity={0.5} />
          <Suspense fallback={null}>
            {slices.length > 0 ? (
              <group>
                <SlicePlane url={slices[current]} />
              </group>
            ) : (
              <mesh>
                <boxGeometry args={[1.6, 1.0, 0.2]} />
                <meshStandardMaterial color="#9ca3af" />
              </mesh>
            )}
          </Suspense>
          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Slice</span>
        <Slider value={index} onValueChange={setIndex} min={0} max={Math.max(slices.length - 1, 0)} step={1} className="flex-1" />
        <span className="text-xs text-muted-foreground w-8 text-right">{current}</span>
      </div>
    </div>
  );
};

export default CBCTViewer;
