# Research Intake Release Checklist

**Status: pre-release checklist only. Do not treat this file as evidence that production has been inspected, migrated, or tested.**

The Research Intake changes in PR #9 require database changes before deploying the matching application code. The GitHub tests inspect application behavior and migration text; they do **not** execute these SQL statements against the production database.

## Release gates

- [ ] Confirm the live hosting target, deployed commit/version, database engine and version, and the database actually used by the live app.
- [ ] Confirm a maintenance/release window and a named operator with authorized database access.
- [ ] Take a database backup and verify that it can be restored to a separate test target. A backup that has not been restore-tested is not a verified recovery plan.
- [ ] Inspect the existing `research_intake` table definition and indexes. Confirm the `independent_trace` column and check whether `submission_key` or `uq_research_intake_submission_key` already exists. These migrations are **not idempotent**; do not blindly rerun them.
- [ ] Confirm the database engine supports the statements and index definition as written, and that the migration account has the required privileges.
- [ ] Review the actual SQL and record the migration outcome before deploying application code.

## Migration order

Apply both migration files to the verified target database, using the project's approved database administration method:

1. `migrations/2026-10-28-research-intake-independent-trace.sql`
2. `migrations/2026-10-29-research-intake-idempotency.sql`

The second migration adds a nullable `submission_key` column and a unique index. Existing rows should remain valid because their new column values are NULL. Confirm the actual database's behavior before relying on that assumption.

After applying the migrations, inspect the table definition and indexes again. Confirm `independent_trace` is a text-capable column and `submission_key` plus its unique index exist. If a migration partially fails or the observed schema differs from expectation, stop; inspect and reconcile the actual schema rather than rerunning the script or proceeding with deployment.

## Deploy and verify

Deploy only the reviewed PR commit after both migrations have succeeded and the post-migration schema has been verified.

Use controlled test submissions with synthetic data. Verify:
- A valid submission is persisted and receives an intake ID.
- A repeat request using the same idempotency key returns the existing intake rather than sending a second email.
- An email failure leaves a recoverable intake ID and does not encourage a fresh submission.
- Rate limiting and validation reject malformed or excessive requests as expected.
- The configured mail relay and recipient are correct, and a test message reaches the monitored research mailbox.
- Logs and responses do not expose submitted research content unnecessarily.

Do not use real participant data for release tests. Do not declare the Privacy Policy effective until actual deployed routes, hosting, database/mail providers, logging, backups, retention, and browser data flows have been verified and the policy has received the intended review.

## Recovery / rollback

- If a migration fails, stop before deploying the new application code. Inspect the database and reconcile the partial result with the verified backup and database operator.
- If application verification fails after deployment, roll back the application code to the previously verified version using the host's supported release process.
- Do **not** automatically drop the new nullable column or unique index during code rollback. Retaining additive schema changes is generally safer than a hurried reverse migration.
- Do **not** reverse the `independent_trace` type change without checking stored value lengths and proving that no data would be truncated.
- After rollback, confirm the previous application version is healthy. Record the failed check, migration state, and any manual recovery action before attempting another release.

## Current evidence boundary

Repository tests passing does not establish that the production database schema matches this branch, that either migration has been applied, that a backup is restorable, that SMTP works, or that deployment/rollback has been exercised. Those remain explicit release gates.
