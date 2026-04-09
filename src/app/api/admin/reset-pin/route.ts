import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { admin_id, target_user_id, new_pin } = body;

  if (!admin_id || !target_user_id) {
    return NextResponse.json({ error: "admin_id and target_user_id are required" }, { status: 400 });
  }

  // Verify admin
  const admin = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(Number(admin_id)) as
    | { is_admin: number }
    | undefined;

  if (!admin || admin.is_admin !== 1) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Verify target user exists
  const target = db.prepare("SELECT id, name FROM users WHERE id = ?").get(Number(target_user_id)) as
    | { id: number; name: string }
    | undefined;

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const pin = new_pin || "0000";
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be exactly 4 digits" }, { status: 400 });
  }

  db.prepare("UPDATE users SET pin = ? WHERE id = ?").run(pin, Number(target_user_id));

  return NextResponse.json({
    success: true,
    message: `PIN for ${target.name} has been reset`,
  });
}
