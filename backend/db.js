const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'bbsec.sqlite');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Failed to open SQLite database', error);
  }
});

function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        wallet TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_login TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        detail TEXT NOT NULL,
        user_id INTEGER,
        created_at TEXT NOT NULL
      )
    `);
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

function addAuditEvent(eventType, detail, userId = null) {
  return run(
    'INSERT INTO audit_events (event_type, detail, user_id, created_at) VALUES (?, ?, ?, ?)',
    [eventType, detail, userId, new Date().toISOString()],
  );
}

module.exports = {
  db,
  initDb,
  run,
  get,
  addAuditEvent,
};
