import React, { useEffect, useMemo } from 'react';

export interface DetectionBox {
  id: string;
  label: string;
  confidence: number; // 0..1 or 0..100
  severity?: 'low' | 'medium' | 'high' | 'critical';
  rect: { x: number; y: number; width: number; height: number }; // normalized 0..1
}

interface XRayOverlayProps {
  boxes: DetectionBox[];
  width: number; // rendered image width in px
  height: number; // rendered image height in px
}

const severityColor: Record<NonNullable<DetectionBox['severity']>, string> = {
  low: 'border-green-500/80 text-green-700 bg-green-50/60',
  medium: 'border-yellow-500/80 text-yellow-700 bg-yellow-50/60',
  high: 'border-orange-500/80 text-orange-700 bg-orange-50/60',
  critical: 'border-red-500/80 text-red-700 bg-red-50/60',
};

export const XRayOverlay: React.FC<XRayOverlayProps> = ({ boxes, width, height }) => {
  const pixelBoxes = useMemo(() => {
    return boxes.map((b) => ({
      ...b,
      px: {
        left: Math.round(b.rect.x * width),
        top: Math.round(b.rect.y * height),
        w: Math.round(b.rect.width * width),
        h: Math.round(b.rect.height * height),
      },
    }));
  }, [boxes, width, height]);

  useEffect(() => {
    // No-op: placeholder for future animation hooks
  }, [pixelBoxes]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {pixelBoxes.map((b) => (
        <div
          key={b.id}
          className={`absolute rounded-sm border backdrop-blur-[1px] ${b.severity ? severityColor[b.severity] : 'border-primary/70 bg-background/40'}`}
          style={{ left: b.px.left, top: b.px.top, width: b.px.w, height: b.px.h }}
        >
          <div className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[11px] leading-4 border bg-background/80 text-foreground shadow-sm">
            <span className="font-medium mr-1">{b.label}</span>
            <span className="opacity-70">{(b.confidence > 1 ? b.confidence : b.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default XRayOverlay;
