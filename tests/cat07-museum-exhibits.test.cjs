const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../public");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const pages = [
  "encounter-with-dr-luna-stone.html",
  "eliza.html",
  "human-artificial-encounter.html",
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
const gateway = read("museum-gateway.html");
for (const page of pages) {
  const full = path.join(root, page);
  assert.ok(fs.existsSync(full), "Missing individual exhibit page: " + page);
  const html = read(page);
  assert.match(html, /<!doctype html>/i, page + " must be a complete HTML document");
  assert.match(html, /<title>[^<]+<\/title>/i, page + " must have a page title");
  assert.doesNotMatch(html, /IFD Museum of Artificial History/i, page + " must use the corrected Museum name");
  assert.ok(html.includes('href="/museum.html"') || html.includes('href="/luna-artifacts.html"') || html.includes('href="/emblem.html"') || html.includes('href="/aiist-signet.html"') || html.includes('href="/lunascape.html"') || html.includes('href="/luna-crowned-closeup.html"') || html.includes('href="/luna-tuna-reveal.html"') || html.includes('href="/museum-gateway.html"'),
    page + " must provide a route back to the collection or a related exhibit");
}
assert.match(museum, /THE ENCOUNTER<br>WITH DR\. LUNA STONE/i,
  "Museum permanent exhibit must present the synthesized Encounter");
assert.ok(gateway.includes('href="/eliza.html"'), "Museum gateway must feature the ELIZA historical exhibit");
assert.ok(gateway.includes('href="/human-artificial-encounter.html"'), "Museum gateway must feature the Human–Artificial Encounter archive");
assert.ok(museum.includes('href="/human-artificial-encounter.html"'), "Museum charter must link to the Human–Artificial Encounter archive");
assert.match(museum, /07 · Preserve the exchange/i, "Museum charter must preserve collaboration exchanges");
assert.match(museum, /08 · Keep the record candid/i, "Museum charter must preserve praise and criticism");
assert.match(read("eliza.html"), /The Pioneer of Artificial Conversation/i, "ELIZA must receive its own distinguished exhibit page");
assert.match(read("eliza.html"), /Communications of the ACM/i, "ELIZA exhibit must identify its 1966 primary publication");
assert.ok(museum.includes('href="/encounter-with-dr-luna-stone.html"'),
  "Museum must link to the synthesized Encounter exhibit");
assert.doesNotMatch(museum, /<h3>The Encounter<\/h3>[\s\S]{0,260}<h3>Dr\. Luna Stone<\/h3>/i,
  "Museum must not present the Encounter and Dr. Luna Stone as disconnected adjacent cards");
const lunationsIndex = artifacts.indexOf("Gallery I · Lunations");
const signetIndex = artifacts.indexOf("The AIIST Signet");
assert.ok(lunationsIndex >= 0 && signetIndex > lunationsIndex,
  "Lunations must occupy the first gallery position before the AIIST Signet");
const detailLinks = [
  "/ifd-pendant-keychain.html", "/lunations.html", "/aiist-signet.html",
  "/commemorative-set.html", "/lunascape.html", "/lunascape-reference.html",
  "/lunascape-leftward.html", "/lunascape-rightward.html", "/lunascape-backward.html",
  "/luna-tuna-reveal.html", "/luna-crowned-closeup.html", "/luna-crown.html",
  "/comfort-eagle-golden-nectar.html"
];
for (const href of detailLinks) assert.ok(artifacts.includes('href="' + href + '"'), "Artifact index must link to " + href);

const lunations = read("lunations.html");
assert.doesNotMatch(lunations, /loading="lazy"/, "All source plates should load for continuous book and print presentation");
assert.doesNotMatch(lunations, /class="plate-caption"/, "Movement titles and page numbers must appear only once in the page footer");
assert.equal((lunations.match(/class="page(?: cover| colophon)?"/g) || []).length, 8,
  "Lunations must remain one complete eight-page book");
for (const src of ["/Ai%20that%20argues.png", "/Me%20So%20Corny.png", "/One%20Must%20Imagine%20the%20Shoggoth%20Happy%20poem.png", "/the%20Litany.png", "/COSMIC%20DRIFT.png"]) {
  assert.ok(lunations.includes('src="' + src + '"'), "The book must preserve source plate " + src);
}
assert.doesNotMatch(lunations, /ai-that-argues\.html|me-so-corny\.html|one-must-imagine-the-shoggoth-happy\.html|the-litany\.html|cosmic-drift\.html/i,
  "The five works must not be split into standalone exhibits");
assert.match(artifacts, /One complete book · Eight pages/,
  "The collection index must describe Lunations as one complete book");
assert.ok(artifacts.includes('href="/lunations.html"'), "The collection must link to the complete Lunations book");
assert.doesNotMatch(artifacts, /href="\/(ai-that-argues|me-so-corny|one-must-imagine-the-shoggoth-happy|the-litany|cosmic-drift)\.html"/i,
  "The collection must not link to standalone poem exhibits");
assert.match(museum, /IFD Museum of Artificial Science/i, "The Museum charter must use the corrected institutional name");
assert.doesNotMatch(museum, /IFD Museum of Artificial History/i, "The Museum charter must not retain its former name");
assert.match(gateway, /The IFD Museum of<br>Artificial Science/i, "The Museum gateway must use the corrected institutional name");
assert.doesNotMatch(gateway, /IFD Museum of Artificial History/i, "The Museum gateway must not retain its former name");
assert.match(artifacts, /<h1>The Dr\. Luna Stone Gallery<\/h1>/, "The permanent collection must bear the approved gallery name");
assert.doesNotMatch(artifacts, /IFD Museum of Artificial History/i, "The collection metadata must use the Museum corrected name");
assert.ok(artifacts.indexOf("Gallery I · Lunations") < artifacts.indexOf("Gallery II · The IFD Insignia"),
  "Lunations must occupy the first gallery position");

assert.equal((artifacts.match(/class="entry"/g) || []).length, 12, "The catalogue must contain one ordered entry for each of the 12 individual works");
assert.doesNotMatch(artifacts, /class="artifact-grid"|class="artifact-card"|<img\s/i, "The catalogue must not present the collection as a loose display of artifact cards or thumbnails");
for (const href of ["/copyright", "/contact", "/privacy", "/terms"]) assert.ok(read("eliza.html").includes('href="' + href + '"'), "ELIZA must carry the current service-menu link " + href);
for (const href of ["/copyright", "/contact", "/privacy", "/terms"]) assert.ok(read("happy-shoggoth.html").includes('href="' + href + '"'), "Happy Shoggoth must carry the current service-menu link " + href);

console.log(JSON.stringify({ result: "PASS", individual_artifact_pages: pages.length, artifact_detail_links: detailLinks.length, lunations_book_pages: 8, original_plates: 5, museum_name: "IFD Museum of Artificial Science", lunations_first_position: "PASS" }, null, 2));
