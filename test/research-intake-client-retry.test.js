const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("research intake preserves the original payload for uncertain persistence retries", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "public", "research-intake.html"), "utf8");

  assert.match(html, /sessionStorage\.setItem\(pendingPayloadStorageKey,pendingSubmission\)/);
  assert.match(html, /const restored=JSON\.parse\(saved\)/);
  assert.match(html, /pendingSubmission=saved;Object\.assign\(state,restored\)/);
  assert.match(html, /show\(7\);const submitButton=document\.getElementById\('submit'\);submitButton\.textContent='Retry same submission'/);
  assert.match(html, /if\(r\.status===400\|\|r\.status===422\)\{pendingSubmission=null;try\{sessionStorage\.removeItem\(pendingPayloadStorageKey\)\}catch\{\}\}throw new Error/);
  assert.match(html, /sessionStorage\.removeItem\(submissionStorageKey\);sessionStorage\.removeItem\(pendingPayloadStorageKey\)/);
});
