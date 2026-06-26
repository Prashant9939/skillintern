"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { TrendingUp, BarChart2 } from "lucide-react";

interface AnalyticsChartsProps {
  registrationTrend: Array<{ name: string; Students: number }>;
  certificationDistribution: Array<{ name: string; Pass: number; Fail: number }>;
}

export default function AnalyticsCharts({ 
  registrationTrend, 
  certificationDistribution 
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Registration Trend */}
      <div className="glass-panel bg-white border border-zinc-200/80 rounded-3xl p-6 flex flex-col h-[350px] shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 mb-6 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          Registration Trend (Monthly Growth)
        </h3>
        
        <div className="flex-grow w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={registrationTrend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.08)", borderRadius: "12px", fontSize: "12px", color: "#0f172a" }}
                labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="Students" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Certifications distribution passes vs fails */}
      <div className="glass-panel bg-white border border-zinc-200/80 rounded-3xl p-6 flex flex-col h-[350px] shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 mb-6 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-indigo-600" />
          Pass vs Fail Ratios By Track
        </h3>

        <div className="flex-grow w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={certificationDistribution} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.08)", borderRadius: "12px", fontSize: "12px", color: "#0f172a" }}
              />
              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
              <Bar dataKey="Pass" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Fail" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
