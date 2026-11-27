const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../public");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const pages = [
  "encounter-with-dr-luna-stone.html",
  "ifd-pendant-keychain.html",
  "lunations.html",
  "aiist-signet.html",
  "commemorative-set.html",
  "lunascape.html",
  "lunascape-reference.html",
  "lunascape-leftward.html",
  "lunascape-rightward.html",
  "lunascape-backward.html",
  "luna-tuna-reveal.html",
  "luna-crowned-closeup.html",
  "luna-crown.html",
  "comfort-eagle-golden-nectar.html"
];
const artifacts = read("luna-artifacts.html");
const museum = read("museum.html");
for (const page of pages) {
  const full = path.join(root, page);
  assert.ok(fs.existsSync(full), "Missing individual exhibit page: " + page);
  const html = read(page);
  assert.match(html, /<!doctype html>/i, page + " must be a complete HTML document");
  assert.match(html, /<title>[^<]+<\/title>/i, page + " must have a page title");
  assert.ok(html.includes('href="/museum.html"') || html.includes('href="/luna-artifacts.html"') || html.includes('href="/emblem.html"') || html.includes('href="/aiist-signet.html"') || html.includes('href="/lunascape.html"') || html.includes('href="/luna-crowned-closeup.html"') || html.includes('href="/luna-tuna-reveal.html"'),
    page + " must provide a route back to the collection or a related exhibit");
}
assert.match(museum, /THE ENCOUNTER<br>WITH DR\. LUNA STONE/i,
  "Museum permanent exhibit must present the synthesized Encounter");
assert.ok(museum.includes('href="/encounter-with-dr-luna-stone.html"'),
  "Museum must link to the synthesized Encounter exhibit");
assert.doesNotMatch(museum, /<h3>The Encounter<\/h3>[\s\S]{0,260}<h3>Dr\. Luna Stone<\/h3>/i,
  "Museum must not present the Encounter and Dr. Luna Stone as disconnected adjacent cards");
const lunationsIndex = artifacts.indexOf("<h3>Lunations</h3>");
const signetIndex = artifacts.indexOf("<h3>The AIIST Signet</h3>");
assert.ok(lunationsIndex >= 0 && signetIndex > lunationsIndex,
  "Lunations must occupy the first artifact position before the AIIST Signet");
const detailLinks = [
  "/ifd-pendant-keychain.html", "/lunations.html", "/aiist-signet.html",
  "/commemorative-set.html", "/lunascape.html", "/lunascape-reference.html",
  "/lunascape-leftward.html", "/lunascape-rightward.html", "/lunascape-backward.html",
  "/luna-tuna-reveal.html", "/luna-crowned-closeup.html", "/luna-crown.html",
  "/comfort-eagle-golden-nectar.html"
];
for (const href of detailLinks) assert.ok(artifacts.includes('href="' + href + '"'), "Artifact index must link to " + href);
console.log(JSON.stringify({ result: "PASS", individual_pages: pages.length, artifact_detail_links: detailLinks.length, museum_synthesis: "PASS", lunations_first_position: "PASS" }, null, 2));
