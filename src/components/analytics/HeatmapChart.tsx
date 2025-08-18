import React, { useMemo } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface HeatmapChartProps {
  data: Array<{ hour: number; day: string; appointments: number; revenue: number }>;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const transformedData = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    
    return data.map(item => ({
      x: hours.indexOf(item.hour),
      y: days.indexOf(item.day),
      value: item.appointments,
      revenue: item.revenue,
      hour: item.hour,
      day: item.day,
      intensity: Math.min(item.appointments / 10, 1) // Normalize to 0-1
    }));
  }, [data]);

  const getColor = (intensity: number) => {
    const colors = [
      'hsl(var(--primary) / 0.1)',
      'hsl(var(--primary) / 0.3)',
      'hsl(var(--primary) / 0.5)',
      'hsl(var(--primary) / 0.7)',
      'hsl(var(--primary) / 0.9)',
      'hsl(var(--primary))'
    ];
    return colors[Math.floor(intensity * 5)];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.day}, {data.hour}:00</p>
          <p className="text-sm text-muted-foreground">
            Appointments: {data.value}
          </p>
          <p className="text-sm text-muted-foreground">
            Revenue: ${data.revenue?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          data={transformedData}
          margin={{ top: 20, right: 20, bottom: 20, left: 80 }}
        >
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 11]}
            tickFormatter={(value) => `${value + 8}:00`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 5]}
            tickFormatter={(value) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][value]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter dataKey="value" fill="hsl(var(--primary))">
            {transformedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.intensity)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeatmapChart;