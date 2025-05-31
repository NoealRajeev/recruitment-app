"use client";

import { BarChart, Clock, Users, Briefcase } from "lucide-react";

const stats = [
  {
    icon: <BarChart className="text-white w-6 h-6" />,
    label: "Total Request",
    value: "500",
    footer: "12% increase from last month",
    trend: "up",
    bg: "bg-purple-300",
  },
  {
    icon: <Clock className="text-white w-6 h-6" />,
    label: "Pending Reviews",
    value: "20 /100",
    footer: "10% decrease from last month",
    trend: "down",
    bg: "bg-orange-300",
  },
  {
    icon: <Users className="text-white w-6 h-6" />,
    label: "Clients Registered",
    value: "102",
    footer: "8% increase from last month",
    trend: "up",
    bg: "bg-blue-300",
  },
  {
    icon: <Briefcase className="text-white w-6 h-6" />,
    label: "Agencies Active",
    value: "101",
    footer: "2% increase from last month",
    trend: "up",
    bg: "bg-yellow-300",
  },
];

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-purple-100 p-4 rounded-xl flex flex-col justify-between shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${stat.bg}`}>{stat.icon}</div>
            <div className="text-sm text-gray-600 font-semibold">
              {stat.label}
            </div>
          </div>
          <div className="text-2xl font-bold text-black mt-4">{stat.value}</div>
          <div
            className={`text-xs mt-2 ${
              stat.trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {stat.footer}
          </div>
        </div>
      ))}
    </div>
  );
}
