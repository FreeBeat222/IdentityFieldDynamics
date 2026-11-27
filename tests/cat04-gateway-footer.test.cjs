const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../public");
const gateways = [
  "understand.html",
  "research-gateway.html",
  "library-gateway.html",
  "museum-gateway.html",
  "experience-gateway.html",
  "participate-gateway.html"
];
const requiredLinks = [
  ["Copyright © 2026 Rick York", "/copyright"],
  ["Contact Us", "/contact"],
  ["Privacy Policy", "/privacy"],
  ["Terms &amp; Conditions", "/terms"]
];
const sharedCss = fs.readFileSync(path.join(root, "copyright.css"), "utf8");

assert.match(sharedCss, /\\.ifd-footer-brand\\s*\\{[^}]*color:\\s*#d6b15a/i,
  "Shared CSS must define the Cathedral-gold footer brand label");
assert.match(sharedCss, /\\.ifd-footer\\s*\\{[^}]*font-family:\\s*Aptos,\\s*"Segoe UI",\\s*sans-serif/is,
  "Shared CSS must own the footer typography");

assert.match(sharedCss, /\.ifd-footer table\s*\{/is,
  "Shared CSS must define the footer table");
assert.match(sharedCss, /width:\s*auto[\s\S]*?margin:\s*14px auto 0/is,
  "Footer utility table must be centered as a group");
assert.match(sharedCss, /text-align:\s*center/is,
  "Footer cells must center their contents");
assert.match(sharedCss, /\.ifd-footer table,\s*\.ifd-footer table tr,\s*\.ifd-footer table td\s*\{[^}]*border:\s*0/is,
  "Footer table, row, and cells must have invisible borders");

for (const filename of gateways) {
  const html = fs.readFileSync(path.join(root, filename), "utf8");
  assert.ok(html.includes('<link rel="stylesheet" href="/copyright.css">'),
    filename + " must load the shared footer stylesheet");
  assert.match(html, /<footer class="ifd-footer">/,
    filename + " must use the shared footer class without inline style attributes");
  assert.match(html, /<div class="ifd-footer-inner">/,
    filename + " must use the shared footer inner wrapper");
  assert.match(html, /<div class="ifd-footer-brand">Identity Field Dynamics · Research in development\.<\/div>/,
    filename + " must use the shared footer brand style");
  assert.doesNotMatch(html, /<footer\b[^>]*\bstyle=/i,
    filename + " must not override the shared footer stylesheet inline");
  assert.doesNotMatch(html, /<div class="ifd-footer-inner"[^>]*\bstyle=/i,
    filename + " must not override the shared inner-wrapper stylesheet inline");
  assert.doesNotMatch(html, /<table\b[^>]*\bstyle=/i,
    filename + " must not override the shared footer-table stylesheet inline");
  assert.match(html, /<table\b(?=[^>]*role="presentation")(?=[^>]*border="0")/i,
    filename + " must use a borderless footer table");
  assert.match(html, /<tr>\s*<td[\s\S]*?<td[\s\S]*?<td[\s\S]*?<td[\s\S]*?<\/tr>/i,
    filename + " must contain one footer row with four columns");
  assert.ok(html.indexOf(">Copyright © 2026 Rick York</a>") < html.indexOf(">Contact Us</a>") &&
    html.indexOf(">Contact Us</a>") < html.indexOf(">Privacy Policy</a>") &&
    html.indexOf(">Privacy Policy</a>") < html.indexOf(">Terms &amp; Conditions</a>"),
    filename + " must preserve the requested footer order");
  assert.doesNotMatch(html, /class="ifd-copyright"/,
    filename + " must not center copyright in the old standalone copyright block");
  for (const [label, href] of requiredLinks) {
    assert.ok(html.includes('href="' + href + '"'),
      filename + " must include link target " + href);
    assert.ok(html.includes(">" + label + "</a>"),
      filename + " must include label " + label);
  }
}
console.log(JSON.stringify({ result: "PASS", gateways_checked: gateways.length, utilities_per_gateway: requiredLinks.length, gold: "#d6b15a" }, null, 2));
