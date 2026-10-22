const SETTINGS_KEY = "lunaAutoContext.settings.v1";
const CHECKPOINTS_KEY = "lunaAutoContext.checkpoints.v1";
const STATUS_KEY = "lunaAutoContext.status.v1";

const autoCapture = document.getElementById("autoCapture");
const statusEl = document.getElementById("status");
const checkpointStatus = document.getElementById("checkpointStatus");

function setStatus(message) {
  statusEl.textContent = message;
}

async function getActiveChatTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab.url || "")) {
    throw new Error("Open a ChatGPT conversation in this tab first.");
  }
  return tab;
}

async function requestFullCapture() {
  const tab = await getActiveChatTab();
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "LUNA_AUTOCONTEXT_CAPTURE_FULL"
    });
    if (!response?.ok) throw new Error(response?.error || "Capture failed.");
    if (!response.snapshot?.messageCount) throw new Error("No message elements were found. Reload the ChatGPT tab and try again.");
    return response.snapshot;
  } catch (error) {
    throw new Error(error?.message || "Could not reach the capture script. Reload the ChatGPT tab and try again.");
  }
}

function downloadText(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename, saveAs: true }, () => {
    const error = chrome.runtime.lastError;
    if (error) setStatus("Download failed: " + error.message);
    else setStatus("Download requested: " + filename);
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  });
}

function toMarkdown(snapshot) {
  const lines = [
    "# LUNA AutoContext — Full Capture",
    "",
    "- **Captured:** " + snapshot.capturedAt,
    "- **Title:** " + snapshot.title,
    "- **Source URL:** " + snapshot.url,
    "- **Message elements captured:** " + snapshot.messageCount,
    "- **Fingerprint:** " + snapshot.fingerprint,
    "- **Capture scope:** " + snapshot.captureScope,
    "",
    "> This is a DOM-derived capture, not proof of a complete conversation export. Review the message count and source before relying on it.",
    ""
  ];
  snapshot.messages.forEach((message, index) => {
    lines.push("## " + (index + 1) + ". " + message.role.toUpperCase());
    if (message.messageId) lines.push("- Message ID: " + message.messageId);
    lines.push("", message.text, "");
  });
  return lines.join("\n");
}

async function refreshCheckpointStatus() {
  const result = await chrome.storage.local.get({
    [CHECKPOINTS_KEY]: {},
    [STATUS_KEY]: null
  });
  const checkpoints = Object.values(result[CHECKPOINTS_KEY] || {});
  const lastStatus = result[STATUS_KEY];
  let summary = "No automatic checkpoints saved yet.";
  if (checkpoints.length) {
    checkpoints.sort((a, b) => (b.changedAt || "").localeCompare(a.changedAt || ""));
    const latest = checkpoints[0];
    summary = checkpoints.length + " conversation(s) checkpointed. Latest: " +
      (latest.title || "Untitled") + " — " + (latest.messageCount ?? "?") +
      " message elements; updated " + (latest.changedAt || "time unknown") + ".";
  }
  if (lastStatus?.result === "error") {
    summary += " LAST SAVE ERROR (" + (lastStatus.at || "time unknown") + "): " +
      (lastStatus.message || "Unknown storage error") + ".";
  } else if (lastStatus?.result === "saved") {
    summary += " Last save confirmed at " + lastStatus.at + ".";
  }
  checkpointStatus.textContent = summary;
}

autoCapture.addEventListener("change", async () => {
  const result = await chrome.storage.local.get({ [SETTINGS_KEY]: { autoCapture: false } });
  const settings = { ...result[SETTINGS_KEY], autoCapture: autoCapture.checked };
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  setStatus(autoCapture.checked ? "Automatic local checkpoints enabled." : "Automatic checkpoints paused.");
  await refreshCheckpointStatus();
});

document.getElementById("downloadMarkdown").addEventListener("click", async () => {
  try {
    setStatus("Capturing messages currently in the page…");
    const snapshot = await requestFullCapture();
    const safeTitle = (snapshot.title || "chatgpt-conversation").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 70);
    downloadText("LUNA-AutoContext-" + safeTitle + ".md", toMarkdown(snapshot), "text/markdown;charset=utf-8");
  } catch (error) { setStatus(error.message); }
});

document.getElementById("downloadJson").addEventListener("click", async () => {
  try {
    setStatus("Capturing messages currently in the page…");
    const snapshot = await requestFullCapture();
    const safeTitle = (snapshot.title || "chatgpt-conversation").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 70);
    downloadText("LUNA-AutoContext-" + safeTitle + ".json", JSON.stringify(snapshot, null, 2), "application/json;charset=utf-8");
  } catch (error) { setStatus(error.message); }
});

document.getElementById("exportCheckpoint").addEventListener("click", async () => {
  const result = await chrome.storage.local.get({ [CHECKPOINTS_KEY]: {} });
  const checkpoints = Object.values(result[CHECKPOINTS_KEY] || {});
  if (!checkpoints.length) { setStatus("No checkpoint to export yet."); return; }
  checkpoints.sort((a, b) => (b.changedAt || "").localeCompare(a.changedAt || ""));
  downloadText("LUNA-AutoContext-checkpoint.json", JSON.stringify(checkpoints[0], null, 2), "application/json;charset=utf-8");
});

document.getElementById("refresh").addEventListener("click", refreshCheckpointStatus);

document.getElementById("clearCheckpoints").addEventListener("click", async () => {
  if (!confirm("Delete all LUNA AutoContext checkpoints stored in this browser? Download any checkpoint you want to keep first.")) return;
  await chrome.storage.local.remove(CHECKPOINTS_KEY);
  await refreshCheckpointStatus();
  setStatus("Local checkpoints cleared. Downloaded exports are not affected.");
});

(async function init() {
  const result = await chrome.storage.local.get({ [SETTINGS_KEY]: { autoCapture: false } });
  autoCapture.checked = Boolean(result[SETTINGS_KEY]?.autoCapture);
  await refreshCheckpointStatus();
})();