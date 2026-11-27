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

assert.match(sharedCss, /\.ifd-footer-links a\s*\{[^}]*color:\s*#d6b15a/is,
  "Footer utility links must use the established Cathedral gold");
assert.match(sharedCss, /\.ifd-copyright-link[^}]*color:\s*#d6b15a/is,
  "Copyright must retain the established Cathedral gold");

for (const filename of gateways) {
  const html = fs.readFileSync(path.join(root, filename), "utf8");
  assert.match(html, /<link rel="stylesheet" href="\/copyright\.css">/,
    filename + " must load the shared footer stylesheet");
  assert.match(html, /<footer\\b[^>]*class="ifd-footer"/,
    filename + " must contain the shared Cathedral footer");
  assert.match(html, /<table\\b(?=[^>]*role="presentation")(?=[^>]*border="0")/i,
    filename + " must use a borderless footer table");
  assert.match(html, /<tr>\\s*<td[\\s\\S]*?<td[\\s\\S]*?<td[\\s\\S]*?<td[\\s\\S]*?<\\/tr>/i,
    filename + " must contain one footer row with four columns");
  assert.doesNotMatch(html, /class="ifd-copyright"/,
    filename + " must not center copyright in the old standalone copyright block");
  for (const [label, href] of requiredLinks) {
    const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const anchorPattern = new RegExp("<a\\b(?=[^>]*href=\"" + escapedHref + "\")[^>]*>" + escapedLabel + "</a>");
    assert.match(html, anchorPattern,
      filename + " must include " + label + " → " + href);
  }
}
console.log(JSON.stringify({ result: "PASS", gateways_checked: gateways.length, utilities_per_gateway: requiredLinks.length, gold: "#d6b15a" }, null, 2));
