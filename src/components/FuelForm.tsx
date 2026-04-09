"use client";

import { useState } from "react";
import { User } from "@/lib/types";

interface FuelFormProps {
  currentUser: User | null;
  onSubmit: (data: {
    user_id: number;
    tank_level: number;
    jerry_cans_full: number;
    jerry_cans_empty: number;
  }) => Promise<void>;
}

export default function FuelForm({ currentUser, onSubmit }: FuelFormProps) {
  const [tankLevel, setTankLevel] = useState(4);
  const [fullCans, setFullCans] = useState(0);
  const [emptyCans, setEmptyCans] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await onSubmit({
        user_id: currentUser.id,
        tank_level: tankLevel,
        jerry_cans_full: fullCans,
        jerry_cans_empty: emptyCans,
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={!currentUser}
        className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Update Fuel Status
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Update Fuel Status
      </h3>

      <div className="space-y-4">
        {/* Tank level slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tank Level: <span className="text-blue-600 font-bold">{tankLevel}/8</span>
          </label>
          <input
            type="range"
            min="0"
            max="8"
            value={tankLevel}
            onChange={(e) => setTankLevel(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Empty</span>
            <span>Full</span>
          </div>
        </div>

        {/* Jerry cans */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Cans
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFullCans(Math.max(0, fullCans - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                −
              </button>
              <span className="text-lg font-semibold w-8 text-center">{fullCans}</span>
              <button
                onClick={() => setFullCans(fullCans + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empty Cans
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEmptyCans(Math.max(0, emptyCans - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                −
              </button>
              <span className="text-lg font-semibold w-8 text-center">{emptyCans}</span>
              <button
                onClick={() => setEmptyCans(emptyCans + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !currentUser}
            className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
