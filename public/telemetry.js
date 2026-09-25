(() => {
  const sessionId = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  const send = (eventType, extra = {}) => {
    const payload = {
      event_type: eventType,
      path: window.location.pathname,
      session_id: sessionId,
      ...extra
    };
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/telemetry", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true
        }).catch(() => {});
      }
    } catch (_) {}
  };

  send("page_view");
  if (window.location.pathname === "/confessional") send("confessional_view");

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-telemetry-event]");
    if (!target) return;
    const eventType = target.getAttribute("data-telemetry-event");
    const seedId = target.getAttribute("data-seed-id") || undefined;
    send(eventType, seedId ? { seed_id: seedId } : {});
  });
})();
