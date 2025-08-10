import React, { useMemo } from 'react';

export interface DetectionPoint { x: number; y: number } // normalized 0..1

export interface DetectionBox {
  id: string;
  label: string;
  confidence: number; // 0..1 or 0..100
  severity?: 'low' | 'medium' | 'high' | 'critical';
  rect?: { x: number; y: number; width: number; height: number }; // normalized 0..1
  poly?: DetectionPoint[]; // optional polygon in normalized coords
}

interface XRayOverlayProps {
  boxes: DetectionBox[];
  width: number; // rendered image width in px
  height: number; // rendered image height in px
  offsetX?: number; // left offset within container when using object-contain
  offsetY?: number; // top offset within container when using object-contain
  opacity?: number; // overlay visual opacity (0..1)
  highlightedId?: string; // id to emphasize
}

const severityStyles: Record<NonNullable<DetectionBox['severity']>, { stroke: string; fill: string }> = {
  low: { stroke: 'hsl(var(--accent))', fill: 'hsl(var(--accent) / 0.10)' },
  medium: { stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary) / 0.10)' },
  high: { stroke: 'hsl(var(--ring))', fill: 'hsl(var(--ring) / 0.10)' },
  critical: { stroke: 'hsl(var(--destructive))', fill: 'hsl(var(--destructive) / 0.12)' },
};

export const XRayOverlay: React.FC<XRayOverlayProps> = ({ boxes, width, height, offsetX = 0, offsetY = 0, opacity = 0.6, highlightedId }) => {
  const shapes = useMemo(() => {
    return boxes.map((b) => {
      const label = b.label;
      const conf = (b.confidence > 1 ? b.confidence : b.confidence * 100).toFixed(0) + '%';
      const sev: NonNullable<DetectionBox['severity']> = (b.severity ?? 'medium') as any;

      if (b.poly && b.poly.length >= 3) {
        const pts = b.poly
          .map((p) => `${Math.round(p.x * width)},${Math.round(p.y * height)}`)
          .join(' ');
        // centroid for label
        const cx = b.poly.reduce((s, p) => s + p.x, 0) / b.poly.length;
        const cy = b.poly.reduce((s, p) => s + p.y, 0) / b.poly.length;
        return {
          id: b.id,
          type: 'poly' as const,
          sev,
          pts,
          label,
          conf,
          lx: Math.round(cx * width),
          ly: Math.round(cy * height) - 8,
        };
      }

      if (b.rect) {
        const left = Math.round(b.rect.x * width);
        const top = Math.round(b.rect.y * height);
        const w = Math.round(b.rect.width * width);
        const h = Math.round(b.rect.height * height);
        return {
          id: b.id,
          type: 'rect' as const,
          sev,
          left, top, w, h,
          label, conf,
        };
      }

      return null;
    }).filter(Boolean);
  }, [boxes, width, height]);

  return (
    <div className="absolute pointer-events-none" style={{ left: offsetX ?? 0, top: offsetY ?? 0, width, height }}>
      <svg className="absolute inset-0 w-full h-full" width={width} height={height}>
        {(shapes as any[]).map((s) => {
          const styles = severityStyles[s.sev as keyof typeof severityStyles] || severityStyles.medium;
          const isHi = highlightedId && s.id === highlightedId;
          const strokeWidth = isHi ? 3 : 2;
          const strokeOpacity = Math.min(1, (opacity ?? 0.6) + (isHi ? 0.2 : 0));
          const fillOpacity = Math.max(0, (opacity ?? 0.6) - 0.35);
          return s.type === 'poly' ? (
            <g key={s.id}>
              <polygon points={s.pts} style={{ stroke: styles.stroke, fill: styles.fill, strokeWidth, strokeOpacity, fillOpacity }} />
              <g transform={`translate(${s.lx},${s.ly})`}>
                <rect x={-2} y={-12} width={Math.max(50, s.label.length * 6 + 30)} height={16} rx={3} className="fill-background/80" />
                <text x={4} y={0} className="text-[11px] fill-foreground">
                  {s.label} {s.conf}
                </text>
              </g>
            </g>
          ) : (
            <g key={s.id}>
              <rect x={s.left} y={s.top} width={s.w} height={s.h} style={{ stroke: styles.stroke, fill: styles.fill, strokeWidth, strokeOpacity, fillOpacity }} />
              <g transform={`translate(${s.left},${s.top - 6})`}>
                <rect x={0} y={-12} width={Math.max(50, s.label.length * 6 + 30)} height={16} rx={3} className="fill-background/80" />
                <text x={4} y={0} className="text-[11px] fill-foreground">
                  {s.label} {s.conf}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default XRayOverlay;
