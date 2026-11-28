const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const publicRoot = path.resolve(__dirname, "../public");
const outputRoot = path.resolve(__dirname, "../artifacts/la-reina-visual");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

async function main() {
  await fs.mkdir(outputRoot, { recursive: true });
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
      const relative = pathname.replace(/^\/+/, "");
      const file = path.resolve(publicRoot, relative);
      if (file !== publicRoot && !file.startsWith(publicRoot + path.sep)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      const body = await fs.readFile(file);
      res.writeHead(200, { "content-type": mime[path.extname(file).toLowerCase()] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });

  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    desktop.on("pageerror", error => errors.push(error.message));
    await desktop.goto(base + "/commemorative-set.html", { waitUntil: "networkidle" });
    await desktop.locator(".casket-stage > img").waitFor();
    await desktop.locator(".artifact-trigger").first().waitFor();
    const composition = await desktop.evaluate(() => {
      const image = document.querySelector(".casket-stage > img");
      return {
        imageLoaded: image.complete && image.naturalWidth > 0,
        imageWidth: image.naturalWidth,
        imageHeight: image.naturalHeight,
        casketHotspots: document.querySelectorAll(".casket-map .artifact-trigger").length,
        totalTriggers: document.querySelectorAll(".artifact-trigger").length,
        mappedArtifacts: [...document.querySelectorAll(".casket-map a")].map(a => ({ image: a.dataset.artifactImage, title: a.dataset.artifactTitle, href: a.dataset.artifactLink })),
        stage: (() => { const r = document.querySelector(".casket-stage").getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; })()
      };
    });
    assert.equal(composition.imageLoaded, true, "Casket artwork must load in Chromium");
    assert.equal(composition.casketHotspots, 4, "The casket must expose exactly four mapped artifact hotspots");
    assert.equal(composition.totalTriggers, 4, "Only the four casket pieces use modal triggers");
    assert.deepEqual(composition.mappedArtifacts, [
      { image: "/C1.png", title: "The AIIST Sequence Ring", href: "/commemorative-a-i-i-s-t-ring.html" },
      { image: "/C2.png", title: "The AIIST Signet", href: "/commemorative-aiist-signet.html" },
      { image: "/C3.png", title: "The IFD Medallion", href: "/commemorative-ifd-medallion.html" },
      { image: "/C4.png", title: "The Zodiac Medallion", href: "/commemorative-zodiac-medallion.html" }
    ], "Casket hotspots must follow the intended left-to-right C1–C4 order");
    await desktop.screenshot({ path: path.join(outputRoot, "desktop-casket-composition.png"), fullPage: true });

    await desktop.locator('.casket-map a[aria-label*="Sequence Ring"]').click();
    await desktop.locator("#artifact-modal[aria-hidden='false']").waitFor();
    await desktop.locator("#artifact-modal-image").evaluate(img => img.decode());
    const modal = await desktop.evaluate(() => ({
      title: document.querySelector("#artifact-modal-title").textContent,
      imageLoaded: document.querySelector("#artifact-modal-image").naturalWidth > 0,
      onwardHref: document.querySelector("#artifact-modal-link").getAttribute("href"),
      dialogVisible: getComputedStyle(document.querySelector("#artifact-modal")).display !== "none"
    }));
    assert.equal(modal.title, "The AIIST Sequence Ring");
    assert.equal(modal.imageLoaded, true, "Enlarged artifact artwork must load");
    assert.equal(modal.onwardHref, "/commemorative-a-i-i-s-t-ring.html");
    assert.equal(modal.dialogVisible, true);
    await desktop.screenshot({ path: path.join(outputRoot, "desktop-sequence-ring-modal.png") });

    await desktop.keyboard.press("Escape");
    await desktop.locator("#artifact-modal").waitFor({ state: "hidden" });

    const remainingCasketPieces = [
      { label: "AIIST Signet", title: "The AIIST Signet", image: "/C2.png", href: "/commemorative-aiist-signet.html" },
      { label: "IFD Medallion", title: "The IFD Medallion", image: "/C3.png", href: "/commemorative-ifd-medallion.html" },
      { label: "Zodiac Medallion", title: "The Zodiac Medallion", image: "/C4.png", href: "/commemorative-zodiac-medallion.html" }
    ];
    for (const piece of remainingCasketPieces) {
      await desktop.locator('.casket-map a[aria-label*="' + piece.label + '"]').click();
      await desktop.locator("#artifact-modal[aria-hidden='false']").waitFor();
      await desktop.locator("#artifact-modal-image").evaluate(img => img.decode());
      const opened = await desktop.evaluate(() => ({
        title: document.querySelector("#artifact-modal-title").textContent,
        imageLoaded: document.querySelector("#artifact-modal-image").naturalWidth > 0,
        imageSource: document.querySelector("#artifact-modal-image").getAttribute("src"),
        onwardHref: document.querySelector("#artifact-modal-link").getAttribute("href")
      }));
      assert.equal(opened.title, piece.title, piece.label + " modal title must match");
      assert.equal(opened.imageLoaded, true, piece.label + " artwork must load");
      assert.equal(opened.imageSource, piece.image, piece.label + " artwork source must match");
      assert.equal(opened.onwardHref, piece.href, piece.label + " onward exhibit link must match");
      await desktop.keyboard.press("Escape");
      await desktop.locator("#artifact-modal").waitFor({ state: "hidden" });
    }

    const tiaraLink = desktop.locator('.tiara-link[aria-label*="Tiara of La Reina"]');
    const tiaraPreview = await tiaraLink.locator(".tiara-preview").evaluate(img => ({
      loaded: img.complete && img.naturalWidth > 0,
      source: img.getAttribute("src"),
      filter: getComputedStyle(img).filter
    }));
    assert.equal(tiaraPreview.loaded, true, "The illuminated Tiara artwork must load beneath the casket");
    assert.equal(tiaraPreview.source, "/la%20reina.png");
    assert.match(tiaraPreview.filter, /brightness\(/, "The Tiara artwork itself must be illuminated");
    assert.equal(await tiaraLink.getAttribute("href"), "/luna-tiara.html", "The Tiara image must link directly to its exhibit");
    await desktop.screenshot({ path: path.join(outputRoot, "desktop-tiara-link.png") });
    await tiaraLink.click();
    await desktop.waitForURL("**/luna-tiara.html");
    assert.equal(await desktop.locator(".tiara-image").evaluate(img => img.complete && img.naturalWidth > 0), true, "Clicking the Tiara artwork must open its exhibit");

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    mobile.on("pageerror", error => errors.push(error.message));
    await mobile.goto(base + "/commemorative-set.html", { waitUntil: "networkidle" });
    await mobile.locator(".casket-stage > img").waitFor();
    const mobileTiara = await mobile.locator(".tiara-link .tiara-preview").evaluate(img => ({
      loaded: img.complete && img.naturalWidth > 0,
      href: img.closest("a").getAttribute("href")
    }));
    assert.equal(mobileTiara.loaded, true, "Illuminated Tiara artwork must load on mobile beneath the casket");
    assert.equal(mobileTiara.href, "/luna-tiara.html", "Mobile Tiara artwork must link directly to its exhibit");
    await mobile.screenshot({ path: path.join(outputRoot, "mobile-casket-composition.png"), fullPage: true });
    const mobileLayout = await mobile.evaluate(() => ({
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      stageWidth: Math.round(document.querySelector(".casket-stage").getBoundingClientRect().width)
    }));
    assert.ok(mobileLayout.documentWidth <= mobileLayout.viewportWidth, "Casket exhibit must not create horizontal overflow on mobile");

    const tiara = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    tiara.on("pageerror", error => errors.push(error.message));
    await tiara.goto(base + "/luna-tiara.html", { waitUntil: "networkidle" });
    const tiaraImage = await tiara.locator(".tiara-image").evaluate(img => ({
      loaded: img.complete && img.naturalWidth > 0,
      width: img.naturalWidth,
      height: img.naturalHeight
    }));
    assert.equal(tiaraImage.loaded, true, "Independent Tiara artwork must load in Chromium");
    await tiara.screenshot({ path: path.join(outputRoot, "mobile-tiara-exhibit.png"), fullPage: true });
    assert.deepEqual(errors, [], "No uncaught browser errors should occur during visual capture");

    console.log(JSON.stringify({
      result: "PASS",
      viewport: { desktop: "1440x1000", mobile: "390x844" },
      composition,
      modal,
      tiaraPreview,
      mobileTiara,
      mobileLayout,
      tiaraImage,
      screenshots: [
        "desktop-casket-composition.png",
        "desktop-sequence-ring-modal.png",
        "desktop-tiara-link.png",
        "mobile-casket-composition.png",
        "mobile-tiara-exhibit.png"
      ]
    }, null, 2));
    await mobile.close();
    await tiara.close();
    await desktop.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
