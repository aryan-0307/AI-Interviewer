"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TopicBarChartProps {
  data: {
    topic: string;
    score: number;
    feedback: string;
  }[];
}

export function TopicBarChart({ data }: TopicBarChartProps) {
  // Truncate long topic names for X-Axis display
  const formattedData = data.map(item => ({
    ...item,
    shortName: item.topic.length > 20 ? item.topic.substring(0, 20) + "..." : item.topic,
  }));

  return (
    <div className="w-full h-[320px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
          <XAxis 
            dataKey="shortName" 
            stroke="#a1a1aa" 
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#a1a1aa" 
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            contentStyle={{
              backgroundColor: "#18181b",
              borderColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              color: "#ffffff",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value}/100`, "Score"]}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.topic; // Full name in tooltip
              }
              return label;
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.score >= 80 ? "#818cf8" : entry.score >= 60 ? "#fbbf24" : "#f87171"} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
