// Email templates for RSVP submissions.
const path = require("path");

const FONT = "'Heebo', Arial, Helvetica, sans-serif";
const PRIMARY = "#4458f1";
const PRIMARY_2 = "#6a33c5";
const BG = "#f7f7f7";
const LOGO_PATH = path.join(__dirname, "..", "public", "assets", "images", "MAIN-LOGO.png");
const LOGO_CID = "pro-algorithm-logo";

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

// Keep user input from adding header lines
function oneLine(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

function fill(template, values) {
  return String(template || "").replace(/\{(\w+)\}/g, (m, key) => (key in values ? values[key] : m));
}

// Event place/date/time come from content.details (matched by key)
function eventInfo(content) {
  const byKey = {};
  (content.details || []).forEach((d) => {
    if (d.key) byKey[d.key] = d.value;
  });
  return {
    title: content.hero.title,
    place: byKey.place || "",
    date: byKey.date || "",
    time: byKey.time || ""
  };
}

/* ---------- Internal notification (to rsvp.notify.recipients) ---------- */

function buildRsvpEmail(data, content) {
  const notify = content.rsvp.notify;
  const conferenceName = content.hero.title || "כנס Pro Algorithm";
  const status = data.attending ? content.rsvp.attendingYes : content.rsvp.attendingNo;
  const subjectTemplate = data.attending ? notify.subjectYes : notify.subjectNo;
  const subject = oneLine(subjectTemplate.replace("{name}", conferenceName));

  const rows = [
    ["סטטוס", status],
    ["שם מלא", data.name],
    ["אימייל", data.email],
    ["חברה / תפקיד", data.company || "—"],
    ["טלפון", data.phone],
    ["מעוניין/ת בעדכונים", data.consent ? "כן" : "לא"],
    ["נשלח בתאריך", data.submittedAt.toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })]
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

/* ---------- Confirmation (to the attendee, only when attending) ---------- */

function buildConfirmationEmail(data, content) {
  const T = content.rsvp.confirmation;
  const ev = eventInfo(content);
  const values = { name: data.name, title: ev.title, place: ev.place, date: ev.date, time: ev.time };
  // Escaped copy for HTML output
  const safe = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, escapeHtml(v)]));

  const subject = oneLine(fill(T.subject, values));

  const detailBox = (label, value) => `
                <td class="stack" width="33%" style="width:33%;padding:0 5px 10px;" valign="top">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e3e4ea;border-radius:10px;background:#ffffff;">
                    <tr><td align="center" style="padding:10px 8px 2px;font-family:${FONT};font-size:12px;line-height:16px;color:#8d909a;">${escapeHtml(label)}</td></tr>
                    <tr><td align="center" style="padding:0 8px 12px;font-family:${FONT};font-size:16px;line-height:22px;font-weight:700;color:${PRIMARY};">${escapeHtml(value)}</td></tr>
                  </table>
                </td>`;

  const contacts = (content.contact.items || [])
    .map(
      (c) =>
        `<a href="${escapeHtml(c.href)}" style="color:${PRIMARY};text-decoration:none;white-space:nowrap;" dir="ltr">${escapeHtml(c.value)}</a>`
    )
    .join(`<span style="color:#c5c7d0;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`);

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .stack { display: block !important; width: 100% !important; box-sizing: border-box; }
      .px { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BG};" dir="rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background:${BG};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" class="container" dir="rtl" style="width:560px;max-width:560px;">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <img src="cid:${LOGO_CID}" width="260" alt="Pro Algorithm" style="display:block;width:260px;max-width:80%;height:auto;border:0;margin:0 auto;">
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #ebebf2;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td height="6" bgcolor="${PRIMARY}" style="height:6px;line-height:6px;font-size:6px;background-color:${PRIMARY};background-image:linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_2} 100%);border-radius:16px 16px 0 0;">&nbsp;</td>
                </tr>
                <tr>
                  <td class="px" style="padding:32px 40px 8px;text-align:center;font-family:${FONT};font-size:24px;line-height:30px;font-weight:800;color:#000000;">
                    ${escapeHtml(fill(T.heading, values))}
                  </td>
                </tr>
                <tr>
                  <td class="px" style="padding:12px 40px 0;text-align:right;font-family:${FONT};font-size:16px;line-height:24px;font-weight:700;color:#111111;">
                    ${fill(escapeHtml(T.greeting), safe)}
                  </td>
                </tr>
                <tr>
                  <td class="px" style="padding:6px 40px 24px;text-align:right;font-family:${FONT};font-size:16px;line-height:25px;color:#111111;">
                    ${fill(escapeHtml(T.text), safe)}
                  </td>
                </tr>
                <tr>
                  <td class="px" style="padding:0 35px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl">
                      <tr>${detailBox(T.placeLabel, ev.place)}${detailBox(T.dateLabel, ev.date)}${detailBox(T.timeLabel, ev.time)}
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="px" style="padding:0 40px 30px;">
                    <div style="border-top:1px solid #e3e4ea;height:1px;line-height:1px;font-size:1px;">&nbsp;</div>
                    <p style="margin:18px 0 6px;text-align:center;font-family:${FONT};font-size:13px;line-height:19px;color:#555a66;">${escapeHtml(T.footer)}</p>
                    <p style="margin:0;text-align:center;font-family:${FONT};font-size:14px;line-height:22px;">${contacts}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    fill(T.heading, values),
    "",
    fill(T.greeting, values),
    fill(T.text, values),
    "",
    `${T.placeLabel}: ${ev.place}`,
    `${T.dateLabel}: ${ev.date}`,
    `${T.timeLabel}: ${ev.time}`,
    "",
    T.footer,
    ...(content.contact.items || []).map((c) => `${c.label}: ${c.value}`)
  ].join("\n");

  return {
    subject,
    text,
    html,
    attachments: [{ filename: "pro-algorithm.png", path: LOGO_PATH, cid: LOGO_CID }]
  };
}

module.exports = { buildRsvpEmail, buildConfirmationEmail, eventInfo };
