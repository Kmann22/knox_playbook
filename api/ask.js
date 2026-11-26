// Shared Gemini proxy logic: hides the key, and on the free tier falls back to other models
// when one is busy ("high demand" 503), rate-limited (429), slow or unavailable.
const MAX_BODY = 60_000;
const CHAIN = ["gemini-flash-latest", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
const models = () => { const first = process.env.GEMINI_MODEL; return first ? [first, ...CHAIN.filter(m => m !== first)] : CHAIN; };
function info() {
  return Response.json({ ok: !!process.env.GEMINI_API_KEY, provider: "Google Gemini", model: models()[0], fallbacks: models().slice(1), tier: "free" });
}
async function ask(req, budgetMs) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Server is missing GEMINI_API_KEY" }, { status: 500 });
  const raw = await req.text();
  if (raw.length > MAX_BODY) return Response.json({ error: "Request too large" }, { status: 413 });
  let body; try { body = JSON.parse(raw); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }
  const list = models(); const pref = list.includes(body.model) ? body.model : null;   // keep one model per question
  const order = pref ? [pref, ...list.filter(m => m !== pref)] : list;
  const payload = JSON.stringify({ contents: body.contents, tools: body.tools, systemInstruction: body.systemInstruction,
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 } });
  const start = Date.now(); let last = { status: 503, text: JSON.stringify({ error: { message: "Gemini is busy" } }) }; const tried = [];
  for (const model of order) {
    const left = budgetMs - (Date.now() - start); if (left < 2500) break;
    tried.push(model);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: payload,
        signal: AbortSignal.timeout(Math.min(left - 1000, 20_000)) });
      const text = await r.text();
      if (r.ok) return new Response(text, { status: 200, headers: { "Content-Type": "application/json", "x-gemini-model": model, "x-gemini-tried": tried.join(",") } });
      if (r.status === 401 || r.status === 403) return new Response(text, { status: r.status, headers: { "Content-Type": "application/json" } });
      last = { status: r.status, text };            // 429 / 5xx / 404 / 400: try the next model
    } catch (e) { last = { status: 504, text: JSON.stringify({ error: { message: "Gemini took too long to respond" } }) }; }
  }
  return new Response(last.text, { status: last.status === 404 || last.status === 400 ? 503 : last.status, headers: { "Content-Type": "application/json", "x-gemini-tried": tried.join(",") } });
}
// Vercel Function (Hobby): up to 60 s.
export async function GET() { return info(); }
export async function POST(req) { return ask(req, 55_000); }
