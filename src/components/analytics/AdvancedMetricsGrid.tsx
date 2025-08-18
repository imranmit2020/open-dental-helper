import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Zap,
  Brain,
  Heart,
  Shield,
  Gauge,
  Sparkles
} from "lucide-react";

interface MetricData {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  gradient: string;
  description: string;
  progress?: number;
  target?: number;
  status?: 'excellent' | 'good' | 'warning' | 'critical';
}

interface AdvancedMetricsGridProps {
  metrics: MetricData[];
}

const AdvancedMetricsGrid: React.FC<AdvancedMetricsGridProps> = ({ metrics }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={metric.title} 
            className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.gradient} shadow-sm`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-4">
              {/* Main Value */}
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                {metric.status && (
                  <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </Badge>
                )}
              </div>
              
              {/* Change Indicator */}
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon(metric.trend)}
                <span className={`font-medium ${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              
              {/* Progress Bar */}
              {metric.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{metric.progress}%</span>
                  </div>
                  <Progress value={metric.progress} className="h-2" />
                  {metric.target && (
                    <div className="text-xs text-muted-foreground">
                      Target: {metric.target}
                    </div>
                  )}
                </div>
              )}
              
              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {metric.description}
              </p>
              
              {/* Sparkle Effect for Excellent Status */}
              {metric.status === 'excellent' && (
                <div className="absolute top-2 right-2">
                  <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdvancedMetricsGrid;