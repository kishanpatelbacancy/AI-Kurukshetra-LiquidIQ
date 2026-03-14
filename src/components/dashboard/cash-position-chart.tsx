"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompactCurrency } from "@/lib/utils";

type CashPositionPoint = {
  dateLabel: string;
  inflow: number;
  net: number;
  outflow: number;
};

type CashPositionChartProps = {
  data: CashPositionPoint[];
};

export function CashPositionChart({ data }: CashPositionChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            axisLine={false}
            dataKey="dateLabel"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
            tickLine={false}
            width={80}
          />
          <Tooltip
            cursor={{ fill: "rgba(15, 23, 42, 0.35)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 shadow-xl shadow-black/20">
                  <p className="mb-2 text-sm font-medium text-slate-100">{label}</p>
                  <div className="space-y-1.5 text-sm text-slate-300">
                    {payload.map((entry) => (
                      <div
                        key={entry.dataKey?.toString()}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="capitalize" style={{ color: entry.color }}>
                          {entry.name}
                        </span>
                        <span className="font-medium text-slate-100">
                          {formatCompactCurrency(Number(entry.value ?? 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{
              color: "#94a3b8",
              fontSize: "12px",
              paddingTop: "12px",
            }}
          />
          <Bar
            dataKey="inflow"
            fill="#22c55e"
            name="Inflow"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="outflow"
            fill="#ef4444"
            name="Outflow"
            radius={[6, 6, 0, 0]}
          />
          <Line
            dataKey="net"
            dot={{ fill: "#3b82f6", r: 3 }}
            name="Net"
            stroke="#3b82f6"
            strokeWidth={3}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
