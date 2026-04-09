"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar from "@/components/Calendar";
import FuelGauge from "@/components/FuelGauge";
import UsageStats from "@/components/UsageStats";
import ActivityLog from "@/components/ActivityLog";
import DayDetailModal from "@/components/DayDetailModal";
import SettingsModal from "@/components/SettingsModal";
import PinLogin from "@/components/PinLogin";
import { User, Reservation, FuelLog, ActivityLog as ActivityLogType } from "@/lib/types";

function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("boat-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("boat-theme", "light");
    }
  }, [dark]);

  return { dark, toggle };
}

function Toast({ message, type, onDismiss }: { message: string; type: "error" | "success"; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium max-w-xs text-center ${
        type === "error"
          ? "bg-red-600 text-white"
          : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
      }`}
      style={{ animation: "fadeInDown 0.25s ease-out" }}
    >
      {message}
    </div>
  );
}

export default function Home() {
  const { dark, toggle: toggleTheme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [fuelData, setFuelData] = useState<{
    current: { tank_level: number; jerry_cans_full: number; jerry_cans_empty: number };
    history: FuelLog[];
  }>({
    current: { tank_level: 8, jerry_cans_full: 0, jerry_cans_empty: 0 },
    history: [],
  });
  const [stats, setStats] = useState<Array<{ id: number; name: string; trip_count: number }>>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogType[]>([]);
  const [month, setMonth] = useState(() => new Date());
  const [statsYear, setStatsYear] = useState(() => new Date().getFullYear());
  const [statsMonth, setStatsMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const showToast = useCallback((message: string, type: "error" | "success") => {
    setToast({ message, type });
  }, []);

  const year = month.getFullYear();
  const monthStr = `${year}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  // Check for saved session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("boat-user");
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch { /* ignore */ }
      }
      setAuthChecked(true);
    }
  }, []);

  // Fetch users for login screen
  useEffect(() => {
    fetch("/api/users")
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else console.error("Expected array from /api/users, got:", data);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("boat-user", JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("boat-user");
    }
  };

  const fetchAll = useCallback(async () => {
    try {
      const statsUrl = statsMonth
        ? `/api/stats?year=${statsYear}&month=${statsMonth}`
        : `/api/stats?year=${statsYear}`;
      const [reservationsRes, upcomingRes, fuelRes, statsRes, activityRes] = await Promise.all([
        fetch(`/api/reservations?month=${monthStr}`),
        fetch("/api/reservations?upcoming=true"),
        fetch("/api/fuel"),
        fetch(statsUrl),
        fetch("/api/activity?limit=20"),
      ]);

      const [reservationsData, upcomingData, fuelDataResult, statsData, activityData] = await Promise.all([
        reservationsRes.json(),
        upcomingRes.json(),
        fuelRes.json(),
        statsRes.json(),
        activityRes.json(),
      ]);

      setReservations(reservationsData);
      setUpcomingReservations(upcomingData);
      setFuelData(fuelDataResult);
      setStats(statsData.stats);
      setAvailableYears(statsData.availableYears);
      setAvailableMonths(statsData.availableMonths || []);
      setActivityLogs(activityData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      showToast("Could not load data. Try refreshing.", "error");
    } finally {
      setLoading(false);
    }
  }, [monthStr, statsYear, statsMonth, showToast]);

  useEffect(() => {
    if (currentUser) {
      fetchAll();
    }
  }, [currentUser, fetchAll]);

  const handleReserve = async (date: string) => {
    if (!currentUser || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser.id, date }),
      });
      if (res.ok) {
        showToast("Reserved", "success");
        fetchAll();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to reserve", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (reservation: Reservation) => {
    if (!currentUser || saving) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/reservations?id=${reservation.id}&user_id=${currentUser.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        showToast("Cancelled", "success");
        fetchAll();
      } else {
        showToast("Could not cancel", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFuelUpdate = async (tankLevel: number, jerryFull: number, jerryEmpty: number) => {
    if (!currentUser || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          tank_level: tankLevel,
          jerry_cans_full: jerryFull,
          jerry_cans_empty: jerryEmpty,
        }),
      });
      if (res.ok) {
        showToast("Fuel updated", "success");
        fetchAll();
      } else {
        showToast("Could not update fuel", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Show login if no user
  if (!currentUser) {
    return <PinLogin users={users} onLogin={handleLogin} />;
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  const reservationMap = new Map<string, Reservation>();
  reservations.forEach((r) => reservationMap.set(r.date, r));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-0 left-0 right-0 z-40 h-0.5">
          <div className="h-full bg-gray-900 dark:bg-sky-400 animate-pulse" />
        </div>
      )}

      {/* Settings modal */}
      {showSettings && currentUser && (
        <SettingsModal
          currentUser={currentUser}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Day detail modal */}
      {selectedDay && (
        <DayDetailModal
          date={selectedDay}
          reservation={reservationMap.get(selectedDay) || null}
          currentUser={currentUser}
          onClose={() => setSelectedDay(null)}
          onReserve={handleReserve}
          onCancel={handleCancel}
          saving={saving}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <svg className="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
              <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
              <path d="M12 2v10" />
              <path d="M12 4l6 3" />
            </svg>
            Miloubo
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 dark:text-gray-500"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 dark:text-gray-500"
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentUser.name}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left column: Calendar */}
          <div className="lg:col-span-5">
            <Calendar
              reservations={reservations}
              upcomingReservations={upcomingReservations}
              currentUser={currentUser}
              onDayClick={setSelectedDay}
              month={month}
              onMonthChange={setMonth}
            />
          </div>

          {/* Middle column: Fuel + Stats */}
          <div className="lg:col-span-3 space-y-4">
            <FuelGauge
              current={fuelData.current}
              history={fuelData.history}
              currentUser={currentUser}
              onUpdate={handleFuelUpdate}
              saving={saving}
            />
            <UsageStats
              stats={stats}
              year={statsYear}
              month={statsMonth}
              availableYears={availableYears}
              availableMonths={availableMonths}
              onYearChange={(y) => {
                setStatsYear(y);
                setStatsMonth(null); // reset month when year changes
              }}
              onMonthChange={setStatsMonth}
            />
          </div>

          {/* Right column: Activity log */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                Activity
              </h3>
              <div className="max-h-[600px] overflow-y-auto">
                <ActivityLog logs={activityLogs} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
