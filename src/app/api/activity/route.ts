import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get("date");
  const limit = Number(searchParams.get("limit") || "30");

  if (targetDate) {
    const logs = db.prepare(`
      SELECT a.id, a.user_id, a.action, a.target_date, a.detail, a.created_at, u.name as user_name
      FROM activity_log a
      JOIN users u ON a.user_id = u.id
      WHERE a.target_date = ?
      ORDER BY a.created_at DESC LIMIT ?
    `).all(targetDate, limit);
    return NextResponse.json(logs);
  }

  const logs = db.prepare(`
    SELECT a.id, a.user_id, a.action, a.target_date, a.detail, a.created_at, u.name as user_name
    FROM activity_log a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC LIMIT ?
  `).all(limit);
  return NextResponse.json(logs);
}
