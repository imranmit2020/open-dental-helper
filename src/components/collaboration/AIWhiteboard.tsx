import React, { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, FabricText } from "fabric";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, Brain, Sparkles, Zap, Wand2, Save, Download, 
  Undo, Redo, Square, Circle as CircleIcon, Type, Eraser,
  Bot, Lightbulb, Target, Image
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIInsight {
  id: string;
  type: 'suggestion' | 'analysis' | 'correction';
  message: string;
  position: { x: number; y: number };
}

export const AIWhiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [brushSize, setBrushSize] = useState([3]);
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "text" | "eraser">("select");
  const [aiAssistEnabled, setAiAssistEnabled] = useState(true);
  const [predictiveMode, setPredictiveMode] = useState(true);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [collaborators, setCollaborators] = useState([
    { id: '1', name: 'Dr. Sarah', color: '#ef4444', cursor: { x: 100, y: 100 } },
    { id: '2', name: 'Mike', color: '#10b981', cursor: { x: 200, y: 150 } },
    { id: '3', name: 'AI Assistant', color: '#8b5cf6', cursor: { x: 300, y: 200 } }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#1f2937",
    });

    // Enhanced drawing brush
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize[0];

    setFabricCanvas(canvas);
    
    // AI-powered welcome message
    setTimeout(() => {
      addAIInsight({
        id: '1',
        type: 'suggestion',
        message: '🧠 AI Whiteboard ready! Try drawing - I\'ll provide smart suggestions.',
        position: { x: 50, y: 50 }
      });
    }, 1000);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw" || activeTool === "eraser";
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeTool === "eraser" ? "#1f2937" : activeColor;
      fabricCanvas.freeDrawingBrush.width = activeTool === "eraser" ? brushSize[0] * 3 : brushSize[0];
    }

    // AI predictive drawing
    if (predictiveMode && activeTool === "draw") {
      const handleDrawing = () => {
        if (Math.random() > 0.7) { // Simulate AI prediction
          generateAIPrediction();
        }
      };
      
      fabricCanvas.on('path:created', handleDrawing);
      return () => fabricCanvas.off('path:created', handleDrawing);
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas, predictiveMode]);

  // Simulate real-time cursor tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(collab => ({
        ...collab,
        cursor: {
          x: Math.max(0, Math.min(800, collab.cursor.x + (Math.random() - 0.5) * 100)),
          y: Math.max(0, Math.min(600, collab.cursor.y + (Math.random() - 0.5) * 100))
        }
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addAIInsight = (insight: AIInsight) => {
    setAiInsights(prev => [...prev, insight]);
    setTimeout(() => {
      setAiInsights(prev => prev.filter(i => i.id !== insight.id));
    }, 5000);
  };

  const generateAIPrediction = () => {
    const predictions = [
      "💡 This looks like a tooth diagram - shall I add anatomical labels?",
      "🎯 I notice you're drawing a workflow - want me to suggest next steps?", 
      "✨ Great sketch! I can convert this to a 3D model",
      "🔍 This pattern suggests a treatment plan - adding patient data?",
      "🚀 Your drawing style is improving! Keep it up!"
    ];
    
    addAIInsight({
      id: Date.now().toString(),
      type: 'suggestion',
      message: predictions[Math.floor(Math.random() * predictions.length)],
      position: { x: Math.random() * 600, y: Math.random() * 400 }
    });
  };

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (tool === "rectangle" && fabricCanvas) {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 100,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(rect);
      
      if (aiAssistEnabled) {
        addAIInsight({
          id: Date.now().toString(),
          type: 'analysis',
          message: '📐 Perfect rectangle! AI suggests adding rounded corners for modern UI?',
          position: { x: 120, y: 80 }
        });
      }
    } else if (tool === "circle" && fabricCanvas) {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 50,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(circle);
      
      if (aiAssistEnabled) {
        addAIInsight({
          id: Date.now().toString(),
          type: 'suggestion',
          message: '⭕ Nice circle! AI detected this could be a tooth cross-section',
          position: { x: 120, y: 80 }
        });
      }
    } else if (tool === "text" && fabricCanvas) {
      const text = new FabricText('AI Enhanced Text', {
        left: 100,
        top: 100,
        fill: activeColor,
        fontSize: 20,
        fontFamily: 'Arial',
      });
      fabricCanvas.add(text);
    }

    toast({
      title: `${tool.charAt(0).toUpperCase() + tool.slice(1)} Tool Selected`,
      description: aiAssistEnabled ? "AI assistance is active" : "Manual mode",
    });
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#1f2937";
    fabricCanvas.renderAll();
    setAiInsights([]);
    toast({
      title: "Canvas Cleared",
      description: "🧠 AI is ready for your next masterpiece!",
    });
  };

  const generateAIContent = async () => {
    if (!fabricCanvas) return;
    
    // Simulate AI generating content
    const shapes = ['rectangle', 'circle', 'text'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    setTimeout(() => {
      if (shape === 'rectangle') {
        const rect = new Rect({
          left: Math.random() * 400,
          top: Math.random() * 300,
          fill: '#8b5cf6',
          width: 80,
          height: 60,
          stroke: '#8b5cf6',
          strokeWidth: 2,
          opacity: 0.7
        });
        fabricCanvas.add(rect);
      } else if (shape === 'circle') {
        const circle = new Circle({
          left: Math.random() * 400,
          top: Math.random() * 300,
          fill: '#06b6d4',
          radius: 30,
          opacity: 0.7
        });
        fabricCanvas.add(circle);
      } else {
        const text = new FabricText('AI Generated Ideas', {
          left: Math.random() * 400,
          top: Math.random() * 300,
          fill: '#f59e0b',
          fontSize: 16,
          opacity: 0.8
        });
        fabricCanvas.add(text);
      }
      
      addAIInsight({
        id: Date.now().toString(),
        type: 'suggestion',
        message: '🤖 AI added some creative elements to inspire you!',
        position: { x: 400, y: 100 }
      });
    }, 1000);

    toast({
      title: "🧠 AI Content Generation",
      description: "Generating creative elements...",
    });
  };

  const exportCanvas = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    const link = document.createElement('a');
    link.download = `ai-whiteboard-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    toast({
      title: "Canvas Exported",
      description: "Your AI-enhanced masterpiece has been saved!",
    });
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-purple-900 text-white border-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-purple-400" />
            Neural Whiteboard
            <Brain className="h-5 w-5 text-blue-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={aiAssistEnabled}
                onCheckedChange={setAiAssistEnabled}
              />
              <span className="text-sm">AI Assist</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={predictiveMode}
                onCheckedChange={setPredictiveMode}
              />
              <span className="text-sm">Predictive Mode</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool Controls */}
        <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
          <div className="flex gap-2">
            <Button
              variant={activeTool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("select")}
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("draw")}
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("rectangle")}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("circle")}
            >
              <CircleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("text")}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === "eraser" ? "destructive" : "outline"}
              size="sm"
              onClick={() => handleToolClick("eraser")}
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Color:</span>
              <input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Size:</span>
              <Slider
                value={brushSize}
                onValueChange={setBrushSize}
                max={50}
                min={1}
                step={1}
                className="w-24"
              />
              <span className="text-xs text-slate-300">{brushSize[0]}px</span>
            </div>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={generateAIContent}>
              <Bot className="h-4 w-4 mr-1" />
              AI Generate
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={exportCanvas}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Canvas Area with Real-time Cursors */}
        <div className="relative border border-purple-500 rounded-lg overflow-hidden bg-slate-800">
          <canvas ref={canvasRef} className="max-w-full" />
          
          {/* Real-time Collaborator Cursors */}
          {collaborators.map(collab => (
            <div
              key={collab.id}
              className="absolute pointer-events-none z-10 transition-all duration-300"
              style={{
                left: collab.cursor.x,
                top: collab.cursor.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: collab.color }}
              />
              <div className="text-xs mt-1 px-1 bg-black/70 rounded text-white whitespace-nowrap">
                {collab.name}
              </div>
            </div>
          ))}
          
          {/* AI Insights Overlay */}
          {aiInsights.map(insight => (
            <div
              key={insight.id}
              className="absolute z-20 animate-in fade-in-50 zoom-in-95 duration-500"
              style={{
                left: insight.position.x,
                top: insight.position.y
              }}
            >
              <div className={`max-w-xs p-3 rounded-lg shadow-lg border-2 ${
                insight.type === 'suggestion' ? 'bg-blue-900/90 border-blue-400' :
                insight.type === 'analysis' ? 'bg-purple-900/90 border-purple-400' :
                'bg-green-900/90 border-green-400'
              }`}>
                <div className="flex items-start gap-2">
                  {insight.type === 'suggestion' && <Lightbulb className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />}
                  {insight.type === 'analysis' && <Brain className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />}
                  {insight.type === 'correction' && <Zap className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />}
                  <p className="text-xs text-white">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Collaborators */}
        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Active Collaborators:</span>
            {collaborators.map(collab => (
              <Badge 
                key={collab.id} 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: collab.color, color: collab.color }}
              >
                {collab.name}
              </Badge>
            ))}
          </div>
          
          {aiAssistEnabled && (
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Sparkles className="h-3 w-3" />
              AI Neural Network Active
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};