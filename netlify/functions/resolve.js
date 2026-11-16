// AI address resolver: messy text -> search keywords (Claude) -> real postcodes (NIPOST autocomplete).
// The AI never invents postcodes. It only produces search terms; every candidate comes from the API.
const BASE = "https://api.postcode.gov.ng";

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

async function keywordsFromAI(text) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 200,
      system:
        "You extract search terms from informal Nigerian addresses (English or pidgin). " +
        'Reply with ONLY JSON: {"keywords":["..."]} with 1-4 short place names, landmarks, streets or area names. Never output postcodes.',
      messages: [{ role: "user", content: text }],
    }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  const out = data?.content?.[0]?.text || "";
  try {
    const m = out.match(/\{[\s\S]*\}/);
    return JSON.parse(m[0]).keywords.slice(0, 4);
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  const pcKey = process.env.POSTCODE_API_KEY;
  if (!pcKey) return json(500, { error: "POSTCODE_API_KEY not set" });
  const text = (event.queryStringParameters || {}).text || "";
  if (!text.trim()) return json(400, { error: "text required" });

  const ai = await keywordsFromAI(text);
  const keywords = ai && ai.length ? ai : [text.trim()];

  const seen = new Map();
  for (const k of keywords) {
    try {
      const r = await fetch(`${BASE}/v1/search/autocomplete?q=${encodeURIComponent(k)}`, {
        headers: { "X-API-Key": pcKey },
      });
      if (!r.ok) continue;
      const body = await r.json();
      const list = Array.isArray(body.data) ? body.data : body.data?.results || body.data?.suggestions || [];
      for (const item of list) {
        const code = typeof item === "string" ? item : item.postcode || item.code;
        if (code && !seen.has(code)) seen.set(code, { code, raw: item, matchedOn: k });
      }
    } catch {}
  }
  return json(200, { usedAI: !!ai, keywords, candidates: [...seen.values()].slice(0, 8) });
};
