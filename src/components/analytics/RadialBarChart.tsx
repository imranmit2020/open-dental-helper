import React from "react";
import { ResponsiveContainer, RadialBarChart as RechartsRadialBarChart, RadialBar, Legend, Tooltip } from "recharts";

interface RadialBarData {
  name: string;
  value: number;
  fill: string;
}

interface RadialBarChartProps {
  data: RadialBarData[];
  title?: string;
}

const RadialBarChart: React.FC<RadialBarChartProps> = ({ data, title }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Value: {data.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      )}
      <div className="bg-gradient-card rounded-xl border border-border/30 p-6">
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="10%" 
              outerRadius="80%" 
              data={data}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill="hsl(var(--primary))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                iconSize={18} 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ 
                  paddingLeft: '20px',
                  fontSize: '12px'
                }}
              />
            </RechartsRadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RadialBarChart;