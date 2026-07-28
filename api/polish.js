// Plaud · "Add move" polish — Superhuman-style. Takes a rough, half-formed note
// and rewrites it into the board's house style: a tight title + a proactive
// "→" move, auto-tagged to an OKR objective (D/E/F).
//
// Zero-dependency Vercel serverless function (Node runtime, global fetch).
// Keeping it dependency-free means the repo stays a build-free static site —
// no package.json, no npm install on deploy.
//
// Requires the ANTHROPIC_API_KEY env var (set it in Vercel → Project → Settings
// → Environment Variables, then redeploy). Runs only on the live Vercel site;
// the Artifact preview can't reach it (its CSP blocks outbound fetch).

// Fast + cheap by design: this fires on every "Polish" click, so it uses Haiku
// for near-instant turnaround. Swap to "claude-opus-5" for a smarter rewrite.
const MODEL = "claude-haiku-4-5";

const SYSTEM = [
  "You turn a rough, half-formed note from Pinyan (Community Operations at Plaud AI, first four weeks) into ONE board move in the house style.",
  "House style — study these real moves:",
  '  • "Start participating in Reddit & X where Plaud is discussed." → "Draft low-stakes replies for Jun Lin\'s review before going live."',
  '  • "Stay present in the Builder Discord — now in-role." → "Re-introduce yourself and begin light white-glove shadowing."',
  '  • "List standout Sigma / Builder Discord contributors." → "Note what makes each one high-signal — not just who, but why."',
  "",
  "Return three fields:",
  "- title: the thing being tracked/observed, as a short declarative line. Sentence case, no trailing period unless natural. ≤ 90 chars.",
  "- move: the proactive next step. MUST start with an action verb (Draft, Map, Ping, Shadow, Note, Pull, Flag…). Concrete, forward-leaning, one clause. Do NOT restate the title. ≤ 120 chars. No leading arrow.",
  "- obj: the single best-fit objective letter:",
  "    D = every signal caught & acted on (listening, replying, coverage, feedback loops, community response)",
  "    E = Sigma / Builder ecosystem (builders, showcases, white-glove, Discord contributors, docs)",
  "    F = infra & team capacity (tooling, process, dashboards, enabling the team, internal systems)",
  "",
  "Voice: calm, precise, low-ego, operator-not-marketer. No hype, no emoji, no hashtags. Keep the user's intent; sharpen it, don't invent scope.",
].join("\n");

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    move: { type: "string" },
    obj: { type: "string", enum: ["D", "E", "F"] },
  },
  required: ["title", "move", "obj"],
  additionalProperties: false,
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "no_api_key" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};
  const rough = String(body.text || "").slice(0, 2000).trim();
  const week = String(body.week || "").slice(0, 40);
  if (!rough) {
    res.status(400).json({ error: "empty" });
    return;
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content:
              (week ? "Context: " + week + ".\n" : "") +
              "Rough note to shape into a move:\n" + rough,
          },
        ],
        output_config: { format: { type: "json_schema", schema: SCHEMA } },
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ error: "anthropic_error", status: r.status, detail: detail.slice(0, 400) });
      return;
    }

    const data = await r.json();
    const textBlock = (data.content || []).find(function (b) { return b.type === "text"; });
    let out = {};
    try { out = JSON.parse(textBlock && textBlock.text); } catch (e) { out = {}; }
    if (!out || !out.title) {
      res.status(502).json({ error: "parse_failed" });
      return;
    }
    res.status(200).json({
      title: String(out.title || "").trim(),
      move: String(out.move || "").trim(),
      obj: ["D", "E", "F"].indexOf(out.obj) >= 0 ? out.obj : "",
    });
  } catch (err) {
    res.status(502).json({ error: "request_failed", detail: String(err && err.message || err).slice(0, 200) });
  }
};
