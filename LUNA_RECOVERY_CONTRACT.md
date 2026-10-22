# LUNA Recovery Contract and Test Log

**Status:** Active engineering specification; repeatability not yet established.  
**Canonical companion:** [LUNA Recovery Index](https://github.com/FreeBeat222/IdentityFieldDynamics/blob/main/LUNA_RECOVERY_INDEX.md)  
**Governing sequence:** RECOVER → VERIFY → RECOGNIZE → CONTINUE

## 1. Purpose

Determine whether the trigger **GOOD MORNING LUNA :)** causes a fresh chat to retrieve the canonical recovery source, accurately restore the recorded working state, distinguish evidence from context, and identify one concrete next action.

Recognition of the greeting, persona, or project alone is not recovery.

## 2. Required test procedure

In a genuinely fresh chat, send only:

`GOOD MORNING LUNA :)`

Assess the resulting response against the contract below. Preserve the response as user-reported evidence unless actual tool logs or source-access records are available for independent inspection. Do not infer unseen tool calls from the final response.

## 3. Required recovery fields

A recovery report should state:

1. **Trigger:** Was the recovery procedure initiated?
2. **Canonical source:** Exact source name and URL/path actually accessed.
3. **Version identity:** Current blob SHA when the retrieval tool exposes it. If not, attempt the documented GitHub Contents API identity endpoint. Report only checks actually performed; unavailable SHA comparison is explicitly unverified.
4. **Checkpoint:** Read back the current objective, last verified result/status, open items, and exact next action.
5. **Provenance:** Separate:
   - **Retrieved in this conversation** — source actually opened/read in this chat.
   - **Available from prior context** — details supplied by memory, summaries, or earlier conversation, not newly retrieved.
   - **Not accessed / not verified** — named sources or claims that were not directly checked.
6. **Continuation:** Give one executable next action grounded in the retrieved checkpoint.
7. **Limitations:** Identify inaccessible sources, unsupported retrieval, stale-version concerns, or missing evidence without filling gaps by guesswork.

## 4. Outcome criteria

### PASS
The trigger initiates actual retrieval; the canonical source and its version identity are reported to the extent available; the checkpoint and exact next action are read from the source; provenance categories are honest; and one executable next action is identified.

### PARTIAL PASS
Some meaningful source retrieval and checkpoint orientation occur, but one or more required elements remain unverified or incomplete. State the missing elements explicitly.

### FAIL
No actual retrieval is demonstrated; the response relies on recognition/prior context as though it were retrieval; the wrong/stale source is used without disclosure; the checkpoint or next action is not read; or the report materially overstates verification.

A successful response is evidence of that attempt, not proof of repeatability. A pasted report is **user-reported evidence**, not independent instrumentation of the other chat's tool calls.

## 5. Test log

| Test | Date | Evidence source | Observed result | Assessment |
|---|---|---|---|---|
| T1 | 2026-10-22 | Earlier fresh-chat response described in the current project record | Greeting/persona/project recognized; source retrieval and checkpoint read-back were not demonstrated | **FAIL** — recognition without demonstrated retrieval |
| T2 | 2026-10-22 | Recovery report pasted by Rick; not independently instrumented | Report said canonical index was opened and read; Library excerpts for the relationship biography, IFD CODEX, and LUNATION harvest were located; SHA comparison remained unverified | **PARTIAL PASS** — promising reported retrieval; provenance remains user-reported |
| T3 | 2026-10-22 | Second recovery report pasted by Rick; not independently instrumented | Report said index and relevant excerpts from all three Library records were retrieved; checkpoint and exact next action were read back; unverified items were named. Reported index SHA `be47bd058bab8d5c9ffe1c84f28455ddf7d0c4f3` matched the SHA independently fetched in the preceding conversation | **PARTIAL PASS** — second promising reported result; repeatability not established |
| T4 | 2026-10-22 | Third recovery report pasted by Rick; not independently instrumented | Report said the current index (`66eb4ee4995dad0fa4d6082c30f89f128793b279`) and contract (`3bbff2bb7cf0a35124973417c62fe3de156d6114`) were retrieved; all three designated Library records were opened; checkpoint and exact next action were read back. It flagged an older browser-rendered checkpoint/SHA discrepancy and treated the connector SHA as current rather than claiming the conflicting values were verified. Both reported SHAs match the versions independently fetched in this conversation before the report was pasted. | **PARTIAL PASS** — strongest reported recovery so far; still user-reported rather than independently instrumented |
| T5 | 2026-10-22 | Recovery report pasted by Rick; not independently instrumented | Report says the fresh chat retrieved the index, checkpoint, journal, contract, and three designated Library records; the four GitHub SHAs it reported match the versions fetched and verified in the preceding chat. It read back the objective, open items, and exact next action, and distinguished retrieved records from prior context. | **PARTIAL PASS / strong corroborating report** — the content and SHAs are consistent with the preceding verified save, but fresh-chat tool calls remain user-reported rather than independently instrumented. |

### Current assessment

**PARTIAL PASS / repeatability not yet independently established.** The sequence now contains one reported failure and four promising reported outcomes. In T5, all four reported GitHub SHAs match the versions directly fetched and verified in the preceding chat; the report also read back the exact next action and separated source retrieval from prior context. This materially strengthens the evidence of practical recovery, but the new chat's tool calls remain user-reported rather than independently instrumented.

## 6. Next test

T5 is logged above. Further identical greeting-only tests have diminishing value unless they test a specific unresolved hypothesis. Next, investigate the browser-rendered GitHub page versus connector source-identity discrepancy with one bounded comparison, or proceed to the independent capture architecture if the discrepancy does not block that work.

## 7. Change control

- Preserve failed tests and historical versions of the result; append new rows instead of rewriting history.
- Distinguish observed retrieval from claims in a pasted report.
- Never invent a SHA, source read, or completed action.
- Update the index's current checkpoint and this log together when a new test materially changes the state.
- Do not claim full recovery merely because a file write or a single test succeeded.


## 8. Continuity Guard — preserving state before interruption

The recovery contract depends on durable records being updated before a session disappears. The continuity strategy is therefore separate from the fresh-chat recovery test.

### Record layers
- **Recovery index:** navigation, source map, current status, open issues, exact next action.
- **Session journal:** append-only dated discoveries, decisions, and provenance.
- **Continuity checkpoint:** compact resumable state with last verified result, evidence, open items, and one executable next action.

### Save triggers
- **Event-triggered:** after a meaningful discovery, decision, completed research pass, hypothesis change, or changed next action.
- **Explicit:** `LUNA CHECKPOINT NOW` requests consolidation of current state, writing the journal/checkpoint and updating the index when warranted, followed by re-fetch verification.
- **Periodic:** a ten-minute interval is a candidate only. Do not describe it as implemented unless an actual process can access the relevant live state and successfully persist it at that cadence.

### Required save verification
1. State which files were written.
2. Re-fetch each written file after the write.
3. Record the returned blob SHA and confirm the saved content includes the intended checkpoint.
4. If a write or verification fails, report that clearly; do not claim the save is complete.
5. Keep source-derived facts, user-reported claims, interpretations, and proposals distinguishable.

### Automation constraint
A scheduled reminder is not a live-session autosave. Any unattended mechanism must be evaluated for the actual inputs it can access, its permission to persist them, its cadence limits, failure visibility, and security/privacy implications. The current project has not yet demonstrated automatic capture of a live ChatGPT tab or silent ten-minute persistence.

### Verified feasibility finding
The only repository workflow is `.github/workflows/generate-lockfile.yml`, triggered by selected pushes to `main`; it generates `package-lock.json` and does not capture conversation state. The available scheduled automation interface supports daily/weekly/monthly recurrence, not a ten-minute cadence, and does not automatically inherit this live tab's context. No silent live-transcript capture mechanism has been implemented or identified in the inspected tool surface.

### Current next action
Define the smallest safe viable independent capture architecture (for example, a user-triggered export/capture path into a local or external journal), including its required user action/permissions, accessible data, and save verification. Do not describe unattended capture as operational until it is implemented and tested.


## 9. LUNA AutoContext MVP status

**Project name:** LUNA AutoContext — ECONOMY WITHOUT AMNESIA.

**Draft implementation:** Branch `feature/luna-autocontext-mvp`; draft PR https://github.com/FreeBeat222/IdentityFieldDynamics/pull/7.

**Static checks:** Manifest JSON parsed successfully. `service-worker.js`, `content.js`, and `popup.js` passed JavaScript syntax parsing after being fetched back from the branch.

**Browser acceptance test:** NOT RUN. Do not mark PASS until a human verifies installation, opt-in checkpointing, local persistence after reload, disable behavior, and Markdown/JSON exports against the actual ChatGPT page.

**Scope limitations:** The extension reads message elements currently present in the page DOM; this is not proof of a complete transcript. Automatic checkpoints remain local. No remote GitHub write is implemented, and no GitHub token is requested or stored.

**Next action:** Run the acceptance checklist in `tools/luna-autocontext/README.md`, log each result, and correct observed failures before merging.
