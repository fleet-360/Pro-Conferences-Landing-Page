// Serves the landing page and emails RSVP submissions.
//
//   npm start            → http://localhost:5510
//
// SMTP settings come from .env (see .env.example). Without SMTP_HOST the server runs in
// dry-run mode: emails are printed to the console instead of being sent.
// On Vercel, files in public/ are served directly by Vercel; this server only handles /api/rsvp.
// Each RSVP submission:
//   1. emails the details to public/js/content.js → rsvp.notify.recipients
//   2. emails a confirmation to the attendee (only if they're attending)
//   3. POSTs the data to the Make scenario at MAKE_WEBHOOK_URL (.env)

const fs = require("fs");
const http = require("http");
const path = require("path");
const nodemailer = require("nodemailer");
const { loadContent } = require("./lib/load-content");
const { buildRsvpEmail, buildConfirmationEmail } = require("./lib/emails");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
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

const FROM = () => process.env.MAIL_FROM || process.env.SMTP_USER || "rsvp@localhost";

async function sendMail(message) {
  const info = await transporter.sendMail({ from: FROM(), ...message });
  if (DRY_RUN) {
    console.log(`[dry-run] email not sent (no SMTP_HOST). Would send:\n  to: ${message.to}\n  subject: ${message.subject}\n  ${message.text.replace(/\n/g, "\n  ")}`);
  } else {
    console.log(`[mail] sent "${message.subject}" to ${message.to} (${info.messageId})`);
  }
}

// 1) Internal notification to rsvp.notify.recipients — every submission
async function sendNotification(data, content) {
  const recipients = (content.rsvp.notify && content.rsvp.notify.recipients) || [];
  if (!recipients.length) throw new Error("rsvp.notify.recipients in public/js/content.js is empty");
  await sendMail({ to: recipients.join(", "), ...buildRsvpEmail(data, content) });
}

// 2) Confirmation to the attendee — only when they confirmed attendance
async function sendConfirmation(data, content) {
  if (!data.attending) return "skipped";
  if (!content.rsvp.confirmation) throw new Error("rsvp.confirmation in public/js/content.js is missing");
  await sendMail({ to: data.email, ...buildConfirmationEmail(data, content) });
}

// 3) Make scenario webhook — every submission
async function sendToMake(data, content) {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) {
    console.warn("[make] MAKE_WEBHOOK_URL not set — skipping webhook");
    return "skipped";
  }
  const payload = {
    status: data.attending ? content.rsvp.attendingYes : content.rsvp.attendingNo,
    full_name: data.name,
    company_job: data.company,
    phone: data.phone,
    email: data.email,
    get_updates: data.consent,
    date: data.submittedAt.toISOString(),
    conference_name: content.hero.title
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`Make webhook responded ${res.status}`);
  console.log(`[make] webhook accepted (${res.status})`);
}

/* ---------- Validation ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateRsvp(body) {
  const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const data = {
    attending: body.attending === true,
    name: str(body.name, 100),
    company: str(body.company, 150),
    phone: str(body.phone, 30),
    email: str(body.email, 200),
    consent: body.consent === true,
    submittedAt: new Date()
  };
  const digits = data.phone.replace(/\D/g, "");
  if (data.name.length < 2) return { error: "name" };
  if (!EMAIL_RE.test(data.email)) return { error: "email" };
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

  let content;
  try {
    content = loadContent(); // re-read so edits to content.js apply without a restart
  } catch (err) {
    console.error("[rsvp] failed to load content:", err.message);
    return sendJson(res, 500, { ok: false, error: "server_error" });
  }

  const [notification, confirmation, make] = await Promise.allSettled([
    sendNotification(data, content),
    sendConfirmation(data, content),
    sendToMake(data, content)
  ]);
  if (notification.status === "rejected") console.error("[rsvp] notification email failed:", notification.reason.message);
  if (confirmation.status === "rejected") console.error("[rsvp] confirmation email failed:", confirmation.reason.message);
  if (make.status === "rejected") console.error("[rsvp] Make webhook failed:", make.reason.message);

  // The RSVP counts as received if it reached the team by email or reached Make
  const recorded =
    notification.status === "fulfilled" || (make.status === "fulfilled" && make.value !== "skipped");
  if (!recorded) return sendJson(res, 500, { ok: false, error: "send_failed" });
  sendJson(res, 200, { ok: true });
}

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

  // Only files inside public/ are served — keeps .env, server.js, node_modules etc. private
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
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
