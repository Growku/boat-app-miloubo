"use client";

import { useState } from "react";
import { FuelLog, User } from "@/lib/types";

interface FuelGaugeProps {
  current: {
    tank_level: number;
    jerry_cans_full: number;
    jerry_cans_empty: number;
  };
  history: FuelLog[];
  currentUser: User | null;
  onUpdate: (tankLevel: number, jerryFull: number, jerryEmpty: number) => void;
  saving?: boolean;
}

function ArcGauge({ level, maxLevel = 8 }: { level: number; maxLevel?: number }) {
  const size = 180;
  const strokeWidth = 16;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const radius = (size - strokeWidth) / 2 - 6;

  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = startAngle - endAngle;
  const fillAngle = startAngle - (level / maxLevel) * sweepAngle;

  const polarToCartesian = (angle: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  });

  const bgStart = polarToCartesian(startAngle);
  const bgEnd = polarToCartesian(endAngle);
  const fillStart = polarToCartesian(startAngle);
  const fillEnd = polarToCartesian(fillAngle);
  const fillSweep = startAngle - fillAngle;
  const largeArc = fillSweep > Math.PI ? 1 : 0;

  const getColor = (l: number) => {
    if (l <= 2) return "#ef4444";
    if (l <= 4) return "#f59e0b";
    return "#22c55e";
  };

  const color = getColor(level);

  const ticks = Array.from({ length: maxLevel + 1 }, (_, i) => {
    const angle = startAngle - (i / maxLevel) * sweepAngle;
    const inner = radius - strokeWidth / 2 - 3;
    const outer = radius + strokeWidth / 2 + 3;
    return {
      x1: cx + inner * Math.cos(angle),
      y1: cy - inner * Math.sin(angle),
      x2: cx + outer * Math.cos(angle),
      y2: cy - outer * Math.sin(angle),
      label: i,
      lx: cx + (outer + 9) * Math.cos(angle),
      ly: cy - (outer + 9) * Math.sin(angle),
    };
  });

  const needleAngle = startAngle - (level / maxLevel) * sweepAngle;
  const needleLength = radius - strokeWidth / 2 - 6;
  const needleTip = {
    x: cx + needleLength * Math.cos(needleAngle),
    y: cy - needleLength * Math.sin(needleAngle),
  };

  return (
    <svg viewBox={`0 0 ${size} ${size / 2 + 24}`} className="w-full max-w-[200px] mx-auto gauge-svg">
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
        fill="none"
        className="stroke-gray-200 dark:stroke-gray-700"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {level > 0 && (
        <path
          d={`M ${fillStart.x} ${fillStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      )}
      {ticks.map((tick) => (
        <line
          key={tick.label}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          className="stroke-gray-300 dark:stroke-gray-600"
          strokeWidth={tick.label === 0 || tick.label === maxLevel ? 1.5 : 0.75}
        />
      ))}
      <line
        x1={cx}
        y1={cy}
        x2={needleTip.x}
        y2={needleTip.y}
        className="stroke-gray-700 dark:stroke-gray-300 transition-all duration-700 ease-out"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={4} className="fill-gray-700 dark:fill-gray-300" />
      <circle cx={cx} cy={cy} r={2} className="fill-gray-400 dark:fill-gray-500" />
      <text x={cx} y={cy + 18} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="10" fontWeight="600">
        {level}/{maxLevel}
      </text>
      <text x={ticks[0].lx - 1} y={ticks[0].ly + 3} textAnchor="end" className="fill-gray-400 dark:fill-gray-500" fontSize="9" fontWeight="600">E</text>
      <text x={ticks[maxLevel].lx + 1} y={ticks[maxLevel].ly + 3} textAnchor="start" className="fill-gray-400 dark:fill-gray-500" fontSize="9" fontWeight="600">F</text>
    </svg>
  );
}

export default function FuelGauge({ current, history, currentUser, onUpdate, saving = false }: FuelGaugeProps) {
  const [editing, setEditing] = useState(false);
  const [tankLevel, setTankLevel] = useState(current.tank_level);
  const [jerryFull, setJerryFull] = useState(current.jerry_cans_full);
  const [jerryEmpty, setJerryEmpty] = useState(current.jerry_cans_empty);

  const handleSave = () => {
    if (saving) return;
    onUpdate(tankLevel, jerryFull, jerryEmpty);
    setEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Diesel</h3>
      </div>

      <ArcGauge level={current.tank_level} />

      {/* Jerry cans */}
      <div className="flex items-center justify-center gap-3 mt-2 mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Jerry cans:</span>
        <span className="text-xs px-2 py-0.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded font-medium">
          {current.jerry_cans_full} full
        </span>
        <span className="text-xs px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded font-medium">
          {current.jerry_cans_empty} empty
        </span>
      </div>

      {currentUser && !editing && (
        <button
          onClick={() => {
            setTankLevel(current.tank_level);
            setJerryFull(current.jerry_cans_full);
            setJerryEmpty(current.jerry_cans_empty);
            setEditing(true);
          }}
          className="w-full py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
        >
          Update after trip
        </button>
      )}

      {editing && (
        <div className="space-y-2.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Tank level
            </label>
            <div className="flex gap-0.5">
              {Array.from({ length: 9 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setTankLevel(i)}
                  className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                    i === tankLevel
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : i < tankLevel
                        ? "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Full cans</label>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setJerryFull(Math.max(0, jerryFull - 1))} className="w-7 h-7 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-sm">-</button>
                <span className="w-6 text-center text-sm font-medium">{jerryFull}</span>
                <button onClick={() => setJerryFull(Math.min(10, jerryFull + 1))} className="w-7 h-7 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-sm">+</button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Empty cans</label>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setJerryEmpty(Math.max(0, jerryEmpty - 1))} className="w-7 h-7 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-sm">-</button>
                <span className="w-6 text-center text-sm font-medium">{jerryEmpty}</span>
                <button onClick={() => setJerryEmpty(Math.min(10, jerryEmpty + 1))} className="w-7 h-7 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-sm">+</button>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button onClick={() => setEditing(false)} disabled={saving} className="flex-1 py-1.5 text-xs rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-1.5 text-xs rounded bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 font-medium disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      )}

      {/* Recent history */}
      {history.length > 0 && !editing && (
        <div className="mt-3 space-y-0.5">
          <h4 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Recent</h4>
          {history.slice(0, 5).map((log) => {
            const totalCans = log.jerry_cans_full + log.jerry_cans_empty;
            return (
              <div key={log.id} className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 py-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300 shrink-0">{log.user_name}</span>
                  <span className="text-gray-300 dark:text-gray-600 shrink-0">—</span>
                  <span className="shrink-0">{log.tank_level}/8</span>
                  {totalCans > 0 && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                      ({log.jerry_cans_full}F/{log.jerry_cans_empty}E)
                    </span>
                  )}
                </div>
                <span className="text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                  {new Date(log.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
