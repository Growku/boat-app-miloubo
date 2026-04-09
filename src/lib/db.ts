import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "boat.db");

let db: Database.Database | null = null;

const USERS = [
  "Lou", "Josha", "Ruby", "Wouter", "Corine",
  "Maarten", "Nicole", "Tom", "Michael", "Bob", "Reinout",
];

export function getDb(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");

  // Check if tables exist
  const tableCheck = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  ).get();

  if (!tableCheck) {
    initializeDb(db);
  } else {
    migrateDb(db);
  }

  return db;
}

function initializeDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL DEFAULT '0000'
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      cancelled_at TEXT DEFAULT NULL
    )
  `);

  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
    ON reservations (date) WHERE cancelled_at IS NULL
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS fuel_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      tank_level INTEGER NOT NULL CHECK(tank_level >= 0 AND tank_level <= 8),
      jerry_cans_full INTEGER NOT NULL DEFAULT 0,
      jerry_cans_empty INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      target_date TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Seed users with default PIN 0000
  const insert = database.prepare("INSERT OR IGNORE INTO users (name, pin) VALUES (?, '0000')");
  const seedAll = database.transaction(() => {
    for (const name of USERS) {
      insert.run(name);
    }
  });
  seedAll();

  // Seed initial fuel log (full tank, 0 jerry cans)
  database.prepare(
    "INSERT INTO fuel_logs (user_id, tank_level, jerry_cans_full, jerry_cans_empty) VALUES (1, 8, 0, 0)"
  ).run();
}

function migrateDb(database: Database.Database) {
  // Add pin column to users if missing
  const userCols = database.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  if (!userCols.some((c) => c.name === "pin")) {
    database.exec("ALTER TABLE users ADD COLUMN pin TEXT NOT NULL DEFAULT '0000'");
  }

  // Add cancelled_at column to reservations if missing
  const resCols = database.prepare("PRAGMA table_info(reservations)").all() as Array<{ name: string }>;
  if (!resCols.some((c) => c.name === "cancelled_at")) {
    database.exec("ALTER TABLE reservations ADD COLUMN cancelled_at TEXT DEFAULT NULL");
  }

  // Create activity_log table if missing
  database.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      target_date TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migrate: replace UNIQUE constraint on date with partial unique index
  try {
    const tableInfo = database.prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='reservations'"
    ).get() as { sql: string } | undefined;

    if (tableInfo && tableInfo.sql.includes("UNIQUE") && tableInfo.sql.includes("date")) {
      database.exec("ALTER TABLE reservations RENAME TO reservations_old");
      database.exec(`
        CREATE TABLE reservations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id),
          date TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          cancelled_at TEXT DEFAULT NULL
        )
      `);
      database.exec(`
        INSERT INTO reservations (id, user_id, date, created_at, cancelled_at)
        SELECT id, user_id, date, created_at, cancelled_at FROM reservations_old
      `);
      database.exec("DROP TABLE reservations_old");
      database.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
        ON reservations (date) WHERE cancelled_at IS NULL
      `);
    }
  } catch {
    try {
      database.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_active_date
        ON reservations (date) WHERE cancelled_at IS NULL
      `);
    } catch {
      // Index may already exist
    }
  }
}

export type { User, Reservation, FuelLog, ActivityLog } from "./types";
