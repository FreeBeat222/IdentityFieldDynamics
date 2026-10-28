# Privacy Policy — Working Draft for Review

**Status:** Internal draft. Not published or legal advice. This draft intentionally identifies unresolved operational facts instead of making unsupported promises. Do not deploy until hosting/provider facts are verified, the wording is approved, and applicable legal requirements are reviewed.

**Effective date:** To be set only upon approval and publication.

## 1. Scope

This draft covers the public Identity Field Dynamics (IFD) website and its Research Intake. Different interactive tools may handle information differently. This draft describes the source-code behavior reviewed on 28 October 2026; the deployed website and hosting configuration must be checked before this is published as a definitive policy.

## 2. Research Intake information

When a visitor submits the Research Intake, the form sends the fields in the submission to the IFD server. The application writes the structured fields to a MySQL `research_intake` table and attempts to send the record to the research mailbox. If email delivery fails, the database record may still have been saved. The application creates an intake identifier for the submission.

The form may include:
- encounter type and participant categories;
- optional participant details;
- event summary and sequence;
- approximate first-observed date/time;
- observable behavior, persistence, and repeatability;
- evidence and independent witness/trace details;
- the submitter's interpretation and research question;
- optional name and email;
- a follow-up preference and additional notes.

Please do not include sensitive personal information about yourself or others unless it is necessary, appropriate, and you have authority to disclose it. Consider describing people or systems without identifying them where possible.

The follow-up preference records whether IFD may contact the submitter. It does not determine whether the submitted record is stored or sent for processing.

## 3. Purpose

The source code indicates that Research Intake submissions are collected to receive, preserve, and review research observations and questions, and to route the record to the research mailbox. Any additional purposes must be confirmed before publication.

## 4. Other interactive tools

Source review of the Quiz Lab and OBSERVOR pages examined to date found their interaction results held in page memory, without an apparent network submission or browser-storage call in those reviewed scripts. OBSERVOR includes a user-triggered local JSON export. A separate /lab prototype records the choice and response time in the active page script; no server submission was found in that route's reviewed code.

These findings are limited to the reviewed source files and are not a guarantee about every page, browser extension, hosting component, or future version. The full deployed page inventory and live network behavior must be checked before relying on this section.

## 5. Recipients and service providers

The source shows Research Intake data is stored by the configured MySQL database and sent through the application's configured mail relay to the configured research recipient (defaulting in source to research@identityfielddynamics.com). The hosting provider, database service, mail provider, administrators with access, and any subcontractors may process information or technical data as part of providing these services.

**Before publication, verify and name the actual hosting, database, and email providers; who can access records; applicable contractual terms; data locations where relevant; and whether other recipients or processors are involved.** Do not publish provider names or assurances based on source-code defaults alone.

## 6. Technical and server information

The application source reviewed does not implement an application-level analytics package, cookie/session system, or general request logger. That does not establish whether the hosting provider, proxy, firewall, CDN, server runtime, database, or email infrastructure records IP addresses, timestamps, user-agent strings, security events, or other technical information. Verify actual infrastructure behavior before describing it.

## 7. Storage, security, and retention

Research Intake records are stored in the configured database; email copies may also exist in the research mailbox. The inspected application source does not define a deletion schedule or automatic retention limit. Database backups, mailbox retention, access controls, encryption at rest, provider-level backups, and deletion processes have not yet been verified.

Before publication, the operator must determine the actual retention approach, access restrictions, backup behavior, incident response, and process for handling deletion or access requests. Until then, no specific retention period or deletion guarantee should be stated.

The application disables Express's X-Powered-By header and disables public lookup of intake records by intake ID. These safeguards do not establish that all data is confidential or eliminate all security risk. No promise of absolute security is made.

## 8. Choices and requests

The submitter can leave name and email blank and can choose not to permit follow-up contact. These choices do not prevent processing needed to accept, store, and route a submitted research record.

**Before publication, provide a verified contact channel and a procedure for privacy inquiries and applicable rights requests.** Whether particular access, correction, deletion, objection, or other rights apply depends on the relevant law and circumstances; do not promise capabilities that have not been implemented.

## 9. Children and third-party links

The site's age-related practices and any restrictions for minors must be decided and verified before publication. The reviewed pages include links to external research resources. When a visitor follows an external link, that destination's own practices apply; review its policy separately. The source review found no third-party embedded analytics scripts in the pages checked, but this is not a guarantee for every deployed resource.

## 10. Changes and contact

This policy should be dated when published and updated when data flows or providers materially change. Contact details and response procedures must be verified before this section is published.

## Publication blockers / verification checklist

- [ ] Confirm deployed routes and page versions match the reviewed GitHub source.
- [ ] Identify hosting, database, SMTP/mailbox providers and review relevant terms/settings.
- [ ] Verify IP/security/access logs, backup copies, access controls, encryption, and retention/deletion behavior.
- [ ] Confirm whether the database's `raw_payload` column is now unused by the deployed version and decide whether legacy contents need separate handling.
- [ ] Inspect every public HTML/JS page and browser network activity for analytics, cookies, local storage, third-party scripts, and other transfers.
- [ ] Confirm a monitored privacy contact and a workable request-handling process.
- [ ] Review jurisdictional requirements and finalize language with appropriate legal review.
- [ ] Record approval and effective date before linking this policy publicly.
