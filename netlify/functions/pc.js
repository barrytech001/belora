// Postcode API proxy: keeps the NIPOST key on the server.
const BASE = "https://api.postcode.gov.ng";

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  const key = process.env.POSTCODE_API_KEY;
  if (!key) return json(500, { error: "POSTCODE_API_KEY not set" });

  const q = event.queryStringParameters || {};
  let path;
  if (q.op === "autocomplete") {
    if (!q.q || !q.q.trim()) return json(400, { error: "empty query" }); // API never answers empty queries
    path = `/v1/search/autocomplete?q=${encodeURIComponent(q.q.trim())}`;
  } else if (q.op === "lookup") {
    if (!q.code) return json(400, { error: "code required" });
    const level = Math.min(Math.max(parseInt(q.level || "1", 10) || 1, 1), 3);
    path = `/v1/lookup?code=${encodeURIComponent(q.code)}&level=${level}`;
  } else {
    return json(400, { error: "unknown op" });
  }

  try {
    const r = await fetch(BASE + path, { headers: { "X-API-Key": key } });
    const text = await r.text();
    return { statusCode: r.status, headers: { "Content-Type": "application/json" }, body: text };
  } catch (e) {
    return json(502, { error: "upstream failed", detail: String(e) });
  }
};
