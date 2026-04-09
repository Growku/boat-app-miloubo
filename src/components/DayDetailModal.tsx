"use client";

import { useEffect, useState, useCallback } from "react";
import { Reservation, ActivityLog, User, USER_COLORS } from "@/lib/types";

interface DayDetailModalProps {
  date: string;
  reservation: Reservation | null;
  currentUser: User;
  onClose: () => void;
  onReserve: (date: string) => void;
  onCancel: (reservation: Reservation) => void;
  saving: boolean;
}

function formatFriendlyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DayDetailModal({
  date,
  reservation,
  currentUser,
  onClose,
  onReserve,
  onCancel,
  saving,
}: DayDetailModalProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/activity?date=${date}`);
      const data = await res.json();
      setActivities(data);
    } catch {
      // silently fail
    } finally {
      setLoadingActivities(false);
    }
  }, [date]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const isPast = date < todayStr;
  const isAdmin = currentUser.is_admin === 1;
  const isOwnReservation = reservation && reservation.user_id === currentUser.id;
  const canCancel = reservation && (isOwnReservation || isAdmin);
  const canReserve = !reservation && !isPast;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl animate-slideUp sm:animate-fadeIn">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {formatFriendlyDate(date)}
            </h3>
            {reservation ? (
              <p className="text-sm mt-0.5" style={{ color: USER_COLORS[reservation.user_name || ""] || "#6b7280" }}>
                Reserved by {reservation.user_name}
              </p>
            ) : isPast ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">No reservation</p>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">Available</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Reservation info */}
        {reservation && (
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: USER_COLORS[reservation.user_name || ""] || "#6b7280" }}
              >
                {(reservation.user_name || "?")[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{reservation.user_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Booked on {new Date(reservation.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Activity history for this date */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Activity history
          </h4>
          {loadingActivities ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">Loading...</p>
          ) : activities.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">No history for this date</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 py-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: USER_COLORS[a.user_name || ""] || "#6b7280" }}
                  >
                    {(a.user_name || "?")[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{a.user_name}</span>{" "}
                      <span className={
                        a.action === "booked" ? "text-green-600 dark:text-green-400" :
                        a.action === "cancelled" ? "text-red-500 dark:text-red-400" :
                        "text-gray-500 dark:text-gray-400"
                      }>
                        {a.action}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      {new Date(a.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-gray-100 dark:border-gray-800">
          {canCancel && !confirmingCancel && (
            <button
              onClick={() => setConfirmingCancel(true)}
              disabled={saving}
              className="w-full py-3 text-sm font-medium rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 active:bg-red-200 transition-colors disabled:opacity-50"
            >
              {isOwnReservation ? "Cancel my reservation" : `Cancel ${reservation?.user_name}'s reservation`}
            </button>
          )}
          {canCancel && confirmingCancel && (
            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                {isOwnReservation
                  ? `Are you sure? This frees up ${formatFriendlyDate(date).split(",")[0]} for others.`
                  : `Cancel ${reservation?.user_name}'s reservation for ${formatFriendlyDate(date).split(",")[0]}?`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingCancel(false)}
                  disabled={saving}
                  className="flex-1 py-3 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Keep it
                </button>
                <button
                  onClick={() => {
                    if (reservation) onCancel(reservation);
                    onClose();
                  }}
                  disabled={saving}
                  className="flex-1 py-3 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50"
                >
                  {saving ? "Cancelling..." : "Yes, cancel"}
                </button>
              </div>
            </div>
          )}
          {canReserve && (
            <button
              onClick={() => {
                onReserve(date);
                onClose();
              }}
              disabled={saving}
              className="w-full py-3 text-sm font-medium rounded-xl bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Reserving..." : "Reserve this date"}
            </button>
          )}
          {!canCancel && !canReserve && (
            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
