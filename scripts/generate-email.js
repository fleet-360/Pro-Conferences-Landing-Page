#!/usr/bin/env node
// Generates an email-ready HTML invite from public/js/content.js — same content and look as the
// landing page, but built with tables and inline styles so it renders in email clients.
//
//   npm run email                                   → email/invite-email.html
//   npm run email -- --url https://example.com      → override site.url
//   npm run email -- --out some/other/file.html     → custom output path
//
// Images are referenced by absolute URL (site.url + path), so the landing page must be
// deployed at site.url for the images and links in the email to work.

const fs = require("fs");
const path = require("path");
const { loadContent } = require("../lib/load-content");

const ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const PLACEHOLDER_MARKER = "your-landing-page-url";

/* ---------- CLI ---------- */

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url") args.url = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return args;
}

/* ---------- Helpers ---------- */

const FONT = "'Heebo', Arial, Helvetica, sans-serif";
const PRIMARY = "#4458f1";
const PRIMARY_2 = "#6a33c5";
const BG = "#f7f7f7";

// Email-safe PNGs matching the landing page's inline SVG contact icons
const CONTACT_ICONS = {
  phone: "assets/email/icon-phone.png",
  email: "assets/email/icon-email.png",
  web: "assets/email/icon-web.png"
};

function esc(value) {
  return String(value == null ? "" : value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function makeUrl(base) {
  const root = base.replace(/\/+$/, "");
  return (p) => (/^(https?:|mailto:|tel:)/.test(p) ? p : `${root}/${p.replace(/^\/+/, "")}`);
}

// Agenda banner assets derived from the landing page banners (public/assets/images/point-N.jpeg)
function agendaAssets(image) {
  const base = path.basename(image).replace(/\.[^.]+$/, "");
  return { bg: `assets/email/${base}-bg.jpg`, num: `assets/email/${base}-num.jpg` };
}

function timestamp() {
  const now = new Date();
  const local = now.toLocaleString("sv-SE", { timeZone: "Asia/Jerusalem" }).slice(0, 16);
  return `${local} (Asia/Jerusalem) / ${now.toISOString()}`;
}

/* ---------- Sections ---------- */

function header(C, url) {
  const site = url("");
  return `
          <!-- Header: corner decorations + logo -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="ltr">
                <tr>
                  <td width="100" valign="top" style="width:100px;padding:0;line-height:0;">
                    <img src="${url(C.decorations.topLeft)}" width="100" alt="" style="display:block;width:100px;height:auto;border:0;">
                  </td>
                  <td valign="middle" align="center" style="padding:20px 10px 0;">
                    <a href="${esc(site)}" target="_blank" style="text-decoration:none;">
                      <img src="${url(C.hero.logo.src)}" width="360" alt="${esc(C.hero.logo.alt)}" class="logo" style="display:block;width:360px;max-width:100%;height:auto;border:0;margin:0 auto;">
                    </a>
                  </td>
                  <td width="80" valign="top" style="width:80px;padding:0;line-height:0;">
                    <img src="${url(C.decorations.topRight)}" width="80" alt="" style="display:block;width:80px;height:auto;border:0;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function hero(C) {
  return `
          <!-- Title + subtitle -->
          <tr>
            <td align="center" style="padding:16px 40px 0;font-family:${FONT};font-size:22px;line-height:28px;font-weight:700;color:#000000;text-align:center;">
              ${esc(C.hero.title)}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 50px 0;font-family:${FONT};font-size:17px;line-height:24px;font-weight:400;color:#000000;text-align:center;" class="px">
              ${esc(C.hero.subtitle)}
            </td>
          </tr>`;
}

function details(C, url) {
  const cells = C.details
    .map(
      (d) => `
                  <td width="33%" valign="top" align="center" class="stack" style="width:33%;padding:0 6px 16px;text-align:center;">
                    <img src="${url(d.icon)}" height="72" alt="" style="display:block;height:72px;width:auto;border:0;margin:0 auto 12px;">
                    <div style="font-family:${FONT};font-size:16px;line-height:20px;font-weight:400;color:#000000;">
                      <strong style="font-weight:700;">${esc(d.label)}</strong> ${esc(d.value)}
                    </div>
                  </td>`
    )
    .join("");
  return `
          <!-- Event details (RTL: location, time, date) -->
          <tr>
            <td style="padding:32px 24px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl">
                <tr>${cells}
                </tr>
              </table>
            </td>
          </tr>`;
}

function agenda(C, url) {
  const rows = C.agenda.items
    .map((item) => {
      const a = agendaAssets(item.image);
      return `
          <tr>
            <td style="padding:0 0 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="box-shadow:0 6px 12px rgba(90,80,160,0.12);">
                <tr>
                  <td width="120" valign="middle" bgcolor="#ffffff" style="width:120px;padding:0;line-height:0;background:#ffffff;">
                    <img src="${url(a.num)}" width="120" height="80" alt="" style="display:block;width:120px;height:80px;border:0;">
                  </td>
                  <td valign="middle" bgcolor="#e4e3f8" background="${url(a.bg)}"
                      style="height:80px;padding:12px 16px 12px 24px;background-color:#e4e3f8;background-image:url('${url(a.bg)}');background-repeat:no-repeat;background-position:right center;background-size:cover;text-align:right;">
                    <div style="font-family:${FONT};font-size:17px;line-height:22px;font-weight:700;color:#000000;">${esc(item.title)}</div>
                    <div style="font-family:${FONT};font-size:14px;line-height:19px;font-weight:300;color:#000000;padding-top:4px;">${esc(item.text)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
    })
    .join("");
  return `
          <!-- Agenda -->
          <tr>
            <td align="center" style="padding:28px 24px 18px;font-family:${FONT};font-size:21px;line-height:26px;font-weight:700;color:#000000;text-align:center;">
              ${esc(C.agenda.title)}
            </td>
          </tr>${rows}`;
}

function speakers(C, url) {
  return C.speakers
    .map((s) => {
      const photo = `
                  <td width="170" valign="top" class="stack" style="width:170px;padding:0;">
                    <img src="${url(s.image)}" width="170" alt="${esc(s.name)}" style="display:block;width:170px;max-width:100%;height:auto;border:0;margin:0 auto;">
                  </td>`;
      const paragraphs = (s.paragraphs || [])
        .map(
          (p) =>
            `<p style="margin:0 0 8px;font-family:${FONT};font-size:14px;line-height:20px;font-weight:400;color:#111111;">${esc(p)}</p>`
        )
        .join("\n                    ");
      const info = `
                  <td valign="top" class="stack" style="padding:18px 16px 0;text-align:right;">
                    <div style="font-family:${FONT};font-size:19px;line-height:24px;font-weight:700;color:#000000;">${esc(s.name)}</div>
                    ${s.role ? `<div style="font-family:${FONT};font-size:17px;line-height:22px;font-weight:700;color:#000000;">${esc(s.role)}</div>` : ""}
                    ${s.talkTitle ? `<div style="font-family:${FONT};font-size:16px;line-height:21px;font-weight:600;color:#111111;padding:8px 0 6px;">${esc(s.talkTitle)}</div>` : ""}
                    ${paragraphs}
                  </td>`;
      // dir="rtl": the first cell is on the right
      const cells = s.imageSide === "left" ? info + photo : photo + info;
      return `
          <!-- Speaker: ${esc(s.name)} -->
          <tr>
            <td style="padding:28px 20px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl">
                <tr>${cells}
                </tr>
              </table>
            </td>
          </tr>`;
    })
    .join("");
}

function rsvpCard(C, url) {
  const E = C.emailInvite;
  const rsvpLink = url("") + (E.buttonAnchor || "");

  const infoBox = (label, value) => `
                        <td width="50%" style="width:50%;padding:0 6px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e3e4ea;border-radius:10px;background:#ffffff;">
                            <tr><td align="center" style="padding:10px 8px 2px;font-family:${FONT};font-size:12px;line-height:16px;color:#8d909a;">${esc(label)}</td></tr>
                            <tr><td align="center" style="padding:0 8px 10px;font-family:${FONT};font-size:18px;line-height:24px;font-weight:700;color:${PRIMARY};">${esc(value)}</td></tr>
                          </table>
                        </td>`;

  const contacts = C.contact.items
    .map(
      (c) => `
                        <td width="33%" valign="top" class="stack" style="width:33%;padding:0 5px 10px;">
                          <a href="${esc(url(c.href))}" target="_blank" style="text-decoration:none;color:#000000;display:block;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e3e4ea;border-radius:12px;background:#ffffff;">
                              <tr><td align="center" style="padding:14px 6px 6px;">
                                <img src="${url(CONTACT_ICONS[c.icon] || CONTACT_ICONS.web)}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;border:0;margin:0 auto;">
                              </td></tr>
                              <tr><td align="center" style="padding:2px 6px 0;font-family:${FONT};font-size:14px;line-height:18px;font-weight:700;color:#000000;">${esc(c.label)}</td></tr>
                              <tr><td align="center" dir="ltr" style="padding:2px 6px 14px;font-family:${FONT};font-size:13px;line-height:18px;color:#4a4d56;">${esc(c.value)}</td></tr>
                            </table>
                          </a>
                        </td>`
    )
    .join("");

  return `
          <!-- RSVP + contact card -->
          <tr>
            <td align="center" style="padding:40px 24px 16px;font-family:${FONT};font-size:21px;line-height:26px;font-weight:700;color:#000000;text-align:center;">
              ${esc(C.rsvp.sectionTitle)}
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 40px;" class="px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="background:#ffffff;border-radius:16px;border:1px solid #ebebf2;">
                <tr>
                  <td style="padding:30px 30px 34px;" class="px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td align="center" style="font-family:${FONT};font-size:22px;line-height:28px;font-weight:800;color:#000000;">${esc(C.rsvp.title)}</td></tr>
                      <tr><td align="center" style="padding:10px 20px 0;font-family:${FONT};font-size:13px;line-height:20px;color:#555a66;">${esc(E.rsvpText)}</td></tr>
                      <tr>
                        <td align="center" style="padding:20px 0 0;">
                          <table role="presentation" width="260" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="width:260px;">
                            <tr>${infoBox(E.dateLabel, E.dateValue)}${infoBox(E.timeLabel, E.timeValue)}
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:22px 0 0;">
                          <!-- Button (solid fallback colour for Outlook, gradient elsewhere) -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" bgcolor="${PRIMARY}" style="border-radius:10px;background-color:${PRIMARY};background-image:linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_2} 100%);">
                                <a href="${esc(rsvpLink)}" target="_blank"
                                   style="display:inline-block;padding:14px 56px;font-family:${FONT};font-size:17px;line-height:22px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                                  ${esc(E.button)} &larr;
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="padding:30px 0 0;"><div style="border-top:1px solid #e3e4ea;height:1px;line-height:1px;font-size:1px;">&nbsp;</div></td></tr>
                      <tr><td align="center" style="padding:24px 0 0;font-family:${FONT};font-size:20px;line-height:26px;font-weight:800;color:#000000;">${esc(C.contact.title)}</td></tr>
                      <tr><td align="center" style="padding:8px 10px 18px;font-family:${FONT};font-size:13px;line-height:19px;color:#555a66;">${esc(C.contact.subtitle)}</td></tr>
                      <tr>
                        <td>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl">
                            <tr>${contacts}
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

/* ---------- Document ---------- */

function buildEmail(C, siteUrl) {
  const url = makeUrl(siteUrl);
  const E = C.emailInvite;

  return `<!DOCTYPE html>
<!-- Generated by scripts/generate-email.js on ${timestamp()} -->
<!-- Source: public/js/content.js | Site URL: ${esc(siteUrl)} -->
<!-- Copy everything in this file into your email tool as HTML. -->
<html lang="he" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(E.subject)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; background: ${BG}; }
    table { border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; }
    a { color: inherit; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .stack { display: block !important; width: 100% !important; box-sizing: border-box; }
      .px { padding-left: 16px !important; padding-right: 16px !important; }
      .logo { width: 220px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BG};" dir="rtl">
  <!-- Preheader (inbox preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BG};opacity:0;">
    ${esc(E.preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background:${BG};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container" dir="rtl" style="width:600px;max-width:600px;background:${BG};">${header(C, url)}${hero(C)}${details(C, url)}${agenda(C, url)}${speakers(C, url)}${rsvpCard(C, url)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/* ---------- Main ---------- */

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: npm run email -- [--url <landing page url>] [--out <file>]");
    return;
  }

  const C = loadContent();
  if (!C.emailInvite) throw new Error("public/js/content.js is missing the emailInvite section");

  const siteUrl = args.url || (C.site && C.site.url) || "";
  if (!/^https?:\/\//.test(siteUrl)) {
    throw new Error(`Invalid site URL "${siteUrl}". Set site.url in public/js/content.js or pass --url https://...`);
  }
  if (siteUrl.includes(PLACEHOLDER_MARKER)) {
    console.warn(
      `WARNING: site.url is still the placeholder (${siteUrl}).\n` +
        "         Images and links in the email will not work until you set the real landing page URL."
    );
  }

  // Warn about referenced local assets that don't exist (they'd be broken images in the email)
  const localAssets = [
    C.decorations.topLeft,
    C.decorations.topRight,
    C.hero.logo.src,
    ...C.details.map((d) => d.icon),
    ...C.agenda.items.flatMap((i) => Object.values(agendaAssets(i.image))),
    ...C.speakers.map((s) => s.image),
    ...C.contact.items.map((c) => CONTACT_ICONS[c.icon] || CONTACT_ICONS.web)
  ];
  const missing = localAssets.filter((p) => !fs.existsSync(path.join(PUBLIC_DIR, p)));
  if (missing.length) console.warn("WARNING: missing image files:\n  " + missing.join("\n  "));

  const outPath = path.resolve(ROOT, args.out || "email/invite-email.html");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buildEmail(C, siteUrl), "utf8");
  console.log(`Email HTML written to ${path.relative(ROOT, outPath) || outPath}`);
}

try {
  main();
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
