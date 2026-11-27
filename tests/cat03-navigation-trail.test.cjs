const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const publicRoot = path.resolve(__dirname, "../public");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp"
};

async function main() {
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
      const relative = pathname === "/" ? "homepage-cathedral.html" : pathname.replace(/^\/+/, "");
      const file = path.resolve(publicRoot, relative);
      if (file !== publicRoot && !file.startsWith(publicRoot + path.sep)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      const body = await fs.readFile(file);
      res.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });

  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const base = "http://127.0.0.1:" + address.port;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [];
  const ensurePanelOpen = async () => {
    if (await page.locator("#ifd-navtrail").getAttribute("data-open") !== "true") {
      await page.locator("#ifd-navtrail .toggle").click();
    }
  };
  page.on("pageerror", error => pageErrors.push(error.message));

  const steps = [
    "/understand.html",
    "/structure-dynamics-identity.html",
    "/",
    "/research-gateway.html",
    "/research-deep.html",
    "/",
    "/library-gateway.html",
    "/tools.html",
    "/",
    "/museum-gateway.html",
    "/museum.html",
    "/salon.html"
  ];

  try {
    await page.goto(base + "/");
    await page.locator("#ifd-navtrail .toggle").waitFor();
    assert.equal(
      await page.locator('#ifd-navtrail a[title="Return to the first page in this tab"]').getAttribute("href"),
      "/",
      "Point of Origin must capture the initial homepage"
    );

    for (const href of steps) {
      const link = page.locator('a[href="' + href + '"]').first();
      await link.waitFor({ state: "visible" });
      await link.click();
      await page.waitForURL(url => url.pathname === href);
      await page.locator("#ifd-navtrail .toggle").waitFor();
    }

    let state = await page.evaluate(() => JSON.parse(sessionStorage.getItem("ifd.navigationTrail.v1")));
    assert.equal(state.visits.length, 13, "Homepage plus twelve internal links should be recorded");
    assert.equal(state.visits.at(-1).url, "/salon.html");
    assert.equal(state.category.url, "/museum-gateway.html", "Return to Category should retain the last visited gateway");

    await page.locator("#ifd-navtrail .toggle").click();
    assert.equal(await page.locator("#ifd-navtrail ol li").count(), 12, "The panel should show the latest twelve visits");
    assert.equal(await page.locator('#ifd-navtrail a[title="Return to the first page in this tab"]').count(), 1);
    assert.equal(await page.locator('#ifd-navtrail a[title="Return to the most recently visited Cathedral gateway"]').getAttribute("href"), "/museum-gateway.html");

    const beforeTraversal = state.visits.length;
    await page.locator('#ifd-navtrail [data-step="-1"]').click();
    await page.waitForURL(url => url.pathname === "/museum.html");
    await page.waitForTimeout(150);
    const afterBack = await page.evaluate(() => JSON.parse(sessionStorage.getItem("ifd.navigationTrail.v1")).visits.length);
    await ensurePanelOpen();
    await page.locator('#ifd-navtrail [data-step="1"]').click();
    await page.waitForURL(url => url.pathname === "/salon.html");
    await page.waitForTimeout(150);
    const afterForward = await page.evaluate(() => JSON.parse(sessionStorage.getItem("ifd.navigationTrail.v1")).visits.length);
    assert.deepEqual([beforeTraversal, afterBack, afterForward], [13, 13, 13], "Back/Forward traversal must not create duplicate visits");

    await page.goto(base + "/current-ifd-formulation.html");
    await page.locator("#ifd-navtrail .toggle").waitFor();
    await page.evaluate(() => window.scrollTo(0, 560));
    await page.waitForTimeout(100);
    const scrollEntryId = await page.evaluate(() => history.state && history.state.ifdTrailEntryId);
    const beforeDeparture = await page.evaluate(() => ({ y: window.scrollY, state: history.state, scrollMap: sessionStorage.getItem("ifd.navigationTrail.scroll.v1"), trailScript: !!window.__IFD_NAV_TRAIL__ }));
    await page.evaluate(() => window.addEventListener("pagehide", () => sessionStorage.setItem("__cat03_test_pagehide", JSON.stringify({ y: window.scrollY, state: history.state }))));
    await page.evaluate(() => {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      window.location.assign("/current-ifd/zero-source.html");
    });
    await page.waitForURL(url => url.pathname === "/current-ifd/zero-source.html");
    const savedScroll = await page.evaluate(entryId => {
      const positions = JSON.parse(sessionStorage.getItem("ifd.navigationTrail.scroll.v1") || "{}");
      return { value: positions[entryId], map: positions, pagehide: sessionStorage.getItem("__cat03_test_pagehide") };
    }, scrollEntryId);
    console.log("SCROLL DEBUG", JSON.stringify({ beforeDeparture, scrollEntryId, savedScroll }));
    assert.ok(typeof savedScroll.value === "number" && savedScroll.value > 100, "The trail should save the departing page's scroll position");
    await page.goBack();
    await page.waitForURL(url => url.pathname === "/current-ifd-formulation.html");
    await page.waitForTimeout(300);
    const restoredScroll = await page.evaluate(() => window.scrollY);
    assert.ok(Math.abs(restoredScroll - savedScroll.value) <= 3, "Back navigation should restore the saved scroll position (saved " + savedScroll.value + ", restored " + restoredScroll + ")");

    await ensurePanelOpen();
    await page.locator('#ifd-navtrail a[title="Return to the first page in this tab"]').click();
    await page.waitForURL(url => url.pathname === "/");
    assert.equal(new URL(page.url()).pathname, "/", "Point of Origin should return to the homepage");

    await page.setViewportSize({ width: 390, height: 844 });
    const toggleBox = await page.locator("#ifd-navtrail .toggle").boundingBox();
    assert.ok(toggleBox && toggleBox.x >= 0 && toggleBox.x + toggleBox.width <= 390, "Trail control must remain within a mobile viewport");

    await ensurePanelOpen();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#ifd-navtrail").getAttribute("data-open"), "false", "Escape should close the trail panel");

    assert.deepEqual(pageErrors, [], "No uncaught browser errors should occur");
    console.log(JSON.stringify({
      result: "PASS",
      twelve_link_path: steps,
      recorded_visits: 13,
      visible_recent_visits: 12,
      back_forward_counts: [beforeTraversal, afterBack, afterForward],
      scroll_saved: savedScroll,
      scroll_restored: restoredScroll,
      point_of_origin: "PASS",
      return_to_category: "PASS",
      mobile_viewport: "PASS",
      escape_to_close: "PASS",
      browser_errors: pageErrors.length
    }, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
