import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const fuel = db.prepare(`
    SELECT f.tank_level, f.jerry_cans_full, f.jerry_cans_empty, f.created_at,
           u.name as reported_by
    FROM fuel_logs f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
    LIMIT 1
  `).get();

  return NextResponse.json(fuel || {
    tank_level: 8,
    jerry_cans_full: 0,
    jerry_cans_empty: 0,
    created_at: null,
    reported_by: null,
  });
}
