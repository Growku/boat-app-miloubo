import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || new Date().getFullYear().toString();
  const month = searchParams.get("month");

  let datePrefix = year;
  if (month) {
    datePrefix = `${year}-${month.padStart(2, "0")}`;
  }

  const stats = db.prepare(`
    SELECT u.id, u.name, COUNT(r.id) as trip_count
    FROM users u
    LEFT JOIN reservations r ON u.id = r.user_id AND r.date LIKE ? || '%' AND r.cancelled_at IS NULL
    GROUP BY u.id, u.name
    ORDER BY trip_count DESC, u.name ASC
  `).all(datePrefix) as Array<{ id: number; name: string; trip_count: number }>;

  const availableYears = db.prepare(`
    SELECT DISTINCT substr(date, 1, 4) as year
    FROM reservations
    ORDER BY year DESC
  `).all() as Array<{ year: string }>;

  const yearList = availableYears.map((r) => r.year);
  const currentYear = new Date().getFullYear().toString();
  if (!yearList.includes(currentYear)) {
    yearList.unshift(currentYear);
  }

  const availableMonths = db.prepare(`
    SELECT DISTINCT substr(date, 6, 2) as month
    FROM reservations
    WHERE date LIKE ? || '%' AND cancelled_at IS NULL
    ORDER BY month ASC
  `).all(year) as Array<{ month: string }>;

  return NextResponse.json({
    stats,
    availableYears: yearList,
    availableMonths: availableMonths.map((r) => r.month),
  });
}
