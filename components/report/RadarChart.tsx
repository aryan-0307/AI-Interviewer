"use client";

import React from "react";
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ReportTopicScore } from "@/types/interview";

interface SkillRadarChartProps {
  data: ReportTopicScore[];
}

export function RadarChart({ data }: SkillRadarChartProps) {
  return (
    <div className="w-full h-[320px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#71717a", fontSize: 9 }}
          />
          <Radar
            name="Skill Score"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              borderColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              color: "#ffffff",
              fontSize: "12px",
            }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
