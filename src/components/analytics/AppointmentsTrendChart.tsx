import React, { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { startOfWeek, startOfMonth, format, parseISO } from "date-fns";

interface AppointmentsTrendChartProps {
  appointments: Array<{ appointment_date: string } | any>;
  granularity?: "daily" | "weekly" | "monthly";
}

const AppointmentsTrendChart: React.FC<AppointmentsTrendChartProps> = ({ appointments, granularity = "daily" }) => {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    (appointments || []).forEach((ap: any) => {
      if (!ap?.appointment_date) return;
      const date = typeof ap.appointment_date === 'string' ? parseISO(ap.appointment_date) : new Date(ap.appointment_date);
      let key: string;
      if (granularity === "weekly") {
        key = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
      } else if (granularity === "monthly") {
        key = format(startOfMonth(date), "yyyy-MM-01");
      } else {
        key = format(date, "yyyy-MM-dd");
      }
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [appointments, granularity]);

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
