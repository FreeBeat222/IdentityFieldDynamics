const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "data");
const EVENT_FILE = path.join(DATA_DIR, "telemetry.ndjson");

const EVENT_TYPES = new Set([
  "page_view",
  "confessional_view",
  "confessional_seed_open",
  "confessional_response_started",
  "confessional_response_submitted",
  "research_interest_click",
  "experiment_interest_click"
]);

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function cleanString(value, max = 120) {
  return typeof value === "string" ? value.slice(0, max) : undefined;
}

function recordEvent(input = {}) {
  ensureStore();

  const eventType = cleanString(input.event_type, 80);
  if (!EVENT_TYPES.has(eventType)) return false;

  const event = {
    event_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    event_type: eventType,
    path: cleanString(input.path, 240) || "/",
    session_id: cleanString(input.session_id, 80),
    seed_id: cleanString(input.seed_id, 80),
    source: cleanString(input.source, 80)
  };

  // Deliberately do not persist IP address, user-agent, email, name,
  // free-form response text, or a persistent cross-visit identifier.
  fs.appendFileSync(EVENT_FILE, JSON.stringify(event) + "\n", { encoding: "utf8" });
  return true;
}

function parseEvents() {
  if (!fs.existsSync(EVENT_FILE)) return [];
  return fs.readFileSync(EVENT_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch (_) { return null; }
    })
    .filter(Boolean);
}

function report() {
  const events = parseEvents();
  const byEvent = {};
  const byPath = {};
  const byDay = {};
  const bySeed = {};

  for (const e of events) {
    byEvent[e.event_type] = (byEvent[e.event_type] || 0) + 1;
    byPath[e.path] = (byPath[e.path] || 0) + 1;
    const day = (e.timestamp || "").slice(0, 10);
    if (day) byDay[day] = (byDay[day] || 0) + 1;
    if (e.seed_id) bySeed[e.seed_id] = (bySeed[e.seed_id] || 0) + 1;
  }

  return {
    generated_at: new Date().toISOString(),
    total_events: events.length,
    by_event_type: byEvent,
    by_path: byPath,
    by_day: byDay,
    by_seed: bySeed
  };
}

function requireAdmin(req, res, next) {
  const configured = process.env.ANALYTICS_ADMIN_TOKEN;
  if (!configured) return res.status(404).json({ error: "Analytics reporting is not configured." });
  const auth = req.get("authorization") || "";
  if (auth !== `Bearer ${configured}`) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  next();
}

function install(app) {
  app.post("/api/telemetry", (req, res) => {
    try {
      const accepted = recordEvent(req.body);
      if (!accepted) return res.status(400).json({ accepted: false });
      res.status(202).json({ accepted: true });
    } catch (_) {
      res.status(500).json({ accepted: false });
    }
  });

  app.get("/api/telemetry/report", requireAdmin, (_req, res) => {
    res.json(report());
  });
}

module.exports = { install, recordEvent, report };
