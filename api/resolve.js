// Vercel adapter: reuses the Netlify handler so there is one source of truth.
const { handler } = require("../netlify/functions/resolve.js");

module.exports = async (req, res) => {
  const r = await handler({ queryStringParameters: req.query });
  Object.entries(r.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  res.status(r.statusCode).send(r.body);
};
