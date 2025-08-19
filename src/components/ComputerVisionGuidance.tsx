import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProcedureGuidance, useNextGenAI } from '@/hooks/useNextGenAI';
import { Eye, Camera, Play, Square, AlertTriangle, CheckCircle, Target } from 'lucide-react';

export const ComputerVisionGuidance: React.FC = () => {
  const { procedureGuidance, activeGuidanceSession, startProcedureGuidance, stopProcedureGuidance } = useNextGenAI();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState('Root Canal Treatment');

  const procedures = [
    'Root Canal Treatment',
    'Crown Preparation',
    'Dental Implant Placement',
    'Periodontal Surgery',
    'Tooth Extraction',
    'Composite Restoration'
  ];

  const activeGuidance = procedureGuidance.find(g => g.id === activeGuidanceSession);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopVideoStream = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const startGuidance = async () => {
    await startVideoStream();
    await startProcedureGuidance(selectedProcedure);
  };

  const stopGuidance = () => {
    if (activeGuidanceSession) {
      stopProcedureGuidance(activeGuidanceSession);
    }
    stopVideoStream();
  };

  // Draw annotations on canvas
  useEffect(() => {
    if (activeGuidance && canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw annotations
      activeGuidance.visual_annotations.forEach(annotation => {
        ctx.strokeStyle = annotation.type === 'warning' ? '#ef4444' : 
                         annotation.type === 'highlight' ? '#22c55e' : 
                         annotation.type === 'guide' ? '#3b82f6' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);

        // Draw confidence text
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '12px Arial';
        ctx.fillText(
          `${annotation.message} (${Math.round(annotation.confidence * 100)}%)`,
          annotation.x,
          annotation.y - 5
        );
      });
    }
  }, [activeGuidance]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Computer Vision Procedure Guidance</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Video Stream & Controls */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Live Video Feed
            </CardTitle>
            <CardDescription>
              AI-powered real-time procedure guidance and annotation
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Video Container */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-64 object-cover"
                style={{ display: isStreaming ? 'block' : 'none' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ display: isStreaming && activeGuidance ? 'block' : 'none' }}
              />
              {!isStreaming && (
                <div className="w-full h-64 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Camera feed will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Procedure Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Procedure</label>
              <select
                value={selectedProcedure}
                onChange={(e) => setSelectedProcedure(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={!!activeGuidanceSession}
              >
                {procedures.map(procedure => (
                  <option key={procedure} value={procedure}>{procedure}</option>
                ))}
              </select>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {!activeGuidanceSession ? (
                <Button onClick={startGuidance} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start AI Guidance
                </Button>
              ) : (
                <Button onClick={stopGuidance} variant="destructive" className="flex-1">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Guidance
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Guidance Panel */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Real-Time Guidance</CardTitle>
            <CardDescription>
              AI-powered step-by-step procedure assistance
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {activeGuidance ? (
              <>
                {/* Procedure Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{activeGuidance.procedure_name}</h3>
                    <Badge className={getRiskColor(activeGuidance.risk_level)}>
                      {activeGuidance.risk_level} risk
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Step {activeGuidance.current_step} of {activeGuidance.total_steps}</span>
                      <span>{Math.round((activeGuidance.current_step / activeGuidance.total_steps) * 100)}%</span>
                    </div>
                    <Progress value={(activeGuidance.current_step / activeGuidance.total_steps) * 100} />
                  </div>

                  {/* Confidence Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Confidence</span>
                      <span>{Math.round(activeGuidance.confidence_score * 100)}%</span>
                    </div>
                    <Progress value={activeGuidance.confidence_score * 100} className="h-2" />
                  </div>
                </div>

                {/* Current Guidance */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Current Guidance</h4>
                  <p className="text-blue-800 text-sm">{activeGuidance.guidance_text}</p>
                </div>

                {/* Next Action */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Next Recommended Action
                  </h4>
                  <p className="text-green-800 text-sm">{activeGuidance.next_recommended_action}</p>
                </div>

                {/* Time Estimate */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Estimated completion:</span>
                  <span className="font-medium">{activeGuidance.estimated_completion}</span>
                </div>

                {/* Visual Annotations Summary */}
                {activeGuidance.visual_annotations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Active Annotations</h4>
                    <div className="space-y-1">
                      {activeGuidance.visual_annotations.map(annotation => (
                        <div key={annotation.id} className="flex items-center gap-2 text-xs">
                          {annotation.type === 'warning' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          {annotation.type === 'highlight' && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {annotation.type === 'guide' && <Target className="h-3 w-3 text-blue-500" />}
                          <span>{annotation.message}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(annotation.confidence * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start AI guidance to see real-time procedure assistance</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Guidance Sessions */}
      {procedureGuidance.length > 0 && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Recent Guidance Sessions</CardTitle>
            <CardDescription>
              History of AI-guided procedures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {procedureGuidance.slice(0, 3).map(guidance => (
                <div key={guidance.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{guidance.procedure_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Step {guidance.current_step}/{guidance.total_steps} • 
                      Confidence: {Math.round(guidance.confidence_score * 100)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(guidance.risk_level)}>
                      {guidance.risk_level}
                    </Badge>
                    {guidance.id === activeGuidanceSession && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};