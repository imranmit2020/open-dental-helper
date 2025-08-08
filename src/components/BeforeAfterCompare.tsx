import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface BeforeAfterCompareProps {
  beforeUrl: string;
  afterUrl: string;
  height?: number;
}

export const BeforeAfterCompare: React.FC<BeforeAfterCompareProps> = ({ beforeUrl, afterUrl, height = 320 }) => {
  const [value, setValue] = useState<number[]>([50]);
  const percent = value[0];

  return (
    <div className="space-y-3">
      <div className="relative w-full rounded border bg-muted/30 overflow-hidden" style={{ height }}>
        <img
          src={beforeUrl}
          alt="Before"
          className="absolute inset-0 w-full h-full object-contain bg-background"
        />
        <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${percent}%` }}>
          <img
            src={afterUrl}
            alt="After"
            className="w-full h-full object-contain bg-background"
          />
        </div>
        <div
          className="absolute inset-y-0 pointer-events-none"
          style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
        >
          <div className="h-full w-0.5 bg-primary" />
        </div>
      </div>
      <Slider value={value} onValueChange={setValue} min={0} max={100} step={1} />
    </div>
  );
};

export default BeforeAfterCompare;
