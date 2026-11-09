// Vercel adapter: POST /api/order → reuses the same handler as netlify/functions/order.js
const { handler } = require("../netlify/functions/order.js");

module.exports = async (req, res) => {
  let body = req.body;
  if (body && typeof body !== "string") body = JSON.stringify(body);
  const headers = { ...req.headers };
  if (!headers["x-nf-client-connection-ip"]) headers["x-nf-client-connection-ip"] = headers["x-real-ip"] || "";
  const out = await handler({ httpMethod: req.method, headers, body: body || "" });
  for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
  res.status(out.statusCode).send(out.body || "");
};
