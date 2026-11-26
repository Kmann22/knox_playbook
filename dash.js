{
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nf = new Intl.NumberFormat("en-GB");
const k = x => x == null ? "–" : x >= 1e6 ? (x / 1e6).toFixed(1) + "m" : x >= 1e4 ? Math.round(x / 1e3) + "k" : x >= 1e3 ? (x / 1e3).toFixed(1) + "k" : String(Math.round(x));
const pc = (x, d = 0) => x == null ? "–" : (x * 100).toFixed(d) + "%";
const lift = l => l == null ? "–" : (l >= 1 ? "+" : "−") + Math.abs(Math.round((l - 1) * 100)) + "%";
const sgn = p => p == null ? "–" : (p >= 0 ? "+" : "−") + Math.abs(Math.round(p)) + "%";
const APPX = "https://claude.ai/artifact/Fidci4kRP3EcZmAF2YDqDT";
let R, B, Q, V; const S = {}; const CB = {};
const probe = document.createElement("i"); probe.style.display = "none"; document.body.appendChild(probe);
const col = v => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };

const PAGES = [["home", "Home"], ["why", "Why he wins"], ["works", "Works vs flops"], ["learn", "Lessons"], ["compare", "Compare"], ["change", "Over time"], ["explore", "Explore"], ["method", "Method"]];
$("nav").innerHTML = PAGES.slice(1).map(([id, l]) => `<button data-go="${id}">${l}</button>`).join("");
const ICON = {
  bolt: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
  down: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 4v16M5 13l7 7 7-7"/></svg>',
  up: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 20V4M5 11l7-7 7 7"/></svg>',
  mic: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M3 10v4h3l6 5V5L6 10zm13-2a6 6 0 0 1 0 8l-1.4-1.4a4 4 0 0 0 0-5.2z"/></svg>',
  link: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  star: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/></svg>',
  caps: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20 9 4h2l6 16h-3l-1.5-4h-5L6 20zm5.3-7h3.4L10 8.3z"/></svg>'
};

/* ---------- routing ---------- */
let cur = "home"; const drawn = {};
function go(id, push = true) {
  if (!PAGES.find(p => p[0] === id)) id = "home"; cur = id;
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("on", p.id === "p-" + id));
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.go === id));
  if (push && location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
  if (R && !drawn[id] && RENDER[id]) { drawn[id] = true; RENDER[id](); }
  if (R && LIVE[id]) requestAnimationFrame(LIVE[id]);
}
document.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) { e.preventDefault(); go(b.dataset.go); } });
const step = d => { const i = PAGES.findIndex(p => p[0] === cur); go(PAGES[(i + d + PAGES.length) % PAGES.length][0]); };
$("prev").onclick = () => step(-1); $("next").onclick = () => step(1);
addEventListener("keydown", e => { if (e.target.closest("input,select,textarea") || !$("modal").hidden) return; if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
addEventListener("hashchange", () => go(location.hash.slice(1) || "home", false));
document.querySelectorAll(".seg[data-k]").forEach(seg => { const key = seg.dataset.k; S[key] = seg.querySelector(".on")?.dataset.v;
  seg.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; seg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); S[key] = b.dataset.v; (CB[key] || []).forEach(f => f()); }); });
const on = (key, f) => (CB[key] = CB[key] || []).push(f);

/* ---------- helpers ---------- */
const dna = (era, l) => R.dna.find(x => x.era === era && x.label === l) || {};
const LQ = () => Object.fromEntries((R.label_quality?.per_label || []).map(x => [x.label, x.new_f1]));
const okL = l => (LQ()[l] ?? 1) >= 0.5;   // hide categories our accuracy check could not confirm
const adj = x => x.label === "Endorsements" || x.kind !== "topic" ? x.lift : (x.lift_xe ?? x.lift);   // topics measured without endorsement templates
const reg = (era, t) => R.regression[era].terms.find(x => x.term === t) || {};
const fmt = R0 => Object.fromEntries(R0.truth_format_rp.map(x => [x.kind, x]));
const post = (p, plat, extra = "") => `<div class="post ${plat === "Twitter" ? "tw" : "ts"}"><p>${esc(p.text)}</p><small>${esc(p.date)} · ${plat === "Twitter" ? "Twitter (now X)" : plat}${p.rp != null ? ` · ${p.rp}× his usual` : ""}${p.likes != null ? ` · ${nf.format(p.likes)} likes` : ""}${extra}</small></div>`;
function plainBars(el, rows, hi) {
  const mx = Math.max(...rows.map(r => r.v));
  el.innerHTML = rows.map(r => `<button class="bar" data-w="${esc(r.who || r.l)}"><span>${esc(r.l)}</span><span class="t"><i class="gw" style="left:0;--w:${r.v / mx * 100}%;background:var(${r.l === hi ? "--or" : r.base ? "--ink" : "--sl"});opacity:${r.l === hi || r.base ? 1 : .55}"></i></span><span class="n">${r.txt}</span></button>`).join("");
  animate(el, ".bar");
}
const kpis = (el, arr, cols) => { el.innerHTML = arr.map(([v, l, c]) => `<div class="kpi"><div class="v ${c || ""}">${v}</div><div class="l">${l}</div></div>`).join(""); if (cols) el.style.gridTemplateColumns = cols; };

function divBars(el, rows, { sel, click, pair, era } = {}) {
  const vals = rows.filter(r => !r.sep).flatMap(r => [r.v, r.v2].filter(x => x != null));
  const mx = Math.max(.3, Math.ceil(Math.max(...vals.map(v => Math.abs(v - 1))) * 10) / 10);
  const X = v => 50 + (v - 1) / mx * 50;
  const cA = "var(--tw)", cB = "var(--ts)", one = era === "Twitter" ? cA : cB, oneT = era === "Twitter" ? "var(--twt)" : cB;
  const row = r => {
    if (pair) { const a = X(r.v), b = X(r.v2), lo = Math.min(a, b), hi = Math.max(a, b);
      return `<button class="bar dp${r.l === sel ? " sel" : ""}" data-l="${esc(r.l)}"><span class="lb">${esc(r.name || r.l)}</span><span class="tr"><span class="z"></span><i class="cn" style="--l:${lo}%;--w:${hi - lo}%"></i><b class="d a" style="--x:${a}%;background:${cA}"></b><b class="d b" style="--x:${b}%;background:${cB}"></b></span><span class="vals"><em style="color:var(--twt)">${r.txt || lift(r.v)}</em><em style="color:${cB}">${r.txt2 || lift(r.v2)}</em></span></button>`; }
    const a = X(r.v);
    return `<button class="bar dp${r.l === sel ? " sel" : ""}" data-l="${esc(r.l)}"><span class="lb">${esc(r.name || r.l)}</span><span class="tr"><span class="z"></span><i class="stem" style="--l:${Math.min(a, 50)}%;--w:${Math.abs(a - 50)}%;background:${one}"></i><b class="d big" style="--x:${a}%;background:${one}"></b></span><span class="vals one"><em style="color:${oneT}">${r.txt || lift(r.v)}</em></span></button>`; };
  const tick = v => `<span style="left:${X(v)}%">${v === 1 ? "0" : lift(v)}</span>`;
  const vals2 = rows.filter(r => !r.sep);
  el.innerHTML = rows.map(r => r.sep ? `<div class="dp sep"><span class="lb">${esc(r.sep)}</span><span class="tr"></span><span></span></div>` : row(r)).join("") + `<div class="dp axis"><span class="lb"></span><span class="tr ticks">${tick(1 - mx)}${tick(1)}${tick(1 + mx)}</span><span></span></div><div class="dp axis cap"><span class="lb"></span><span class="tr"><span class="l">← does worse than his usual</span><span class="r">does better →</span></span><span></span></div>`;
  if (click) el.onclick = e => { const b = e.target.closest(".bar"); if (b) click(b.dataset.l); };
  animate(el, ".dp");
}
const animate = (el, sel) => requestAnimationFrame(() => requestAnimationFrame(() => el.querySelectorAll(sel).forEach((r, i) => { r.style.setProperty("--dl", Math.min(i, 14) * 45 + "ms"); r.classList.add("go"); })));

/* ---------- hover card ---------- */
const tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip);
let tipFor = null;
function tipHTML(label, eras) {
  const blocks = eras.map(era => {
    if (label === "__link" || label === "__media") { const g = reg(era, label === "__link" ? "has_link" : "Media");
      return `<div class="tb"><div class="th"><span class="dot" style="background:var(${era === "Twitter" ? "--tw" : "--ts"})"></span>${era === "Twitter" ? "Twitter (now X)" : "Truth Social"}</div><div class="tv">${sgn(g.pct)}</div><div class="k">After allowing for topic, tone, length and timing. Likely range ${g.lo}% to ${g.hi}%.</div></div>`; }
    const x = dna(era, label); if (!x.n) return `<div class="tb"><div class="th">${era}</div><div class="k">Too few posts.</div></div>`;
    const g = reg(era, label), ex = R.label_examples[era]?.[label];
    return `<div class="tb"><div class="th"><span class="dot" style="background:var(${era === "Twitter" ? "--tw" : "--ts"})"></span>${era === "Twitter" ? "Twitter (now X) Oct 2015–21" : "Truth Social 2022–26"}</div>
      <div class="tv" style="color:var(${adj(x) >= 1 ? "--or" : "--sl"})">${lift(adj(x))}</div>
      <div class="tg"><span><b>${nf.format(x.n)}</b> posts</span><span><b>${pc(x.share, 1)}</b> of his posts</span><span>typical post <b>${x.med_rp}×</b> his usual (others ${x.base}×)</span><span>likely range <b>${x.ci?.[0]}–${x.ci?.[1]}×</b></span>${g.pct != null ? `<span>after other factors <b>${sgn(g.pct)}</b></span>` : ""}</div>
      ${ex ? `<div class="tp">“${esc(ex.top[0].text.slice(0, 130))}${ex.top[0].text.length > 130 ? "…" : ""}”<small>Best: ${esc(ex.top[0].date)} · ${ex.top[0].rp}× his usual</small></div>` : ""}</div>`; });
  const d = DESC[label] || "";
  return `<div class="tt">${esc(label === "__link" ? "Includes a web link" : label === "__media" ? "Media-bashing" : label)}</div>${d ? `<div class="k tdesc" style="margin-bottom:6px">${esc(d)}</div>` : ""}<div class="tbs">${blocks.join("")}</div>`;
}
const DESC = { "__link": "A web address in the post: a link to a news article, a video (YouTube, Rumble) or a website. Link-only posts are just the address with no words of his own.", "__media": "Posts attacking news outlets: fake news, CNN, NYT, ratings, reporters.",  "Attack / insult": "Words like loser, weak, corrupt, crooked, disgrace, lunatic.", "Grievance / victimhood": "Witch hunt, hoax, rigged, persecution, lawfare.", "Threat / warning": "Warnings and consequences: “will pay a big price”, “held accountable”.", "Nickname": "Crooked Hillary, Sleepy Joe, Shifty Schiff, Birdbrain…", "Fear / danger": "Dangerous, destroy, disaster, chaos, invasion.", "Foreign policy": "China, Russia, Ukraine, Iran, Israel, NATO, war and peace.", "Religion": "God, faith, prayer, Christians, church.", "Specifics / numbers": "Posts with real numbers: %, $, millions, billions.", "Endorsements": "Copy-paste “Complete and Total Endorsement” posts for candidates.", "Call to action": "Vote, watch, tune in, join, donate.", "Nationalism / patriotism": "MAGA, America First, our country, patriots.", "Us vs them": "Radical left, the swamp, deep state, the Democrats.", "Boast / superlative": "Record, historic, never before, #1.", "Praise / gratitude": "Thank you, congratulations, great job.", "Military & veterans": "Troops, veterans, military, armed forces.", "Legal & investigations": "Courts, judges, indictments, prosecutors, impeachment.", "Media": "Fake news, CNN, NYT, ratings, reporters.", "Elections": "Voting, ballots, polls, campaigns, rallies.", "Economy & trade": "Jobs, tariffs, inflation, stock market, taxes.", "Immigration & border": "Border, wall, illegal aliens, deportation.", "Personal & brand": "Golf, family, interviews, Trump properties.", "Crime & law and order": "Crime, police, gangs, cartels, riots." };
function bindTip(el, getEras) {
  const show = (b, x, y) => { const l = b.dataset.l; tip.innerHTML = tipHTML(l, getEras()); tip.classList.add("on"); tipFor = b; place(x, y); };
  const place = (x, y) => { const w = tip.offsetWidth, h = tip.offsetHeight; let L = x + 18, T = y - h - 14; if (L + w > innerWidth - 10) L = x - w - 18; if (T < 64) T = y + 20; if (T + h > innerHeight - 10) T = innerHeight - h - 10; tip.style.left = Math.max(10, L) + "px"; tip.style.top = T + "px"; };
  el.addEventListener("mousemove", e => { const b = e.target.closest(".bar"); if (!b) { tip.classList.remove("on"); tipFor = null; return; } if (b !== tipFor) show(b, e.clientX, e.clientY); else place(e.clientX, e.clientY); });
  el.addEventListener("mouseleave", () => { tip.classList.remove("on"); tipFor = null; });
  el.addEventListener("focusin", e => { const b = e.target.closest(".bar"); if (b) { const r = b.getBoundingClientRect(); show(b, r.right - 60, r.top); } });
  el.addEventListener("focusout", () => tip.classList.remove("on"));
}
addEventListener("scroll", () => tip.classList.remove("on"), true);

/* ---------- HOME ---------- */
let phTimer = null;
function home() {
  const T = R.totals, f = fmt(R), att = dna("Truth Social", "Attack / insult"), end = dna("Truth Social", "Endorsements");
  const bm = Object.fromEntries(B.people.map(p => [p.who, p])), others = B.people.filter(p => p.who !== "Donald Trump" && !p.who.startsWith("Congress"));
  const tw20 = R.overview.find(o => o.period.startsWith("2017")), ts25 = R.overview.find(o => o.period.startsWith("2025"));
  $("homeSub").textContent = `${T.years} years · ${nf.format(T.posts)} posts · Twitter (2009–Jan 2021, before it became X) and Truth Social (2022–26). Each post is scored against how his posts usually did at the time. Pick a question.`;
  const QS = [["why", "Q1", "What makes him do so well?", `Attacks <b>${lift(att.lift)}</b> vs his other posts`],
    ["works", "Q2", "What works with his base, and what flops?", `Endorsement posts <b>${lift(end.lift)}</b>`],
    ["learn", "Q3", "What can other politicians learn?", `<b>6 moves</b> + 4 voter groups`],
    ["compare", "Q4", "How does he compare with other politicians?", `<b>${pc(bm["Donald Trump"].excl)}</b> use "!" vs ≤${pc(Math.max(...others.map(p => p.excl)))}`],
    ["change", "+", "How has it changed since 2009?", `Typical likes <b>${k(tw20.med_likes)}</b> → <b>${k(ts25.med_likes)}</b>`],
    ["explore", "+", "Explore the posts yourself", "Search 59k posts · ask the AI", "dark"]];
  const ICON_R = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>`;
  const card = ([id, n, q, s, c]) => `<button class="q ${c || ""}" data-go="${id}"><span class="qh"><i class="av">${n === "+" ? "+" : n}</i><span><b>${n === "+" ? (id === "explore" ? "Try it" : "Bonus") : "Question " + n.slice(1)}</b> · Knox insight</span><span class="go">→</span></span><span class="tq">${q}</span><span class="st">${s}</span><span class="qf"><span>${ICON_R}Tap to open</span></span></button>`;
  $("qsL").innerHTML = [QS[0], QS[2], QS[4]].map(card).join(""); $("qsR").innerHTML = [QS[1], QS[3], QS[5]].map(card).join("");
  const star = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-14 4-4 14-4 6 2 9 13 0 6-9 13-6 2-14-4-4-4z" fill="${c}"/>`;
  const pills = [[`${ICON.bolt} Attacks ${lift(att.lift)}`, 17, 30, "why"], [`${ICON.mic} Own words ×${(f.original.med_rp / f.link_only.med_rp).toFixed(1)} vs link-only posts`, 82, 20, "works"], [`${ICON.caps} ALL CAPS ${sgn(reg("Truth Social", "caps_ratio").pct)}`, 13, 60, "why"], [`${ICON.down} Copy-paste posts ${lift(end.lift)}`, 85, 58, "works"], [`${ICON.star} Faith ${lift(dna("Truth Social", "Religion").lift)}`, 80, 84, "works"]];
  $("heroVis").innerHTML = `<svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <defs><clipPath id="sun"><circle cx="300" cy="580" r="260"/></clipPath></defs>
    <circle cx="300" cy="580" r="260" fill="#ffffff"/>
    <g clip-path="url(#sun)">${Array.from({ length: 13 }, (_, i) => i % 2 ? "" : `<rect x="30" y="${(320 + i * 280 / 13).toFixed(1)}" width="540" height="${(280 / 13 + .4).toFixed(1)}" fill="#b31942"/>`).join("")}
      <rect x="30" y="310" width="250" height="${(10 + 7 * 280 / 13).toFixed(1)}" fill="#0a3161"/>${Array.from({ length: 20 }, (_, i) => star(62 + (i % 5) * 46 + (Math.floor(i / 5) % 2) * 23, 336 + Math.floor(i / 5) * 32, .55, "#fff")).join("")}</g>
    <circle cx="300" cy="580" r="260" fill="none" stroke="#0a3161" stroke-width="3"/>
    <g class="tw1">${star(80, 150, 1, "#b31942")}${star(530, 170, .7, "#0a3161")}${star(480, 70, 1, "#b31942")}${star(110, 260, .7, "#0a3161")}</g>
    <g stroke="#b31942" stroke-width="5" stroke-linecap="round" fill="none"><path d="M448 106l22-26M462 120l32-12M440 92l2-30"/></g><g stroke="#0a3161" stroke-width="5" stroke-linecap="round" fill="none"><path d="M118 360l-34 10M124 380l-28 28"/></g>
  </svg>
  <div class="phone" id="phone"><div class="scr"><div class="notch"></div>
    <div class="ph-top"><i></i><span><b>Donald J. Trump</b><small id="phPlat"></small></span></div>
    <div class="ph-badge" id="phBadge"></div>
    <p id="phText"></p>
    <div class="ph-meta"><span><svg viewBox="0 0 24 24" class="ico" fill="#b31942"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg><b id="phLikes"></b></span><span><svg viewBox="0 0 24 24" class="ico" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/></svg><b id="phShares"></b></span></div>
    <div class="ph-dots" id="phDots"></div></div></div>
  `;
  // rotating real posts
  const feed = [];
  for (let i = 0; i < 4; i++) ["Twitter", "Truth Social"].forEach(era => { const p = R.autopsy[era].top_absolute[i]; if (p) feed.push({ ...p, era }); });
  let ix = 0;
  const showPost = () => { const p = feed[ix % feed.length]; const ph = $("phone"); if (!ph) return;
    ph.classList.add("fade");
    setTimeout(() => { $("phText").textContent = p.text.length > 190 ? p.text.slice(0, 190) + "…" : p.text; $("phPlat").textContent = `${p.era === "Twitter" ? "Twitter (now X)" : "Truth Social"} · ${p.date}`;
      $("phBadge").textContent = `#${Math.floor(ix % feed.length / 2) + 1} most-liked on ${p.era === "Twitter" ? "Twitter" : "Truth Social"}`; $("phLikes").textContent = k(p.likes); $("phShares").textContent = k(p.shares);
      $("phDots").innerHTML = feed.map((_, j) => `<i class="${j === ix % feed.length ? "on" : ""}"></i>`).join(""); ph.classList.remove("fade"); }, 220); };
  showPost(); clearInterval(phTimer);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) phTimer = setInterval(() => { if (cur === "home") { ix++; showPost(); } }, 4200);
  $("phone").onclick = () => { ix++; showPost(); };
}


/* ---------- example viewer (modal) ---------- */
const TAGN = { top: "Best performing", typical: "Typical", bottom: "Weakest" };
let MX = { items: [], i: 0, last: null };
function exItems(label, eras) {
  const out = [], ord = label === "__link" ? ["typical", "bottom", "top"] : ["top", "typical", "bottom"], add = (set, era, note) => { if (!set) return; ord.forEach(k_ => (set[k_] || []).forEach(p => out.push({ ...p, era, tag: TAGN[k_], note }))); };
  const fx = R.format_examples || {};
  if (label === "__link") { add(fx.link_only_truth, "Truth Social", "Link-only post: nothing but a web address"); if (eras.includes("Truth Social")) add(fx.with_link_truth, "Truth Social", "Text plus a web link"); if (eras.includes("Twitter")) add(fx.with_link_twitter, "Twitter", "Text plus a web link"); add(fx.own_words_truth, "Truth Social", "For comparison: his own words, no link"); return out; }
  const key = label === "__media" ? "Media" : label;
  eras.forEach(era => add(R.label_examples[era]?.[key], era)); return out;
}
function openEx(label, eras, title) {
  const items = exItems(label, eras); if (!items.length) return;
  MX = { items, i: 0, last: document.activeElement, label };
  $("mTitle").textContent = title || (label === "__link" ? "Posts with web links" : label === "__media" ? "Media-bashing" : label);
  const ff = fmt(R); $("mDesc").textContent = label === "__link" ? `A web address in a post: a link to a news story, a video or a website. A typical link-only post (just the address, no words of his own) got ${ff.link_only.med_rp}× his usual likes. A typical post in his own words got ${ff.original.med_rp}×.` : (DESC[label] || ""); $("modal").hidden = false; document.body.classList.add("mopen"); showEx(); $("mClose").focus(); tip.classList.remove("on");
}
function openItems(title, desc, items) {
  MX = { items, i: 0, last: document.activeElement }; $("mTitle").textContent = title; $("mDesc").textContent = desc;
  $("modal").hidden = false; document.body.classList.add("mopen"); showEx(); $("mClose").focus();
}
function showEx() {
  const p = MX.items[MX.i], tw = p.era === "Twitter";
  if (p.handle !== undefined) {
    $("mPost").className = "mpost " + (p.who === "Donald Trump" ? "ts" : "tw");
    $("mPost").innerHTML = `<div class="mtags"><span class="tag" style="background:var(${p.who === "Donald Trump" ? "--or" : "--pill"})">${esc(p.who)}</span><span class="tag" style="background:var(--sl)">${esc(p.tag)}</span></div>
      <p class="mtext">${esc(p.text)}</p>${p.empty ? "" : `<div class="mmeta"><span>${esc(p.date)}</span><span>@${esc(p.handle)}</span><span>Twitter (now X)</span></div>`}`;
    $("mCount").textContent = `${MX.i + 1} / ${MX.items.length}`; $("mDots").innerHTML = MX.items.map((_, j2) => `<i class="${j2 === MX.i ? "on" : ""}"></i>`).join(""); return;
  }
  $("mPost").className = "mpost " + (tw ? "tw" : "ts");
  $("mPost").innerHTML = `<div class="mtags"><span class="tag" style="background:var(${tw ? "--tw" : "--ts"})">${tw ? "Twitter (now X)" : "Truth Social"}</span><span class="tag ${p.tag === "Weakest" ? "" : "o"}" style="${p.tag === "Weakest" ? "background:var(--sl)" : ""}">${p.tag}</span>${p.note ? `<span class="mnote">${esc(p.note)}</span>` : ""}</div>
    <p class="mtext">${esc(p.text)}</p>
    <div class="mmeta"><span>${esc(p.date)}</span><span><b>${p.rp}×</b> his usual likes</span><span><b>${nf.format(p.likes)}</b> likes</span></div>`;
  $("mCount").textContent = `${MX.i + 1} / ${MX.items.length}`;
  $("mDots").innerHTML = MX.items.map((_, j) => `<i class="${j === MX.i ? "on" : ""}"></i>`).join("");
}
const mStep = d => { MX.i = (MX.i + d + MX.items.length) % MX.items.length; showEx(); };
const closeEx = () => { $("modal").hidden = true; document.body.classList.remove("mopen"); MX.last && MX.last.focus && MX.last.focus(); };
$("mPrev").onclick = () => mStep(-1); $("mNext").onclick = () => mStep(1); $("mClose").onclick = closeEx;
$("modal").addEventListener("click", e => { if (e.target.id === "modal") closeEx(); });
addEventListener("keydown", e => { if ($("modal").hidden) return; if (e.key === "Escape") closeEx(); if (e.key === "ArrowRight") { mStep(1); e.stopImmediatePropagation(); } if (e.key === "ArrowLeft") { mStep(-1); e.stopImmediatePropagation(); } }, true);

/* ---------- WHY ---------- */
const BOTH_NOTE = '<span class="legend" style="margin-left:6px"><span><span class="dot" style="background:var(--tw)"></span>Twitter (now X)</span><span><span class="dot" style="background:var(--ts)"></span>Truth Social</span></span>';
function pairedRows(filterFn, n = 9) {
  const labels = [...new Set(R.dna.map(x => x.label))];
  return labels.map(l => { const a = dna("Twitter", l), b = dna("Truth Social", l); if (!a.n || !b.n || !okL(l)) return null; return { l, v: adj(a), v2: adj(b), avg: (adj(a) + adj(b)) / 2, ok: a.q < .05 && b.q < .05 && a.n >= 200 && b.n >= 200 }; }).filter(x => x && x.ok && filterFn(x));
}
let whySel = null;
function why() {
  const eras = () => S.whyEra === "Both" ? ["Twitter", "Truth Social"] : [S.whyEra];
  const show = () => { const l = whySel; if (!l) return;
    $("whyPost").innerHTML = `<div class="k tapnote">Tap any row to see its details here</div>${tipHTML(l, eras())}<button class="btn" id="whyBrowse" style="margin-top:auto;align-self:flex-start">Browse example posts →</button>`;
    $("whyBrowse").onclick = () => openEx(l, eras()); };
  const pickRow = l => { whySel = l; $("whyBars").querySelectorAll(".bar").forEach(b => b.classList.toggle("sel", b.dataset.l === l)); show(); };
  const draw = () => { const era = S.whyEra, f = fmt(R), events = R.news_cycle.filter(e => e.rp_before && e.rp_after), up = events.filter(e => e.rp_after > e.rp_before).length;
    if (era === "Both") {
      const rows = pairedRows(() => true).sort((a, b) => b.avg - a.avg); const pick = [...rows.slice(0, 6), ...rows.filter(x => x.avg < .99).slice(-3)];
      if (!pick.find(r => r.l === whySel)) whySel = pick[0].l;
      divBars($("whyBars"), pick, { pair: true, sel: whySel, click: pickRow }); $("whyLeg").innerHTML = BOTH_NOTE;
      const a = dna("Twitter", "Attack / insult"), b = dna("Truth Social", "Attack / insult");
      kpis($("whyK"), [[`<span style="font-size:.5em;white-space:nowrap"><span style="color:var(--twt)">${lift(a.lift)}</span> <span style="color:var(--mut)">/</span> <span style="color:var(--ts)">${lift(b.lift)}</span></span>`, "more likes for attack posts (Twitter / Truth Social)", "o"],
        [`<span style="font-size:.5em;white-space:nowrap"><span style="color:var(--twt)">${sgn(reg("Twitter", "has_link").pct)}</span> <span style="color:var(--mut)">/</span> <span style="color:var(--ts)">${sgn(reg("Truth Social", "has_link").pct)}</span></span>`, "fewer likes when a post includes a web link (article, video, website)", "s"],
        [`${up}/${events.length}`, "big news events after which his posts did better than the week before", "o"]]);
      const replic = pairedRows(x => (x.v - 1) * (x.v2 - 1) > 0).length, all = pairedRows(() => true).length;
      $("whyTake").textContent = `Same formula on both platforms (${replic} of ${all} post types work the same way): attacks, nicknames and grievance beat his usual posts.`;
      show(); return; }
    $("whyLeg").innerHTML = "";
    const rows = R.dna.filter(x => x.era === era && x.n >= 100 && x.q < .01 && okL(x.label)).map(x => ({ ...x, a: adj(x) })).sort((a, b) => b.a - a.a);
    const pick = [...rows.slice(0, 6), ...rows.filter(x => x.a < .99).slice(-3)].map(x => ({ l: x.label, v: x.a }));
    if (!pick.find(r => r.l === whySel)) whySel = pick[0].l;
    divBars($("whyBars"), pick, { era, sel: whySel, click: pickRow });
    kpis($("whyK"), [[lift(dna(era, "Attack / insult").lift), "more likes for attack posts than his other posts", "o"],
      [era === "Truth Social" ? `×${(f.original.med_rp / f.link_only.med_rp).toFixed(1)}` : sgn(reg(era, "has_link").pct), era === "Truth Social" ? "more likes for posts in his own words than for link-only posts (just a web address)" : "fewer likes when a post includes a web link", era === "Truth Social" ? "o" : "s"],
      [`${up}/${events.length}`, "big news events after which his posts did better than the week before", "o"]]);
    $("whyTake").textContent = era === "Truth Social" ? "Attacks, nicknames and grievance get his best results. His biggest hits are in his own words, at big news moments." : "On Twitter too, nicknames and attacks did better than usual. Self-promotion and 'go vote' or 'tune in' posts did worse.";
    show();
  };
  draw(); on("whyEra", draw);
}

/* ---------- WORKS ---------- */
let wkSel = "Attack / insult";
function works() {
  const getEras = () => S.wkEra === "Both" ? ["Twitter", "Truth Social"] : [S.wkEra];
  const side = () => { const eras = getEras();
    const btn = `<button class="btn" style="margin-top:auto;align-self:flex-start" id="wkBrowse">Browse example posts →</button>`;
    if (wkSel === "__link" || wkSel === "__media") { $("wkSide").innerHTML = tipHTML(wkSel, eras).replace('class="tt"', 'class="tt" style="font-size:20px"') + btn; $("wkBrowse").onclick = () => openEx(wkSel, eras); return; }
    const one = era => { const x = dna(era, wkSel), ex = R.label_examples[era]?.[wkSel]; if (!x.n) return "";
      return `<div style="margin-bottom:6px"><div class="th"><span class="dot" style="background:var(${era === "Twitter" ? "--tw" : "--ts"})"></span>${era === "Twitter" ? "Twitter (now X)" : "Truth Social"}</div><div class="kpi" style="border:0;padding:2px 0 4px"><div class="v ${adj(x) >= 1 ? "o" : "s"}" style="font-size:${eras.length > 1 ? "30px" : ""}">${lift(adj(x))}</div><div class="l">${nf.format(x.n)} posts · ${pc(x.share, 1)} of his posts</div></div>${ex ? post(ex.top[0], era) : ""}</div>`; };
    $("wkSide").innerHTML = `<h3>${esc(wkSel)}</h3><div class="k" style="margin-bottom:6px">${esc(DESC[wkSel] || "")}</div>${eras.map(one).join("")}${eras.length === 1 && R.label_examples[eras[0]]?.[wkSel] ? `<div class="k" style="font-weight:700;color:var(--ink);margin-top:6px">Typical</div>${post(R.label_examples[eras[0]][wkSel].typical[0], eras[0])}` : ""}${btn}`; $("wkBrowse").onclick = () => openEx(wkSel, eras); };
  const draw = () => { const era = S.wkEra; const ck = l => { wkSel = l; $("wkUp").querySelectorAll(".bar").forEach(b => b.classList.toggle("sel", b.dataset.l === l)); side(); };
    if (era === "Both") {
      const up = pairedRows(x => x.avg > 1.05).sort((a, b) => b.avg - a.avg).slice(0, 6);
      const dn = pairedRows(x => x.avg < .99).sort((a, b) => b.avg - a.avg).slice(-3);
      const r1 = reg("Twitter", "has_link").pct, r2_ = reg("Truth Social", "has_link").pct, m1 = reg("Twitter", "Media").pct, m2 = reg("Truth Social", "Media").pct;
      dn.unshift({ l: "__media", name: "Media-bashing", v: 1 + m1 / 100, v2: 1 + m2 / 100, txt: sgn(m1), txt2: sgn(m2) }, { l: "__link", name: "Includes a web link", v: 1 + r1 / 100, v2: 1 + r2_ / 100, txt: sgn(r1), txt2: sgn(r2_) });
      divBars($("wkUp"), [...up, { sep: "FLOPS ↓" }, ...dn], { sel: wkSel, click: ck, pair: true }); $("wkLeg").innerHTML = BOTH_NOTE;
      $("wkTake").textContent = "On both platforms, attacks and faith do well. Copy-paste endorsements, posts with web links and 'go vote' posts do badly. It's about him and his followers, not one platform.";
    } else {
      $("wkLeg").innerHTML = "";
      const ar = R.dna.filter(x => x.era === era && x.n >= 100 && okL(x.label)).map(x => ({ ...x, a: adj(x) }));
      const up = ar.filter(x => x.a > 1.05 && x.q < .01).sort((a, b) => b.a - a.a).slice(0, 6).map(x => ({ l: x.label, v: x.a }));
      const dn = ar.filter(x => x.a < .99 && x.q < .05).sort((a, b) => b.a - a.a).slice(-3).map(x => ({ l: x.label, v: x.a }));
      dn.unshift({ l: "__media", name: "Media-bashing", v: 1 + reg(era, "Media").pct / 100, txt: sgn(reg(era, "Media").pct) }, { l: "__link", name: "Includes a web link", v: 1 + reg(era, "has_link").pct / 100, txt: sgn(reg(era, "has_link").pct) });
      divBars($("wkUp"), [...up, { sep: "FLOPS ↓" }, ...dn], { sel: wkSel, click: ck, era });
      const end = dna(era, "Endorsements"), im = R.issue_attention.find(x => x.era === "Truth Social" && x.issue === "Immigration");
      $("wkTake").textContent = era === "Truth Social" ? `His copy-paste endorsement posts (${pc(end.share, 1)} of all posts) do ${lift(end.lift)} vs his usual. Leave them out and immigration posts go from ${lift(im.lift)} to ${lift(im.lift_xe)}. The issue works; the copy-paste format doesn't.` : `On Twitter, endorsements (${lift(end.lift)}), 'go vote' posts and self-promotion did worse. Nicknames and threats did better.`;
    }
    side(); };
  draw(); on("wkEra", draw);
}
/* ---------- LEARN ---------- */
function learn() {
  const f = fmt(R), att = dna("Truth Social", "Attack / insult"), end = dna("Truth Social", "Endorsements"), im = R.issue_attention.find(x => x.era === "Truth Social" && x.issue === "Immigration");
  const lw = R.lang["Truth Social"].words, sp = dna("Truth Social", "Specifics / numbers");
  const MOVES = [[`×${(f.original.med_rp / f.link_only.med_rp).toFixed(1)}`, "Write your own words, don't just share a link", `His own message: ${f.original.med_rp}× his usual likes. A post that was only a web link (a news story or video, no words of his own): ${f.link_only.med_rp}×.`, "Supplied data"],
    [lift(att.lift), "Give every post an opponent and a stake", "Attacks, nicknames and grievance get more likes from followers. Attacking the media itself doesn't.", "Supplied data"],
    [lift(end.lift), "Drop the copy-paste format", `Copy-paste endorsements are ${pc(end.share, 1)} of his posts and his weakest type. Group them together, or write each one fresh.`, "Supplied data", "s"],
    [lift(im.lift_xe), "Lead with what your voters rank top", `82% of his supporters rank immigration very important (Pew). His immigration posts beat his usual. Posts with real numbers: ${lift(sp.lift)}.`, "Pew 2024 + supplied data"],
    ["2%", "One platform is not a strategy", "Only about 2% of US adults regularly get news on Truth Social. Most people meet his posts second-hand: on the news, on X, through creators.", "Pew Social Media & News 2025"],
    [lift(lw.at(-1).med_rp / lw[0].med_rp), "Long beats short for the base", `His 100+ word posts scored ${lw.at(-1).med_rp}× vs ${lw[0].med_rp}× for 10 words or fewer. His loyal followers read long posts.`, "Supplied data", "", "dark"]];
  const GROUPS = [["51%", "The core: White non-college", "51% of his 2024 voters (63% in 2016). 79% identify as Christian.", `Faith posts ${lift(dna("Truth Social", "Religion").lift)}, grievance ${lift(dna("Truth Social", "Grievance / victimhood").lift)}.`, "Identity and loyalty posts fire up existing fans; they don't reach new people.", "Pew validated voters 2025"],
    ["48%", "Hispanic voters", "Up from 36% in 2020. Latino Trump supporters' top issues: economy 93%, crime 73%, immigration 71%.", `Economy posts ${lift(R.issue_attention.find(x => x.era === "Truth Social" && x.issue === "Economy").lift_xe)} leaving out copy-paste posts.`, "Cost of living and safety, said concretely.", "Pew 2024–25"],
    ["46%", "Men under 50", "He narrowly won men under 50 (Biden +10 in 2020). 46% of under-30s get election news mainly from social media.", "His own platform barely reaches them. Podcasts and creators do.", "Go where they are: long-form audio and video.", "Pew 2024–25"],
    ["54–42", "New and irregular voters", "2020 non-voters who voted in 2024 backed him 54–42. They were decisive.", `Plain 'go vote' posts do worse (${lift(dna("Twitter", "Call to action").lift)} on Twitter). Big news moments do better.`, "To get people out, tie the ask to a big moment and what's at stake.", "Pew turnout study 2025"]];
  const draw = () => {
    if (S.lnTab === "moves") { $("learnH").innerHTML = "Six lessons for <em>2026</em>.";
      const EXK = ["__link", "Attack / insult", "Endorsements", "Immigration & border", null, null];
      $("learnBody").innerHTML = `<div class="lgrid">${MOVES.map(([n, h, p, src, c, dark], i) => `<div class="lcard ${dark || ""}"><div class="num ${c || ""}">${n}</div><h3>${esc(h)}</h3><p>${esc(p)}</p><div class="src" style="display:flex;justify-content:space-between;gap:8px;align-items:center">${esc(src)}${EXK[i] ? `<button class="exb" data-ex="${esc(EXK[i])}">See examples →</button>` : ""}</div></div>`).join("")}</div>`;
      $("learnBody").querySelectorAll(".exb").forEach(b => b.onclick = () => openEx(b.dataset.ex, ["Twitter", "Truth Social"])); }
    else { $("learnH").innerHTML = "Who's in his coalition, and <em>what reaches them</em>.";
      $("learnBody").innerHTML = `<div class="lgrid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${GROUPS.map(([n, h, ext, own, les, src], i) => `<div class="lcard ${i === 3 ? "dark" : ""}"><div class="num">${n}</div><h3>${esc(h)}</h3><p><b>Surveys:</b> ${esc(ext)}</p><p><b>His data:</b> ${esc(own)}</p><p style="color:inherit;font-weight:700">→ ${esc(les)}</p><div class="src">${esc(src)}</div></div>`).join("")}</div>`; }
  };
  draw(); on("lnTab", draw);
}

/* ---------- COMPARE ---------- */
function compare() {
  const P = B.people, T = P.find(p => p.who === "Donald Trump"), C0 = P.find(p => p.who.startsWith("Congress")), others = P.filter(p => p !== T && p !== C0);
  const M = [["excl", "Exclamation marks", "Share of own tweets using “!”"], ["shout", "ALL CAPS", "Share with 2+ ALL-CAPS words"], ["link", "Links", "Share containing a link"], ["neg", "Negative tone", "Share with negative sentiment"], ["L:Attack / insult", "Attacks", "Share attacking or insulting"], ["L:Nickname", "Nicknames", "Share using a nickname"]];
  $("cmpSeg").innerHTML = M.map(([v, l], i) => `<button data-v="${v}" class="${i ? "" : "on"}">${l}</button>`).join("");
  let m = "excl"; const val = (p, m) => m.startsWith("L:") ? p.labels[m.slice(2)] : p[m];
  const draw = () => { const meta = M.find(x => x[0] === m); $("cmpTitle").textContent = meta[2];
    const rows = [...P].sort((a, b) => val(b, m) - val(a, m)).map(p => ({ l: p.who.startsWith("Congress") ? "Congress (random 3%)" : p.who, who: p.who, v: val(p, m), txt: pc(val(p, m)), base: p === C0 }));
    plainBars($("cmpBars"), rows, "Donald Trump"); };
  $("cmpBars").onclick = e => { const b = e.target.closest(".bar"); if (!b) return; const who = b.dataset.w, p = P.find(x => x.who === who), meta = M.find(x => x[0] === m);
    const nm = who.startsWith("Congress") ? "Random members of Congress" : who, ex = (B.examples?.[who]?.[m] || []);
    const items = ex.length ? ex.map(x => ({ ...x, who: nm, tag: meta[1] })) : [{ empty: true, text: `No tweets of this type in our sample for ${nm}.`, date: "", handle: "", who: nm, tag: meta[1] }];
    openItems(`${nm}: ${meta[1].toLowerCase()}`, `${pc(val(p, m))} of ${who.startsWith("Congress") ? "these members' own" : nm + "'s own"} tweets fit this measure (${nf.format(ex[0]?.n_match ?? 0)} of ${nf.format(p.n_own)} sampled). Twitter, Jun 2017 – Jan 2021. This archive has no likes, so these show style only.`, items); };
  $("cmpSeg").onclick = e => { const b = e.target.closest("button"); if (!b) return; $("cmpSeg").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); m = b.dataset.v; draw(); };
  draw();
  const moreNeg = others.filter(p => p.neg > T.neg).length;
  kpis($("cmpK"), [[`${pc(T.excl)} <span style="font-size:.5em;color:var(--mut)">vs ≤${pc(Math.max(...others.map(p => p.excl)))}</span>`, "of his tweets had an exclamation mark. Among 12 senior members of Congress, the highest was the second figure.", "o"],
    [`${pc(T.link)} <span style="font-size:.5em;color:var(--mut)">vs ${pc(C0.link)}</span>`, "included a link, against the Congress average. He writes; they share links.", "o"],
    [`${moreNeg} of ${others.length}`, "others posted a higher share of negative tweets, including Sanders, Warren and Harris", "s"]]);
  $("cmpTake").textContent = "What makes him different is style (energy, capitals, his own words), not negativity. This data has no likes, so it compares style only. Source: congresstweets archive.";
}

/* ---------- CHANGE (svg line) ---------- */
let chgDraw;
function change() {
  const ov = Object.fromEntries(R.overview.map(o => [o.period.slice(0, 4), o]));
  kpis($("chgK"), [[k(ov["2009"].med_likes), "typical likes per post, 2009–14: a celebrity account", ""], [k(ov["2017"].med_likes), "typical likes per post, 2017–20: as president on Twitter", "o"], [k(ov["2025"].med_likes), "typical likes per post, 2025–26: a smaller, loyal crowd on Truth Social", ""]]);
  const per = [...new Set(R.label_by_period.map(x => x.period))].sort().filter(p => !p.startsWith("2021"));
  const TOP = ["Elections", "Legal & investigations", "Media", "Economy & trade", "Immigration & border", "Foreign policy", "Personal & brand", "Crime & law and order", "Health & COVID"];
  const dv = R.device.devices;
  $("chgEra").innerHTML = `<h3>What he talked about most</h3><div style="display:grid;gap:7px;margin-top:6px">${per.map(p => { const t = R.label_by_period.filter(x => x.period === p && TOP.includes(x.label)).sort((a, b) => b.share - a.share).slice(0, 3);
    return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="width:62px;font-size:13px">${p.split(" ")[0]}</b>${t.map((x, i) => `<span class="tag ${i ? "" : "o"}" style="font-size:12px;padding:3px 9px">${esc(x.label)} ${pc(x.share)}</span>`).join("")}</div>`; }).join("")}</div>
    <div class="k devnote" style="margin-top:auto;padding-top:8px"><b style="color:var(--ink)">2015–17 device split:</b> Android posts (linked to Trump himself) were angrier (${pc(dv.Android.neg_share)} negative vs ${pc(dv.iPhone.neg_share)}), but both scored about the same (${dv.Android.med_rp}× vs ${dv.iPhone.med_rp}×).</div>`;
  $("chgTake").textContent = "The Twitter data stops when he was banned in Jan 2021. X let him back in Nov 2022, but Truth Social stayed his main platform: a smaller, loyal crowd, still about 18–23 posts a day.";
  chgDraw = () => { const box = $("chgFig"); const W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
    const ink = col("--ink"), mut = col("--mut"), line = col("--line"), tw = col("--tw"), ts = col("--ts"), or = col("--or"), nv = col("--navy");
    const m = R.monthly.filter(x => x.med_likes > 0 && x.posts >= 20), t0 = Date.UTC(2009, 4), t1 = Date.UTC(2026, 4);
    const X = d => 40 + (Date.parse(d + "-15") - t0) / (t1 - t0) * (W - 56), Y = v => H - 30 - (Math.log10(v) - 0.5) / (5.6 - 0.5) * (H - 60);
    const path = p => m.filter(x => x.platform === p).map((x, i) => `${i ? "L" : "M"}${X(x.month).toFixed(1)},${Y(x.med_likes).toFixed(1)}`).join("");
    const bands = [["2009-05", "2014-12", "Celebrity"], ["2015-01", "2016-12", "Campaign"], ["2017-01", "2021-01", "President"], ["2022-02", "2024-12", "Comeback"], ["2025-01", "2026-04", "President again"]];
    const ev = [["2016-11", "Wins 2016"], ["2020-10", "COVID diagnosis"], ["2024-07", "Butler"]];
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}">${bands.map(([a, b, l], i) => `<rect x="${X(a)}" y="18" width="${X(b) - X(a)}" height="${H - 48}" fill="${i % 2 ? or : nv}" opacity="${i % 2 ? .07 : .05}" rx="8"/><text x="${(X(a) + X(b)) / 2}" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="${mut}">${W < 560 && l.length > 9 ? l.slice(0, 6) + "…" : l}</text>`).join("")}
      ${[10, 100, 1000, 10000, 100000].map(v => `<line x1="40" x2="${W - 10}" y1="${Y(v)}" y2="${Y(v)}" stroke="${line}"/><text x="34" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="${mut}">${k(v)}</text>`).join("")}
      ${[2010, 2014, 2018, 2022, 2026].map(y => `<text x="${X(y + "-01")}" y="${H - 10}" text-anchor="middle" font-size="11" fill="${mut}">${y}</text>`).join("")}
      <path class="drawln" pathLength="1" d="${path("Twitter")}" fill="none" stroke="${tw}" stroke-width="3" stroke-linejoin="round"/><path class="drawln d2" pathLength="1" d="${path("Truth Social")}" fill="none" stroke="${ts}" stroke-width="3" stroke-linejoin="round"/>
      ${ev.map(([d, l]) => { const v = m.find(x => x.month === d); if (!v) return ""; return `<circle cx="${X(d)}" cy="${Y(v.med_likes)}" r="6" fill="${or}" stroke="#fff" stroke-width="2"/><text x="${X(d)}" y="${Y(v.med_likes) - 12}" text-anchor="middle" font-size="12" font-weight="800" fill="${ink}">${l}</text>`; }).join("")}</svg>`; };
  new ResizeObserver(() => chgDraw && chgDraw()).observe($("chgFig"));
}

/* ---------- METHOD ---------- */
function method() {
  const p = Q.processed, kap = V.lexicon_vs_supplied.map(x => x.kappa), main = V.lexicon_vs_supplied.filter(x => ["Elections", "Legal & investigations", "Foreign policy", "Economy & trade", "Media", "Immigration & border"].includes(x.topic)).map(x => x.kappa);
  const kd = Q.processed.by_platform_kind, g = (p, k_) => kd[`${p}|${k_}`] || 0, se = R.sensitivity;
  const reposts = g("Twitter", "repost") + g("Truth Social", "repost"), fmtN = g("Truth Social", "link_only") + g("Truth Social", "media_only") + g("Twitter", "link_only");
  const glitch = (Q.twitter.zero_like_own_posts || 0) + (Q.truth.zero_like_posts || 0) + (Q.truth.recent_3d_posts || 0), pre = se.twitter_all_years_n - se.twitter_oct2015_n;
  const FUN = [[nf.format(R.totals.posts), "posts in the two files"], [nf.format(reposts), "reposts of others: counted, likes belong to the original"], [nf.format(fmtN), "link or media only: used to compare formats"], [nf.format(glitch), "glitched or too new: set aside"], [nf.format(R.totals.voice), "in his own words: topics and style"], [nf.format(pre), "of these are pre-Oct 2015 tweets: trends only"]];
  const lq = R.label_quality;
  const C = [["1.0×", "How a post is scored", "Likes ÷ his typical likes in the previous 30 days. 2.0× means twice his usual. Findings must hold on both platforms."],
    [`${lq.macro_f1_rules.toFixed(2)}→${lq.macro_f1_final.toFixed(2)}`, "Labels checked for accuracy", `Tested on ${lq.gold_n} labelled posts (F1, 1 = perfect). Keyword rules, then machine learning. Weak categories hidden. A person checked 100 of the test labels: 90% agreed.`],
    ["3", "Outside sources", "Pew Research Center, AP VoteCast 2024, and an archive of tweets by members of Congress."],
    ["AI", "Where AI helped", "Planning, code, labelling the test set (90% confirmed by a hand check), and the Gemini chat assistant. Every number is computed by code. No AI judged any claim true or false.", "dark"]];
  $("mGrid").innerHTML = `<div class="lcard mfun"><h3>Where every post went</h3><div class="fun">${FUN.map(([v, l], k2) => `<div class="${k2 === 4 ? "hi" : ""}"><b>${v}</b><span>${esc(l)}</span></div>`).join("")}</div><div class="src">Nothing deleted: every exclusion is logged. Full detail in the PDF appendix.</div></div>`
    + C.map(([n, h, t, c]) => `<div class="lcard ${c || ""}"><div class="num">${n}</div><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join("");
}

/* ---------- EXPLORE (search + AI) ---------- */
const IC = { reply: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg>',
  repost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="var(--twt)"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' };
function socialCard(r) {
  const tw = r.platform === "Twitter", hot = r.rp != null && r.rp >= 2, cold = r.rp != null && r.rp <= .5;
  return `<article class="sc ${tw ? "tw" : "ts"}"><div class="sc-av" aria-hidden="true">DT</div><div class="sc-b">
    <div class="sc-h"><b>Donald J. Trump</b><span class="sc-v">${IC.check}</span><span class="sc-u">@realDonaldTrump · ${esc(r.date)}</span><span class="sc-p">${tw ? "Twitter (now X)" : "Truth Social"}</span></div>
    <p class="sc-t">${esc(r.text)}</p>
    <div class="sc-a"><span title="Replies">${IC.reply}–</span><span title="${tw ? "Retweets" : "Re-truths"}">${IC.repost}${k(r.shares ?? 0)}</span><span class="lk" title="Likes">${IC.heart}${k(r.likes)}</span>
      <span class="sc-rp ${hot ? "hot" : cold ? "cold" : ""}">${r.rp ?? "–"}× his usual</span>${r.similarity != null ? `<span class="sc-m">match ${Math.round(r.similarity * 100)}%</span>` : ""}</div></div></article>`;
}
let GEM = null, P = null, EMB = null, WV = null, WIDX = null, page = 0, last = null, sample = null; const D = 64, PL = { T: "Twitter", S: "Truth Social" }, hist = [];
function explore() {
  const card = $("exCard");
  card.innerHTML = `<div class="empty"><h3 style="color:var(--ink);font-size:22px">Load 59,422 posts</h3>About 22 MB: posts, meaning-vectors and vocabulary. Then search by idea, or ask a question in plain English.<div class="prog"><i id="exBar"></i></div><button class="btn" id="exGo">Load the data</button></div>`;
  $("exGo").onclick = load;
  on("exTab", () => P && view());
}
async function getBin(url, key, prog) { const r = await fetch(url); const rd = r.body.getReader(); const ch = []; let g = 0; for (;;) { const { done, value } = await rd.read(); if (done) break; ch.push(value); g += value.length; prog[key] = g; $("exBar").style.width = Math.min(100, Object.values(prog).reduce((a, b) => a + b, 0) / 22e6 * 100) + "%"; } const o = new Uint8Array(g); let off = 0; for (const c of ch) { o.set(c, off); off += c.length; } return o; }
async function load() {
  $("exGo").disabled = true; $("exGo").textContent = "Loading…"; const pr = {};
  try { const [pb, eb, wb, ww] = await Promise.all([getBin("data/wb_posts.json", "p", pr), getBin("data/wb_emb.b64.txt", "e", pr), getBin("data/wb_words.json", "w", pr), getBin("data/wb_wvec.b64.txt", "v", pr)]);
    const td = new TextDecoder(), unb = u => { const s = atob(td.decode(u)); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return new Int8Array(a.buffer); };
    P = JSON.parse(td.decode(pb)); EMB = unb(eb); const words = JSON.parse(td.decode(wb)); WV = unb(ww); WIDX = new Map(words.map((w, i) => [w, i]));
    { try { const g = await fetch("api/ask").then(r => r.ok ? r.json() : null); if (g && g.ok) GEM = g; } catch { GEM = null; } }
    view();
  } catch (e) { $("exGo").disabled = false; $("exGo").textContent = "Try again"; }
}
function embed(q) { const v = new Float32Array(D); let h = 0; for (const t of (q.toLowerCase().match(/[a-z']+/g) || [])) { const i = WIDX.get(t); if (i == null) continue; h++; for (let j = 0; j < D; j++) v[j] += WV[i * D + j]; } if (!h) return null; let n = 0; for (let j = 0; j < D; j++) n += v[j] * v[j]; n = Math.sqrt(n) || 1; for (let j = 0; j < D; j++) v[j] /= n; return v; }
function match(r, f = {}) { if (f.platform && r[1] !== (f.platform === "Twitter" || f.platform === "T" ? "T" : "S")) return false; const y = +r[2].slice(0, 4); if (f.year_from && y < f.year_from) return false; if (f.year_to && y > f.year_to) return false; if (f.label && !(`;${r[7]};${r[8]};`).includes(`;${f.label};`)) return false; if (f.contains && !r[3].toLowerCase().includes(String(f.contains).toLowerCase())) return false; if (f.min_rp != null && !(r[6] != null && r[6] >= f.min_rp)) return false; if (f.max_rp != null && !(r[6] != null && r[6] <= f.max_rp)) return false; if (f.device && r[12] !== f.device) return false; if (f.tone && r[9] !== f.tone) return false; return true; }
function search(q, f = {}, sort = "similarity", limit = 20) { const v = q ? embed(q) : null; const out = []; for (let i = 0; i < P.length; i++) { const r = P[i]; if (!match(r, f)) continue; let s = null; if (v) { s = 0; const o = i * D; for (let j = 0; j < D; j++) s += v[j] * EMB[o + j]; s /= 127; } else if (q && !r[3].toLowerCase().includes(q.toLowerCase())) continue; out.push([s, i]); }
  const key = { similarity: a => -(a[0] ?? 0), rp_desc: a => -(P[a[1]][6] ?? -1), rp_asc: a => (P[a[1]][6] ?? 1e9), likes_desc: a => -P[a[1]][4], date: a => P[a[1]][2] }[sort] || (a => -(a[0] ?? 0)); out.sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0);
  return { total: out.length, used_embedding: !!v, rows: out.slice(0, limit).map(([s, i]) => ({ id: P[i][0], platform: PL[P[i][1]], date: P[i][2], text: P[i][3], likes: P[i][4], shares: P[i][5], rp: P[i][6], topics: P[i][7], techniques: P[i][8], similarity: s == null ? null : +s.toFixed(3) })) }; }
const med = a => { if (!a.length) return null; const s = Float64Array.from(a).sort(); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
function stats(f = {}, g = "none") { const sel = P.filter(r => match(r, f)); const sm = rows => { const rp = rows.map(r => r[6]).filter(x => x != null); return { n: rows.length, median_likes: med(rows.map(r => r[4])), median_rp: rp.length ? +med(rp).toFixed(3) : null, share_2x: rp.length ? +(rp.filter(x => x >= 2).length / rp.length).toFixed(3) : null }; };
  if (g === "none") return { filters: f, ...sm(sel) }; const m = new Map(); const add = (k_, r) => { if (!m.has(k_)) m.set(k_, []); m.get(k_).push(r); };
  for (const r of sel) { if (g === "year") add(r[2].slice(0, 4), r); else if (g === "platform") add(PL[r[1]], r); else if (g === "tone") add(r[9], r); else if (g === "emotion") add(r[10], r); else if (g === "device") add(r[12] || "n/a", r); else if (g === "label") (`${r[7]};${r[8]}`).split(";").filter(Boolean).forEach(l => add(l, r)); }
  return { filters: f, group_by: g, n_total: sel.length, groups: [...m.entries()].map(([k_, rows]) => ({ group: k_, ...sm(rows) })).filter(x => x.n >= 20).sort((a, b) => g === "year" ? a.group.localeCompare(b.group) : (b.median_rp ?? 0) - (a.median_rp ?? 0)).slice(0, 40) }; }
function cmp(a = {}, b = {}) { const A = P.filter(r => match(r, a) && r[6] != null).map(r => r[6]), Bb = P.filter(r => match(r, b) && r[6] != null).map(r => r[6]); if (A.length < 20 || Bb.length < 20) return { error: "A group has fewer than 20 posts.", n_a: A.length, n_b: Bb.length }; const ma = med(A), mb = med(Bb); return { group_a: { n: A.length, median_rp: +ma.toFixed(3) }, group_b: { n: Bb.length, median_rp: +mb.toFixed(3) }, ratio: +(ma / mb).toFixed(3) }; }
function view() {
  const card = $("exCard"); const labels = [...new Set(R.dna.map(x => x.label))];
  if (S.exTab === "search") {
    card.innerHTML = `<form class="srch" id="sF"><input id="sQ" placeholder="Search an idea, e.g. border security and national identity" aria-label="Search"><select id="sP" aria-label="Platform"><option value="">Both platforms</option><option value="T">Twitter</option><option value="S">Truth Social</option></select><select id="sL" aria-label="Label"><option value="">Any topic</option>${labels.map(l => `<option>${esc(l)}</option>`).join("")}</select><select id="sR" aria-label="Performance"><option value="">Any result</option><option value="2">Beat his usual 2×+</option><option value="-0.5">Under half his usual</option></select><button class="btn">Search</button></form>
      <div class="pills" id="sX" style="margin-top:8px">${["rigged election ballots", "attacking judges and prosecutors", "prayer faith God bless", "jobs record stock market", "trade deal China tariffs"].map(x => `<button type="button">${x}</button>`).join("")}</div><div class="res" id="sRes"></div><div class="pager" id="sPg"></div>`;
    const run = () => { const f = { platform: PL[$("sP").value], label: $("sL").value || undefined }; if ($("sR").value === "2") f.min_rp = 2; if ($("sR").value === "-0.5") f.max_rp = .5; const q = $("sQ").value.trim(); last = search(q, f, q ? "similarity" : "rp_desc", 60); page = 0; show(); };
    const show = () => { const per = innerHeight < 660 && innerWidth < 1200 ? 1 : innerHeight < 800 ? 2 : innerHeight < 1000 ? 3 : 4, rows = last.rows.slice(page * per, page * per + per);
      $("sRes").innerHTML = rows.map(r => socialCard(r)).join("") || '<div class="empty">Nothing matches. Remove a filter.</div>';
      $("sPg").innerHTML = `<span>${nf.format(last.total)} posts match · ranked by ${last.used_embedding ? "meaning" : "performance"}</span><span style="flex:1"></span><button id="pp" ${page ? "" : "disabled"}>←</button><span>${page + 1}/${Math.max(1, Math.ceil(Math.min(60, last.rows.length) / per))}</span><button id="pn" ${(page + 1) * per < last.rows.length ? "" : "disabled"}>→</button>`;
      $("pp").onclick = () => { page--; show(); }; $("pn").onclick = () => { page++; show(); }; };
    $("sF").onsubmit = e => { e.preventDefault(); run(); }; $("sX").onclick = e => { const b = e.target.closest("button"); if (b) { $("sQ").value = b.textContent; run(); } };
    $("sQ").value = "border security and national identity"; run();
  } else {
    if (!sample && !GEM) { card.innerHTML = `<div class="empty"><h3 style="color:var(--ink)">Ask the AI runs on the live site</h3>It uses Google Gemini (free tier) and is switched on in the published Netlify version. Search still works here.</div>`; return; }
    card.innerHTML = `<div class="caution"><b>⚠ AI can make mistakes.</b> Answers are written by ${esc(GEM.provider)} on its <b>free tier</b>. The numbers come from calculations run in your browser, but always check the evidence listed under each answer.
  <details><summary>Read all cautions</summary><ul>
  <li><b>Wording vs numbers:</b> the AI only chooses which calculations to run and writes the summary. It can still misread a result or overstate it.</li>
  <li><b>Labels are automatic:</b> topics and techniques are tagged by keyword rules and a classifier (accuracy about 0.69 F1; a hand check of 100 test posts agreed with 90%). Sarcasm and context can be missed.</li>
  <li><b>Likes are not votes:</b> they show how his followers reacted. They don't show persuasion, voting, reach, or who liked a post.</li>
  <li><b>"His usual"</b> means his typical likes over the previous 30 days on that platform. Twitter posts before Oct 2015 are less reliable (likes were collected years later).</li>
  <li><b>Associations, not causes:</b> a pattern doesn't prove that a topic or style caused more likes.</li>
  <li><b>Privacy:</b> your question and the post snippets needed to answer it are sent to Google (Gemini free tier, which may use them to improve its products). Don't type personal information.</li>
  <li><b>Free tier:</b> at busy times Google may reply "high demand" or limit requests. That is normal for the free tier, not a site error. The site automatically tries backup Gemini models; if all are busy, wait a minute.</li>
  <li><b>Neutral research tool:</b> it describes patterns and doesn't endorse any candidate or message.</li></ul></details></div><div class="pills" id="aX">${["Which techniques do best on Truth Social?", "Find immigration posts that beat his usual", "Compare Android and iPhone posts in 2016", "Do China posts beat media posts?"].map(x => `<button type="button">${x}</button>`).join("")}</div><div class="chat" id="chat"></div><form class="srch" id="aF" style="margin-top:8px"><input id="aQ" placeholder="Ask about the posts" aria-label="Question"><button class="btn" id="aS">Ask</button></form>`;
    $("aX").onclick = e => { const b = e.target.closest("button"); if (b) { $("aQ").value = b.textContent; ask(labels); } }; $("aF").onsubmit = e => { e.preventDefault(); ask(labels); };
  }
}
const FS = { type: "object", properties: { platform: { type: "string", enum: ["Twitter", "Truth Social"] }, year_from: { type: "integer" }, year_to: { type: "integer" }, label: { type: "string" }, contains: { type: "string" }, min_rp: { type: "number" }, max_rp: { type: "number" }, device: { type: "string", enum: ["Android", "iPhone", "Web", "Staff tools", "Other"] }, tone: { type: "string", enum: ["positive", "neutral", "negative"] } } };
async function runGemini(h, sys, tools) {
  const decl = tools.map(t => ({ name: t.name, description: t.description, parameters: t.inputSchema }));
  const contents = h.map(m_ => ({ role: m_.role === "assistant" ? "model" : "user", parts: [{ text: m_.content }] }));
  let model = null;
  const call = async () => { const r = await fetch("api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, contents, tools: [{ functionDeclarations: decl }], systemInstruction: { parts: [{ text: sys }] } }) });
    let j = {}; try { j = await r.json(); } catch { j = {}; } return { r, j }; };
  for (let round = 0; round < 6; round++) {
    let { r, j } = await call();
    if ([429, 500, 502, 503, 504].includes(r.status)) { await new Promise(s => setTimeout(s, 2500)); ({ r, j } = await call()); }
    if (!r.ok) { const e = new Error(j.error?.message || j.error || ("HTTP " + r.status)); e.code = [429, 500, 502, 503, 504].includes(r.status) ? "busy" : "api"; throw e; }
    model = r.headers.get("x-gemini-model") || model; GEM.used = model;
    const c = j.candidates?.[0]?.content; if (!c) throw new Error("No answer returned");
    contents.push(c); const calls = (c.parts || []).filter(p => p.functionCall);
    if (!calls.length) return { text: (c.parts || []).map(p => p.text || "").join("").trim() || "(no answer)" };
    contents.push({ role: "user", parts: calls.map(p => { const t = tools.find(x => x.name === p.functionCall.name); let out; try { out = t ? t.execute(p.functionCall.args || {}) : { error: "unknown tool" }; } catch (e) { out = { error: String(e.message || e) }; } return { functionResponse: { name: p.functionCall.name, response: { result: out } } }; }) });
  }
  return { text: "I couldn't finish within the step limit. Try a narrower question." };
}
async function ask(labels) {
  const q = $("aQ").value.trim(); if (!q) return; $("aQ").value = ""; $("aS").disabled = true; const chat = $("chat");
  chat.insertAdjacentHTML("beforeend", `<div class="msg u">${esc(q)}</div>`); const box = document.createElement("div"); box.className = "msg a"; box.textContent = "Thinking…"; chat.appendChild(box); chat.scrollTop = chat.scrollHeight;
  const trace = [], w = (n, f) => i => { const o = f(i || {}); trace.push(`${n}(${JSON.stringify(i)}) → ${o.error || (o.total != null ? o.total + " matches" : o.n != null ? "n=" + o.n : o.groups ? o.groups.length + " groups" : "ok")}`); return o; };
  const tools = [{ name: "get_stats", description: "Counts, median likes, median RP (likes ÷ his median over the previous 30 days) and share at 2×+, for filtered posts, optionally grouped by year, platform, label, tone, emotion or device.", inputSchema: { type: "object", properties: { filters: FS, group_by: { type: "string", enum: ["none", "year", "platform", "label", "tone", "emotion", "device"] } } }, execute: w("get_stats", i => stats(i.filters, i.group_by || "none")) },
    { name: "search_posts", description: "Find real posts: optional semantic query, filters, sort (similarity, rp_desc, rp_asc, likes_desc, date). Up to 10.", inputSchema: { type: "object", properties: { query: { type: "string" }, filters: FS, sort: { type: "string" }, limit: { type: "integer" } } }, execute: w("search_posts", i => { const r = search(i.query || "", i.filters || {}, i.sort || (i.query ? "similarity" : "rp_desc"), Math.min(i.limit || 6, 10)); r.rows.forEach(x => x.text = x.text.slice(0, 240)); return r; }) },
    { name: "compare_groups", description: "Compare median RP of two filtered groups.", inputSchema: { type: "object", properties: { a: FS, b: FS }, required: ["a", "b"] }, execute: w("compare_groups", i => cmp(i.a, i.b)) }];
  const sys = `You are the research assistant in a public dashboard on Donald Trump's posts (Twitter 2009–Jan 2021, Truth Social Feb 2022–Apr 2026). Every number must come from a tool result; never estimate. RP = likes ÷ his median likes over the previous 30 days on the same platform (not an engagement rate). Cite posts by date and platform with short quotes. Never infer who engaged or claim persuasion or votes; say plainly when the data can't answer. Stay neutral. Labels: ${labels.join(", ")}. Answer in under 120 words, then a short "Evidence" list.`;
  hist.push({ role: "user", content: q }); const h = hist.slice(-7); while (h.length && h[0].role !== "user") h.shift();
  try { const res = await runGemini(h, sys, tools); box.textContent = res.text; hist.push({ role: "assistant", content: res.text }); }
  catch (e) { box.textContent = e && e.code === "busy" ? "Google's free Gemini tier is busy right now. This is normal on the free tier, not a problem with the site; the site already tried several backup models. Please try again in a minute, or use Search, which always works." : "Couldn't answer: " + (e && e.message || e); hist.pop(); }
  if (trace.length) { const t = document.createElement("div"); t.className = "trace"; t.textContent = (GEM && GEM.used ? `Answered by ${GEM.used} · ` : "") + "Computed in your browser: " + trace.join(" · "); box.appendChild(t); }
  $("aS").disabled = false; chat.scrollTop = chat.scrollHeight;
}

const RENDER = { home, why, works, learn, compare, change, explore, method };
const LIVE = { change: () => chgDraw && chgDraw() };
Promise.all(["report", "benchmark", "quality", "validation"].map(f => fetch(`data/${f}.json`).then(r => r.json()))).then(([r, b, q, v]) => { R = r; B = b; Q = q; V = v; go(location.hash.slice(1) || "home", false); })
  .catch(e => { $("stage").insertAdjacentHTML("afterbegin", `<div class="empty" style="padding:40px">Couldn't load data: ${esc(e.message)}</div>`); });
}
