export interface User {
  id: number;
  name: string;
  pin?: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  date: string;
  created_at: string;
  cancelled_at?: string | null;
  user_name?: string;
}

export interface FuelLog {
  id: number;
  user_id: number;
  tank_level: number;
  jerry_cans_full: number;
  jerry_cans_empty: number;
  created_at: string;
  user_name?: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  target_date?: string;
  detail?: string;
  created_at: string;
  user_name?: string;
}

// Color palette for users
export const USER_COLORS: Record<string, string> = {
  Lou: "#3b82f6",
  Josha: "#ef4444",
  Ruby: "#ec4899",
  Wouter: "#f97316",
  Corine: "#8b5cf6",
  Maarten: "#14b8a6",
  Nicole: "#eab308",
  Tom: "#22c55e",
  Michael: "#6366f1",
  Bob: "#f43f5e",
  Reinout: "#0ea5e9",
};
