const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "..", "public", "research-intake.html"), "utf8");

test("research intake client script parses as valid JavaScript", () => {
  const scripts = [...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)];
  assert.equal(scripts.length, 1, "expected one inline application script");
  assert.doesNotThrow(() => new vm.Script(scripts[0][1]), "inline client script must parse");
});

test("research intake preserves the original payload for uncertain persistence retries", () => {
  assert.match(html, /sessionStorage\\.setItem\\(pendingPayloadStorageKey,pendingSubmission\\)/);
  assert.match(html, /const restored=JSON\\.parse\\(saved\\)/);
  assert.match(html, /pendingSubmission=saved;Object\\.assign\\(state,restored\\)/);
  assert.match(html, /show\\(7\\);const submitButton=document\\.getElementById\\('submit'\\);submitButton\\.textContent='Retry same submission'/);
  assert.match(html, /if\\(r\\.status===400\\|\\|r\\.status===422\\)\\{pendingSubmission=null;try\\{sessionStorage\\.removeItem\\(pendingPayloadStorageKey\\)\\}catch\\{\\}\\}throw new Error/);
  assert.match(html, /sessionStorage\\.removeItem\\(submissionStorageKey\\);sessionStorage\\.removeItem\\(pendingPayloadStorageKey\\)/);
});
