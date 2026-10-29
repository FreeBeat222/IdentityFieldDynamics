const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("research intake keeps the exact payload for uncertain persistence retries", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "public", "research-intake.html"), "utf8");
  assert.match(html, /if\(r\.status===400\|\|r\.status===422\)pendingSubmission=null;throw new Error/);
});
