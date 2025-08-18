import React, { useMemo } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

interface TreemapData {
  name: string;
  size: number;
  revenue?: number;
  patients?: number;
  fill?: string;
}

interface TreemapChartProps {
  data: TreemapData[];
  title?: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({ data, title }) => {
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item.fill || `hsl(${(index * 137.5) % 360}, 70%, 60%)`
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Size: {data.size?.toLocaleString()}
          </p>
          {data.revenue && (
            <p className="text-sm text-muted-foreground">
              Revenue: ${data.revenue?.toLocaleString()}
            </p>
          )}
          {data.patients && (
            <p className="text-sm text-muted-foreground">
              Patients: {data.patients?.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, size } = props;
    
    if (width < 30 || height < 30) return null;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.payload?.fill || `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
            stroke: 'hsl(var(--background))',
            strokeWidth: 2,
            fillOpacity: 0.8
          }}
          className="hover:fill-opacity-60 transition-all"
        />
        {width > 60 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 10}
              textAnchor="middle"
              fill="white"
              fontSize={12}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="white"
              fontSize={10}
            >
              {size?.toLocaleString()}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      )}
      <div className="bg-gradient-card rounded-xl border border-border/30 p-6">
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={processedData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="hsl(var(--background))"
              content={<CustomContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TreemapChart;