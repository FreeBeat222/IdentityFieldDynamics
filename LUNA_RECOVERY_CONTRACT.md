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

### Current assessment

**PARTIAL PASS / repeatability not yet established.** The sequence now contains one reported failure and three promising reported outcomes. T4's reported source identities match the files independently fetched in this conversation immediately before recording the result. The report is detailed and provenance-aware, but its claims about the fresh chat's tool calls remain user-reported rather than independently instrumented.

## 6. Next test

T4 completed the previously recorded next test and has been logged above. The next engineering step is to review the recurring source-identity discrepancy between the browser-rendered GitHub page and connector output, then decide whether another bounded fresh-chat test is warranted. Do not immediately ask for repeated tests without a specific hypothesis; first use the accumulated evidence to identify what additional test would establish.

## 7. Change control

- Preserve failed tests and historical versions of the result; append new rows instead of rewriting history.
- Distinguish observed retrieval from claims in a pasted report.
- Never invent a SHA, source read, or completed action.
- Update the index's current checkpoint and this log together when a new test materially changes the state.
- Do not claim full recovery merely because a file write or a single test succeeded.
