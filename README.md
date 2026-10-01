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
```

## Building on it

- **Brand tokens:** colours and fonts live in `:root` at the top of `styles.css`.
- **Agent demo:** `heroScript` and `demos` in `app.js` hold scripted conversations. Swap them for calls to the real agent API when it exists.
- **Waitlist:** the form only saves to `localStorage` right now. Look for the `TODO` in `app.js` and point it at a real backend.
- **Copy & numbers:** every figure on the page is illustrative sample data.
