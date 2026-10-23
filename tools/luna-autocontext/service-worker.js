const SETTINGS_KEY = "lunaAutoContext.settings.v1";
const CHECKPOINTS_KEY = "lunaAutoContext.checkpoints.v1";
const STATUS_KEY = "lunaAutoContext.status.v1";

async function writeStatus(status) {
  await chrome.storage.local.set({
    [STATUS_KEY]: { ...status, at: new Date().toISOString() }
  });
}

async function saveCheckpoint(payload) {
  const settingsResult = await chrome.storage.local.get({
    [SETTINGS_KEY]: { autoCapture: false }
  });
  if (!settingsResult[SETTINGS_KEY]?.autoCapture) {
    await writeStatus({
      result: "disabled",
      title: payload.title || "",
      url: payload.url || "",
      message: "Automatic checkpoints are disabled."
    });
    return { ok: false, reason: "auto-capture-disabled" };
  }

  const stored = await chrome.storage.local.get({ [CHECKPOINTS_KEY]: {} });
  const checkpoints = stored[CHECKPOINTS_KEY] || {};
  const key = payload.conversationKey || payload.url;
  const previous = checkpoints[key];

  if (previous?.fingerprint === payload.fingerprint) {
    await writeStatus({
      result: "unchanged",
      title: payload.title || previous.title || "",
      url: payload.url || previous.url || "",
      messageCount: payload.messageCount,
      message: "Capture ran; the saved checkpoint already has this content."
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
  await chrome.storage.local.set({ [CHECKPOINTS_KEY]: checkpoints });
  await writeStatus({
    result: "saved",
    title: payload.title || "",
    url: payload.url || "",
    messageCount: payload.messageCount,
    message: "Checkpoint written to this browser's local storage."
  });
  return { ok: true, unchanged: false };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "LUNA_AUTOCONTEXT_CHECKPOINT") {
    saveCheckpoint(message.payload)
      .then(sendResponse)
      .catch(async (error) => {
        const detail = String(error?.message || error);
        try {
          await writeStatus({
            result: "error",
            title: message.payload?.title || "",
            url: message.payload?.url || sender.tab?.url || "",
            message: detail
          });
        } catch (_) {}
        sendResponse({ ok: false, error: detail });
      });
    return true;
  }

  if (message?.type === "LUNA_AUTOCONTEXT_DIAGNOSTIC") {
    writeStatus({
      result: message.result || "diagnostic",
      title: message.title || "",
      url: message.url || sender.tab?.url || "",
      messageCount: message.messageCount ?? null,
      message: message.detail || ""
    }).then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }
});
