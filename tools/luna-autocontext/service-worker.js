const SETTINGS_KEY = "lunaAutoContext.settings.v1";
const CHECKPOINTS_KEY = "lunaAutoContext.checkpoints.v1";
const STATUS_KEY = "lunaAutoContext.status.v1";

async function saveCheckpoint(payload) {
  const settingsResult = await chrome.storage.local.get({
    [SETTINGS_KEY]: { autoCapture: false }
  });
  if (!settingsResult[SETTINGS_KEY]?.autoCapture) {
    return { ok: false, reason: "auto-capture-disabled" };
  }

  const stored = await chrome.storage.local.get({ [CHECKPOINTS_KEY]: {} });
  const checkpoints = stored[CHECKPOINTS_KEY] || {};
  const key = payload.conversationKey || payload.url;
  const previous = checkpoints[key];

  // Write only when the DOM-derived fingerprint changes.
  if (previous?.fingerprint === payload.fingerprint) {
    await chrome.storage.local.set({
      [STATUS_KEY]: { result: "unchanged", at: new Date().toISOString() }
    });
    return { ok: true, unchanged: true };
  }

  checkpoints[key] = {
    schema: "luna-autocontext-checkpoint/1",
    conversationKey: key,
    title: payload.title || "Untitled ChatGPT conversation",
    url: payload.url,
    capturedAt: payload.capturedAt,
    messageCount: payload.messageCount,
    fingerprint: payload.fingerprint,
    recentMessages: (payload.messages || []).slice(-8).map((message) => ({
      role: message.role,
      text: String(message.text || "").slice(0, 600),
      messageId: message.messageId || null
    })),
    captureScope: "DOM-visible messages only; completeness is not guaranteed."
  };

  checkpoints[key] = { ...checkpoints[key], changedAt: new Date().toISOString() };
  await chrome.storage.local.set({
    [CHECKPOINTS_KEY]: checkpoints,
    [STATUS_KEY]: { result: "saved", at: new Date().toISOString() }
  });
  return { ok: true, unchanged: false };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "LUNA_AUTOCONTEXT_CHECKPOINT") {
    saveCheckpoint(message.payload)
      .then(sendResponse)
      .catch(async (error) => {
        const detail = String(error);
        try {
          await chrome.storage.local.set({
            [STATUS_KEY]: { result: "error", at: new Date().toISOString(), message: detail }
          });
        } catch (_) {}
        sendResponse({ ok: false, error: detail });
      });
    return true;
  }
});