// ─── db.js — Database setup (SQLite via sql.js — pure JS, no build tools needed)
// Drop-in replacement for the better-sqlite3 version.
// All public exports are identical so server.js / auth.js need no changes.

const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const DB_PATH = path.resolve(process.env.DB_PATH || "./redcipher.db");

// sql.js works fully in memory; we load from disk on startup and flush on writes.
let db; // will be set in initDb()

// ─── Persist helper ───────────────────────────────────────────────────────────
function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ─── Low-level helpers ────────────────────────────────────────────────────────
// getOne and getAll defined BEFORE runWrite so they can be called inside it.

function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function runWrite(sql, params = []) {
  db.run(sql, params);
  // Return lastInsertRowid to match better-sqlite3's .run() return value
  const row = getOne("SELECT last_insert_rowid() as lastInsertRowid");
  save();
  return { lastInsertRowid: row ? row.lastInsertRowid : null };
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`PRAGMA foreign_keys = ON;`);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT    UNIQUE NOT NULL COLLATE NOCASE,
      name        TEXT    NOT NULL,
      password    TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS progress (
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      level_id     INTEGER NOT NULL CHECK(level_id BETWEEN 1 AND 5),
      completed    INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      PRIMARY KEY (user_id, level_id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      cert_id    TEXT    UNIQUE NOT NULL,
      full_name  TEXT    NOT NULL,
      issued_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  save();
  return db;
}

// ─── Exported helpers (same interface as the better-sqlite3 version) ──────────
module.exports = {
  initDb,

  createUser: (email, name, hashedPassword) =>
    runWrite(
      "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
      [email, name, hashedPassword]
    ),

  findUserByEmail: (email) =>
    getOne("SELECT * FROM users WHERE email = ? COLLATE NOCASE", [email]),

  findUserById: (id) =>
    getOne(
      "SELECT id, email, name, created_at FROM users WHERE id = ?",
      [id]
    ),

  markLevelComplete: (userId, levelId) =>
    runWrite(
      `INSERT INTO progress (user_id, level_id, completed, completed_at)
       VALUES (?, ?, 1, datetime('now'))
       ON CONFLICT(user_id, level_id) DO UPDATE SET
         completed    = 1,
         completed_at = datetime('now')`,
      [userId, levelId]
    ),

  getUserProgress: (userId) => {
    const rows = getAll(
      "SELECT level_id, completed, completed_at FROM progress WHERE user_id = ?",
      [userId]
    );
    const map = {};
    for (let i = 1; i <= 5; i++) {
      map[i] = { completed: false, completedAt: null };
    }
    for (const row of rows) {
      map[row.level_id] = {
        completed: row.completed === 1,
        completedAt: row.completed_at,
      };
    }
    return map;
  },

  createCertificate: (userId, certId, fullName) =>
    runWrite(
      "INSERT INTO certificates (user_id, cert_id, full_name) VALUES (?, ?, ?)",
      [userId, certId, fullName]
    ),

  getCertificate: (userId) =>
    getOne(
      "SELECT cert_id, full_name, issued_at FROM certificates WHERE user_id = ?",
      [userId]
    ),
};
