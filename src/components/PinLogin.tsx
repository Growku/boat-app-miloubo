"use client";

import { useState } from "react";
import { User, USER_COLORS } from "@/lib/types";

interface PinLoginProps {
  users: User[];
  onLogin: (user: User) => void;
  error?: string | null;
}

export default function PinLogin({ users, onLogin, error }: PinLoginProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const handlePinKey = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setPinError(null);

      // Auto-submit on 4 digits
      if (newPin.length === 4 && selectedUser) {
        setTimeout(() => {
          setLoading(true);
          setPinError(null);
          fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: selectedUser.id, pin: newPin }),
          })
            .then((res) => {
              if (res.ok) return res.json().then((user) => onLogin(user));
              else {
                setPinError("Incorrect PIN");
                setPin("");
              }
            })
            .catch(() => {
              setPinError("Connection error");
            })
            .finally(() => setLoading(false));
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setPinError(null);
  };

  if (!selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg className="w-7 h-7 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
                <path d="M12 2v10" />
                <path d="M12 4l6 3" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Miloubo</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select your name</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm dark:hover:shadow-none border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: USER_COLORS[user.name] || "#6b7280" }}
                >
                  {user.name[0]}
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3"
            style={{ backgroundColor: USER_COLORS[selectedUser.name] || "#6b7280" }}
          >
            {selectedUser.name[0]}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedUser.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Enter your PIN</p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                pinError
                  ? "bg-red-400"
                  : i < pin.length
                    ? "bg-gray-900 dark:bg-gray-100"
                    : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {pinError && (
          <p className="text-center text-sm text-red-500 mb-4">{pinError}</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((key) => {
            if (key === "") return <div key="empty" />;
            if (key === "back") {
              return (
                <button
                  key="back"
                  onClick={handleBackspace}
                  disabled={loading}
                  className="h-14 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                  </svg>
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => handlePinKey(key)}
                disabled={loading || pin.length >= 4}
                className="h-14 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-lg font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {key}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setSelectedUser(null);
            setPin("");
            setPinError(null);
          }}
          className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-2"
        >
          Back to user list
        </button>
      </div>
    </div>
  );
}
