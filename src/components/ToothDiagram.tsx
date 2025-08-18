import React from "react";
import { cn } from "@/lib/utils";
import type { ToothData } from "@/types/dental";

// Import tooth images
import toothIncisor from "@/assets/tooth-incisor.png";
import toothCanine from "@/assets/tooth-canine.png";
import toothPremolar from "@/assets/tooth-premolar.png";
import toothMolar from "@/assets/tooth-molar.png";

interface ToothDiagramProps {
  toothData: Record<number, ToothData>;
  selectedTooth: number | null;
  onToothSelect: (toothNumber: number) => void;
  showImages?: boolean; // New prop to toggle between image and simple mode
}

export function ToothDiagram({ toothData, selectedTooth, onToothSelect, showImages = true }: ToothDiagramProps) {
  // Adult permanent teeth numbering (FDI notation)
  const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerLeftTeeth = [38, 37, 36, 35, 34, 33, 32, 31];
  const lowerRightTeeth = [41, 42, 43, 44, 45, 46, 47, 48];

  const getToothStatus = (toothNumber: number): string => {
    const tooth = toothData[toothNumber];
    if (!tooth) return "healthy";
    
    if (tooth.status === "treated") return "treated";
    if (tooth.status === "in_progress") return "in_progress";
    if (tooth.conditions.includes("extraction")) return "missing";
    if (tooth.severity === "severe") return "severe";
    if (tooth.severity === "moderate") return "moderate";
    return "mild";
  };

  const getToothColor = (status: string): string => {
    switch (status) {
      case "healthy": return "brightness-100 contrast-100 saturate-100";
      case "mild": return "brightness-90 contrast-110 saturate-110 hue-rotate-15";
      case "moderate": return "brightness-80 contrast-120 saturate-120 hue-rotate-30";
      case "severe": return "brightness-70 contrast-130 saturate-150 hue-rotate-[350deg]";
      case "treated": return "brightness-95 contrast-105 saturate-105 hue-rotate-[120deg]";
      case "in_progress": return "brightness-85 contrast-115 saturate-115 hue-rotate-[200deg]";
      case "missing": return "brightness-50 contrast-50 saturate-0 opacity-30";
      default: return "brightness-100 contrast-100 saturate-100";
    }
  };

  const getToothImage = (toothNumber: number): string => {
    // Determine tooth type based on tooth number
    const lastDigit = toothNumber % 10;
    
    if (lastDigit === 1 || lastDigit === 2) return toothIncisor; // Incisors
    if (lastDigit === 3) return toothCanine; // Canines
    if (lastDigit === 4 || lastDigit === 5) return toothPremolar; // Premolars
    if (lastDigit === 6 || lastDigit === 7 || lastDigit === 8) return toothMolar; // Molars
    
    return toothIncisor; // Default
  };

  const renderTooth = (toothNumber: number, isSelected: boolean = false) => {
    const status = getToothStatus(toothNumber);
    const filterClass = getToothColor(status);
    const toothImage = getToothImage(toothNumber);
    const isUpper = toothNumber < 30;
    const tooth = toothData[toothNumber];
    
    if (showImages) {
      return (
        <div
          key={toothNumber}
          className={cn(
            "relative cursor-pointer group w-8 h-10 flex flex-col items-center",
            "transition-all duration-500 ease-out transform-gpu",
            "hover:scale-125 hover:z-20 hover:-translate-y-2",
            "hover:drop-shadow-2xl hover:brightness-110"
          )}
          onClick={() => onToothSelect(toothNumber)}
          onMouseEnter={() => {
            // Add haptic feedback simulation
            if (navigator.vibrate) navigator.vibrate(10);
          }}
        >
          {/* Glow Effect Background */}
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-500",
            "opacity-0 group-hover:opacity-100 blur-md scale-150",
            status === "severe" && "bg-destructive/30",
            status === "moderate" && "bg-warning/30", 
            status === "mild" && "bg-warning/20",
            status === "treated" && "bg-success/30",
            status === "in_progress" && "bg-info/30",
            status === "healthy" && "bg-primary/20"
          )} />

          {/* Tooth Image Container */}
          <div className="relative w-8 h-8 mb-1 transform-gpu">
            {/* Animated Border Ring */}
            {isSelected && (
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-0 rounded-full border-2 border-primary/60 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-primary animate-ping" />
              </div>
            )}
            
            {/* Tooth Image with Advanced Effects */}
            <img
              src={toothImage}
              alt={`Tooth ${toothNumber}`}
              className={cn(
                "w-full h-full object-contain transition-all duration-500 transform-gpu",
                filterClass,
                isSelected && "brightness-110 contrast-130 scale-110 rotate-2",
                status === "missing" && "grayscale opacity-30",
                "group-hover:brightness-110 group-hover:contrast-110",
                "drop-shadow-sm group-hover:drop-shadow-lg"
              )}
            />
            
            {/* Interactive Hotspots for Conditions */}
            {tooth?.conditions.map((condition, index) => (
              <div
                key={condition}
                className={cn(
                  "absolute w-2 h-2 rounded-full animate-pulse cursor-help",
                  "border border-background shadow-sm",
                  condition === "caries" && "bg-destructive top-1 right-1",
                  condition === "filling" && "bg-info top-1 left-1", 
                  condition === "crown" && "bg-warning bottom-1 right-1",
                  condition === "root_canal" && "bg-purple-500 bottom-1 left-1"
                )}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
                title={condition.replace("_", " ")}
              />
            ))}
            
            {/* AI Risk Indicator */}
            {tooth && (
              <div className={cn(
                "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                "transition-all duration-300 transform-gpu",
                "group-hover:scale-125 group-hover:rotate-12",
                status === "severe" && "bg-destructive animate-bounce",
                status === "moderate" && "bg-warning animate-pulse",
                status === "mild" && "bg-warning/70",
                status === "treated" && "bg-success animate-pulse",
                status === "in_progress" && "bg-info animate-ping"
              )} />
            )}

            {/* 3D Depth Shadow */}
            <div className={cn(
              "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1",
              "w-6 h-1 bg-black/10 rounded-full blur-sm",
              "transition-all duration-300 group-hover:w-8 group-hover:bg-black/20"
            )} />
          </div>
          
          {/* Smart Tooth Number with Animations */}
          <span
            className={cn(
              "text-[10px] font-bold text-center leading-none transition-all duration-300",
              "group-hover:text-primary group-hover:scale-110 group-hover:font-extrabold",
              status === "missing" ? "text-muted-foreground" : "text-foreground",
              isSelected && "text-primary font-bold animate-pulse",
              "drop-shadow-sm"
            )}
          >
            {toothNumber}
          </span>

          {/* Condition Tooltip */}
          {tooth && (
            <div className={cn(
              "absolute -top-12 left-1/2 transform -translate-x-1/2",
              "bg-popover border rounded-md px-2 py-1 text-xs font-medium",
              "opacity-0 group-hover:opacity-100 transition-all duration-300",
              "pointer-events-none z-30 whitespace-nowrap shadow-lg",
              "animate-fade-in"
            )}>
              {tooth.conditions[0]?.replace("_", " ") || "Healthy"}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover" />
            </div>
          )}
        </div>
      );
    } else {
      // Simple mode without images - using SVG rectangles
      return (
        <div
          key={toothNumber}
          className="relative cursor-pointer group w-8 h-10 flex flex-col items-center transition-all duration-200 hover:scale-110"
          onClick={() => onToothSelect(toothNumber)}
        >
          <div className="relative w-8 h-8 mb-1">
            <svg width="32" height="32" viewBox="0 0 32 32" className="w-full h-full">
              {/* Tooth Shape */}
              <rect
                x="0"
                y="0"
                width="32"
                height={isUpper ? "28" : "24"}
                rx="6"
                ry="6"
                className={cn(
                  "stroke-2 transition-all duration-200",
                  status === "healthy" && "fill-card stroke-border hover:fill-primary/10",
                  status === "mild" && "fill-warning/20 stroke-warning hover:fill-warning/30",
                  status === "moderate" && "fill-warning/40 stroke-warning hover:fill-warning/50",
                  status === "severe" && "fill-destructive/40 stroke-destructive hover:fill-destructive/50",
                  status === "treated" && "fill-success/40 stroke-success hover:fill-success/50",
                  status === "in_progress" && "fill-info/40 stroke-info hover:fill-info/50",
                  status === "missing" && "fill-muted stroke-muted-foreground opacity-50 stroke-dashed",
                  isSelected && "stroke-primary stroke-4 fill-primary/20"
                )}
              />
            </svg>
            
            {/* Status Indicator */}
            {status !== "healthy" && status !== "missing" && (
              <div
                className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                  status === "severe" && "bg-destructive",
                  status === "moderate" && "bg-warning",
                  status === "mild" && "bg-warning",
                  status === "treated" && "bg-success",
                  status === "in_progress" && "bg-info"
                )}
              />
            )}
          </div>
          
          {/* Tooth Number */}
          <span
            className={cn(
              "text-[10px] font-medium text-center leading-none",
              status === "missing" ? "text-muted-foreground" : "text-foreground",
              isSelected && "text-primary font-bold"
            )}
          >
            {toothNumber}
          </span>
        </div>
      );
    }
  };

  const renderQuadrant = (teeth: number[], label: string) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="flex space-x-1">
        {teeth.map((tooth) => renderTooth(tooth, selectedTooth === tooth))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-2 gap-8">
        {/* Upper Teeth */}
        <div className="space-y-4">
          {renderQuadrant(upperRightTeeth, "Upper Right")}
          {renderQuadrant(upperLeftTeeth, "Upper Left")}
        </div>
        
        {/* Lower Teeth */}
        <div className="space-y-4">
          {renderQuadrant(lowerLeftTeeth, "Lower Left")}
          {renderQuadrant(lowerRightTeeth, "Lower Right")}
        </div>
      </div>
      
      {/* Center Divider */}
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border opacity-50 transform -translate-x-1/2" />
      </div>
      
      {/* Legend */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h4 className="text-sm font-medium mb-3">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success/40 rounded border border-success" />
            <span>Treated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info/40 rounded border border-info" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning/40 rounded border border-warning" />
            <span>Needs Treatment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive/40 rounded border border-destructive" />
            <span>Severe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted rounded border border-muted-foreground opacity-50" />
            <span>Missing</span>
          </div>
        </div>
      </div>
    </div>
  );
}