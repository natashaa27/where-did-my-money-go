# Mosaic — Where did my money go?

Landing page for **Mosaic**, a financial intelligence agent. Mosaic connects every bank account, card and UPI app (via India's Account Aggregator network), turns them into one clean timeline, and lets you ask questions about your money in plain language.

The design takes its base from personal-finance aggregator apps like [Fold](https://fold.money/) (dark UI, phone mockups, account-unification story) and adds a conversational agent layer in the spirit of ChatGPT-style money assistants.

## Run it

It's plain HTML/CSS/JS, so there's no build step.

```bash
# any static server works
python3 -m http.server 8080
# then open http://localhost:8080
```

## Structure

```
index.html        page markup (hero, features bento, agent demo, how it works, security, FAQ, CTA)
styles.css        design tokens (:root) + all styles
app.js            animations, scripted chat demos, waitlist form
assets/           favicon
backend/          waitlist backend (Google Apps Script) + setup guide
```

## Building on it

- **Brand tokens:** colours and fonts live in `:root` at the top of `styles.css`.
- **Agent demo:** `heroScript` and `demos` in `app.js` hold scripted conversations. Swap them for calls to the real agent API when it exists.
- **Waitlist:** signups are sent through [FormSubmit](https://formsubmit.co). Each signup produces one "You're on the Mosaic waitlist" email that goes to you and is CC'd to the subscriber (FormSubmit's `_autoresponse` never reached subscribers). Visitors pass FormSubmit's quick "I'm not a robot" page and are sent back to the site. After activating, replace your email in `WAITLIST_ENDPOINT` (`app.js`) with the random alias FormSubmit sends, so your address isn't public. A Google Apps Script backend (saves to a Sheet, branded email) is also supported: see [`backend/README.md`](backend/README.md).
- **Copy & numbers:** every figure on the page is illustrative sample data.

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main` or `claude/nifty-cannon-62ohkg`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Live at: https://natashaa27.github.io/where-did-my-money-go/
