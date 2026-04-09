import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Helper to verify admin
function isAdmin(db: ReturnType<typeof getDb>, userId: number): boolean {
  const user = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(userId) as
    | { is_admin: number }
    | undefined;
  return user?.is_admin === 1;
}

// GET: list all users with admin info (admin only)
export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const adminId = Number(searchParams.get("admin_id"));

  if (!adminId || !isAdmin(db, adminId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = db.prepare("SELECT id, name, is_admin FROM users ORDER BY id").all();
  return NextResponse.json(users);
}

// POST: add a new user (admin only)
export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { admin_id, name } = body;

  if (!admin_id || !name) {
    return NextResponse.json({ error: "admin_id and name are required" }, { status: 400 });
  }

  if (!isAdmin(db, admin_id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 20) {
    return NextResponse.json({ error: "Name must be 2-20 characters" }, { status: 400 });
  }

  // Check if name already exists
  const existing = db.prepare("SELECT id FROM users WHERE name = ?").get(trimmedName);
  if (existing) {
    return NextResponse.json({ error: "A user with this name already exists" }, { status: 409 });
  }

  const result = db.prepare("INSERT INTO users (name, pin, is_admin) VALUES (?, '0000', 0)").run(trimmedName);

  return NextResponse.json({
    id: result.lastInsertRowid,
    name: trimmedName,
    message: "User created with default PIN 0000",
  }, { status: 201 });
}
