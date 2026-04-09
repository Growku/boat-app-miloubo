"use client";

import { useState, useCallback, useRef } from "react";
import { Reservation, User, USER_COLORS } from "@/lib/types";

type ViewMode = "month" | "week";

interface CalendarProps {
  reservations: Reservation[];
  upcomingReservations: Reservation[];
  currentUser: User | null;
  onDayClick: (dateStr: string) => void;
  month: Date;
  onMonthChange: (date: Date) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDateFromObj(d: Date): string {
  return formatDate(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Get Monday of the week containing `date` */
function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  d.setDate(d.getDate() + diff);
  return d;
}

/** Get 7 days starting from a Monday */
function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }
  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar({
  reservations,
  upcomingReservations,
  currentUser,
  onDayClick,
  month,
  onMonthChange,
}: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [weekDate, setWeekDate] = useState(() => new Date());
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const today = new Date();
  const todayStr = formatDateFromObj(today);

  const reservationMap = new Map<string, Reservation>();
  reservations.forEach((r) => reservationMap.set(r.date, r));
  // Also index upcoming reservations (they may be in different months)
  upcomingReservations.forEach((r) => {
    if (!reservationMap.has(r.date)) reservationMap.set(r.date, r);
  });

  // --- Month view helpers ---
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const isCurrentMonth = year === today.getFullYear() && monthIndex === today.getMonth();

  const prevMonth = useCallback(() => {
    onMonthChange(new Date(year, monthIndex - 1, 1));
  }, [year, monthIndex, onMonthChange]);

  const nextMonth = useCallback(() => {
    onMonthChange(new Date(year, monthIndex + 1, 1));
  }, [year, monthIndex, onMonthChange]);

  // --- Week view helpers ---
  const weekStart = getWeekStart(weekDate);
  const weekDays = getWeekDays(weekStart);
  const prevWeek = useCallback(() => {
    const d = new Date(weekDate);
    d.setDate(d.getDate() - 7);
    setWeekDate(d);
    // Keep month in sync so reservations are fetched for the right period
    onMonthChange(d);
  }, [weekDate, onMonthChange]);

  const nextWeek = useCallback(() => {
    const d = new Date(weekDate);
    d.setDate(d.getDate() + 7);
    setWeekDate(d);
    onMonthChange(d);
  }, [weekDate, onMonthChange]);

  const goToToday = useCallback(() => {
    const now = new Date();
    onMonthChange(now);
    setWeekDate(now);
  }, [onMonthChange]);

  // --- Swipe ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (viewMode === "month") {
        if (dx < 0) nextMonth();
        else prevMonth();
      } else {
        if (dx < 0) nextWeek();
        else prevWeek();
      }
    }
  }, [viewMode, nextMonth, prevMonth, nextWeek, prevWeek]);

  // --- Week header label ---
  const weekLabel = (() => {
    const s = weekDays[0];
    const e = weekDays[6];
    if (s.getMonth() === e.getMonth()) {
      return `${s.getDate()} – ${e.getDate()} ${MONTH_SHORT[s.getMonth()]} ${s.getFullYear()}`;
    }
    if (s.getFullYear() === e.getFullYear()) {
      return `${s.getDate()} ${MONTH_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTH_SHORT[e.getMonth()]} ${s.getFullYear()}`;
    }
    return `${s.getDate()} ${MONTH_SHORT[s.getMonth()]} ${s.getFullYear()} – ${e.getDate()} ${MONTH_SHORT[e.getMonth()]} ${e.getFullYear()}`;
  })();

  const isCurrentWeek = todayStr >= formatDateFromObj(weekDays[0]) && todayStr <= formatDateFromObj(weekDays[6]);

  // --- Month grid ---
  const monthDays: Array<{ day: number | null; dateStr: string; dayOfWeek: number }> = [];
  const firstDay = getFirstDayOfMonth(year, monthIndex);
  const daysInMonth = getDaysInMonth(year, monthIndex);
  for (let i = 0; i < firstDay; i++) {
    monthDays.push({ day: null, dateStr: "", dayOfWeek: i });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const idx = (firstDay + d - 1) % 7;
    monthDays.push({ day: d, dateStr: formatDate(year, monthIndex, d), dayOfWeek: idx });
  }

  // Upcoming reservations
  const upcoming = upcomingReservations.slice(0, 3);

  // --- Shared day cell renderer ---
  function renderDayCell(dateStr: string, dayNum: number, dayOfWeek: number, tall: boolean) {
    const isWeekend = dayOfWeek >= 5;
    const reservation = reservationMap.get(dateStr);
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;

    return (
      <button
        key={dateStr}
        onClick={() => currentUser && onDayClick(dateStr)}
        disabled={!currentUser}
        className={`
          relative ${tall ? "min-h-[4.5rem]" : "min-h-[2.75rem] sm:min-h-[3.25rem]"} p-0.5 flex flex-col items-center transition-colors
          ${isWeekend ? "bg-sky-50/30 dark:bg-sky-950/20" : "bg-white dark:bg-gray-900"}
          ${isPast && !reservation ? "opacity-35" : ""}
          ${currentUser ? "hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 cursor-pointer" : ""}
        `}
      >
        <span
          className={`text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full ${
            isToday
              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
              : isWeekend
                ? "text-sky-700 dark:text-sky-400"
                : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {dayNum}
        </span>

        {reservation && (
          <div
            className={`mt-0.5 w-full rounded px-0.5 py-px text-center`}
            style={{
              backgroundColor: USER_COLORS[reservation.user_name || ""] + "18",
              borderLeft: `2px solid ${USER_COLORS[reservation.user_name || ""] || "#6b7280"}`,
            }}
          >
            <span
              className={`${tall ? "text-[10px]" : "text-[9px]"} font-medium leading-tight block truncate`}
              style={{ color: USER_COLORS[reservation.user_name || ""] || "#6b7280" }}
            >
              {reservation.user_name}
            </span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={viewMode === "month" ? prevMonth : prevWeek}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {viewMode === "month"
              ? `${MONTH_NAMES[monthIndex]} ${year}`
              : weekLabel}
          </h2>
          {((viewMode === "month" && !isCurrentMonth) || (viewMode === "week" && !isCurrentWeek)) && (
            <button
              onClick={goToToday}
              className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={viewMode === "month" ? nextMonth : nextWeek}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-center gap-1 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setViewMode("week")}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            viewMode === "week"
              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            viewMode === "month"
              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Month
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
        {DAY_NAMES.map((name, i) => (
          <div key={name} className={`text-center text-[10px] font-semibold uppercase tracking-wider py-2 ${
            i >= 5 ? "text-sky-500 dark:text-sky-400 bg-sky-50/40 dark:bg-sky-950/30" : "text-gray-400 dark:text-gray-500"
          }`}>
            {name}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {viewMode === "month" ? (
          // --- MONTH VIEW ---
          monthDays.map(({ day, dateStr, dayOfWeek }, i) => {
            if (day === null) {
              const isWeekend = dayOfWeek >= 5;
              return (
                <div
                  key={`empty-${i}`}
                  className={`min-h-[2.75rem] sm:min-h-[3.25rem] ${isWeekend ? "bg-sky-50/30 dark:bg-sky-950/20" : "bg-white dark:bg-gray-900"}`}
                />
              );
            }
            return renderDayCell(dateStr, day, dayOfWeek, false);
          })
        ) : (
          // --- WEEK VIEW ---
          weekDays.map((d, i) => {
            const dateStr = formatDateFromObj(d);
            return renderDayCell(dateStr, d.getDate(), i, true);
          })
        )}
      </div>

      {/* Upcoming reservations */}
      {upcoming.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Coming up
          </h4>
          <div className="space-y-1.5">
            {upcoming.map((r) => {
              const [ry, rm, rd] = r.date.split("-").map(Number);
              const d = new Date(ry, rm - 1, rd);
              const friendly = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
              const isToday2 = r.date === todayStr;
              return (
                <button
                  key={r.id}
                  onClick={() => onDayClick(r.date)}
                  className="w-full flex items-center gap-2.5 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: USER_COLORS[r.user_name || ""] || "#6b7280" }}
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                    <span className="font-medium">{r.user_name}</span>
                    <span className="text-gray-400 dark:text-gray-600 mx-1">—</span>
                    <span className={isToday2 ? "font-medium text-gray-900 dark:text-gray-100" : ""}>
                      {isToday2 ? "Today" : friendly}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
