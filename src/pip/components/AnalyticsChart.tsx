/* ──────────────────────────────────────────────
   Pip Dashboard — Analytics Charts
   Reusable Recharts wrappers for the analytics view
   ────────────────────────────────────────────── */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/* ── Sessions Line Chart ─────────────────────── */

interface SessionsLineChartProps {
  data: number[];
}

export function SessionsLineChart({ data }: SessionsLineChartProps) {
  const chartData = data.map((sessions, i) => ({
    week: `W${i + 1}`,
    sessions,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis dataKey="week" />
        <YAxis hide />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="sessions"
          stroke="#c95d0d"
          strokeWidth={2}
          dot={{ fill: '#c95d0d' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── Traffic Donut Chart ─────────────────────── */

interface TrafficDonutProps {
  data: { organic: number; direct: number; social: number; referral: number };
}

const TRAFFIC_COLORS: Record<string, string> = {
  organic: '#52b788',
  direct: '#c95d0d',
  social: '#6366f1',
  referral: '#f59e0b',
};

export function TrafficDonut({ data }: TrafficDonutProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: TRAFFIC_COLORS[name],
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <Legend verticalAlign="bottom" />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
