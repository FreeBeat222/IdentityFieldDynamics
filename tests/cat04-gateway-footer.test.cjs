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
  ["Contact Us", "/contact"],
  ["Terms of Use", "/terms"],
  ["Privacy Policy", "/privacy"],
  ["Copyright © 2026 Rick York", "/copyright"]
];
const sharedCss = fs.readFileSync(path.join(root, "copyright.css"), "utf8");

assert.match(sharedCss, /\.ifd-footer table\s*\{/is,
  "Shared CSS must define the footer table");
assert.match(sharedCss, /\.ifd-footer table,\s*\.ifd-footer table tr,\s*\.ifd-footer table td\s*\{[^}]*border:\s*0/is,
  "Footer table, row, and cells must have invisible borders");

for (const filename of gateways) {
  const html = fs.readFileSync(path.join(root, filename), "utf8");
  assert.ok(html.includes('<link rel="stylesheet" href="/copyright.css">'),
    filename + " must load the shared footer stylesheet");
  assert.match(html, /<footer\b[^>]*class="ifd-footer"/,
    filename + " must contain the shared Cathedral footer");
  assert.match(html, /<table\b(?=[^>]*role="presentation")(?=[^>]*border="0")/i,
    filename + " must use a borderless footer table");
  assert.match(html, /<tr>\s*<td[\s\S]*?<td[\s\S]*?<td[\s\S]*?<td[\s\S]*?<\/tr>/i,
    filename + " must contain one footer row with four columns");
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
