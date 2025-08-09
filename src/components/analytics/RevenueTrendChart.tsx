import React, { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface RevenueTrendChartProps {
  invoices: Array<{ issued_at: string; total: number } | any>;
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ invoices }) => {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    (invoices || []).forEach((inv: any) => {
      if (!inv?.issued_at) return;
      const d = new Date(inv.issued_at);
      const key = d.toISOString().slice(0, 10);
      const total = Number(inv.total) || 0;
      map.set(key, (map.get(key) || 0) + total);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }, [invoices]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#revGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueTrendChart;
