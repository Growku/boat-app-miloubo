import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const upcoming = searchParams.get("upcoming");

  if (upcoming === "true") {
    const today = new Date().toISOString().slice(0, 10);
    const reservations = db.prepare(`
      SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.cancelled_at IS NULL AND r.date >= ?
      ORDER BY r.date ASC LIMIT 5
    `).all(today);
    return NextResponse.json(reservations);
  }

  if (month) {
    const reservations = db.prepare(`
      SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.cancelled_at IS NULL AND r.date LIKE ?
      ORDER BY r.date ASC
    `).all(`${month}%`);
    return NextResponse.json(reservations);
  }

  if (year) {
    const reservations = db.prepare(`
      SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.cancelled_at IS NULL AND r.date LIKE ?
      ORDER BY r.date ASC
    `).all(`${year}%`);
    return NextResponse.json(reservations);
  }

  const reservations = db.prepare(`
    SELECT r.id, r.user_id, r.date, r.created_at, r.cancelled_at, u.name as user_name
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    WHERE r.cancelled_at IS NULL
    ORDER BY r.date ASC
  `).all();
  return NextResponse.json(reservations);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { user_id, date } = body;

  if (!user_id || !date) {
    return NextResponse.json({ error: "user_id and date are required" }, { status: 400 });
  }

  const existing = db.prepare(
    "SELECT id FROM reservations WHERE date = ? AND cancelled_at IS NULL"
  ).get(date);

  if (existing) {
    return NextResponse.json({ error: "This date is already reserved" }, { status: 409 });
  }

  const insert = db.transaction(() => {
    db.prepare("INSERT INTO reservations (user_id, date) VALUES (?, ?)").run(user_id, date);
    db.prepare(
      "INSERT INTO activity_log (user_id, action, target_date, detail) VALUES (?, 'booked', ?, 'Reserved this date')"
    ).run(user_id, date);
  });
  insert();

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("user_id");

  if (!id || !userId) {
    return NextResponse.json({ error: "id and user_id are required" }, { status: 400 });
  }

  // Check if the requesting user is an admin
  const requestingUser = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(Number(userId)) as
    | { is_admin: number }
    | undefined;
  const isAdmin = requestingUser?.is_admin === 1;

  // Admin can cancel any reservation; regular users can only cancel their own
  let existing: { id: number; date: string; user_id: number } | undefined;
  if (isAdmin) {
    existing = db.prepare(
      "SELECT id, date, user_id FROM reservations WHERE id = ? AND cancelled_at IS NULL"
    ).get(Number(id)) as { id: number; date: string; user_id: number } | undefined;
  } else {
    existing = db.prepare(
      "SELECT id, date, user_id FROM reservations WHERE id = ? AND user_id = ? AND cancelled_at IS NULL"
    ).get(Number(id), Number(userId)) as { id: number; date: string; user_id: number } | undefined;
  }

  if (!existing) {
    return NextResponse.json({ error: "Reservation not found or not yours" }, { status: 403 });
  }

  const ownerName = (db.prepare("SELECT name FROM users WHERE id = ?").get(existing.user_id) as { name: string })?.name;
  const isOwnReservation = existing.user_id === Number(userId);

  const cancel = db.transaction(() => {
    db.prepare("UPDATE reservations SET cancelled_at = datetime('now') WHERE id = ?").run(Number(id));
    db.prepare(
      "INSERT INTO activity_log (user_id, action, target_date, detail) VALUES (?, 'cancelled', ?, ?)"
    ).run(
      Number(userId),
      existing!.date,
      isOwnReservation ? "Cancelled reservation" : `Cancelled ${ownerName}'s reservation (admin)`
    );
  });
  cancel();

  return NextResponse.json({ success: true });
}
