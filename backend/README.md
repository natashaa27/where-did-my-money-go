# Waitlist backend (Google Apps Script)

Free, serverless, and runs on your own Google account. Each signup:

1. is saved to a Google Sheet,
2. gets a branded "You're on the list" confirmation email,
3. sends **you** a "new signup" email.

## One-time setup (~5 minutes)

1. Go to <https://sheets.new> and create a sheet (e.g. "Mosaic Waitlist").
2. In the sheet: **Extensions → Apps Script**.
3. Delete the placeholder code, paste in the contents of [`waitlist.gs`](./waitlist.gs), and click **Save**.
4. Click **Deploy → New deployment** → gear icon → **Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   - Click **Deploy** and **Authorize access** (choose your account → *Advanced* → *Go to project (unsafe)* → *Allow*; this warning is normal for your own unpublished scripts).
5. Copy the **Web app URL** (ends in `/exec`). Opening it in a browser should show `{"ok":true,"service":"mosaic-waitlist"}`.
6. Paste that URL into `WAITLIST_ENDPOINT` near the bottom of [`app.js`](../app.js), commit and push. GitHub Pages redeploys automatically.

Emails are sent from your Google account with the display name "Mosaic".

## Changing the script later

After editing the code in Apps Script, use **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.
This keeps the same URL. (Making a *new deployment* gives you a new URL.)

## Limits & notes

- Free Gmail accounts can send ~100 emails/day from Apps Script (each signup uses 2 with owner notifications on).
  Set `NOTIFY_OWNER = false` in the script to halve that. When the quota runs out the form shows a friendly "try again tomorrow" message.
- Duplicate signups are detected and not emailed again.
- A hidden "honeypot" field silently drops most bot submissions.
