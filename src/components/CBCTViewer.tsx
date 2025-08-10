import React, { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface CBCTViewerProps {
  slices?: string[]; // URLs for axial slices
  height?: number;
}

// Lightweight 2D slice viewer with pan/zoom (fallback for environments without WebGL)
export const CBCTViewer: React.FC<CBCTViewerProps> = ({ slices = [], height = 380 }) => {
  const [index, setIndex] = useState<number[]>([0]);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const mode = useRef<'pan' | 'rotate'>('pan');
  const spinRAF = useRef<number | null>(null);
  const spinStart = useRef<number>(0);
  const spinFrom = useRef<number>(0);
  const stopSpin = () => {
    if (spinRAF.current) {
      cancelAnimationFrame(spinRAF.current);
      spinRAF.current = null;
    }
  };
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const rotateFull360 = (duration = 1200) => {
    stopSpin();
    spinStart.current = performance.now();
    spinFrom.current = rotation;
    const step = (now: number) => {
      const t = Math.min(1, (now - spinStart.current) / duration);
      const angle = spinFrom.current + 360 * easeInOutCubic(t);
      setRotation(angle);
      if (t < 1) {
        spinRAF.current = requestAnimationFrame(step);
      } else {
        setRotation((prev) => ((prev % 360) + 360) % 360);
        spinRAF.current = null;
      }
    };
    spinRAF.current = requestAnimationFrame(step);
  };

  const current = Math.min(Math.max(index[0], 0), Math.max(slices.length - 1, 0));
  const src = slices.length > 0 ? slices[current] : undefined;
  const canScrub = slices.length > 1;

  useEffect(() => {
    // Reset view when switching slice
    setOffset({ x: 0, y: 0 });
    setScale(1);
  }, [current]);

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const delta = -e.deltaY; // up zooms in
    const factor = delta > 0 ? 1.1 : 0.9;
    setScale((s) => Math.min(8, Math.max(0.25, s * factor)));
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target && (target.closest('button') || target.closest('[data-controls]'))) return;
    stopSpin();
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    mode.current = (e.shiftKey || e.button === 2 || (e.buttons & 2) === 2) ? 'rotate' : 'pan';
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    if (mode.current === 'rotate') {
      setRotation((r) => (r + dx * 0.3) % 360);
    } else {
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    dragging.current = false;
    mode.current = 'pan';
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  const prevSlice = () => setIndex(([i]) => [Math.max(0, i - 1)]);
  const nextSlice = () => setIndex(([i]) => [Math.min(slices.length - 1, i + 1)]);

  return (
    <div className="space-y-3">
      <div
        className="w-full rounded border bg-muted/30 overflow-hidden relative select-none"
        style={{ height }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { dragging.current = false; mode.current = 'pan'; }}
        onDoubleClick={reset}
        onContextMenu={(e) => e.preventDefault()}
        role="figure"
        aria-label="CBCT slice viewer"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prevSlice();
          if (e.key === 'ArrowRight') nextSlice();
          if (e.key.toLowerCase() === 'r' || e.key === '0') reset();
        }}
      >
        {src ? (
          <img
            src={src}
            alt={`Slice ${current}`}
            className="absolute top-1/2 left-1/2 max-w-none"
            style={{
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              imageRendering: scale > 1.5 ? 'pixelated' as any : 'auto',
            }}
            draggable={false}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            No image loaded. Upload slices to browse.
          </div>
        )}

        {/* HUD */}
        <div className="absolute left-2 top-2 text-xs px-2 py-1 rounded bg-background/80 border">
          Pan: left-drag • Rotate: right-drag or Shift-drag • Zoom: wheel • Reset: double click
        </div>
        <div className="absolute right-2 top-2 flex gap-2" data-controls>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded border bg-background/80"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            aria-label="Rotate 90 degrees"
            title="Rotate 90°"
          >
            Rotate 90°
          </button>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded border bg-background/80"
            onClick={() => rotateFull360()}
            aria-label="Rotate 360 degrees"
            title="Rotate 360° (animated)"
          >
            Rotate 360°
          </button>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded border bg-background/80"
            onClick={reset}
            aria-label="Reset view"
            title="Reset (double click, or press R/0)"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-xs px-2 py-1 rounded border bg-background"
          onClick={prevSlice}
          disabled={!canScrub}
          aria-label="Previous slice"
        >
          Prev
        </button>
        <span className="text-xs text-muted-foreground">Slice</span>
        <Slider
          value={index}
          onValueChange={setIndex}
          min={0}
          max={Math.max(slices.length - 1, 0)}
          step={1}
          className="flex-1"
          disabled={!canScrub}
        />
        <span className="text-xs text-muted-foreground w-10 text-right">{current}</span>
        <button
          type="button"
          className="text-xs px-2 py-1 rounded border bg-background"
          onClick={nextSlice}
          disabled={!canScrub}
          aria-label="Next slice"
        >
          Next
        </button>
      </div>
      {!canScrub && (
        <p className="text-xs text-muted-foreground">Load multiple slices to enable scrubbing.</p>
      )}
    </div>
  );
};

export default CBCTViewer;
