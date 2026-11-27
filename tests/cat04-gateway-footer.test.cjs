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
  ['Contact Us', '/contact'],
  ['Terms of Use', '/terms'],
  ['Privacy Policy', '/privacy'],
  ['Copyright © 2026 Rick York', '/copyright']
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
  assert.match(html, /<footer class="ifd-footer">/,
    filename + " must contain the shared Cathedral footer");
  for (const [label, href] of requiredLinks) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp('<a href="' + href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '">' + escaped + '</a>');
    assert.match(html, pattern, filename + " must include " + label + " → " + href);
  }
}
console.log(JSON.stringify({ result: "PASS", gateways_checked: gateways.length, utilities_per_gateway: requiredLinks.length, gold: "#d6b15a" }, null, 2));
