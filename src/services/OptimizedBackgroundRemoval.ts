import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for optimal performance
env.allowLocalModels = false;
env.useBrowserCache = true; // Enable caching for faster subsequent loads

const MAX_IMAGE_DIMENSION = 512; // Reduced for faster processing
const QUALITY = 0.85; // Slightly reduced quality for speed

// Cache the pipeline instance to avoid reloading
let segmenterCache: any = null;

function resizeImageForSpeed(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  // Always resize to optimize processing speed
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);
  return { width, height };
}

export const removeBackgroundOptimized = async (
  imageElement: HTMLImageElement,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    console.log('Starting optimized background removal...');
    onProgress?.(10);

    // Initialize or use cached pipeline
    if (!segmenterCache) {
      console.log('Loading segmentation model...');
      onProgress?.(30);
      
      segmenterCache = await pipeline(
        'image-segmentation', 
        'Xenova/segformer-b0-finetuned-ade-512-512',
        {
          device: 'webgpu', // Use WebGPU for faster processing if available
        }
      );
    }
    
    onProgress?.(50);
    
    // Optimize image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize for faster processing
    const { width, height } = resizeImageForSpeed(canvas, ctx, imageElement);
    console.log(`Processing optimized image: ${width}x${height}`);
    
    onProgress?.(60);
    
    // Convert to optimized format
    const imageData = canvas.toDataURL('image/jpeg', QUALITY);
    
    onProgress?.(70);
    
    // Process with cached model
    console.log('Running segmentation...');
    const result = await segmenterCache(imageData);
    
    onProgress?.(85);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create output with transparency
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply mask efficiently
    const outputImageData = outputCtx.getImageData(0, 0, width, height);
    const data = outputImageData.data;
    
    // Vectorized mask application for better performance
    const maskData = result[0].mask.data;
    for (let i = 0; i < maskData.length; i++) {
      const alpha = Math.round((1 - maskData[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    onProgress?.(95);
    
    // Convert to blob with optimized settings
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            onProgress?.(100);
            console.log('Background removal completed successfully');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        0.9 // Slightly reduced quality for faster processing
      );
    });
  } catch (error) {
    console.error('Error in optimized background removal:', error);
    throw error;
  }
};

export const loadImageOptimized = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS properly
    img.onload = () => {
      URL.revokeObjectURL(img.src); // Clean up memory
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(img.src); // Clean up memory
      reject(error);
    };
    img.src = URL.createObjectURL(file);
  });
};

// Preload the model for even faster processing
export const preloadModel = async () => {
  try {
    if (!segmenterCache) {
      console.log('Preloading segmentation model...');
      segmenterCache = await pipeline(
        'image-segmentation', 
        'Xenova/segformer-b0-finetuned-ade-512-512',
        {
          device: 'webgpu',
        }
      );
      console.log('Model preloaded successfully');
    }
  } catch (error) {
    console.warn('Failed to preload model:', error);
  }
};