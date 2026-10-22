(() => {
  if (window.__lunaAutoContextInstalled) return;
  window.__lunaAutoContextInstalled = true;

  const SETTINGS_KEY = "lunaAutoContext.settings.v1";
  const CHECKPOINT_INTERVAL_MS = 5 * 60 * 1000;
  const MUTATION_DEBOUNCE_MS = 2500;
  let mutationTimer = null;
  let lastSentFingerprint = null;

  function conversationKey() {
    return location.origin + location.pathname;
  }

  function readMessages() {
    const nodes = document.querySelectorAll(
      '[data-message-author-role="user"], [data-message-author-role="assistant"]'
    );
    const messages = [];
    for (const node of nodes) {
      const role = node.getAttribute("data-message-author-role");
      const text = (node.innerText || node.textContent || "").trim();
      if (!text || !["user", "assistant"].includes(role)) continue;
      messages.push({
        role,
        text,
        messageId: node.getAttribute("data-message-id") || node.id || null
      });
    }
    return messages;
  }

  async function fingerprint(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    if (globalThis.crypto?.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return [...new Uint8Array(digest)]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }
    // Fallback is a change detector, not a cryptographic integrity guarantee.
    let hash = 2166136261;
    for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619);
    return "fnv1a-" + (hash >>> 0).toString(16);
  }

  async function capture() {
    const messages = readMessages();
    const capturedAt = new Date().toISOString();
    const source = {
      url: location.href,
      conversationKey: conversationKey(),
      title: document.title,
      messages
    };
    const fp = await fingerprint(source);
    return {
      schema: "luna-autocontext-capture/1",
      capturedAt,
      url: location.href,
      conversationKey: conversationKey(),
      title: document.title,
      messageCount: messages.length,
      messages,
      fingerprint: fp,
      captureScope: "DOM-visible messages only; completeness is not guaranteed."
    };
  }

  async function isEnabled() {
    const result = await chrome.storage.local.get({
      [SETTINGS_KEY]: { autoCapture: false }
    });
    return Boolean(result[SETTINGS_KEY]?.autoCapture);
  }

  async function checkpointIfEnabled() {
    if (!(await isEnabled())) return;
    const snapshot = await capture();
    if (!snapshot.messageCount || snapshot.fingerprint === lastSentFingerprint) return;
    lastSentFingerprint = snapshot.fingerprint;
    chrome.runtime.sendMessage({
      type: "LUNA_AUTOCONTEXT_CHECKPOINT",
      payload: snapshot
    }).catch(() => {});
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "LUNA_AUTOCONTEXT_CAPTURE_FULL") {
      capture()
        .then((snapshot) => sendResponse({ ok: true, snapshot }))
        .catch((error) => sendResponse({ ok: false, error: String(error) }));
      return true;
    }
  });

  const observer = new MutationObserver(() => {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(checkpointIfEnabled, MUTATION_DEBOUNCE_MS);
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[SETTINGS_KEY]?.newValue?.autoCapture) {
      checkpointIfEnabled();
    }
  });

  setInterval(checkpointIfEnabled, CHECKPOINT_INTERVAL_MS);
  checkpointIfEnabled();
})();