# IFD Quiz Lab — POWER Pilot Provenance & Design Note

**Artifact ID:** IFD-QL-POWER-PROVENANCE-001  
**Version:** 0.1  
**Status:** Research/design note; OPEN  
**Related implementation:** `public/quiz-lab-power-pilot.html` on branch `feature/quiz-lab-power-pilot`  
**Related prior records:** `IFD_QUIZ_LAB_BITE_005_CONSOLIDATED_AUDIT_v1.0.md`; `IFD_QUIZ_LAB_BITE_006_COMPARATIVE_CODING_LEDGER_v1.0.md`; `IFD_QUIZ_LAB_BITE_007_BLIND_REVIEWER_PACKET_v1.0.md`; `IFD_CODEX_MASTER_v1.0.md`; conversation record “IFD — The 12 Conceptual Sparks / Conceptual Trigger Quizzes.”

## 1. Purpose

This note records which recovered IFD research decisions inform the POWER pilot and which prior findings do **not** transfer directly. It exists to prevent a new implementation from being mistaken for a recovered or validated research instrument.

## 2. Source-grounded definition of the POWER trigger

The recovered “IFD — The 12 Conceptual Sparks” record defines:

> **POWER — What shapes the road?**  
> The capacity to construct circumstances and organize the possibilities available to other identities.

Its quiz concept is:

> **The Roadbuilder Question:** Who constructs the available choices? Can a system influence decisions without explicitly forcing anyone?

Its stated discovery question is:

> What can the structure of available options reveal about power?

The source also proposes a guiding idea for investigation: examine the possibilities a system makes available, not only the intentions it announces. The source explicitly treats this as a question to investigate, **not a proven conclusion**.

The twelve triggers are entry points, not predetermined categories. Their suggested sequence is exploratory and must not be imposed as a law.

## 3. Recovered design requirements for all trigger quizzes

The source proposes five elements:

1. **A compelling situation** — a real-world dilemma, not a vocabulary test.
2. **A consequential choice** — the participant reasons through competing possibilities.
3. **A revealing follow-up** — why they chose as they did, or what additional evidence they would want.
4. **A meaningful reflection** — competing interpretations are explained without declaring one preferred worldview the winner.
5. **An open door** — the ending can generate a new thought, disagreement, or research hypothesis.

The source also distinguishes three types of output:

- **Knowledge:** whether a participant understands a defined concept.
- **Reasoning:** how the participant evaluates evidence, choices, and consequences in a particular scenario.
- **Reflection:** what the participant notices about their own reasoning.

Reflection must not be disguised as a scientifically validated personality measurement. Any later claims about reliable measurement of identity require independent reliability and validity work.

## 4. What the earlier comparative-coding work actually studied

The Bite 005 audit and Bite 006 ledger examined the **existing five-question Identity Challenge**, not the new POWER trigger.

That earlier instrument has five questions and twenty exact answer options, with current categories:

- Present
- History
- Motion
- Context

The prior work compared three analytically separate issues:

- **Model A:** retain four categories with sharpened provisional definitions.
- **Model B:** code response focus and reasoning stance as separate dimensions.
- **Model C:** scoring and reporting policy, kept separate from category mapping.

The audit identified a possible logical-level mismatch: Present, History, and Motion are mainly temporal/evidence emphases, while Context can mix intention/meaning, evidence sufficiency, and investigative method. Several options admit multiple plausible readings. The current implementation's tie-to-Context rule is a separate question from whether individual mappings are defensible.

**Crucial limit:** the recovered original transcript explaining why each old option was assigned its category—or why four categories were chosen—was not found in the audit. The mapping is a fact about the implementation; the comparative explanations are retrospective interpretations. No changes to the original quiz, mappings, scoring, or tie rule were authorized by that audit.

The Bite 007 blind reviewer packet specifies independent coding before revealing existing mappings, preservation of original reviewer submissions, documented rationales and confidence, and separate adjudication. Reviewer agreement would be evidence about reproducibility under the instructions, not proof of construct validity.

## 5. How those findings inform POWER—and how they do not

The prior coding models are **not** imported as POWER answer categories. Present / History / Motion / Context were developed for the earlier Identity Challenge and are not established as suitable dimensions for POWER.

Instead, the POWER pilot applies the recovered trigger-specific question: how might the design of available choices reveal power?

The revised pilot uses five roadbuilding situations to explore:
- which options formally exist versus which can practically be used;
- who or what determines the option set and its constraints;
- how access and consequences may differ across identities;
- how declared goals differ from observed effects;
- how later outcomes can create or close future possibilities;
- what evidence could distinguish competing interpretations.

For each situation, participants first select an **interpretive lens**, then select the **evidence they would inspect next**. The pairing is intentional: interpretation and evidence-seeking are different analytical acts. The result reports the participant's selections and explains what the chosen evidence might establish; it does not generate a personality score or declare a single correct worldview.

These lens labels are descriptive interface language for this pilot. They are **not validated scales, stable traits, or a finalized codebook**. The choices are not a substitute for the independent review process.

## 6. Current limits and open tests

**Status:** exploratory prototype; not validated and not yet approved as a live research instrument.

Open questions:
1. Do the scenarios genuinely probe the structure of available possibilities, or do some drift into generic questions of authority or fairness?
2. Are the interpretation choices meaningfully distinct without steering participants toward a preferred answer?
3. Do the evidence choices genuinely discriminate between competing explanations?
4. Does the feedback stay within what each choice supports?
5. Can independent reviewers code the choices consistently, and do disagreements expose unclear wording or overlapping analytical targets?
6. Do participants understand the difference between an observation, an inference, and evidence that could change their minds?

The implementation remains client-side: answers are not submitted or stored. No participant response data are implied by this design note.

## 7. Next research step

Run a **blind content review** before public deployment. Give reviewers the scenario text, answer options, evidence options, and the POWER trigger definition, but do not tell them the intended lens for each option. Ask reviewers to independently identify:
- what each option attends to;
- what evidence it seeks;
- what inference the feedback invites;
- where wording is ambiguous or overclaims.

Preserve independent classifications before discussion. Record disagreements in a separate, versioned review note. Revise only after the disagreements are documented. Do not claim construct validity from agreement alone.

**Working principle:** One bite → one traceable result → one better map.

## Provenance register

- **Source:** “IFD — The 12 Conceptual Sparks / The IFD Twelve — Conceptual Trigger Quizzes,” recovered from the conversation/library record. Establishes the POWER / Roadbuilder framing and the five-part quiz design.
- **Source:** `IFD_QUIZ_LAB_BITE_005_CONSOLIDATED_AUDIT_v1.0.md`. Retrospective audit of the existing Identity Challenge and its twenty options; explicitly no live change authorized.
- **Source:** `IFD_QUIZ_LAB_BITE_006_COMPARATIVE_CODING_LEDGER_v1.0.md`. Comparative proposal for Model A, Model B, and Model C; status OPEN, not validated.
- **Source:** `IFD_QUIZ_LAB_BITE_007_BLIND_REVIEWER_PACKET_v1.0.md`. Independent review and evidence-handling procedure.
- **Source:** `IFD_CODEX_MASTER_v1.0.md`. Governing status discipline: distinguish canonical principle, provisional model, interpretation, empirical validation, and open question.
