import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const current = db.prepare(`
    SELECT f.id, f.user_id, f.tank_level, f.jerry_cans_full, f.jerry_cans_empty, f.created_at, u.name as user_name
    FROM fuel_logs f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.id DESC
    LIMIT 1
  `).get() as {
    id: number;
    user_id: number;
    tank_level: number;
    jerry_cans_full: number;
    jerry_cans_empty: number;
    created_at: string;
    user_name: string;
  } | undefined;

  const history = db.prepare(`
    SELECT f.id, f.user_id, f.tank_level, f.jerry_cans_full, f.jerry_cans_empty, f.created_at, u.name as user_name
    FROM fuel_logs f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.id DESC
    LIMIT 10
  `).all();

  return NextResponse.json({
    current: current || { tank_level: 8, jerry_cans_full: 0, jerry_cans_empty: 0 },
    history,
  });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { user_id, tank_level, jerry_cans_full, jerry_cans_empty } = body;

  if (!user_id || tank_level === undefined) {
    return NextResponse.json({ error: "user_id and tank_level are required" }, { status: 400 });
  }

  if (tank_level < 0 || tank_level > 8) {
    return NextResponse.json({ error: "tank_level must be 0-8" }, { status: 400 });
  }

  const insert = db.transaction(() => {
    db.prepare(
      "INSERT INTO fuel_logs (user_id, tank_level, jerry_cans_full, jerry_cans_empty) VALUES (?, ?, ?, ?)"
    ).run(user_id, tank_level, jerry_cans_full ?? 0, jerry_cans_empty ?? 0);

    db.prepare(
      "INSERT INTO activity_log (user_id, action, detail) VALUES (?, 'fuel_update', ?)"
    ).run(user_id, `Tank ${tank_level}/8, ${jerry_cans_full ?? 0} full / ${jerry_cans_empty ?? 0} empty cans`);
  });
  insert();

  return NextResponse.json({ success: true }, { status: 201 });
}
