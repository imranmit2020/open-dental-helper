import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

interface WaterfallData {
  name: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
}

interface WaterfallChartProps {
  data: WaterfallData[];
  title?: string;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({ data, title }) => {
  const transformedData = useMemo(() => {
    let runningTotal = 0;
    
    return data.map((item, index) => {
      if (item.type === 'total') {
        const result = {
          ...item,
          start: 0,
          end: runningTotal,
          displayValue: runningTotal
        };
        return result;
      }
      
      const start = runningTotal;
      runningTotal += item.value;
      const end = runningTotal;
      
      return {
        ...item,
        start: Math.min(start, end),
        end: Math.max(start, end),
        displayValue: item.value,
        height: Math.abs(item.value)
      };
    });
  }, [data]);

  const getBarColor = (type: string) => {
    switch (type) {
      case 'positive': return 'hsl(var(--success))';
      case 'negative': return 'hsl(var(--destructive))';
      case 'total': return 'hsl(var(--primary))';
      default: return 'hsl(var(--muted))';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">
            Value: {data.displayValue > 0 ? '+' : ''}{data.displayValue?.toLocaleString()}
          </p>
          {data.type === 'total' && (
            <p className="text-sm text-muted-foreground">
              Total: {data.end?.toLocaleString()}
            </p>
          )}
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
            <BarChart
              data={transformedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="height" stackId="stack">
                {transformedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WaterfallChart;