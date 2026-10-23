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
    return {
      schema: "luna-autocontext-capture/1",
      capturedAt,
      url: location.href,
      conversationKey: conversationKey(),
      title: document.title,
      messageCount: messages.length,
      messages,
      fingerprint: await fingerprint(source),
      captureScope: "DOM-visible messages only; completeness is not guaranteed."
    };
  }

  async function report(result, detail, messageCount = null) {
    try {
      await chrome.runtime.sendMessage({
        type: "LUNA_AUTOCONTEXT_DIAGNOSTIC",
        result,
        detail,
        title: document.title,
        url: location.href,
        messageCount
      });
    } catch (_) {}
  }

  async function isEnabled() {
    const result = await chrome.storage.local.get({
      [SETTINGS_KEY]: { autoCapture: false }
    });
    return Boolean(result[SETTINGS_KEY]?.autoCapture);
  }

  async function checkpointIfEnabled({ force = false } = {}) {
    let enabled;
    try {
      enabled = await isEnabled();
    } catch (error) {
      const detail = "Could not read extension settings: " + String(error?.message || error);
      await report("error", detail);
      return { ok: false, result: "error", detail };
    }

    if (!enabled) {
      const detail = "Automatic checkpoints are disabled.";
      if (force) await report("disabled", detail);
      return { ok: false, result: "disabled", detail };
    }

    try {
      const snapshot = await capture();
      if (!snapshot.messageCount) {
        const detail = "Capture script ran, but found zero message elements. The ChatGPT DOM selectors may need updating.";
        await report("no-messages", detail, 0);
        return { ok: false, result: "no-messages", detail, messageCount: 0 };
      }

      if (!force && snapshot.fingerprint === lastSentFingerprint) {
        return { ok: true, result: "unchanged-in-page", messageCount: snapshot.messageCount };
      }

      const response = await chrome.runtime.sendMessage({
        type: "LUNA_AUTOCONTEXT_CHECKPOINT",
        payload: snapshot
      });
      if (!response?.ok) {
        const detail = response?.error || response?.reason || "The service worker did not confirm the checkpoint write.";
        await report("error", detail, snapshot.messageCount);
        return { ok: false, result: "error", detail, messageCount: snapshot.messageCount };
      }

      lastSentFingerprint = snapshot.fingerprint;
      return {
        ok: true,
        result: response.unchanged ? "unchanged" : "saved",
        messageCount: snapshot.messageCount,
        detail: response.unchanged
          ? "Capture ran; saved content was already current."
          : "Checkpoint saved locally."
      };
    } catch (error) {
      const detail = "Capture/save failed: " + String(error?.message || error);
      await report("error", detail);
      return { ok: false, result: "error", detail };
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "LUNA_AUTOCONTEXT_CAPTURE_FULL") {
      capture()
        .then((snapshot) => sendResponse({ ok: true, snapshot }))
        .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
      return true;
    }

    if (message?.type === "LUNA_AUTOCONTEXT_RUN_DIAGNOSTIC") {
      checkpointIfEnabled({ force: true })
        .then(sendResponse)
        .catch((error) => sendResponse({
          ok: false,
          result: "error",
          detail: String(error?.message || error)
        }));
      return true;
    }
  });

  const observer = new MutationObserver(() => {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => checkpointIfEnabled(), MUTATION_DEBOUNCE_MS);
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

  setInterval(() => checkpointIfEnabled(), CHECKPOINT_INTERVAL_MS);
  checkpointIfEnabled();
})();
