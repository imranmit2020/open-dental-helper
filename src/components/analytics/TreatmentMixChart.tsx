import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface TreatmentMixChartProps {
  appointments: Array<{ treatment_type?: string | null } | any>;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--accent))",
  "hsl(var(--accent) / 0.7)",
  "hsl(var(--accent) / 0.5)",
];

const TreatmentMixChart: React.FC<TreatmentMixChartProps> = ({ appointments }) => {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    (appointments || []).forEach((ap: any) => {
      const key = (ap.treatment_type || 'Unspecified') as string;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} fill="hsl(var(--primary))" label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TreatmentMixChart;
