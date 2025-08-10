import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Slider } from '@/components/ui/slider';

interface CBCTViewerProps {
  slices?: string[]; // URLs for axial slices; optional for now
  height?: number;
}

const SlicePlane: React.FC<{ url: string }> = ({ url }) => {
  const texture = useLoader(THREE.TextureLoader, url);

  useEffect(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
  }, [texture]);

  const aspect = (texture as any)?.image?.width && (texture as any)?.image?.height
    ? (texture as any).image.width / (texture as any).image.height
    : 1;
  const width = 2;
  const height = 2 / aspect;

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

export const CBCTViewer: React.FC<CBCTViewerProps> = ({ slices = [], height = 380 }) => {
  const [index, setIndex] = useState<number[]>([0]);
  const current = Math.min(Math.max(index[0], 0), Math.max(slices.length - 1, 0));

  return (
    <div className="space-y-3">
      <div className="w-full rounded border bg-muted/30 overflow-hidden" style={{ height }}>
        <Canvas camera={{ position: [0, 0, 3] }} dpr={[1, 1.5]} gl={{ antialias: true }}>
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
