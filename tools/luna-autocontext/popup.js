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
    throw new Error("The active tab is not a ChatGPT page. Open the conversation tab and run this test there.");
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
    if (!response.snapshot?.messageCount) throw new Error("The capture script found zero message elements. The ChatGPT DOM selectors may need updating.");
    return response.snapshot;
  } catch (error) {
    const detail = String(error?.message || error);
    if (/receiving end does not exist|could not establish connection|message port closed/i.test(detail)) {
      throw new Error("The capture script is not running in this ChatGPT tab. Reload that tab once after updating the extension, then retry.");
    }
    throw new Error(detail || "Could not reach the capture script.");
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
  try {
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

    if (lastStatus) {
      const labels = {
        saved: "SAVE CONFIRMED",
        unchanged: "CAPTURE RAN — NO CONTENT CHANGE",
        "no-messages": "CAPTURE FOUND ZERO MESSAGES",
        error: "CAPTURE/SAVE ERROR",
        disabled: "CAPTURE DISABLED",
        diagnostic: "DIAGNOSTIC"
      };
      const label = labels[lastStatus.result] || String(lastStatus.result || "STATUS").toUpperCase();
      summary += "\n\nLast attempt: " + label +
        (lastStatus.at ? " at " + lastStatus.at : "") + "." +
        (lastStatus.messageCount != null ? " Message elements found: " + lastStatus.messageCount + "." : "") +
        (lastStatus.title ? "\nSource: " + lastStatus.title : "") +
        (lastStatus.message ? "\nDetail: " + lastStatus.message : "");
    }
    checkpointStatus.textContent = summary;
    setStatus("Status refreshed at " + new Date().toLocaleTimeString() + ".");
  } catch (error) {
    checkpointStatus.textContent = "Could not read local checkpoint storage: " + String(error?.message || error);
    setStatus("Storage read failed.");
  }
}

autoCapture.addEventListener("change", async () => {
  try {
    const result = await chrome.storage.local.get({ [SETTINGS_KEY]: { autoCapture: false } });
    const settings = { ...result[SETTINGS_KEY], autoCapture: autoCapture.checked };
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
    setStatus(autoCapture.checked ? "Automatic local checkpoints enabled." : "Automatic checkpoints paused.");
    await refreshCheckpointStatus();
  } catch (error) {
    setStatus("Could not update setting: " + String(error?.message || error));
  }
});

document.getElementById("runDiagnostic").addEventListener("click", async () => {
  setStatus("Running one capture test on the active ChatGPT tab…");
  try {
    const tab = await getActiveChatTab();
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "LUNA_AUTOCONTEXT_RUN_DIAGNOSTIC"
    });
    const result = response?.result || "unknown";
    if (response?.ok && result === "saved") {
      setStatus("PASS: " + response.messageCount + " message elements captured and checkpoint saved locally.");
    } else if (response?.ok && result === "unchanged") {
      setStatus("PASS: capture ran; the saved checkpoint already matches this content (" + response.messageCount + " message elements).");
    } else {
      setStatus("FAIL: " + (response?.detail || response?.error || result));
    }
  } catch (error) {
    setStatus("FAIL: " + String(error?.message || error));
  }
  await refreshCheckpointStatus();
});

document.getElementById("downloadMarkdown").addEventListener("click", async () => {
  try {
    setStatus("Capturing messages currently in the page…");
    const snapshot = await requestFullCapture();
    const safeTitle = (snapshot.title || "chatgpt-conversation").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 70);
    downloadText("LUNA-AutoContext-" + safeTitle + ".md", toMarkdown(snapshot), "text/markdown;charset=utf-8");
  } catch (error) { setStatus(String(error?.message || error)); }
});

document.getElementById("downloadJson").addEventListener("click", async () => {
  try {
    setStatus("Capturing messages currently in the page…");
    const snapshot = await requestFullCapture();
    const safeTitle = (snapshot.title || "chatgpt-conversation").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 70);
    downloadText("LUNA-AutoContext-" + safeTitle + ".json", JSON.stringify(snapshot, null, 2), "application/json;charset=utf-8");
  } catch (error) { setStatus(String(error?.message || error)); }
});

document.getElementById("exportCheckpoint").addEventListener("click", async () => {
  try {
    const result = await chrome.storage.local.get({ [CHECKPOINTS_KEY]: {} });
    const checkpoints = Object.values(result[CHECKPOINTS_KEY] || {});
    if (!checkpoints.length) { setStatus("No checkpoint to export yet."); return; }
    checkpoints.sort((a, b) => (b.changedAt || "").localeCompare(a.changedAt || ""));
    downloadText("LUNA-AutoContext-checkpoint.json", JSON.stringify(checkpoints[0], null, 2), "application/json;charset=utf-8");
  } catch (error) {
    setStatus("Checkpoint export failed: " + String(error?.message || error));
  }
});

document.getElementById("refresh").addEventListener("click", refreshCheckpointStatus);

document.getElementById("clearCheckpoints").addEventListener("click", async () => {
  if (!confirm("Delete all LUNA AutoContext checkpoints stored in this browser? Download any checkpoint you want to keep first.")) return;
  try {
    await chrome.storage.local.remove(CHECKPOINTS_KEY);
    await refreshCheckpointStatus();
    setStatus("Local checkpoints cleared. Downloaded exports are not affected.");
  } catch (error) {
    setStatus("Could not clear checkpoints: " + String(error?.message || error));
  }
});

(async function init() {
  try {
    const result = await chrome.storage.local.get({ [SETTINGS_KEY]: { autoCapture: false } });
    autoCapture.checked = Boolean(result[SETTINGS_KEY]?.autoCapture);
    await refreshCheckpointStatus();
  } catch (error) {
    setStatus("Initialization failed: " + String(error?.message || error));
  }
})();
