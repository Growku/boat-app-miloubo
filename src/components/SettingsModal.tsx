"use client";

import { useState, useEffect, useCallback } from "react";
import { User, USER_COLORS } from "@/lib/types";

interface SettingsModalProps {
  currentUser: User;
  onClose: () => void;
}

type Step = "menu" | "current" | "new" | "confirm";

export default function SettingsModal({ currentUser, onClose }: SettingsModalProps) {
  const [step, setStep] = useState<Step>("menu");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const resetForm = useCallback(() => {
    setStep("menu");
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setError(null);
    setSuccess(false);
  }, []);

  const handlePinKey = (digit: string) => {
    setError(null);
    if (step === "current" && currentPin.length < 4) {
      const next = currentPin + digit;
      setCurrentPin(next);
      if (next.length === 4) {
        // Auto-advance to new PIN step after a brief delay
        setTimeout(() => setStep("new"), 200);
      }
    } else if (step === "new" && newPin.length < 4) {
      const next = newPin + digit;
      setNewPin(next);
      if (next.length === 4) {
        setTimeout(() => setStep("confirm"), 200);
      }
    } else if (step === "confirm" && confirmPin.length < 4) {
      const next = confirmPin + digit;
      setConfirmPin(next);
      if (next.length === 4) {
        // Auto-submit
        setTimeout(() => submitPinChange(currentPin, newPin, next), 200);
      }
    }
  };

  const handleBackspace = () => {
    setError(null);
    if (step === "current") setCurrentPin(currentPin.slice(0, -1));
    else if (step === "new") setNewPin(newPin.slice(0, -1));
    else if (step === "confirm") setConfirmPin(confirmPin.slice(0, -1));
  };

  const submitPinChange = async (curPin: string, nPin: string, confPin: string) => {
    if (nPin !== confPin) {
      setError("PINs don't match");
      setConfirmPin("");
      return;
    }

    if (curPin === nPin) {
      setError("New PIN must be different");
      setNewPin("");
      setConfirmPin("");
      setStep("new");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          current_pin: curPin,
          new_pin: nPin,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        if (data.error === "Current PIN is incorrect") {
          setError("Current PIN is incorrect");
          setCurrentPin("");
          setNewPin("");
          setConfirmPin("");
          setStep("current");
        } else {
          setError(data.error || "Failed to change PIN");
        }
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const activePin = step === "current" ? currentPin : step === "new" ? newPin : confirmPin;
  const stepLabel =
    step === "current"
      ? "Enter current PIN"
      : step === "new"
        ? "Enter new PIN"
        : "Confirm new PIN";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl animate-slideUp sm:animate-fadeIn">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Settings</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* User info (non-editable) */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: USER_COLORS[currentUser.name] || "#6b7280" }}
            >
              {currentUser.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Logged in</p>
            </div>
          </div>

          {/* Menu state */}
          {step === "menu" && !success && (
            <button
              onClick={() => setStep("current")}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Change passcode</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Success state */}
          {success && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Passcode changed</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Use your new PIN next time you log in.</p>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* PIN entry states */}
          {(step === "current" || step === "new" || step === "confirm") && !success && (
            <div>
              {/* Back button + label */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => {
                    if (step === "current") resetForm();
                    else if (step === "new") { setNewPin(""); setStep("current"); }
                    else if (step === "confirm") { setConfirmPin(""); setStep("new"); }
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stepLabel}</span>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {(["current", "new", "confirm"] as Step[]).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full transition-colors ${
                        s === step
                          ? "bg-sky-500"
                          : (step === "new" && i === 0) || (step === "confirm" && i <= 1)
                            ? "bg-green-500"
                            : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                    {i < 2 && <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />}
                  </div>
                ))}
              </div>

              {/* PIN dots */}
              <div className="flex justify-center gap-3 mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      error
                        ? "bg-red-400"
                        : i < activePin.length
                          ? "bg-gray-900 dark:bg-gray-100"
                          : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-sm text-red-500 mb-3">{error}</p>
              )}

              {saving && (
                <p className="text-center text-sm text-gray-400 mb-3">Saving...</p>
              )}

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((key) => {
                  if (key === "") return <div key="empty" />;
                  if (key === "back") {
                    return (
                      <button
                        key="back"
                        onClick={handleBackspace}
                        disabled={saving}
                        className="h-12 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                        </svg>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => handlePinKey(key)}
                      disabled={saving || activePin.length >= 4}
                      className="h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-lg font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
