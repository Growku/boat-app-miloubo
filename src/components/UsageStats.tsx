"use client";

import { USER_COLORS } from "@/lib/types";

interface Stat {
  id: number;
  name: string;
  trip_count: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface UsageStatsProps {
  stats: Stat[];
  year: number;
  month: number | null; // null = full year
  availableYears: string[];
  availableMonths: string[];
  onYearChange: (year: number) => void;
  onMonthChange: (month: number | null) => void;
}

export default function UsageStats({
  stats,
  year,
  month,
  availableYears,
  availableMonths,
  onYearChange,
  onMonthChange,
}: UsageStatsProps) {
  const maxTrips = Math.max(...stats.map((s) => s.trip_count), 1);
  const totalTrips = stats.reduce((sum, s) => sum + s.trip_count, 0);

  const periodLabel = month
    ? `${MONTH_NAMES[month - 1]} ${year}`
    : `${year}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      {/* Header with trip count */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          Usage — {totalTrips} trips
        </h3>
      </div>

      {/* Year navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => onYearChange(year - 1)}
          className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 dark:text-gray-500"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-1">
          {availableYears.length > 2 ? (
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-transparent border-none cursor-pointer text-center focus:outline-none"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{year}</span>
          )}
        </div>
        <button
          onClick={() => onYearChange(year + 1)}
          className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 dark:text-gray-500"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Month pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => onMonthChange(null)}
          className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors ${
            month === null
              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          All
        </button>
        {MONTH_NAMES.map((name, i) => {
          const monthNum = i + 1;
          const monthStr = String(monthNum).padStart(2, "0");
          const hasData = availableMonths.includes(monthStr);
          return (
            <button
              key={name}
              onClick={() => onMonthChange(monthNum)}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md transition-colors ${
                month === monthNum
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : hasData
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    : "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Bars */}
      <div className="space-y-1">
        {stats.map((stat) => (
          <div key={stat.id} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
              style={{ backgroundColor: USER_COLORS[stat.name] || "#6b7280" }}
            >
              {stat.name[0]}
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 w-14 shrink-0 truncate">{stat.name}</span>
            <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: stat.trip_count > 0 ? `${Math.max((stat.trip_count / maxTrips) * 100, 8)}%` : "0%",
                  backgroundColor: USER_COLORS[stat.name] || "#6b7280",
                  opacity: stat.trip_count > 0 ? 1 : 0.15,
                }}
              />
            </div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 w-5 text-right">{stat.trip_count}</span>
          </div>
        ))}
      </div>

      {totalTrips === 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-3">No trips recorded for {periodLabel}</p>
      )}
    </div>
  );
}
