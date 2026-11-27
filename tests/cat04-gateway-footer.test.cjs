const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../public");
const pages = fs.readdirSync(root).filter(name => name.endsWith(".html")).sort();
const expected = [
  ["Copyright © 2026 Rick York", "/copyright"],
  ["Contact Us", "/contact"],
  ["Privacy Policy", "/privacy"],
  ["Terms & Conditions", "/terms"]
];
const sharedCss = fs.readFileSync(path.join(root, "copyright.css"), "utf8");

assert.match(sharedCss, /\.ifd-footer-links\s*\{[\s\S]*?display:\s*flex[\s\S]*?flex-wrap:\s*wrap[\s\S]*?justify-content:\s*center/i,
  "Shared footer must center its four links and wrap on narrow screens");
assert.match(sharedCss, /\.ifd-footer-links a:focus-visible\s*\{[\s\S]*?outline:\s*2px/i,
  "Footer links must retain visible keyboard focus");
assert.doesNotMatch(sharedCss, /\.ifd-footer-brand\s*\{|\.ifd-footer table/i,
  "Shared footer CSS must not retain the former brand label or table layout");

function inspectFooter(html, filename) {
  const matches = [...html.matchAll(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gi)];
  assert.equal(matches.length, 1, filename + " must contain exactly one footer");
  assert.match(matches[0][0], /<footer class="ifd-footer">/i,
    filename + " must use the shared footer component");
  const inner = matches[0][1];
  const links = [...inner.matchAll(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => [m[2].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim(), m[1]]);
  assert.deepEqual(links, expected, filename + " must contain only the four canonical links in order");
  const text = inner.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  assert.equal(text, expected.map(x => x[0]).join(" "), filename + " footer must contain no additional text");
}

for (const filename of pages) {
  const html = fs.readFileSync(path.join(root, filename), "utf8");
  inspectFooter(html, filename);
  assert.ok(html.includes('<link rel="stylesheet" href="/copyright.css">'),
    filename + " must load the shared footer stylesheet");
}

const serverSource = fs.readFileSync(path.resolve(__dirname, "../server.js"), "utf8");
const template = serverSource.match(/const deepPage = [\s\S]*?;\n\napp\.post/);
assert.ok(template, "Dynamic deepPage template must remain present");
inspectFooter(template[0], "server.js deepPage template");

console.log(JSON.stringify({
  result: "PASS",
  static_pages_checked: pages.length,
  links_per_footer: expected.length,
  responsive: true,
  dynamic_template: "PASS"
}, null, 2));
