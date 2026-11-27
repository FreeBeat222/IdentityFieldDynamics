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
      if (pathname === "/__test/scroll.html") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end('<!doctype html><html><head><title>Scroll Test</title></head><body style="min-height:2600px"><h1>Scroll restoration fixture</h1><a href="/salon.html">Continue</a><script src="/js/ifd-navigation-trail.js"></script></body></html>');
        return;
      }
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
    const trailPlacement = await page.evaluate(() => {
      const footer = document.querySelector("footer.ifd-footer");
      const trail = document.querySelector("#ifd-navtrail");
      return {
        isBodyChild: trail && trail.parentElement === document.body,
        precedesFooter: !!(footer && trail && (trail.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING)),
        isImmediatelyBeforeFooter: !!(footer && trail && trail.nextElementSibling === footer),
        position: trail ? getComputedStyle(trail).position : null,
        separatedByBorder: trail ? getComputedStyle(trail).borderTopWidth === "1px" : false,
        topMargin: trail ? parseFloat(getComputedStyle(trail).marginTop) : 0,
        footerWidth: footer ? Math.round(footer.getBoundingClientRect().width) : 0,
        menuWidth: footer ? Math.round(footer.querySelector(".ifd-footer-links").getBoundingClientRect().width) : 0
      };
    });
    assert.equal(trailPlacement.isBodyChild, true, "Navigation Trail must be a direct child of the page body");
    assert.equal(trailPlacement.precedesFooter, true, "Navigation Trail must appear above the footer");
    assert.equal(trailPlacement.isImmediatelyBeforeFooter, true, "Navigation Trail must be a distinct body element immediately before the footer");
    assert.equal(trailPlacement.position, "relative", "Navigation Trail must remain in normal document flow");
    assert.equal(trailPlacement.separatedByBorder, true, "Navigation Trail must have a visible separating top rule");
    assert.equal(trailPlacement.topMargin, 22, "Navigation Trail must have visible separation from preceding page content");
    assert.ok(trailPlacement.footerWidth > 0, "Homepage footer must be present");
    assert.ok(trailPlacement.menuWidth < trailPlacement.footerWidth * 0.8, "Footer links must form a compact menu rather than stretch across the page");
    await page.locator(".ifd-footer-links a").first().hover();
    const hoverStyle = await page.locator(".ifd-footer-links a").first().evaluate(el => getComputedStyle(el).textShadow);
    assert.notEqual(hoverStyle, "none", "Footer link hover must use a visible gold glow");
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

    await page.goto(base + "/__test/scroll.html");
    await page.locator("#ifd-navtrail .toggle").waitFor();
    await page.evaluate(() => window.scrollTo(0, 560));
    await page.waitForTimeout(100);
    const scrollState = await page.evaluate(() => ({
      y: window.scrollY,
      entryId: history.state && history.state.ifdTrailEntryId,
      positions: JSON.parse(sessionStorage.getItem("ifd.navigationTrail.scroll.v1") || "{}")
    }));
    assert.ok(scrollState.y > 100, "Scroll fixture must be scrollable");
    const savedScroll = scrollState.positions[scrollState.entryId];
    assert.ok(typeof savedScroll === "number" && savedScroll > 100, "The trail should save the departing page's scroll position");
    await page.evaluate(() => {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      window.location.assign("/salon.html");
    });
    await page.waitForURL(url => url.pathname === "/salon.html");
    await page.goBack();
    await page.waitForURL(url => url.pathname === "/__test/scroll.html");
    await page.waitForTimeout(300);
    const restoredScroll = await page.evaluate(() => window.scrollY);
    assert.ok(Math.abs(restoredScroll - savedScroll) <= 3, "Back navigation should restore the saved scroll position (saved " + savedScroll + ", restored " + restoredScroll + ")");

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

    // Structural acceptance across every public HTML page that loads the shared Trail.
    const auditPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    auditPage.on("pageerror", error => pageErrors.push(error.message));
    const htmlFiles = (await fs.readdir(publicRoot)).filter(name => name.endsWith(".html"));
    const auditedPages = [];
    for (const name of htmlFiles) {
      const source = await fs.readFile(path.join(publicRoot, name), "utf8");
      if (!source.includes("/js/ifd-navigation-trail.js")) continue;
      await auditPage.goto(base + "/" + name);
      await auditPage.locator("#ifd-navtrail .toggle").waitFor();
      const placement = await auditPage.evaluate(() => {
        const trail = document.querySelector("#ifd-navtrail");
        const footer = document.querySelector("footer.ifd-footer");
        return {
          hasFooter: !!footer,
          directBodyChild: !!(trail && trail.parentElement === document.body),
          immediatelyBeforeFooter: !!(trail && footer && trail.nextElementSibling === footer),
          footerInsideMain: !!(footer && footer.closest("main"))
        };
      });
      assert.equal(placement.hasFooter, true, name + ": shared Trail page must have the Cathedral footer");
      assert.equal(placement.directBodyChild, true, name + ": Navigation Trail must be a direct child of body");
      assert.equal(placement.immediatelyBeforeFooter, true, name + ": Navigation Trail must be immediately above the footer");
      assert.equal(placement.footerInsideMain, false, name + ": footer must sit outside main content");
      auditedPages.push(name);
    }
    await auditPage.close();

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
