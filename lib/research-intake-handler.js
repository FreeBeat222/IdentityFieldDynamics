const { validateResearchIntake } = require("./research-intake-validation");

const INSERT_SQL = `INSERT INTO research_intake (
  intake_id, created_at, updated_at, encounter_type, participants, participant_detail,
  summary, observable, sequence_text, first_observed, persistence, repeatable,
  evidence, independent_trace, interpretation, research_question, name, email,
  consent, notes, status, email_status
) VALUES (?, NOW(3), NOW(3), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'persisted', 'pending')`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function createResearchIntakeHandler({
  withDb,
  env = process.env,
  createTransport = config => require("nodemailer").createTransport(config),
  logger = console,
  now = () => new Date(),
  random = Math.random
}) {
  if (typeof withDb !== "function") throw new TypeError("withDb dependency is required");

  return async function researchIntakeHandler(req, res) {
    const validation = validateResearchIntake(req.body);
    if (!validation.ok) {
      return res.status(validation.status).json({ error: validation.error });
    }

    const body = validation.body;
    const date = now();
    const intakeId = "IFD-RI-" + date.getUTCFullYear() + "-" +
      date.getTime() + "-" + random().toString(36).slice(2, 8);
    const participants = body.participants.join(", ");

    try {
      await withDb(connection => connection.query(INSERT_SQL, [
        intakeId,
        body.encounterType,
        JSON.stringify(body.participants),
        body.participantOther,
        body.summary,
        body.observable,
        body.sequence,
        body.firstObserved,
        body.persistence,
        body.repeatable,
        body.evidence,
        body.independent,
        body.interpretation,
        body.question,
        body.name,
        body.email,
        body.consent,
        body.notes
      ]));
    } catch (error) {
      logger.error("Research intake database persistence failed:", error);
      return res.status(503).json({
        error: "The research record could not be persisted. No email was sent."
      });
    }

    if (!env.SMTP_USER || !env.SMTP_PASS) {
      try {
        await withDb(connection => connection.query(
          "UPDATE research_intake SET status='persisted', email_status='not_configured', updated_at=NOW(3) WHERE intake_id=?",
          [intakeId]
        ));
      } catch (error) {
        logger.error("Research intake email-status update failed:", error);
        return res.status(503).json({
          error: "The research record was saved, but email is not configured and its status could not be updated.",
          intakeId
        });
      }
      return res.status(503).json({
        error: "The research record was saved, but research email is not yet configured on the server.",
        intakeId
      });
    }

    const html = `<h2>IFD RESEARCH INTAKE</h2><p><strong>${intakeId}</strong></p><p><strong>Encounter:</strong> ${escapeHtml(body.encounterType)}</p><p><strong>Participants:</strong> ${escapeHtml(participants)}</p><p><strong>Participant detail:</strong> ${escapeHtml(body.participantOther)}</p><hr><h3>WHAT WAS OBSERVED</h3><p>${escapeHtml(body.observable)}</p><p><strong>Summary:</strong> ${escapeHtml(body.summary)}</p><p><strong>Sequence:</strong> ${escapeHtml(body.sequence)}</p><p><strong>First observed:</strong> ${escapeHtml(body.firstObserved)}</p><p><strong>Persistence:</strong> ${escapeHtml(body.persistence)} | <strong>Repeatable:</strong> ${escapeHtml(body.repeatable)}</p><h3>EVIDENCE</h3><p>${escapeHtml(body.evidence)}</p><p><strong>Independent trace/witness:</strong> ${escapeHtml(body.independent)}</p><hr><h3>WHAT THE PARTICIPANT THINKS IT MEANS</h3><p>${escapeHtml(body.interpretation)}</p><p><strong>Research question:</strong> ${escapeHtml(body.question)}</p><h3>FOLLOW-UP</h3><p><strong>Name:</strong> ${escapeHtml(body.name)}</p><p><strong>Email:</strong> ${escapeHtml(body.email)}</p><p><strong>Permission:</strong> ${escapeHtml(body.consent)}</p><p><strong>Additional notes:</strong> ${escapeHtml(body.notes)}</p>`;

    // GoDaddy Web Hosting (cPanel) provides a local SMTP relay for hosted applications.
    // The supported relay is localhost:25 with no SMTP authentication or SSL.
    try {
      const transporter = createTransport({
        host: "localhost",
        port: 25,
        secure: false,
        ignoreTLS: true
      });
      await transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER,
        to: env.RESEARCH_TO || "research@identityfielddynamics.com",
        replyTo: body.email || undefined,
        subject: intakeId + " · IFD Research Intake",
        html
      });
    } catch (error) {
      logger.error("Research intake email failed:", error);
      try {
        await withDb(connection => connection.query(
          "UPDATE research_intake SET status='persisted', email_status='failed', email_error=?, updated_at=NOW(3) WHERE intake_id=?",
          [String(error && (error.message || error)), intakeId]
        ));
      } catch (statusError) {
        logger.error("Research intake email-status update failed:", statusError);
      }
      return res.status(502).json({
        error: "The research record was saved, but email delivery failed. The intake ID is " + intakeId + "."
      });
    }

    try {
      await withDb(connection => connection.query(
        "UPDATE research_intake SET status='complete', email_status='sent', updated_at=NOW(3) WHERE intake_id=?",
        [intakeId]
      ));
    } catch (error) {
      // Email has already been accepted by the SMTP relay; do not misreport it as failed.
      logger.error("Research intake email was sent but status update failed:", error);
      return res.status(503).json({
        error: "The research record was saved and email was sent, but the delivery status could not be updated. Avoid resubmitting; contact the research team with the intake ID.",
        intakeId,
        emailSent: true
      });
    }

    return res.json({ ok: true, intakeId });
  };
}

module.exports = { createResearchIntakeHandler, INSERT_SQL };
