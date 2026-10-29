const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

test("database schema can store the full independently recorded trace", () => {
  const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
  const validation = fs.readFileSync(path.join(root, "lib", "research-intake-validation.js"), "utf8");
  const migration = fs.readFileSync(
    path.join(root, "migrations", "2026-10-28-research-intake-independent-trace.sql"),
    "utf8"
  );

  assert.match(validation, /independent:\s*3000/);
  assert.match(server, /independent_trace TEXT\b/);
  assert.match(server, /submission_key VARCHAR\(128\) NULL/);
  assert.match(server, /UNIQUE KEY uq_research_intake_submission_key \(submission_key\)/);
  assert.match(migration, /MODIFY COLUMN independent_trace TEXT NULL/i);
});
