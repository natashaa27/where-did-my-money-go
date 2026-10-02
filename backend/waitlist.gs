/**
 * Mosaic waitlist backend — Google Apps Script web app.
 *
 * What it does on each signup:
 *   1. Saves the email to the "Waitlist" sheet of the spreadsheet this script is bound to.
 *   2. Emails the subscriber a confirmation.
 *   3. Emails you (the script owner) a "new signup" notification.
 *
 * Setup: see backend/README.md.
 */

const SHEET_NAME = "Waitlist";
const FROM_NAME = "Mosaic";
const NOTIFY_OWNER = true; // set to false to stop the "new signup" emails to yourself

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  let data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (_) {
    return json({ ok: false, error: "Invalid request." });
  }

  // Honeypot: real visitors never fill this hidden field, bots usually do.
  if (data.company) return json({ ok: true });

  const email = String(data.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "Please enter a valid email address." });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const existing = sheet.getLastRow() > 1
      ? sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().flat()
      : [];

    // Already signed up: don't email them again.
    if (existing.indexOf(email) !== -1) {
      return json({ ok: true, duplicate: true });
    }

    // Each email sent counts against the Apps Script daily quota (100/day on free accounts).
    const needed = NOTIFY_OWNER ? 2 : 1;
    if (MailApp.getRemainingDailyQuota() < needed) {
      return json({ ok: false, error: "We're getting a lot of signups — please try again tomorrow." });
    }

    sheet.appendRow([new Date(), email, String(data.source || "").slice(0, 40), sheet.getLastRow()]);

    MailApp.sendEmail({
      to: email,
      subject: "You're on the Mosaic waitlist ✦",
      name: FROM_NAME,
      htmlBody: confirmationHtml(),
      body:
        "Thanks for joining the Mosaic waitlist!\n\n" +
        "Mosaic connects all your bank accounts, cards and UPI apps and gives you an AI agent " +
        "you can ask anything about your money. We'll email you as soon as your early access is ready.\n\n" +
        "— Team Mosaic",
    });

    if (NOTIFY_OWNER) {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: "New Mosaic waitlist signup: " + email,
        name: FROM_NAME,
        body: email + " just joined the waitlist.\nTotal signups: " + (sheet.getLastRow() - 1) +
          "\n\nSheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
      });
    }

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "Something went wrong. Please try again." });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the web app URL in a browser shows this — handy to check the deployment works.
function doGet() {
  return json({ ok: true, service: "mosaic-waitlist" });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Joined at", "Email", "Source", "Position"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function confirmationHtml() {
  const tile = (c) => `<td style="width:14px;height:14px;background:${c};border-radius:3px"></td>`;
  return `
  <div style="background:#0b0b0d;padding:40px 16px;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#17171c;border:1px solid #2a2a31;border-radius:22px;padding:36px;color:#f4f4f1">
      <table cellspacing="2" cellpadding="0" style="margin-bottom:28px"><tr>${tile("#c6f432")}${tile("#ff7a59")}</tr><tr>${tile("#9b8cff")}${tile("#5cc8ff")}</tr></table>
      <h1 style="margin:0 0 14px;font-size:28px;line-height:1.15;letter-spacing:-0.02em">You're on the list.</h1>
      <p style="margin:0 0 16px;color:#b4b4bc;font-size:15px;line-height:1.6">
        Thanks for joining the <strong style="color:#f4f4f1">Mosaic</strong> waitlist. Mosaic pieces together every bank account,
        card and UPI app you use — and gives you an AI agent you can simply ask, <em>“where did my money go?”</em>
      </p>
      <p style="margin:0 0 28px;color:#b4b4bc;font-size:15px;line-height:1.6">
        We'll email you the moment your early access is ready. Waitlist members get founding-member pricing.
      </p>
      <div style="display:inline-block;background:#c6f432;color:#0b0b0d;font-weight:600;font-size:14px;padding:12px 20px;border-radius:999px">See you soon ✦</div>
      <p style="margin:32px 0 0;color:#6b6b74;font-size:12px">You're receiving this because this address was entered on the Mosaic waitlist. If that wasn't you, just ignore this email.</p>
    </div>
  </div>`;
}
