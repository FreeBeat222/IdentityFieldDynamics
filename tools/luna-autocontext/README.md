# LUNA AutoContext — ECONOMY WITHOUT AMNESIA

**MVP status: source added; browser installation and runtime behavior still require local testing.**

A small, local-first Chrome/Edge Manifest V3 extension for ChatGPT conversations.

## What this first version does

- When explicitly enabled, creates a compact checkpoint on page changes and on a five-minute safety interval.
- Stores only the latest compact checkpoint per conversation in `chrome.storage.local`.
- Exposes a user-triggered full snapshot export as Markdown or JSON.
- Records source URL, capture time, message-element count, message identifiers where available, and a SHA-256 fingerprint when Web Crypto is available.
- Includes a capture-scope warning because DOM-derived messages may omit unloaded or virtualized content.
- Sends no conversation content to GitHub or any other remote service. No API token is requested or stored.

## What it does not do yet

- Does not automatically upload to GitHub.
- Does not guarantee that every message in the conversation is present in the page DOM.
- Does not capture other tabs, other conversations, or content after the browser has closed.
- Does not generate a semantic summary with an AI model.
- Does not guarantee that a checkpoint is saved if the browser closes before the content script sends it and the service worker completes the write.

## Install locally (Chrome or Edge)

1. Download or clone this repository.
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select the `tools/luna-autocontext` directory.
5. Open or reload a ChatGPT conversation tab.
6. Open the LUNA AutoContext extension popup.
7. Enable **Automatic checkpoints**. This is opt-in and remains off by default.
8. Verify the popup reports a saved local checkpoint after the page changes or after a capture cycle.
9. Use **Download full snapshot** to preserve a source artifact outside the extension's rolling checkpoint.

## Storage model

- **Working checkpoint:** one compact, evolving record per conversation, with the last eight message excerpts and a fingerprint for the captured DOM-derived message set.
- **Evidence artifact:** a user-triggered Markdown or JSON download containing all message elements found at capture time.
- **No silent remote persistence:** a later GitHub integration must use explicit authorization, visible status, safe token handling, and read-back verification.

## First acceptance test

1. Install unpacked and open a conversation with several turns.
2. With automatic checkpoints off, confirm no checkpoint appears.
3. Enable automatic checkpoints and trigger a new message or page change.
4. Confirm a checkpoint appears in the popup.
5. Export JSON and Markdown; compare message count, order, roles, and a few exact text passages with the page.
6. Reload the tab and confirm the local checkpoint remains.
7. Disable automatic capture and confirm new page changes do not update the checkpoint.
8. Confirm no network requests to GitHub or other remote destinations are made by this extension.

Record any failed step as a failure; do not treat a successful file write as proof of complete conversation capture.

## Design rule

**Preserve the evidence. Compress the working model. Never confuse the two.**

This MVP uses a compact rolling checkpoint for recovery and explicit exports for source preservation. It is a starting point for testable local capture, not yet the independent, unattended GitHub capture system.
