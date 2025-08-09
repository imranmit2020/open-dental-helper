import React, { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AppointmentsTrendChartProps {
  appointments: Array<{ appointment_date: string } | any>;
}

const AppointmentsTrendChart: React.FC<AppointmentsTrendChartProps> = ({ appointments }) => {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    (appointments || []).forEach((ap: any) => {
      if (!ap?.appointment_date) return;
      const d = new Date(ap.appointment_date);
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [appointments]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="apptsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#apptsGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentsTrendChart;
