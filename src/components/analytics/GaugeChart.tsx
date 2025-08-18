import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  value: number;
  max?: number;
  title: string;
  color?: string;
  target?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ 
  value, 
  max = 100, 
  title, 
  color = "hsl(var(--primary))",
  target 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const data = [
    { name: 'progress', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ];

  const getColor = () => {
    if (target && value >= target) return "hsl(var(--success))";
    if (percentage < 30) return "hsl(var(--destructive))";
    if (percentage < 70) return "hsl(var(--warning))";
    return color;
  };

  return (
    <div className="relative w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getColor()} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground text-center px-4">{title}</div>
        {target && (
          <div className="text-xs text-muted-foreground mt-1">
            Target: {target}
          </div>
        )}
      </div>
    </div>
  );
};

export default GaugeChart;