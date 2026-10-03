/* =========================================================
   Mosaic wireframes — Home → Mosaic chat flow
   Routes: #home (default) and #chat, so each screen is linkable
   and the browser Back button closes the chat.
   Replies are scripted placeholders, not a real agent.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

  const screen = $(".device__screen");
  const chat = $("#chat");
  const home = $("#home");
  const fab = $("#openMosaic");
  const body = $("#chatBody");
  const input = $("#composerInput");
  const steps = $$("#flowSteps li");

  /* ---------- Flow step indicator (left-hand notes) ---------- */
  function setStep(name) {
    const order = steps.map((s) => s.dataset.step);
    const idx = order.indexOf(name);
    steps.forEach((s, i) => {
      s.classList.toggle("is-current", i === idx);
      s.classList.toggle("is-done", i < idx);
    });
  }

  /* ---------- Open / close ---------- */
  function setOrigin() {
    // Grow the chat out of the Mosaic tile's position.
    const a = fab.getBoundingClientRect();
    const b = screen.getBoundingClientRect();
    chat.style.setProperty("--ox", `${a.left - b.left + a.width / 2}px`);
    chat.style.setProperty("--oy", `${a.top - b.top + a.height / 2}px`);
  }

  function openChat() {
    setOrigin();
    chat.classList.add("is-open");
    chat.setAttribute("aria-hidden", "false");
    home.setAttribute("aria-hidden", "true");
    setStep(body.querySelector(".msg") ? "answer" : "chat");
    setTimeout(() => input.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }

  function closeChat() {
    setOrigin();
    chat.classList.remove("is-open");
    chat.setAttribute("aria-hidden", "true");
    home.setAttribute("aria-hidden", "false");
    setStep("home");
    fab.focus({ preventScroll: true });
  }

  const route = () => (location.hash === "#chat" ? openChat() : closeChat());
  const go = (name) => {
    if (location.hash !== "#" + name) location.hash = name;
    else route();
  };

  // When the chat was opened from home in this visit, the back arrow uses real
  // history.back() so the browser history stays tidy.
  let openedFromHome = false;
  fab.addEventListener("click", () => {
    openedFromHome = true;
    go("chat");
  });
  $("#closeMosaic").addEventListener("click", () => {
    if (openedFromHome) history.back();
    else go("home");
    openedFromHome = false;
  });
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chat.classList.contains("is-open")) go("home");
  });
  window.addEventListener("hashchange", route);

  /* ---------- Chat (scripted placeholder replies) ---------- */
  const bars = (rows) =>
    '<div class="mini-bars">' +
    rows
      .map(
        ([label, amt, pct, c]) =>
          `<div class="mini-bar"><span>${label}</span><div class="mini-bar__track"><div class="mini-bar__fill" style="--c:var(${c})" data-w="${pct}%"></div></div><span>${amt}</span></div>`
      )
      .join("") +
    "</div>";
  const rows = (items) =>
    '<div class="rows">' + items.map(([l, r, cls = ""]) => `<div><span>${l}</span><span class="${cls}">${r}</span></div>`).join("") + "</div>";

  // Checked in order: specific questions first, the general "where did it go" last.
  const replies = [
    {
      match: /afford|trip|travel|goa|buy/i,
      html:
        "<b>Yes, comfortably.</b> You'll have about <b>₹46,200</b> spare by mid-December." +
        rows([["Projected surplus", "₹46,200"], ["Trip budget", "−₹40,000"], ["Left over", "₹6,200", "down"]]),
    },
    {
      match: /wast|subscri|cut|cancel/i,
      html:
        "I found <b>₹1,847/month</b> you could probably cut:" +
        rows([["Netflix Premium (2 views in 60 days)", "₹649"], ["Gym (no check-ins since July)", "₹999"], ["Duplicate iCloud plan", "₹199"]]),
    },
    {
      match: /sav|goal|enough|invest/i,
      html:
        "You're saving <b>19%</b> of income, close to your 25% goal." +
        bars([
          ["Current", "19%", 76, "--violet"],
          ["Goal", "25%", 100, "--lime"],
        ]) +
        rows([["Auto-sweep ₹5k on payday", "+4.2%", "down"]]),
    },
    {
      match: /where|go|spend|spent|month/i,
      html:
        "You spent <b>₹59,437</b> in September, <b>18% more</b> than August. Mostly food delivery and one Amazon order." +
        bars([
          ["Rent", "₹28,000", 100, "--coral"],
          ["Food", "₹11,240", 40, "--violet"],
          ["Shopping", "₹8,960", 32, "--sky"],
          ["Travel", "₹5,410", 19, "--lime"],
        ]),
    },
  ];
  const fallback =
    "Good question. In the full version I'll answer this from your real transactions. For now, try one of the suggestions below.";

  let busy = false;
  async function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    setStep("answer");
    add(text, "user");
    await sleep(350);
    const t = add("<i></i><i></i><i></i>", "bot typing");
    await sleep(900);
    t.remove();
    const reply = replies.find((r) => r.match.test(text));
    const m = add(reply ? reply.html : fallback, "bot");
    requestAnimationFrame(() => $$(".mini-bar__fill", m).forEach((b) => (b.style.width = b.dataset.w)));
    busy = false;
  }

  function add(html, who) {
    const el = document.createElement("div");
    el.className = "msg " + who.split(" ").map((w) => (w === "typing" ? w : "msg--" + w)).join(" ");
    if (who === "user") el.textContent = html;
    else el.innerHTML = html;
    body.appendChild(el);
    body.scrollTo({ top: body.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    return el;
  }

  $$(".chip").forEach((c) => c.addEventListener("click", () => ask(c.textContent)));
  $("#composer").addEventListener("submit", (e) => {
    e.preventDefault();
    ask(input.value);
    input.value = "";
  });

  route();
})();
