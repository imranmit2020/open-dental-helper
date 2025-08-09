import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface StaffPerformanceChartProps {
  appointments: Array<{ dentist_id?: string | null; status?: string | null } | any>;
  dentists: Array<{ id: string; first_name?: string; last_name?: string }>;
}

const StaffPerformanceChart: React.FC<StaffPerformanceChartProps> = ({ appointments, dentists }) => {
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    dentists.forEach((d) => map.set(d.id, `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'Dentist'));
    return map;
  }, [dentists]);

  const data = useMemo(() => {
    const agg = new Map<string, { name: string; scheduled: number; completed: number; cancelled: number; total: number }>();
    (appointments || []).forEach((ap: any) => {
      const id = ap.dentist_id || 'unassigned';
      const name = id === 'unassigned' ? 'Unassigned' : (nameById.get(id) || 'Dentist');
      if (!agg.has(id)) agg.set(id, { name, scheduled: 0, completed: 0, cancelled: 0, total: 0 });
      const rec = agg.get(id)!;
      const status = (ap.status || '').toLowerCase();
      if (status === 'completed') rec.completed += 1;
      else if (status === 'cancelled' || status === 'no_show') rec.cancelled += 1;
      else rec.scheduled += 1;
      rec.total += 1;
    });
    return Array.from(agg.values()).sort((a, b) => b.total - a.total);
  }, [appointments, nameById]);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} hide={data.length > 8} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" name="Completed" />
          <Bar dataKey="scheduled" stackId="a" fill="hsl(var(--primary) / 0.6)" name="Scheduled" />
          <Bar dataKey="cancelled" stackId="a" fill="hsl(var(--destructive))" name="Cancelled" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StaffPerformanceChart;
