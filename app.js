/* =========================================================
   Mosaic — landing page interactions
   All demo data below is illustrative. When the real agent
   is ready, swap the scripted conversations for API calls.
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

  /* ---------- Nav border on scroll ---------- */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Floating mosaic tiles ---------- */
  const COLORS = ["--lime", "--coral", "--violet", "--sky", "--amber", "--pink"];
  function scatterTiles(container, count) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const t = document.createElement("span");
      const size = 18 + Math.random() * 60;
      t.className = "bg-tile";
      t.style.cssText = `
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;top:${Math.random() * 100}%;
        --c:var(${COLORS[i % COLORS.length]});
        --o:${(0.05 + Math.random() * 0.12).toFixed(2)};
        --dx:${(Math.random() * 40 - 20).toFixed(0)}px;
        --dy:${(Math.random() * 40 - 20).toFixed(0)}px;
        --r:${(Math.random() * 20 - 10).toFixed(0)}deg;
        animation-delay:${(Math.random() * 1.2).toFixed(2)}s, 0s;
        animation-duration:1.2s, ${10 + Math.random() * 10}s;
      `;
      container.appendChild(t);
    }
  }
  scatterTiles($(".hero__tiles"), 22);
  scatterTiles($(".cta__tiles"), 28);

  /* ---------- Reveal on scroll + count-up ---------- */
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const dur = reduceMotion ? 0 : 1400;
    const tick = (now) => {
      const p = dur ? Math.min((now - start) / dur, 1) : 1;
      el.textContent = inr(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        $$("[data-count]", e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Chat helpers ---------- */
  function addMsg(container, html, who) {
    const m = document.createElement("div");
    m.className = `msg msg--${who}`;
    m.innerHTML = html;
    container.appendChild(m);
    return m;
  }
  function addTyping(container) {
    const t = document.createElement("div");
    t.className = "msg msg--bot typing";
    t.innerHTML = "<i></i><i></i><i></i>";
    container.appendChild(t);
    return t;
  }
  function trim(container, max) {
    while (container.children.length > max) container.firstElementChild.remove();
  }
  function bars(rows) {
    return (
      '<div class="mini-bars">' +
      rows
        .map(
          ([label, amt, pct, color]) =>
            `<div class="mini-bar"><span>${label}</span><div class="mini-bar__track"><div class="mini-bar__fill" style="--c:var(${color})" data-w="${pct}%"></div></div><span>${amt}</span></div>`
        )
        .join("") +
      "</div>"
    );
  }
  const fillBars = (el) =>
    requestAnimationFrame(() => $$(".mini-bar__fill", el).forEach((b) => (b.style.width = b.dataset.w)));

  /* ---------- Hero phone: looping conversation ---------- */
  const heroScript = [
    {
      q: "Where did my money go this month?",
      a:
        "You spent <b>₹59,437</b> in September — <b>18% more</b> than August. The jump is mostly food delivery and one Amazon order." +
        bars([
          ["Rent", "₹28,000", 100, "--coral"],
          ["Food", "₹11,240", 40, "--violet"],
          ["Shopping", "₹8,960", 32, "--sky"],
          ["Travel", "₹5,410", 19, "--lime"],
        ]),
    },
    {
      q: "How much on Swiggy + Zomato?",
      a: "<b>₹7,812</b> across 23 orders — about ₹340 each. Most were after 10pm on weekdays 🌙",
    },
    {
      q: "Can I still afford Goa in December?",
      a: "Yes. At your current pace you'll have <b>₹46,200</b> spare by Dec 15. Trimming late-night orders by half adds another <b>₹3,900</b>.",
    },
  ];

  const heroChat = $("#heroChat");
  const heroTyping = $("#heroTyping");

  async function typeInto(el, text) {
    el.style.color = "var(--text)";
    el.textContent = "";
    for (const ch of text) {
      el.textContent += ch;
      await sleep(28);
    }
  }

  async function runHero() {
    while (true) {
      heroChat.innerHTML = "";
      for (const turn of heroScript) {
        await typeInto(heroTyping, turn.q);
        await sleep(350);
        heroTyping.textContent = "Ask anything about your money…";
        heroTyping.style.color = "";
        addMsg(heroChat, turn.q, "user");
        trim(heroChat, 5);
        await sleep(450);
        const t = addTyping(heroChat);
        await sleep(1100);
        t.remove();
        const m = addMsg(heroChat, turn.a, "bot");
        fillBars(m);
        trim(heroChat, 5);
        await sleep(2800);
      }
      await sleep(1500);
      if (reduceMotion) break;
    }
  }
  runHero();

  /* ---------- Agent demo: pick a question ---------- */
  const demos = [
    {
      q: "Where did my money go?",
      trace: ["Read 312 transactions across 6 accounts", "Merged 14 duplicate UPI ↔ card entries", "Compared against your 6-month average"],
      a:
        "September spend was <b>₹59,437</b>. Three things stand out:" +
        `<div class="answer-card">
          <div class="answer-card__row"><span>Food delivery</span><span class="up">+₹3,120 vs avg</span></div>
          <div class="answer-card__row"><span>Amazon (one order)</span><span class="up">+₹6,499</span></div>
          <div class="answer-card__row"><span>Fuel</span><span class="down">−₹1,240 vs avg</span></div>
        </div>`,
    },
    {
      q: "Can I afford a ₹40,000 trip in December?",
      trace: ["Projected income & fixed bills to Dec 15", "Checked upcoming credit card dues", "Kept your ₹50k emergency buffer untouched"],
      a:
        "<b>Yes — comfortably.</b> You'll have about <b>₹46,200</b> discretionary by mid-December." +
        `<div class="answer-card">
          <div class="answer-card__row"><span>Projected surplus</span><span>₹46,200</span></div>
          <div class="answer-card__row"><span>Trip budget</span><span>−₹40,000</span></div>
          <div class="answer-card__row"><span>Left over</span><span class="down">₹6,200</span></div>
        </div>`,
    },
    {
      q: "Find wasted spend",
      trace: ["Detected 9 recurring payments", "Matched usage signals where available", "Flagged price changes in the last 90 days"],
      a:
        "I found <b>₹1,847/month</b> you could probably cut:" +
        `<div class="answer-card">
          <div class="answer-card__row"><span>Netflix Premium (2 views in 60 days)</span><span>₹649</span></div>
          <div class="answer-card__row"><span>Gym (no check-ins since July)</span><span>₹999</span></div>
          <div class="answer-card__row"><span>Duplicate iCloud plan</span><span>₹199</span></div>
        </div>`,
    },
    {
      q: "Am I saving enough?",
      trace: ["Calculated savings rate for last 6 months", "Benchmarked against your stated goal (25%)", "Modelled 3 small adjustments"],
      a:
        "You're saving <b>19%</b> of income — close to your 25% goal. Here's how to bridge the gap:" +
        bars([
          ["Current", "19%", 76, "--violet"],
          ["Goal", "25%", 100, "--lime"],
        ]) +
        `<div class="answer-card">
          <div class="answer-card__row"><span>Auto-sweep ₹5k on payday</span><span class="down">+4.2%</span></div>
          <div class="answer-card__row"><span>Cancel unused subscriptions</span><span class="down">+1.5%</span></div>
        </div>`,
    },
  ];

  const demoBody = $("#demoBody");
  let demoRun = 0;

  async function playDemo(i) {
    const run = ++demoRun;
    const d = demos[i];
    demoBody.innerHTML = "";
    addMsg(demoBody, d.q, "user");
    await sleep(400);
    if (run !== demoRun) return;

    const trace = document.createElement("div");
    trace.className = "steps-trace";
    demoBody.appendChild(trace);
    for (const step of d.trace) {
      await sleep(450);
      if (run !== demoRun) return;
      const s = document.createElement("div");
      s.textContent = step;
      trace.appendChild(s);
    }
    await sleep(500);
    if (run !== demoRun) return;
    const m = addMsg(demoBody, d.a, "bot");
    fillBars(m);
  }

  $$(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      $$(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      playDemo(Number(chip.dataset.q));
    })
  );

  // Start the demo the first time it scrolls into view.
  const demoIO = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      playDemo(0);
      demoIO.disconnect();
    }
  }, { threshold: 0.3 });
  demoIO.observe(demoBody);

  /* ---------- Waitlist ---------- */
  // Paste your Google Apps Script web app URL here (see backend/README.md).
  const WAITLIST_ENDPOINT = "";

  const toast = $("#toast");
  const showToast = (msg, isError = false) => {
    toast.textContent = msg;
    toast.classList.toggle("toast--error", isError);
    toast.classList.add("is-on");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-on"), 4000);
  };

  async function joinWaitlist(email, company, source) {
    if (!WAITLIST_ENDPOINT) throw new Error("The waitlist isn't connected yet. Please try again later.");
    // text/plain keeps this a "simple" request, so Apps Script doesn't need a CORS preflight.
    const res = await fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ email, company, source }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    return data;
  }

  $$("[data-waitlist]").forEach((form) =>
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const button = form.querySelector('button[type="submit"]');
      const label = button.textContent;
      button.disabled = true;
      button.textContent = "Joining…";
      try {
        const data = await joinWaitlist(
          input.value.trim(),
          form.querySelector('[name="company"]').value,
          form.dataset.waitlist || "site"
        );
        form.reset();
        showToast(data.duplicate ? "You're already on the list ✦" : "You're on the list ✦ Check your inbox.");
      } catch (err) {
        showToast(err.message, true);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    })
  );
})();
