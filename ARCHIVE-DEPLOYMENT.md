# IFD Encounter Archive

The Encounter Archive is a private, append-only research record implemented with SQLite through Node 22's `node:sqlite` runtime API.

## Required environment variable
Set `IFD_ARCHIVE_KEY` in the GoDaddy Node.js application's environment variables before using `/archive.html`. The key is never stored in the repository.

## Record model
Each encounter stores the exact submitted transcript, occurrence time, participants, context, trigger, recognition event, construct, status, SHA-256 transcript hash, previous-record hash, and creation time.

The primary transcript is never overwritten by the application. Later interpretation should be stored as a separate record or layer rather than editing the original encounter.

## Runtime storage
SQLite is created at `data/ifd-archive.sqlite`. The `data/` directory is intentionally excluded from Git because it is live research data.

## First deployment
1. Set `IFD_ARCHIVE_KEY` in GoDaddy Node.js Application Manager.
2. Restart/redeploy the Node application.
3. Open `/archive.html` over HTTPS.
4. Enter the archive key and create a test encounter.
5. Recall it and verify the SHA-256 and `GENESIS`/previous hash fields.
