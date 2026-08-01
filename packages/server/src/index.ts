import { Hono } from "hono";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

const app = new Hono();

app.get("/", (c) => {
  return c.html(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Montagen</title>
  <style>
    body {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #1a1a2e;
      color: #e0e0e0;
      font-family: system-ui, sans-serif;
    }
    h1 {
      font-size: 2rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <h1>Montagen</h1>
</body>
</html>`);
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

Bun.serve({
  port: PORT,
  fetch: app.fetch,
});

console.log(`Server running at http://localhost:${PORT}`);
