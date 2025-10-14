const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");

const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const SENDER_EMAIL = defineSecret("SENDER_EMAIL");

exports.sendEmail = onRequest(
    {cors: true, secrets: [SENDGRID_API_KEY, SENDER_EMAIL]},
    async (req, res) => {
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      try {
        sgMail.setApiKey(SENDGRID_API_KEY.value());

        const body = req.body || {};
        const to = body.to;
        const subject = body.subject || "(no subject)";
        const text = body.text || "";
        const html = body.html;
        const base64 = body.base64;
        const filename = body.filename;

        const msg = {
          to: to,
          from: SENDER_EMAIL.value(),
          subject: subject,
          text: text,
          html: html,
        };

        if (base64 && filename) {
          msg.attachments = [
            {
              content: base64,
              filename: filename,
              type: "application/octet-stream",
              disposition: "attachment",
            },
          ];
        }

        await sgMail.send(msg);
        res.status(200).json({ok: true});
      } catch (err) {
        logger.error(err);
        res.status(500).json({ok: false, error: err.message});
      }
    },
);
