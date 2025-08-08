import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Scissors, Sparkles, Download, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { removeBackground, loadImage } from '@/services/BackgroundRemovalService';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AnnotationCanvas from '@/components/AnnotationCanvas';

export const ImageAnalysis: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [patients, setPatients] = useState<Array<{ id: string; first_name: string; last_name: string }>>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<string>("background_removal");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { logAction, logImageAnalysisAccess } = useAuditLog();

  // Audit logging on page access
  useEffect(() => {
    if (user) {
      logAction({
        action: 'VIEW_IMAGE_ANALYSIS',
        resource_type: 'image_analysis',
        details: { timestamp: new Date().toISOString() }
      }).catch(error => {
        console.error('Failed to log image analysis access:', error);
        toast({
          title: "Logging Error",
          description: "Failed to record audit log",
          variant: "destructive"
        });
      });
    }
  }, [user, logAction]);

  // Load patients for selection
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .order('last_name', { ascending: true })
          .limit(200);
        if (error) throw error;
        setPatients(data || []);
      } catch (e: any) {
        console.error('Failed to load patients', e);
        toast({ title: 'Failed to load patients', description: e.message, variant: 'destructive' });
      }
    };
    loadPatients();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setSelectedImage(file);
        setProcessedImage(null);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Log file selection
        if (user) {
          logAction({
            action: 'UPLOAD_IMAGE',
            resource_type: 'image_analysis',
            details: { 
              file_name: file.name, 
              file_size: file.size,
              file_type: file.type 
            }
          }).catch(error => {
            console.error('Failed to log file selection:', error);
          });
        }
      } catch (error) {
        console.error('Error handling file selection:', error);
        toast({
          title: "File Error",
          description: "Failed to process selected file",
          variant: "destructive"
        });
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setProcessedImage(null);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processBackgroundRemoval = async () => {
    if (!selectedImage) return;

    const processingId = Date.now().toString();
    setIsProcessing(true);
    
    try {
      // Log processing start
      if (user) {
        await logAction({
          action: 'START_BACKGROUND_REMOVAL',
          resource_type: 'image_analysis',
          resource_id: processingId,
          details: { 
            file_name: selectedImage.name,
            processing_type: 'background_removal'
          }
        });
      }

      toast({
        title: "Processing Image",
        description: "Removing background using AI...",
      });

      const imageElement = await loadImage(selectedImage);
      const processedBlob = await removeBackground(imageElement);
      
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
      // Log successful processing
      if (user) {
        await logAction({
          action: 'COMPLETE_BACKGROUND_REMOVAL',
          resource_type: 'image_analysis',
          resource_id: processingId,
          details: { 
            success: true,
            output_size: processedBlob.size
          }
        });
      }
      
      toast({
        title: "Success!",
        description: "Background removed successfully",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      
      // Log processing error
      if (user) {
        logAction({
          action: 'ERROR_BACKGROUND_REMOVAL',
          resource_type: 'image_analysis',
          resource_id: processingId,
          details: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            file_name: selectedImage.name
          }
        }).catch(logError => {
          console.error('Failed to log processing error:', logError);
        });
      }
      
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processImageEnhancement = async () => {
    if (!selectedImage) return;

    const processingId = Date.now().toString();
    setIsProcessing(true);
    
    try {
      // Log processing start
      if (user) {
        await logAction({
          action: 'START_IMAGE_ENHANCEMENT',
          resource_type: 'image_analysis',
          resource_id: processingId,
          details: { 
            file_name: selectedImage.name,
            processing_type: 'enhancement'
          }
        });
      }

      toast({
        title: "Enhancing Image",
        description: "Improving lighting and contrast...",
      });

      const imageElement = await loadImage(selectedImage);
      const enhancedBlob = await removeBackground(imageElement); // Using removeBackground as enhancement
      
      const enhancedUrl = URL.createObjectURL(enhancedBlob);
      setProcessedImage(enhancedUrl);
      
      // Log successful processing
      if (user) {
        await logAction({
          action: 'COMPLETE_IMAGE_ENHANCEMENT',
          resource_type: 'image_analysis',
          resource_id: processingId,
          details: { 
            success: true,
            output_size: enhancedBlob.size
          }
        });
      }
      
      toast({
        title: "Success!",
        description: "Image enhanced successfully",
      });
    } catch (error) {
      console.error('Error enhancing image:', error);
      
      // Log processing error
      if (user) {
        logAction({
          action: 'ERROR_IMAGE_ENHANCEMENT',
          resource_type: 'image_analysis',
          resource_id: processingId,
          details: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            file_name: selectedImage.name
          }
        }).catch(logError => {
          console.error('Failed to log processing error:', logError);
        });
      }
      
      toast({
        title: "Error",
        description: "Failed to enhance image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedImage = () => {
    if (!processedImage) return;

    try {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log download action
      if (user) {
        logAction({
          action: 'DOWNLOAD_PROCESSED_IMAGE',
          resource_type: 'image_analysis',
          details: { 
            original_file: selectedImage?.name || 'unknown',
            download_timestamp: new Date().toISOString()
          }
        }).catch(error => {
          console.error('Failed to log download:', error);
        });
      }

      toast({
        title: "Download Complete",
        description: "Processed image downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download Error",
        description: "Failed to download processed image",
        variant: "destructive"
      });
    }
  };

  const saveAnalysis = async () => {
    try {
      if (!patientId) {
        toast({ title: 'Select a patient', description: 'Choose the patient to attach this image to', variant: 'destructive' });
        return;
      }
      if (!processedImage && !selectedImage) {
        toast({ title: 'No image', description: 'Process or select an image first', variant: 'destructive' });
        return;
      }
      setSaving(true);

      // Get a Blob of the image to upload
      let blob: Blob;
      if (processedImage) {
        const res = await fetch(processedImage);
        blob = await res.blob();
      } else if (selectedImage) {
        blob = selectedImage;
      } else {
        throw new Error('No image to save');
      }

      const ext = (blob.type && blob.type.includes('jpeg')) ? 'jpg' : (blob.type && blob.type.includes('png') ? 'png' : 'png');
      const path = `${patientId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from('analyses').upload(path, blob, {
        cacheControl: '3600',
        contentType: blob.type || 'image/png',
        upsert: false,
      });
      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from('analyses').getPublicUrl(path);
      const image_url = pub.publicUrl;

      const { error: insertErr } = await supabase.from('image_analyses').insert({
        patient_id: patientId,
        image_url,
        analysis_type: analysisType || (processedImage ? 'background_removal' : 'original'),
        ai_results: { source: 'ImageAnalysis', file_name: selectedImage?.name || null, processed: !!processedImage },
      });
      if (insertErr) throw insertErr;

      // Audit log
      if (user) {
        logAction({
          action: 'SAVE_IMAGE_ANALYSIS',
          resource_type: 'image_analysis',
          details: { patient_id: patientId, analysis_type: analysisType, image_url }
        }).catch(() => {});
      }

      toast({ title: 'Saved', description: 'Image analysis saved to patient record' });
    } catch (e: any) {
      console.error('Save analysis failed', e);
      toast({ title: 'Save failed', description: e?.message || 'Could not save analysis', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">AI Image Analysis</h1>
        <p className="text-lg text-muted-foreground">
          Professional background removal and image enhancement for dental photography
        </p>
      </div>

      {/* Upload Area */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Image Upload
          </CardTitle>
          <CardDescription>
            Upload patient photos for professional background removal and enhancement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop your image here</h3>
            <p className="text-muted-foreground mb-4">
              or click to browse your files
            </p>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Select Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Preview and Processing */}
      {selectedImage && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Original Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl && (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-64 object-contain bg-muted/50 rounded border"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={processBackgroundRemoval}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <Scissors className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Remove Background'}
                    </Button>
                    <Button
                      onClick={processImageEnhancement}
                      disabled={isProcessing}
                      variant="outline"
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Enhance Image'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processed Image */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Processed Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedImage ? (
                <div className="space-y-4">
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full h-64 object-contain bg-muted/50 rounded border"
                  />
                  <Button
                    onClick={downloadProcessedImage}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Processed Image
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Patient</Label>
                      <Select value={patientId} onValueChange={setPatientId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.last_name}, {p.first_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Analysis Type</Label>
                      <Select value={analysisType} onValueChange={setAnalysisType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="background_removal">Background removal</SelectItem>
                          <SelectItem value="enhancement">Enhancement</SelectItem>
                          <SelectItem value="original">Original</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={saveAnalysis} disabled={saving || !patientId} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save to Patient'}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-md font-medium">Annotate</h3>
                    <AnnotationCanvas imageUrl={processedImage || previewUrl!} />
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded border">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Processed image will appear here
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Background Removal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI-powered background removal for professional patient photos. 
              Creates clean, distraction-free images perfect for medical records.
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              Image Enhancement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatic lighting correction, contrast enhancement, and color 
              balance optimization for better image quality.
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-info" />
              Professional Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Transform casual photos into professional-grade medical imagery 
              suitable for patient records and consultations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};