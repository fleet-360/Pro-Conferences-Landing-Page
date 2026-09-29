// Serves the landing page and emails RSVP submissions.
//
//   npm start            → http://localhost:5510
//
// SMTP settings come from .env (see .env.example). Without SMTP_HOST the server runs in
// dry-run mode: emails are printed to the console instead of being sent.
// Recipients are read from js/content.js → rsvp.notify.recipients.

const fs = require("fs");
const http = require("http");
const path = require("path");
const nodemailer = require("nodemailer");
const { loadContent } = require("./lib/load-content");

const ROOT = __dirname;
const ENV_PATH = path.join(ROOT, ".env");
if (fs.existsSync(ENV_PATH)) process.loadEnvFile(ENV_PATH);

const PORT = Number(process.env.PORT) || 5510;
const MAX_BODY_BYTES = 10 * 1024;

/* ---------- Mail transport ---------- */

const DRY_RUN = !process.env.SMTP_HOST;

const transporter = DRY_RUN
  ? nodemailer.createTransport({ jsonTransport: true })
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function buildRsvpEmail(data, content) {
  const notify = content.rsvp.notify;
  const conferenceName = content.hero.title || "כנס Pro Algorithm";
  const status = data.attending ? content.rsvp.attendingYes : content.rsvp.attendingNo;
  const subjectTemplate = data.attending ? notify.subjectYes : notify.subjectNo;
  // Strip line breaks so user input can't inject extra headers
  const subject = subjectTemplate.replace("{name}", conferenceName).replace(/[\r\n]+/g, " ");

  const rows = [
    ["סטטוס", status],
    ["שם מלא", data.name],
    ["חברה / תפקיד", data.company || "—"],
    ["טלפון", data.phone],
    ["מעוניין/ת בעדכונים", data.consent ? "כן" : "לא"],
    ["נשלח בתאריך", new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })]
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<body style="margin:0;padding:24px;background:#f7f7f7;font-family:Arial,sans-serif;direction:rtl;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e3e4ea;">
    <tr><td style="padding:24px 28px 8px;font-size:20px;font-weight:bold;color:#000;text-align:right;">${escapeHtml(subject)}</td></tr>
    <tr><td style="padding:8px 28px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:15px;color:#111;">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#555a66;width:40%;text-align:right;">${escapeHtml(k)}</td>` +
              `<td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:bold;text-align:right;">${escapeHtml(v)}</td></tr>`
          )
          .join("\n        ")}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

async function sendRsvpEmail(data) {
  const content = loadContent(); // re-read so edits to content.js apply without a restart
  const recipients = (content.rsvp.notify && content.rsvp.notify.recipients) || [];
  if (!recipients.length) throw new Error("rsvp.notify.recipients in js/content.js is empty");

  const { subject, text, html } = buildRsvpEmail(data, content);
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER || "rsvp@localhost",
    to: recipients.join(", "),
    subject,
    text,
    html
  });

  if (DRY_RUN) {
    const msg = JSON.parse(info.message);
    console.log("[dry-run] email not sent (no SMTP_HOST). Would send:");
    console.log(`  to: ${recipients.join(", ")}\n  subject: ${msg.subject}\n  ${text.replace(/\n/g, "\n  ")}`);
  } else {
    console.log(`[rsvp] email sent to ${recipients.join(", ")} (${info.messageId})`);
  }
}

/* ---------- Validation ---------- */

function validateRsvp(body) {
  const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const data = {
    attending: body.attending === true,
    name: str(body.name, 100),
    company: str(body.company, 150),
    phone: str(body.phone, 30),
    consent: body.consent === true
  };
  const digits = data.phone.replace(/\D/g, "");
  if (data.name.length < 2) return { error: "name" };
  if (digits.length < 9 || digits.length > 12) return { error: "phone" };
  return { data };
}

// Simple per-IP limit so the endpoint can't be used to flood the inbox
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

/* ---------- HTTP ---------- */

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

async function handleRsvp(req, res) {
  if (rateLimited(req.socket.remoteAddress)) return sendJson(res, 429, { ok: false, error: "rate_limited" });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: "bad_request" });
  }

  const { data, error } = validateRsvp(body || {});
  if (error) return sendJson(res, 400, { ok: false, error });

  try {
    await sendRsvpEmail(data);
    sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error("[rsvp] failed to send email:", err.message);
    sendJson(res, 500, { ok: false, error: "send_failed" });
  }
}

// Only these paths are public — keeps .env, server.js, node_modules etc. private
const PUBLIC = ["/index.html", "/css/", "/js/", "/assets/"];
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

function serveStatic(req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400);
    return res.end("Bad request");
  }
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.normalize(path.join(ROOT, urlPath));
  const isPublic = PUBLIC.some((p) => urlPath === p || (p.endsWith("/") && urlPath.startsWith(p)));
  if (!isPublic || !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(404);
    return res.end("Not found");
  }

  fs.readFile(filePath, (err, buf) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/rsvp") {
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return handleRsvp(req, res);
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    return res.end();
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Landing page running at http://localhost:${PORT}`);
  if (DRY_RUN) console.log("SMTP_HOST not set — RSVP emails will be printed here instead of sent (dry-run).");
});
