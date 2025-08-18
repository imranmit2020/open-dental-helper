import React from "react";
import { cn } from "@/lib/utils";
import type { ToothData } from "@/types/dental";

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
      case "healthy": return "fill-card stroke-border hover:fill-primary/10";
      case "mild": return "fill-warning/20 stroke-warning hover:fill-warning/30";
      case "moderate": return "fill-warning/40 stroke-warning hover:fill-warning/50";
      case "severe": return "fill-destructive/40 stroke-destructive hover:fill-destructive/50";
      case "treated": return "fill-success/40 stroke-success hover:fill-success/50";
      case "in_progress": return "fill-info/40 stroke-info hover:fill-info/50";
      case "missing": return "fill-muted stroke-muted-foreground opacity-50";
      default: return "fill-card stroke-border hover:fill-primary/10";
    }
  };

  const renderTooth = (toothNumber: number, isSelected: boolean = false) => {
    const status = getToothStatus(toothNumber);
    const colorClass = getToothColor(status);
    const isUpper = toothNumber < 30;
    
    return (
      <g
        key={toothNumber}
        className="cursor-pointer transition-all duration-200"
        onClick={() => onToothSelect(toothNumber)}
      >
        {/* Tooth Shape */}
        <rect
          x={0}
          y={0}
          width="32"
          height={isUpper ? "40" : "35"}
          rx="6"
          ry="6"
          className={cn(
            colorClass,
            "stroke-2 transition-all duration-200",
            isSelected && "stroke-primary stroke-4 fill-primary/20",
            status === "missing" && "stroke-dashed"
          )}
        />
        
        {/* Tooth Number */}
        <text
          x="16"
          y={isUpper ? "25" : "22"}
          textAnchor="middle"
          className={cn(
            "text-xs font-medium",
            status === "missing" ? "fill-muted-foreground" : "fill-foreground",
            isSelected && "fill-primary font-bold"
          )}
        >
          {toothNumber}
        </text>
        
        {/* Status Indicator */}
        {status !== "healthy" && status !== "missing" && (
          <circle
            cx="26"
            cy="6"
            r="3"
            className={cn(
              "stroke-background stroke-1",
              status === "severe" && "fill-destructive",
              status === "moderate" && "fill-warning",
              status === "mild" && "fill-warning",
              status === "treated" && "fill-success",
              status === "in_progress" && "fill-info"
            )}
          />
        )}
      </g>
    );
  };

  const renderQuadrant = (teeth: number[], label: string, transform: string) => (
    <g transform={transform}>
      <text x="0" y="-10" className="text-sm font-medium fill-muted-foreground">
        {label}
      </text>
      {teeth.map((tooth, index) => (
        <g key={tooth} transform={`translate(${index * 45}, 0)`}>
          {renderTooth(tooth, selectedTooth === tooth)}
        </g>
      ))}
    </g>
  );

  return (
    <div className="w-full overflow-auto">
      <svg viewBox="0 0 800 400" className="w-full h-auto min-h-[400px]">
        {/* Background */}
        <rect width="800" height="400" fill="transparent" />
        
        {/* Upper Teeth */}
        {renderQuadrant(upperRightTeeth, "Upper Right", "translate(60, 80)")}
        {renderQuadrant(upperLeftTeeth, "Upper Left", "translate(420, 80)")}
        
        {/* Center Line */}
        <line
          x1="400"
          y1="60"
          x2="400"
          y2="340"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="opacity-50"
        />
        
        {/* Lower Teeth */}
        {renderQuadrant(lowerLeftTeeth, "Lower Left", "translate(420, 260)")}
        {renderQuadrant(lowerRightTeeth, "Lower Right", "translate(60, 260)")}
        
        {/* Legend */}
        <g transform="translate(50, 350)">
          <text x="0" y="0" className="text-sm font-medium fill-foreground">Legend:</text>
          <g transform="translate(0, 15)">
            <circle r="4" fill="hsl(var(--success) / 0.4)" className="stroke-success stroke-1" />
            <text x="12" y="4" className="text-xs fill-muted-foreground">Treated</text>
          </g>
          <g transform="translate(80, 15)">
            <circle r="4" fill="hsl(var(--info) / 0.4)" className="stroke-info stroke-1" />
            <text x="12" y="4" className="text-xs fill-muted-foreground">In Progress</text>
          </g>
          <g transform="translate(180, 15)">
            <circle r="4" fill="hsl(var(--warning) / 0.4)" className="stroke-warning stroke-1" />
            <text x="12" y="4" className="text-xs fill-muted-foreground">Needs Treatment</text>
          </g>
          <g transform="translate(300, 15)">
            <circle r="4" fill="hsl(var(--destructive) / 0.4)" className="stroke-destructive stroke-1" />
            <text x="12" y="4" className="text-xs fill-muted-foreground">Severe</text>
          </g>
          <g transform="translate(380, 15)">
            <circle r="4" fill="hsl(var(--muted))" className="stroke-muted-foreground stroke-1 opacity-50 stroke-dashed" />
            <text x="12" y="4" className="text-xs fill-muted-foreground">Missing</text>
          </g>
        </g>
      </svg>
    </div>
  );
}