const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "..", "public", "research-intake.html"), "utf8");

test("research intake client script parses as valid JavaScript", () => {
  const start = html.indexOf("<script>");
  const end = html.indexOf("</script>", start + 8);
  assert.notEqual(start, -1, "expected an inline application script");
  assert.notEqual(end, -1, "expected the inline application script to close");
  assert.equal(html.indexOf("<script>", start + 8), -1, "expected one inline application script");
  assert.doesNotThrow(() => new vm.Script(html.slice(start + 8, end)), "inline client script must parse");
});

test("research intake preserves the original payload for uncertain persistence retries", () => {
  assert.match(html, /sessionStorage\.setItem\(pendingPayloadStorageKey,pendingSubmission\)/);
  assert.match(html, /const restored=JSON\.parse\(saved\)/);
  assert.match(html, /pendingSubmission=saved;Object\.assign\(state,restored\)/);
  assert.match(html, /show\(7\);const submitButton=document\.getElementById\('submit'\);submitButton\.textContent='Retry same submission'/);
  assert.match(html, /if\(r\.status===400\|\|r\.status===422\)\{pendingSubmission=null;try\{sessionStorage\.removeItem\(pendingPayloadStorageKey\)\}catch\{\}\}throw new Error/);
  assert.match(html, /sessionStorage\.removeItem\(submissionStorageKey\);sessionStorage\.removeItem\(pendingPayloadStorageKey\)/);
});
