# LUNA AutoContext — ECONOMY WITHOUT AMNESIA

**MVP status:** source and one-click diagnostics are implemented. Browser runtime acceptance remains incomplete; do not describe the extension as verified until the diagnostic and export tests pass.

A local-first Chrome/Edge Manifest V3 extension for ChatGPT conversations.

## What this version does

- When explicitly enabled, attempts a compact checkpoint on page changes and on a five-minute safety interval.
- Stores the latest compact checkpoint per conversation in `chrome.storage.local`.
- Exposes a user-triggered full snapshot export as Markdown or JSON.
- Shows persistent status for the last capture attempt, including saved, unchanged, zero-message, disabled, and error outcomes.
- Includes **Test capture now**, a one-click diagnostic for the active ChatGPT tab. It reports whether the content script ran, how many message elements it found, and whether local storage confirmed a save.
- Records source URL, capture time, message-element count, message identifiers where available, and a fingerprint.
- Includes a capture-scope warning because DOM-derived messages may omit unloaded or virtualized content.
- Sends no conversation content to GitHub or any other remote service. No API token is requested or stored.

## What it does not do yet

- Does not automatically upload to GitHub.
- Does not guarantee that every message in the conversation is present in the page DOM.
- Does not capture other tabs, other conversations, or content after the browser has closed.
- Does not generate a semantic summary with an AI model.
- Does not guarantee a checkpoint if the browser closes before the content script sends it and the service worker completes the write.

## Install or update locally (Chrome or Edge)

1. Download or pull the `feature/luna-autocontext-mvp` branch.
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. For an existing unpacked install, use **Reload** on the extension card after replacing the source files. Then reload the ChatGPT conversation tab so its content script is refreshed.
4. For a first install, turn on **Developer mode**, choose **Load unpacked**, and select `tools/luna-autocontext`.
5. Open a ChatGPT conversation tab and open the LUNA AutoContext popup.
6. Automatic checkpoints remain opt-in and off by default. If already enabled, do not toggle it again just to repeat a completed step.
7. Click **Test capture now** once. Read the explicit PASS/FAIL result and the persistent “Last attempt” detail.
8. If the test passes, compare the saved message count and export a JSON or Markdown snapshot; check message order and exact passages against the visible conversation.

## Reading the diagnostic

- **PASS: … saved locally** — the content script returned a nonzero message count and the service worker confirmed a local write.
- **PASS: … already matches** — capture ran and the stored fingerprint already matched; this is a valid no-change outcome.
- **FAIL: zero message elements** — the content script responded, but its selectors found no messages. Investigate the live ChatGPT DOM selectors.
- **FAIL: content script is not running** — the active tab needs the extension's content script injected (normally reload the ChatGPT tab after updating the extension).
- **FAIL: storage/capture error** — use the specific displayed error; do not repeat setup steps without evidence that setup is the cause.

The Refresh button now updates the visible checkpoint report and displays a refresh time. A status report includes the last attempt result and detail so a no-op is no longer indistinguishable from a failed attempt.

## Storage model

- **Working checkpoint:** one compact, evolving record per conversation, with the last eight message excerpts and a fingerprint for the captured DOM-derived message set.
- **Evidence artifact:** a user-triggered Markdown or JSON download containing all message elements found at capture time.
- **No silent remote persistence:** a later GitHub integration must use explicit authorization, visible status, safe token handling, and read-back verification.

## Acceptance test

1. With automatic checkpoints off, verify no checkpoint is written.
2. With automatic checkpoints on, click **Test capture now** once in a ChatGPT conversation.
3. Confirm a PASS result and a nonzero message-element count, or record the exact FAIL detail.
4. Export JSON/Markdown and compare message count, order, roles, and a few exact text passages with the page.
5. Reload the tab and confirm the local checkpoint remains.
6. Disable automatic capture and verify ordinary page changes do not update the checkpoint.
7. Confirm no network requests to GitHub or other remote destinations are made by this extension.

Record failed steps as failures. A successful file write is not proof of complete conversation capture.

## Design rule

**Preserve the evidence. Compress the working model. Never confuse the two.**

This MVP is a starting point for testable local capture, not yet the independent, unattended GitHub capture system.
