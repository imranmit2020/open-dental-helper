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
}

export function ToothDiagram({ toothData, selectedTooth, onToothSelect }: ToothDiagramProps) {
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
    
    return (
      <div
        key={toothNumber}
        className={cn(
          "relative cursor-pointer transition-all duration-200 w-8 h-10 flex flex-col items-center",
          "hover:scale-110 hover:z-10"
        )}
        onClick={() => onToothSelect(toothNumber)}
      >
        {/* Tooth Image */}
        <div className="relative w-8 h-8 mb-1">
          <img
            src={toothImage}
            alt={`Tooth ${toothNumber}`}
            className={cn(
              "w-full h-full object-contain transition-all duration-200",
              filterClass,
              isSelected && "brightness-110 contrast-130 scale-110",
              status === "missing" && "grayscale opacity-30",
              "hover:brightness-110"
            )}
          />
          
          {/* Selection Ring */}
          {isSelected && (
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
          )}
          
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