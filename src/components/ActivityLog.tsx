"use client";

import { ActivityLog as ActivityLogType, USER_COLORS } from "@/lib/types";

interface ActivityLogProps {
  logs: ActivityLogType[];
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatTargetDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatAction(action: string): { label: string; color: string } {
  switch (action) {
    case "booked":
      return { label: "Booked", color: "#22c55e" };
    case "cancelled":
      return { label: "Cancelled", color: "#ef4444" };
    case "fuel_update":
      return { label: "Fuel update", color: "#f59e0b" };
    default:
      return { label: action, color: "#6b7280" };
  }
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log) => {
        const { label, color } = formatAction(log.action);
        return (
          <div key={log.id} className="flex items-start gap-2.5 py-2 px-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5"
              style={{ backgroundColor: USER_COLORS[log.user_name || ""] || "#6b7280" }}
            >
              {(log.user_name || "?")[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{log.user_name}</span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: color + "18", color }}
                >
                  {label}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                {log.target_date && (
                  <span>{formatTargetDate(log.target_date)}</span>
                )}
                {log.detail && !log.target_date && (
                  <span className="truncate">{log.detail}</span>
                )}
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="shrink-0">{formatTime(log.created_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
