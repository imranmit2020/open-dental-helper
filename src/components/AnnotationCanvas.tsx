import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Text as FabricText, Line as FabricLine, Image as FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export type AnnotationTool = 'select' | 'draw' | 'rectangle' | 'circle' | 'measure' | 'clear';

interface AnnotationCanvasProps {
  imageUrl: string;
  height?: number;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({ imageUrl, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
  const [color, setColor] = useState<string>('#ff3b30');
  const measureStart = useRef<{ x: number; y: number } | null>(null);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const c = new FabricCanvas(canvasRef.current, {
      backgroundColor: '#ffffff',
      width: containerRef.current?.clientWidth || 800,
      height,
      controlsAboveOverlay: true,
      selection: true,
    });

    // Free drawing brush config
    c.freeDrawingBrush.color = color;
    c.freeDrawingBrush.width = 2;

    setFabricCanvas(c);
    toast.success('Annotation canvas ready');

    return () => {
      c.dispose();
    };
  }, []);

  // Handle window resize to keep canvas responsive
  useEffect(() => {
    const handleResize = () => {
      if (!fabricCanvas || !containerRef.current) return;
      const w = containerRef.current.clientWidth;
      fabricCanvas.setWidth(w);
      fabricCanvas.renderAll();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fabricCanvas]);

  // Load background image
  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl).then((img) => {
      const maxW = containerRef.current?.clientWidth || fabricCanvas.getWidth();
      const maxH = height;
      // scale image to fit canvas
      const scale = Math.min(maxW / img.width!, maxH / img.height!);
      img.set({
        selectable: false,
        evented: false,
        opacity: 1,
        left: 0,
        top: 0,
        scaleX: scale,
        scaleY: scale,
      });

      fabricCanvas.setDimensions({ width: maxW, height: maxH });
      fabricCanvas.set({ backgroundImage: img as any });
      fabricCanvas.renderAll();
    }).catch((e) => {
      console.error('Failed to load background image', e);
      toast.error('Failed to load image for annotations');
    });
  }, [fabricCanvas, imageUrl, height]);

  // Update drawing mode and brush color
  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = activeTool === 'draw';
    fabricCanvas.freeDrawingBrush.color = color;
    fabricCanvas.freeDrawingBrush.width = 2;
  }, [activeTool, color, fabricCanvas]);

  // Pointer handling for shape tools
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (opt: any) => {
      const evt = opt.e as MouseEvent;
      const pointer = fabricCanvas.getPointer(evt);

      if (activeTool === 'rectangle') {
        const rect = new Rect({
          left: pointer.x - 40,
          top: pointer.y - 30,
          width: 80,
          height: 60,
          fill: 'transparent',
          stroke: color,
          strokeWidth: 2,
        });
        fabricCanvas.add(rect);
      } else if (activeTool === 'circle') {
        const circle = new Circle({
          left: pointer.x - 30,
          top: pointer.y - 30,
          radius: 30,
          fill: 'transparent',
          stroke: color,
          strokeWidth: 2,
        });
        fabricCanvas.add(circle);
      } else if (activeTool === 'measure') {
        if (!measureStart.current) {
          measureStart.current = { x: pointer.x, y: pointer.y };
        } else {
          const start = measureStart.current;
          const end = { x: pointer.x, y: pointer.y };
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const line = new FabricLine([start.x, start.y, end.x, end.y], {
            stroke: color,
            strokeWidth: 2,
            selectable: true,
          });
          const label = new FabricText(`${Math.round(dist)} px`, {
            left: (start.x + end.x) / 2 + 8,
            top: (start.y + end.y) / 2 + 8,
            fontSize: 14,
            fill: color,
            backgroundColor: 'rgba(255,255,255,0.7)',
          });
          fabricCanvas.add(line);
          fabricCanvas.add(label);
          measureStart.current = null;
        }
      }
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
    };
  }, [fabricCanvas, activeTool, color]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    const bg = fabricCanvas.backgroundImage;
    fabricCanvas.clear();
    if (bg) {
      fabricCanvas.set({ backgroundImage: bg as any });
      fabricCanvas.renderAll();
    }
    toast.message('Annotations cleared');
  };

  const downloadPNG = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({ format: 'png', multiplier: 1 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'annotated-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={activeTool === 'select' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTool('select')}>Select</Button>
        <Button variant={activeTool === 'draw' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTool('draw')}>Free draw</Button>
        <Button variant={activeTool === 'rectangle' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTool('rectangle')}>Rectangle</Button>
        <Button variant={activeTool === 'circle' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTool('circle')}>Circle</Button>
        <Button variant={activeTool === 'measure' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTool('measure')}>Measure</Button>
        <Separator orientation="vertical" className="h-6" />
        <input
          aria-label="Annotation color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border"
        />
        <Separator orientation="vertical" className="h-6" />
        <Button variant="secondary" size="sm" onClick={handleClear}>Clear</Button>
        <Button variant="outline" size="sm" onClick={downloadPNG}>Download PNG</Button>
      </div>
      <div className="rounded border bg-muted/30">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default AnnotationCanvas;
