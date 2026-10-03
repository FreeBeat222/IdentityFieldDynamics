const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "ifd-archive.sqlite");

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  let DatabaseSync;
  try {
    ({ DatabaseSync } = require("node:sqlite"));
  } catch {
    return null;
  }
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS encounters (
      id TEXT PRIMARY KEY,
      occurred_at TEXT NOT NULL,
      local_time TEXT,
      participants TEXT NOT NULL,
      context TEXT,
      trigger_text TEXT,
      recognition TEXT,
      construct TEXT,
      status TEXT NOT NULL DEFAULT 'observation',
      transcript TEXT NOT NULL,
      transcript_sha256 TEXT NOT NULL,
      previous_sha256 TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_encounters_occurred_at ON encounters(occurred_at);
    CREATE INDEX IF NOT EXISTS idx_encounters_construct ON encounters(construct);
  `);
  return db;
}

function auth(req, res) {
  const expected = process.env.IFD_ARCHIVE_KEY;
  const supplied = req.get("x-ifd-archive-key") || req.body?.key;
  if (!expected) {
    res.status(503).json({ error: "Archive intake is not configured. Set IFD_ARCHIVE_KEY." });
    return false;
  }
  if (!supplied || supplied.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    res.status(401).json({ error: "Archive access denied." });
    return false;
  }
  return true;
}

function mountArchive(app) {
  const db = ensureStore();

  app.post("/api/archive/access", (req, res) => {
    if (!db) return res.status(503).json({ error: "SQLite is unavailable on this Node runtime." });
    if (!auth(req, res)) return;
    const q = String(req.body?.q || "").trim();
    const limit = Math.min(Math.max(Number(req.body?.limit || 100), 1), 500);
    let rows;
    if (q) {
      const like = `%${q}%`;
      rows = db.prepare(`
        SELECT id, occurred_at, local_time, participants, context, trigger_text,
               recognition, construct, status, transcript, transcript_sha256, previous_sha256, created_at
        FROM encounters
        WHERE transcript LIKE ? OR context LIKE ? OR construct LIKE ? OR recognition LIKE ?
        ORDER BY occurred_at DESC LIMIT ?
      `).all(like, like, like, like, limit);
    } else {
      rows = db.prepare(`
        SELECT id, occurred_at, local_time, participants, context, trigger_text,
               recognition, construct, status, transcript, transcript_sha256, previous_sha256, created_at
        FROM encounters ORDER BY occurred_at DESC LIMIT ?
      `).all(limit);
    }
    res.json({ count: rows.length, encounters: rows });
  });

  app.post("/api/archive/encounters", (req, res) => {
    if (!db) return res.status(503).json({ error: "SQLite is unavailable on this Node runtime." });
    if (!auth(req, res)) return;

    const b = req.body || {};
    const transcript = String(b.transcript || "");
    if (!transcript.trim()) return res.status(400).json({ error: "A word-for-word transcript is required." });

    const occurredAt = String(b.occurred_at || new Date().toISOString());
    const id = String(b.id || `IFD-ENC-${occurredAt.replace(/[^0-9]/g, "").slice(0, 14)}-${crypto.randomBytes(3).toString("hex")}`);
    const previous = db.prepare("SELECT transcript_sha256 FROM encounters ORDER BY created_at DESC LIMIT 1").get();
    const record = {
      id,
      occurred_at: occurredAt,
      local_time: String(b.local_time || ""),
      participants: String(b.participants || "Rick ↔ LUNA"),
      context: String(b.context || ""),
      trigger_text: String(b.trigger_text || ""),
      recognition: String(b.recognition || ""),
      construct: String(b.construct || ""),
      status: String(b.status || "observation"),
      transcript
    };
    const canonical = JSON.stringify(record);
    const hash = sha256(canonical);
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO encounters
      (id, occurred_at, local_time, participants, context, trigger_text, recognition, construct,
       status, transcript, transcript_sha256, previous_sha256, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id, record.occurred_at, record.local_time, record.participants, record.context,
      record.trigger_text, record.recognition, record.construct, record.status, record.transcript,
      hash, previous?.transcript_sha256 || null, createdAt
    );

    res.status(201).json({
      id,
      transcript_sha256: hash,
      previous_sha256: previous?.transcript_sha256 || null,
      created_at: createdAt
    });
  });
}

module.exports = { mountArchive };
