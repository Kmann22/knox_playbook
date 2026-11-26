// Vercel Function: a thin, key-hiding proxy to the Gemini API.
// The API key lives only in Vercel's environment variables (GEMINI_API_KEY), never in the page.
// Optional: GEMINI_MODEL (default "gemini-flash-latest").
const MAX_BODY = 60_000;
export async function GET() {
  const key = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  return Response.json({ ok: !!key, provider: "Google Gemini", model, tier: "free" });
}
export async function POST(req) {
  const key = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  if (!key) return Response.json({ error: "Server is missing GEMINI_API_KEY" }, { status: 500 });
  const raw = await req.text();
  if (raw.length > MAX_BODY) return Response.json({ error: "Request too large" }, { status: 413 });
  let body; try { body = JSON.parse(raw); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }
  const payload = { contents: body.contents, tools: body.tools, systemInstruction: body.systemInstruction,
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 } };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(payload) });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type": "application/json" } });
}
