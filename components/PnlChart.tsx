"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PnlChart({ data }: { data: any[] }) {
  return (
    <div className="border rounded p-4 mt-6">
      <h2 className="text-xl font-bold mb-4">
        Equity Curve
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="trade" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="equity"
            stroke="#2563eb"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}