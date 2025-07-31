import React, { useState, useRef } from 'react';
import { Camera, Upload, Scissors, Sparkles, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { removeBackground, loadImage, enhanceImage } from '@/services/BackgroundRemovalService';

export const ImageAnalysis: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setProcessedImage(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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

    setIsProcessing(true);
    try {
      toast({
        title: "Processing Image",
        description: "Removing background using AI...",
      });

      const imageElement = await loadImage(selectedImage);
      const processedBlob = await removeBackground(imageElement);
      
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
      toast({
        title: "Success!",
        description: "Background removed successfully",
      });
    } catch (error) {
      console.error('Error processing image:', error);
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

    setIsProcessing(true);
    try {
      toast({
        title: "Enhancing Image",
        description: "Improving lighting and contrast...",
      });

      const imageElement = await loadImage(selectedImage);
      const enhancedBlob = await enhanceImage(imageElement);
      
      const enhancedUrl = URL.createObjectURL(enhancedBlob);
      setProcessedImage(enhancedUrl);
      
      toast({
        title: "Success!",
        description: "Image enhanced successfully",
      });
    } catch (error) {
      console.error('Error enhancing image:', error);
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

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'processed-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Processed Image
                  </Button>
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