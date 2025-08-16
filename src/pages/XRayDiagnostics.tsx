import { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Camera, Brain, AlertTriangle, CheckCircle, FileImage, Heart, Bone, Eye, Stethoscope, Activity, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useErrorLogger } from "@/hooks/useErrorLogger";
import { removeBackground, loadImage } from "@/services/BackgroundRemovalService";
import { supabase } from "@/integrations/supabase/client";
import XRayOverlay, { DetectionBox } from "@/components/XRayOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Slider } from "@/components/ui/slider";
import { jsPDF } from "jspdf";
import XRayDiagnosticsSkeleton from "@/components/XRayDiagnosticsSkeleton";

const LazyCBCTViewer = lazy(() => import("@/components/CBCTViewer"));
interface XRayFinding {
  id: string;
  type: 'cavity' | 'fracture' | 'root_infection' | 'bone_density' | 'oral_cancer' | 'periodontal_disease';
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  coordinates?: { x: number; y: number; width: number; height: number };
  treatmentSuggestion: string;
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  patientExplanation: string;
  followUpNeeded: boolean;
}

interface XRayAnalysis {
  id: string;
  imageUrl: string;
  processedImageUrl?: string;
  findings: XRayFinding[];
  overallRiskScore: number;
  boneDensityScore: number;
  oralHealthGrade: string;
  recommendations: string[];
  treatmentPlan: string[];
  patientSummary: string;
  secondOpinionRequired: boolean;
  analysisTimestamp: Date;
  aiModel: string;
  processingTime: number;
}

export default function XRayDiagnostics() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [analysis, setAnalysis] = useState<XRayAnalysis | null>(null);
  const [analysisType, setAnalysisType] = useState<string>("comprehensive");
  const [activeTab, setActiveTab] = useState("findings");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [uploadedPublicUrl, setUploadedPublicUrl] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<DetectionBox[]>([]);
  const [imgSize, setImgSize] = useState<{w:number;h:number}>({w:0,h:0});
  const [slices, setSlices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const vizImgRef = useRef<HTMLImageElement>(null);
  const [vizSize, setVizSize] = useState<{w:number;h:number}>({w:0,h:0});
  const previewContainerRef = useRef<HTMLDivElement>(null);
const vizContainerRef = useRef<HTMLDivElement>(null);
const [previewRect, setPreviewRect] = useState<{x:number;y:number;width:number;height:number}>({ x: 0, y: 0, width: 0, height: 0 });
const [vizRect, setVizRect] = useState<{x:number;y:number;width:number;height:number}>({ x: 0, y: 0, width: 0, height: 0 });
const [naturalSize, setNaturalSize] = useState<{w:number;h:number}>({ w: 0, h: 0 });
const [overlayOpacity, setOverlayOpacity] = useState<number>(0.6);
const [highlightedId, setHighlightedId] = useState<string | null>(null);
const { logAction } = useAuditLog();
const { logError } = useErrorLogger();

  // Initialize loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Normalize incoming scores to a 0–10 scale and format with one decimal
  const formatTenScale = useCallback((val: number | null | undefined) => {
    let v = Number(val ?? 0);
    if (!Number.isFinite(v)) v = 0;
    if (v <= 1) v = v * 10;           // 0..1 -> 0..10
    else if (v > 10 && v <= 100) v = v / 10; // 0..100 -> 0..10
    // else assumed already 0..10
    return `${v.toFixed(1)}/10`;
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const el = imgRef.current;
      if (!el) return;
      setImgSize({ w: el.clientWidth, h: el.clientHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const calcContainRect = useCallback((cw: number, ch: number, iw: number, ih: number) => {
    const scale = Math.min(cw / iw, ch / ih);
    const width = iw * scale;
    const height = ih * scale;
    const x = (cw - width) / 2;
    const y = (ch - height) / 2;
    return { x, y, width, height };
  }, []);

  const normalizeIncomingDet = useCallback((det: any): DetectionBox | null => {
    if (!det) return null;
    const id = String(det.id ?? `det_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    const label = String(det.label ?? det.type ?? 'finding');
    const confidence = typeof det.confidence === 'number' ? det.confidence : 0;
    const severity = det.severity as DetectionBox['severity'];

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const iw = naturalSize.w || 1; const ih = naturalSize.h || 1;
    const normX = (v: number) => {
      if (!Number.isFinite(v)) return 0;
      if (v <= 1) return clamp01(v);
      if (v <= 100) return clamp01(v / 100);
      return clamp01(v / iw);
    };
    const normY = (v: number) => {
      if (!Number.isFinite(v)) return 0;
      if (v <= 1) return clamp01(v);
      if (v <= 100) return clamp01(v / 100);
      return clamp01(v / ih);
    };

    // 1) Rect-like payloads: support multiple shapes (robust to model variations)
    // Supported keys:
    // - rect: { x,y,width,height } (top-left) OR { cx,cy,width,height } (center based) OR { center:{x,y}, width,height }
    // - bbox: { x1,y1,x2,y2 }
    // - box:  { x1,y1,x2,y2 } or { left,top,right,bottom }
    const r: any = det.rect ?? det.bbox ?? det.box ?? det.rectangle;
    if (r) {
      let x = Number(r.x);
      let y = Number(r.y);
      let w = Number(r.width);
      let h = Number(r.height);

      // Center-based variants
      const cx = Number(r.cx ?? r.center?.x);
      const cy = Number(r.cy ?? r.center?.y);
      if (Number.isFinite(cx) && Number.isFinite(cy) && Number.isFinite(w) && Number.isFinite(h)) {
        // rect provided as center + size
        x = cx - w / 2;
        y = cy - h / 2;
      }

      // x1,y1,x2,y2 variants
      const x1 = Number(r.x1 ?? r.left);
      const y1 = Number(r.y1 ?? r.top);
      const x2 = Number(r.x2 ?? r.right);
      const y2 = Number(r.y2 ?? r.bottom);
      if ([x1, y1, x2, y2].every((v) => Number.isFinite(v))) {
        x = x1; y = y1; w = x2 - x1; h = y2 - y1;
      }

      // Determine units consistently for all components
      const iw = naturalSize.w || 1;
      const ih = naturalSize.h || 1;
      const hasPixelPos = (Number.isFinite(x) && x > 1) || (Number.isFinite(y) && y > 1);
      const hasPixelSize = (Number.isFinite(w) && w > 1) || (Number.isFinite(h) && h > 1);
      const allLTE1 = [x, y, w, h].every((v) => Number.isFinite(v) && v <= 1);
      const allLTE100 = [x, y, w, h].every((v) => Number.isFinite(v) && v <= 100);

      let nx: number, ny: number, nw: number, nh: number;
      if (hasPixelPos || hasPixelSize) {
        // Treat everything as pixels
        nx = clamp01(x / iw);
        ny = clamp01(y / ih);
        nw = Math.abs(w / iw);
        nh = Math.abs(h / ih);
      } else if (!allLTE1 && allLTE100) {
        // Treat as percentages (0..100)
        nx = clamp01(x / 100);
        ny = clamp01(y / 100);
        nw = Math.abs(w / 100);
        nh = Math.abs(h / 100);
      } else {
        // Already normalized (0..1)
        nx = clamp01(x);
        ny = clamp01(y);
        nw = Math.abs(w);
        nh = Math.abs(h);
      }

      // Ensure within bounds
      if (nx + nw > 1) nw = Math.max(0, 1 - nx);
      if (ny + nh > 1) nh = Math.max(0, 1 - ny);

      return { id, label, confidence, severity, rect: { x: nx, y: ny, width: nw, height: nh } };
    }

    // 2) Polygon-like payloads: support poly | polygon | points
    const pts: any[] = det.poly ?? det.polygon ?? det.points;
    if (Array.isArray(pts) && pts.length >= 3) {
      const poly = pts.map((p: any) => {
        const px = normX(Number(p.x ?? p[0]));
        const py = normY(Number(p.y ?? p[1]));
        return { x: clamp01(px), y: clamp01(py) };
      });
      return { id, label, confidence, severity, poly };
    }

    return null;
  }, [naturalSize]);

  useEffect(() => {
    const recalc = () => {
      const cont = previewContainerRef.current;
      if (cont && naturalSize.w && naturalSize.h) {
        const r = calcContainRect(cont.clientWidth, cont.clientHeight, naturalSize.w, naturalSize.h);
        setPreviewRect(r);
      }
      const cont2 = vizContainerRef.current;
      if (cont2 && naturalSize.w && naturalSize.h) {
        const r2 = calcContainRect(cont2.clientWidth, cont2.clientHeight, naturalSize.w, naturalSize.h);
        setVizRect(r2);
      }
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [naturalSize, selectedImage, analysis, calcContainRect]);

const makeOverlayBoxes = useCallback(() => {
  const out: DetectionBox[] = [...boxes];
  if (analysis) {
    const iw = naturalSize.w || 1;
    const ih = naturalSize.h || 1;
    for (const f of analysis.findings) {
      if (f.coordinates) {
        out.push({
          id: `analysis-${f.id}`,
          label: f.type.replace('_', ' '),
          confidence: f.confidence,
          severity: f.severity,
          rect: (() => {
            const c = f.coordinates!;
            const isNorm = c.width <= 1 && c.height <= 1 && c.x <= 1 && c.y <= 1;
            const nx = isNorm ? c.x : c.x / iw;
            const ny = isNorm ? c.y : c.y / ih;
            const nw = isNorm ? c.width : c.width / iw;
            const nh = isNorm ? c.height : c.height / ih;
            const x = Math.min(1, Math.max(0, nx));
            const y = Math.min(1, Math.max(0, ny));
            const width = Math.min(1 - x, Math.max(0, nw));
            const height = Math.min(1 - y, Math.max(0, nh));
            return { x, y, width, height };
          })(),
        });
      }
    }
  }
  return out;
}, [boxes, analysis, naturalSize]);

const previewOverlayBoxes = useMemo(() => makeOverlayBoxes(), [makeOverlayBoxes]);

const vizOverlayBoxes = useMemo(() => makeOverlayBoxes(), [makeOverlayBoxes]);
  // Advanced AI-powered analysis generator
  const generateComprehensiveAnalysis = (imageData: string, type: string): XRayAnalysis => {
    const analysisTypes = {
      comprehensive: "Full spectrum dental analysis",
      cavity: "Cavity detection focus",
      periodontal: "Gum disease assessment", 
      cancer: "Oral cancer screening",
      orthodontic: "Bite and alignment analysis"
    };

    const mockFindings: XRayFinding[] = [
      {
        id: "finding_1",
        type: "cavity",
        confidence: 94,
        severity: "high",
        location: "Upper right first molar (#3)",
        description: "Large proximal cavity with potential pulp involvement detected",
        coordinates: { x: 320, y: 180, width: 45, height: 35 },
        treatmentSuggestion: "Root canal therapy followed by crown placement",
        urgency: "urgent",
        patientExplanation: "We found a large cavity in your upper right back tooth that needs immediate attention to save the tooth.",
        followUpNeeded: true
      },
      {
        id: "finding_2", 
        type: "root_infection",
        confidence: 87,
        severity: "medium",
        location: "Lower left premolar (#20)",
        description: "Periapical radiolucency suggestive of chronic infection",
        coordinates: { x: 180, y: 280, width: 25, height: 30 },
        treatmentSuggestion: "Endodontic evaluation and possible root canal treatment",
        urgency: "soon",
        patientExplanation: "There's an infection around the root of your lower left tooth that needs treatment to prevent it from spreading.",
        followUpNeeded: true
      },
      {
        id: "finding_3",
        type: "bone_density",
        confidence: 82,
        severity: "medium",
        location: "Posterior mandible",
        description: "Mild generalized bone loss consistent with early periodontal disease",
        treatmentSuggestion: "Deep cleaning (scaling and root planing) and enhanced oral hygiene",
        urgency: "routine",
        patientExplanation: "We see some bone loss around your teeth which suggests gum disease in its early stages.",
        followUpNeeded: true
      },
      {
        id: "finding_4",
        type: "fracture",
        confidence: 76,
        severity: "low",
        location: "Upper left lateral incisor (#10)",
        description: "Hairline fracture visible in enamel layer",
        treatmentSuggestion: "Monitor closely, consider composite restoration if progression occurs",
        urgency: "routine",
        patientExplanation: "There's a small crack in one of your front teeth that we'll keep an eye on.",
        followUpNeeded: false
      }
    ];

    return {
      id: `analysis_${Date.now()}`,
      imageUrl: imageData,
      processedImageUrl: imageData, // Would be replaced with actual processed image
      findings: mockFindings,
      overallRiskScore: 7.2,
      boneDensityScore: 6.8,
      oralHealthGrade: "C+",
      recommendations: [
        "Schedule urgent appointment for tooth #3 root canal therapy",
        "Begin periodontal treatment with deep cleaning",
        "Implement enhanced oral hygiene routine with antimicrobial rinse",
        "Follow-up X-rays in 6 months to monitor progression",
        "Consider night guard to prevent further fractures"
      ],
      treatmentPlan: [
        "Phase 1: Emergency treatment for infected tooth #3 (1-2 weeks)",
        "Phase 2: Deep cleaning and periodontal therapy (2-4 weeks)", 
        "Phase 3: Restorative work and crown placement (4-6 weeks)",
        "Phase 4: Maintenance and monitoring (ongoing)"
      ],
      patientSummary: "Your X-ray shows some areas that need attention, including a cavity that requires prompt treatment and early signs of gum disease. With proper treatment, we can address these issues and maintain your oral health.",
      secondOpinionRequired: true,
      analysisTimestamp: new Date(),
      aiModel: "DentalAI-GPT-4V-Enhanced",
      processingTime: 2.3
    };
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const first = files[0];
        const urls = Array.from(files).map((f) => URL.createObjectURL(f));

        logAction({
          action: 'xray_image_uploaded',
          resource_type: 'image_analyses',
          details: {
            files_count: files.length,
            file_name: first.name,
            file_size: first.size,
            file_type: first.type
          }
        });

        setSlices(urls);
        const imageUrl = urls[0];
        setSelectedImage(imageUrl);
        setSelectedFile(first);
        setAnalysis(null);
        setBoxes([]);
        setStreamText("");

        // Auto-process only the first image for better analysis
        setIsProcessingImage(true);
        try {
          const img = await loadImage(first);
          const processedBlob = await removeBackground(img);
          // const processedUrl = URL.createObjectURL(processedBlob); // reserved for future use
          toast.success("Image processed and enhanced for analysis");
          logAction({
            action: 'xray_image_processed',
            resource_type: 'image_analyses',
            details: { processing_successful: true }
          });
        } catch (error) {
          logError(error instanceof Error ? error : new Error(String(error)), {
            context: 'X-ray image processing failed'
          });
          toast.error("Image processing failed, using original image");
        } finally {
          setIsProcessingImage(false);
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          context: 'X-ray image upload failed'
        });
        toast.error("Failed to upload image");
      }
    }
  };

  // Uploads image to Supabase storage and returns a public URL for analysis
  const uploadImageIfNeeded = async (): Promise<string> => {
    if (uploadedPublicUrl) return uploadedPublicUrl;
    if (!selectedFile) throw new Error("No file selected");

    const fileExt = selectedFile.name.split('.').pop() || 'png';
    const path = `xray/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error } = await supabase.storage.from('analyses').upload(path, selectedFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: selectedFile.type || 'image/png',
    });
    if (error) throw error;

    const { data: pub } = supabase.storage.from('analyses').getPublicUrl(data.path);
    setUploadedPublicUrl(pub.publicUrl);
    return pub.publicUrl;
  };

  const analyzeImageRealtime = async () => {
    if (!selectedFile && !uploadedPublicUrl) {
      toast.error("Please upload an X-ray image first");
      return;
    }

    try {
      setIsStreaming(true);
      setStreamText("");
      const publicUrl = await uploadImageIfNeeded();

      logAction({
        action: 'xray_ai_realtime_started',
        resource_type: 'image_analyses',
        details: { analysis_type: analysisType }
      });

      const resp = await fetch(
        `https://nqrwtihwuvyfucmbcsem.functions.supabase.co/functions/v1/xray-stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: publicUrl, analysisType }),
        }
      );

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start streaming analysis');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE lines
        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.replace(/^data:\s*/, '');
          if (payload === "[DONE]") {
            setIsStreaming(false);
            toast.success('Real-time analysis completed');
            logAction({ action: 'xray_ai_realtime_completed', resource_type: 'image_analyses' });
            break;
          }
          try {
            const json = JSON.parse(payload);
            const choice = json.choices?.[0];
            const delta = choice?.delta;
            // Handle both string content and content array shapes
            if (typeof delta?.content === 'string') {
              // Parse for prefixed lines
              const text = delta.content;
              setStreamText(prev => prev + text);
              for (const rawLine of text.split('\n')) {
                const line = rawLine.trim();
                if (line.startsWith('DETECTION:')) {
                  try {
                    const jsonStr = line.replace(/^DETECTION:\s*/, '');
                    const det = JSON.parse(jsonStr);
                    const norm = normalizeIncomingDet(det);
                    if (norm) {
                      setBoxes(prev => {
                        const exists = prev.some(p => p.id === norm.id);
                        const next = exists ? prev.map(p => p.id === norm.id ? norm : p) : [...prev, norm];
                        return next;
                      });
                    }
                  } catch {}
                } else if (line.startsWith('DETECTION_POLY:')) {
                  try {
                    const jsonStr = line.replace(/^DETECTION_POLY:\s*/, '');
                    const det = JSON.parse(jsonStr);
                    const norm = normalizeIncomingDet(det);
                    if (norm) {
                      setBoxes(prev => {
                        const exists = prev.some(p => p.id === norm.id);
                        const next = exists ? prev.map(p => p.id === norm.id ? norm : p) : [...prev, norm];
                        return next;
                      });
                    }
                  } catch {}
                } else if (line.startsWith('FINDING:')) {
                  try {
                    const jsonStr = line.replace(/^FINDING:\s*/, '');
                    const f = JSON.parse(jsonStr);
                    setAnalysis(prev => {
                      const base = prev ?? {
                        id: `stream_${Date.now()}`,
                        imageUrl: selectedImage || uploadedPublicUrl || '',
                        processedImageUrl: undefined,
                        findings: [],
                        overallRiskScore: 0,
                        boneDensityScore: 0,
                        oralHealthGrade: '',
                        recommendations: [],
                        treatmentPlan: [],
                        patientSummary: '',
                        secondOpinionRequired: false,
                        analysisTimestamp: new Date(),
                        aiModel: 'streaming-xray',
                        processingTime: 0,
                      } as XRayAnalysis;
                      const exists = base.findings.some(x => x.id === f.id);
                      const nextFindings = exists
                        ? base.findings.map(x => x.id === f.id ? { ...x, ...f } : x)
                        : [...base.findings, f];
                      return { ...base, findings: nextFindings } as XRayAnalysis;
                    });
                  } catch {}
                }
              }
            } else if (Array.isArray(delta?.content)) {
              for (const part of delta.content) {
                if (typeof part === 'string') {
                  setStreamText(prev => prev + part);
                } else if (part?.type === 'text' && part?.text) {
                  setStreamText(prev => prev + part.text);
                }
              }
            }
          } catch (e) {
            // Non-JSON keep-alive or other line; ignore
          }
        }
      }

      setIsStreaming(false);
    } catch (error) {
      setIsStreaming(false);
      logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'X-ray realtime analysis failed'
      });
      toast.error('Realtime analysis failed');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error("Please upload an X-ray image first");
      return;
    }

    setIsAnalyzing(true);
    const startTime = Date.now();
    
    try {
      logAction({
        action: 'xray_ai_analysis_started',
        resource_type: 'image_analyses',
        details: {
          analysis_type: analysisType,
          image_size: selectedFile?.size
        }
      });

      const publicUrl = await uploadImageIfNeeded();
      const { data, error } = await supabase.functions.invoke('xray-analyze', {
        body: { imageUrl: publicUrl, analysisType }
      });
      if (error) throw error;

      const processingTime = (Date.now() - startTime) / 1000;

      const result = data as any;
      const analysisResult: XRayAnalysis = {
        id: result.id || `analysis_${Date.now()}`,
        imageUrl: result.imageUrl || publicUrl,
        processedImageUrl: result.processedImageUrl,
        findings: (result.findings || []).map((f: any) => ({
          id: f.id,
          type: f.type,
          confidence: f.confidence <= 1 ? Math.round(f.confidence * 100) : Math.round(f.confidence),
          severity: f.severity,
          location: f.location,
          description: f.description,
          coordinates: f.coordinates,
          treatmentSuggestion: f.treatmentSuggestion,
          urgency: f.urgency,
          patientExplanation: f.patientExplanation,
          followUpNeeded: !!f.followUpNeeded,
        })),
        overallRiskScore: result.overallRiskScore ?? 0,
        boneDensityScore: result.boneDensityScore ?? 0,
        oralHealthGrade: result.oralHealthGrade ?? '',
        recommendations: result.recommendations ?? [],
        treatmentPlan: result.treatmentPlan ?? [],
        patientSummary: result.patientSummary ?? '',
        secondOpinionRequired: !!result.secondOpinionRequired,
        analysisTimestamp: new Date(),
        aiModel: result.aiModel || 'gpt-4.1-2025-04-14',
        processingTime
      };

      setAnalysis(analysisResult);
      setIsAnalyzing(false);
      setActiveTab('findings');

      logAction({
        action: 'xray_ai_analysis_completed',
        resource_type: 'image_analyses',
        details: {
          analysis_type: analysisType,
          findings_count: analysisResult.findings.length,
          risk_score: analysisResult.overallRiskScore,
          second_opinion_required: analysisResult.secondOpinionRequired,
          processing_time: processingTime
        }
      });

      toast.success(`AI analysis completed in ${processingTime.toFixed(1)}s`);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'X-ray AI analysis failed'
      });
      setIsAnalyzing(false);
      toast.error("Analysis failed. Please try again.");
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: XRayFinding['type']) => {
    switch (type) {
      case 'cavity': return <FileImage className="w-4 h-4" />;
      case 'fracture': return <AlertTriangle className="w-4 h-4" />;
      case 'root_infection': return <Heart className="w-4 h-4" />;
      case 'bone_density': return <Bone className="w-4 h-4" />;
      case 'oral_cancer': return <Eye className="w-4 h-4" />;
      case 'periodontal_disease': return <Activity className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: XRayFinding['urgency']) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'soon': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'routine': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const downloadReport = async () => {
    if (!analysis) return;

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let y = 40;

      // Header
      doc.setFontSize(16);
      doc.text('Dental X-ray AI Report', 40, y); y += 24;
      doc.setFontSize(10);
      doc.text(`Report ID: ${analysis.id}`, 40, y); y += 16;
      doc.text(`Model: ${analysis.aiModel}`, 40, y); y += 16;
      doc.text(`Timestamp: ${new Date(analysis.analysisTimestamp).toLocaleString()}`, 40, y); y += 24;

      // Scores
      doc.setFontSize(12);
      doc.text(`Overall Risk: ${formatTenScale(analysis.overallRiskScore)}`, 40, y); y += 16;
      doc.text(`Bone Density: ${formatTenScale(analysis.boneDensityScore)}`, 40, y); y += 24;

      // Findings
      doc.setFontSize(14);
      doc.text('Findings', 40, y); y += 18;
      doc.setFontSize(11);
      (analysis.findings || []).forEach((f, idx) => {
        const lines = [
          `${idx + 1}. ${f.type.replace('_', ' ')} — ${f.severity} — ${Math.round(f.confidence)}%`,
          `Location: ${f.location}`,
          `Desc: ${f.description}`,
          `Treatment: ${f.treatmentSuggestion} | Urgency: ${f.urgency}`,
        ];
        lines.forEach((line) => {
          doc.text(line, 40, y);
          y += 14;
          if (y > 780) { doc.addPage(); y = 40; }
        });
        y += 6;
      });

      // Recommendations
      if (analysis.recommendations?.length) {
        if (y > 740) { doc.addPage(); y = 40; }
        doc.setFontSize(14);
        doc.text('Recommendations', 40, y); y += 18;
        doc.setFontSize(11);
        analysis.recommendations.forEach((rec) => {
          doc.text(`• ${rec}`, 40, y);
          y += 14;
          if (y > 780) { doc.addPage(); y = 40; }
        });
      }

      // Patient summary
      if (analysis.patientSummary) {
        doc.addPage(); y = 40;
        doc.setFontSize(14);
        doc.text('Patient Summary', 40, y); y += 18;
        doc.setFontSize(11);
        const wrapped = doc.splitTextToSize(analysis.patientSummary, 515);
        wrapped.forEach((line) => {
          doc.text(line, 40, y);
          y += 14;
          if (y > 780) { doc.addPage(); y = 40; }
        });
      }

      // Save
      doc.save(`xray-report-${analysis.id}.pdf`);

      // Analytics + UX
      logAction({
        action: 'xray_report_downloaded',
        resource_type: 'image_analyses',
        details: { analysis_id: analysis.id },
      });
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to generate report');
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'generate_report' });
    }
  };

  const shareReport = () => {
    if (!analysis) return;
    
    logAction({
      action: 'xray_report_shared',
      resource_type: 'image_analyses', 
      details: { analysis_id: analysis.id }
    });
    
    toast.success("Report sharing link copied");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">AI X-Ray & 3D Scan Analysis</h1>
        <p className="text-lg text-muted-foreground">
          Advanced AI detection of cavities, fractures, root infections, bone density, and early oral cancer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              X-Ray Image Upload & Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Analysis Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Type</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  <SelectItem value="cavity">Cavity Detection</SelectItem>
                  <SelectItem value="periodontal">Periodontal Disease</SelectItem>
                  <SelectItem value="cancer">Oral Cancer Screening</SelectItem>
                  <SelectItem value="orthodontic">Orthodontic Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {selectedImage ? (
                <div className="space-y-4">
                  <div ref={previewContainerRef} className="relative max-w-full h-64 mx-auto rounded overflow-hidden bg-background">
                    <img 
                      ref={imgRef}
                      src={selectedImage} 
                      alt="X-ray" 
                      className="absolute inset-0 w-full h-full object-contain"
                      onLoad={() => {
                        const el = imgRef.current; const cont = previewContainerRef.current;
                        if (el && cont) {
                          setImgSize({ w: el.clientWidth, h: el.clientHeight });
                          setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
                          const r = calcContainRect(cont.clientWidth, cont.clientHeight, el.naturalWidth, el.naturalHeight);
                          setPreviewRect(r);
                        }
                      }}
                    />
                    {previewOverlayBoxes.length > 0 && (
                      <XRayOverlay boxes={previewOverlayBoxes} width={previewRect.width} height={previewRect.height} offsetX={previewRect.x} offsetY={previewRect.y} opacity={overlayOpacity} highlightedId={highlightedId ?? undefined} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">X-ray image uploaded successfully</p>
                    {isProcessingImage && (
                      <div className="flex items-center justify-center gap-2">
                        <Brain className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing image...</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileImage className="w-16 h-16 mx-auto text-gray-400" />
                  <p className="text-lg font-medium">Upload X-ray or 3D Scan</p>
                  <p className="text-sm text-muted-foreground">
                    Supports DICOM, JPEG, PNG formats • Max 50MB
                  </p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.dcm"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="xray-upload"
            />
            <label htmlFor="xray-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Choose Medical Image
                </span>
              </Button>
            </label>

            <Button 
              onClick={analyzeImage} 
              disabled={!selectedImage || isAnalyzing || isProcessingImage || isStreaming}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start AI Analysis
                </>
              )}
            </Button>

            <Button 
              onClick={analyzeImageRealtime}
              disabled={!selectedImage || isProcessingImage || isStreaming}
              variant="secondary"
              className="w-full"
            >
              {isStreaming ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Real-time AI (streaming)...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Real-time AI (Stream)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Analysis Results
                {analysis?.secondOpinionRequired && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Second Opinion Required
                  </Badge>
                )}
              </CardTitle>
              {analysis && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={downloadReport}>
                    <Download className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                  <Button size="sm" variant="outline" onClick={shareReport}>
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!analysis ? (
              streamText || isStreaming ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-medium">Live analysis stream</span>
                  </div>
                  <div className="rounded-md border p-4 text-left h-48 overflow-auto bg-muted/30">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">{streamText}</pre>
                  </div>
                  {isStreaming && (
                    <p className="text-xs text-muted-foreground">Streaming... you can keep browsing.</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload an X-ray image and start AI analysis to detect:</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Cavities & Decay
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      Fractures
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Root Infections
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      Bone Density
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Oral Cancer
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Gum Disease
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-6">
                {/* Health Score Dashboard */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-muted-foreground">Overall Risk</p>
                    <p className="text-2xl font-bold text-blue-700">{formatTenScale(analysis.overallRiskScore)}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <p className="text-sm text-muted-foreground">Bone Density</p>
                    <p className="text-2xl font-bold text-green-700">{formatTenScale(analysis.boneDensityScore)}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                    <p className="text-sm text-muted-foreground">Oral Health</p>
                    <p className="text-2xl font-bold text-purple-700">{analysis.oralHealthGrade}</p>
                  </div>
                </div>

                {/* Analysis Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="findings">Findings</TabsTrigger>
                    <TabsTrigger value="treatment">Treatment</TabsTrigger>
                    <TabsTrigger value="patient">Patient View</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="viewer3d">3D Viewer</TabsTrigger>
                  </TabsList>

                  <TabsContent value="findings" className="mt-4 space-y-4">
                    {analysis.findings.map((finding) => (
                      <div key={finding.id} className="border rounded-lg p-4" onMouseEnter={() => setHighlightedId(`analysis-${finding.id}`)} onMouseLeave={() => setHighlightedId(null)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(finding.type)}
                            <span className="font-medium capitalize">{finding.type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(finding.severity)}>
                              {finding.severity}
                            </Badge>
                            <Badge variant="outline">{finding.confidence}% confidence</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">{finding.location}</p>
                          <p className="text-sm">{finding.description}</p>
                          <div className={`text-xs px-2 py-1 rounded border ${getUrgencyColor(finding.urgency)}`}>
                            Urgency: {finding.urgency}
                          </div>
                          <Progress value={finding.confidence} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="treatment" className="mt-4 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Treatment Recommendations</h4>
                        <div className="space-y-2">
                          {analysis.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Treatment Plan Phases</h4>
                        <div className="space-y-2">
                          {analysis.treatmentPlan.map((phase, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                                {index + 1}
                              </div>
                              <span className="text-sm">{phase}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="patient" className="mt-4 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-blue-800">Patient Summary</h4>
                      <p className="text-sm text-blue-700">{analysis.patientSummary}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Easy-to-Understand Explanations</h4>
                      {analysis.findings.map((finding) => (
                        <div key={finding.id} className="border-l-4 border-blue-400 pl-4 py-2">
                          <h5 className="font-medium text-sm capitalize">{finding.type.replace('_', ' ')}</h5>
                          <p className="text-sm text-muted-foreground">{finding.patientExplanation}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            Suggested: {finding.treatmentSuggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">AI Model</label>
                        <p className="text-sm text-muted-foreground">{analysis.aiModel}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Processing Time</label>
                        <p className="text-sm text-muted-foreground">{analysis.processingTime}s</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Analysis Date</label>
                        <p className="text-sm text-muted-foreground">
                          {analysis.analysisTimestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Analysis ID</label>
                        <p className="text-sm text-muted-foreground font-mono">{analysis.id}</p>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Detection Coordinates</h4>
                      <div className="space-y-2">
                        {analysis.findings.filter(f => f.coordinates).map((finding) => (
                          <div key={finding.id} className="text-xs font-mono bg-gray-50 p-2 rounded">
                            {finding.type}: x:{finding.coordinates?.x}, y:{finding.coordinates?.y}, 
                            w:{finding.coordinates?.width}, h:{finding.coordinates?.height}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="viewer3d" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">CBCT 3D Viewer (MVP)</h4>
                      <p className="text-sm text-muted-foreground">Use mouse to rotate/zoom. Drag the slice slider to browse images. DICOM stack import coming soon.</p>
                    </div>
                    <ErrorBoundary fallback={<div className="h-[380px] w-full rounded border bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">3D viewer failed to load. Please reload.</div>}>
                      <Suspense fallback={<div className="h-[380px] w-full rounded border bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">Loading 3D viewer…</div>}>
                        <LazyCBCTViewer slices={slices.length ? slices : (selectedImage ? [selectedImage] : [])} />
                      </Suspense>
                    </ErrorBoundary>
                  </TabsContent>
                </Tabs>
              </div>
)
            }
            </CardContent>
          </Card>
      </div>

      {/* Color-coded Overlay Demo */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Patient-Friendly Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-3">X-ray with color-coded overlay</h4>
                <div ref={vizContainerRef} className="relative max-w-full h-72 mx-auto rounded overflow-hidden bg-background">
                  <img
                    ref={vizImgRef}
                    src={selectedImage || analysis.imageUrl}
                    alt="Dental X-ray with AI overlay highlighting findings"
                    className="absolute inset-0 w-full h-full object-contain"
                    onLoad={() => {
                      const el = vizImgRef.current; const cont = vizContainerRef.current;
                      if (el && cont) {
                        setVizSize({ w: el.clientWidth, h: el.clientHeight });
                        setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
                        const r = calcContainRect(cont.clientWidth, cont.clientHeight, el.naturalWidth, el.naturalHeight);
                        setVizRect(r);
                      }
                    }}
                  />
                  {vizOverlayBoxes.length > 0 && (
                    <XRayOverlay boxes={vizOverlayBoxes} width={vizRect.width} height={vizRect.height} offsetX={vizRect.x} offsetY={vizRect.y} opacity={overlayOpacity} highlightedId={highlightedId ?? undefined} />
                  )}
                </div>
                <div className="mt-3 flex flex-col items-center gap-3">
                  <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--destructive))' }}></span><span className="text-xs">Critical</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--ring))' }}></span><span className="text-xs">High</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--primary))' }}></span><span className="text-xs">Medium</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--accent))' }}></span><span className="text-xs">Low</span></div>
                  </div>
                  <div className="w-full flex items-center justify-center gap-2">
                    <span className="text-xs text-muted-foreground">Overlay opacity</span>
                    <div className="w-56">
                      <Slider value={[Math.round(overlayOpacity*100)]} onValueChange={(v) => setOverlayOpacity(((v?.[0] ?? 60) as number) / 100)} />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">What this means</h4>
                <div className="space-y-3">
                  {analysis.findings.map((f) => (
                    <div key={f.id} className="border-l-4 pl-3 py-2" onMouseEnter={() => setHighlightedId(`analysis-${f.id}`)} onMouseLeave={() => setHighlightedId(null)}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{f.type.replace('_', ' ')}</span>
                        <Badge variant="outline">{f.confidence}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{f.patientExplanation}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className={getSeverityColor(f.severity)}>{f.severity}</Badge>
                        <span className={`text-xs px-2 py-1 rounded border ${getUrgencyColor(f.urgency)}`}>Urgency: {f.urgency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}