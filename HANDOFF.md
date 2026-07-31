# First Four Weeks — project handoff

Living context for this project. Updated at the end of each working session so nothing is
lost when the conversation context resets. If you're a new session, read this first.

## What this is

A private, self-contained web **hub** for Pinyan's first four weeks in **Community Operations at Plaud AI**.
It started as a re-cut of Steven's "First Four Weeks" onboarding PDF into a living, proactive
task board, and has grown into a personal operating hub: task tracker + idea bank + program-brief
tool + daily log + knowledge base, all anchored to goals.

- **User:** Pinyan (yesly.zeng@plaud.ai), CO team, SF office, Singapore⇄SF split.
- **People:** Steven (manager, shapes H2 OKR), Claire (teammate, content/UGC), Jun Lin (teammate, response/coverage), Brian Yam (Plaud Team/Embedded/MCP).
- **OKR objectives (from the PDF, keep these letters):** D = every signal caught & acted on; E = Sigma builder ecosystem; F = infra & team capacity.

## Where it lives

- **Live site:** deployed on Vercel from the GitHub repo `yeslyzeng/plaud-todo` (auto-deploys on every push to `main`).
- **Artifact (preview):** https://claude.ai/code/artifact/a4cfca4b-f8e5-43b9-a721-edada4c70464
- **Repo / source of truth:** `first-four-weeks/deploy/` — `index.html` is the whole site (self-contained, no build).
- **Build source:** `scratchpad/app.template.html` + a Python font/logo injector writes `deploy/index.html` and `plaud-tracker.html`.

## Design

Built in the **Plaud official brand system** (`~/Downloads/Visual/Plaud - Design System.zip`): Jokker
typeface (embedded base64), neutral surfaces, hairline borders, signal-orange reserved for live/in-progress,
AI gradient (green→blue→purple) as the agentic accent. App-style shell: left sidebar + main content,
mapped from the design pkg's `ui_kits/plaud-app`. Dark + light themes. Wordmark logo embedded (theme-swapped).

## Sub-pages (all in the hub sidebar)

- **North Star** (Strategy) — the big picture: career thesis (AI-native ecosystem builder) → the real Plaud OKR (O1 Amplify/Seen, O2 Address/Heard, O3 Cultivate/Valued, KR1–7 with Week-31 live numbers, targets, weights) → daily execution. Plus the 6 leverage axes, 4 convexity loops, 0–18mo roadmap, anti-replacement filter. Sourced from the career-convexity zip + Notion Week 31. NOTE: the sidebar Objectives still show the placeholder D/E/F (kept prominent for fast team-align, per user); the *real* OKR lives on North Star. Open question: re-anchor the sidebar Objectives to O1/O2/O3.
- **OKR 拟定** (prominent, top of sidebar) — the user's real H2 direction tracker (their evolving objectives + key results), served as a standalone self-contained app `deploy/okr.html` (own localStorage key `plaud.h2tracker`, its own fonts/design) and **embedded via a full-width iframe** on the hub's `okr` view (`okr-mode` widens `.mainwrap`; "Open full screen" links to `/okr.html`). Only loads on the live Vercel site (iframe `src="okr.html"` — not present in the Artifact bundle). Replaced Weeks/Objectives as the primary planning surface per the user (tasks updated; old plan kept for reference).
- **First-4-weeks plan** (collapsed sidebar group, `groupOpen.reference`) — the original Weeks 01–04 + Objectives D/E/F, demoted to reference. The 21 seeded tasks still power Overview's proactive-focus + progress ring.
- **Overview** — proactive-focus panel, progress ring + per-week bars, a **Channels** quick-links block, a **People · who I work with** block (Steven, Claire, Junlin, Jack Mu), all 21 moves grouped by week.
- **Weeks 01–04** — real dates (Jul 27–31 … Aug 17–21, 2026) + live progression tags (Past / This week / Upcoming, computed from today).
- **Objectives D/E/F** — moves filtered by OKR objective (colored tag dots).
- **Daily log** — 4×/day capture of what you did → synthesised into goal-anchored summaries + metrics (fetches `journal.json`).
- **Idea bank** — quick capture, tagged **Plaud signal** (internal) vs **External**, filterable, Export. Daily read fetches `digest.json`.
- **Program briefs** — turn an idea into a one-page program (goal / why now / steps / owners / success signal / first move).
- **Running note** — free-form observations pad.
- **How this ships** — the deploy workflow, in-app.
- **Known issues** — self-audit punch-list of weaknesses (severity-ranked), to harden together.
- **Context / handoff** — renders this file.

## Data & storage

- **Client state** (localStorage key `p4w:app:v1`): task status, custom moves, notes, ideas, briefs, daily log, theme. Per-device.
- **Passcode gate:** code `19730929`, stored only as a SHA-256 hash in the bundle; unlock flag `p4w:app:unlocked`. Soft/client-side — see Known issues.
- **Repo files (agent-readable):** `ideas.md`, `log/YYYY-MM-DD.md`, `goals.md`, and agent outputs `digest.json` (idea digest) + `journal.json` (log synthesis).

## Automation — status

- ✅ **GitHub → Vercel:** automatic deploy on every push. Push auth via repo-scoped SSH key `~/.ssh/id_ed25519_plaud_ffw2` (`core.sshCommand`, not global).
- ✅ **AI move-shaping (`deploy/api/polish.js`):** Vercel serverless fn (zero-dep, Node global `fetch`, model `claude-haiku-4-5`). The "Add move" box on each Week page takes a rough half-formed note → `POST /api/polish` → returns a house-style `{title, move, obj D/E/F}` → shown as a draft preview (Add / Redo / Discard). Enter = polish; a separate "add as-is" button skips it; if the fn is unreachable it falls back to add-as-is. **Requires `ANTHROPIC_API_KEY` set in Vercel → Project → Settings → Environment Variables, then a redeploy.** Uses the user's own API key (secret lives only in Vercel env, never in the repo). Does NOT work on the Artifact (its CSP blocks the fetch — degrades to add-as-is there). To swap to a smarter/slower model, change `MODEL` at the top of `polish.js`.
- ⏳ **Daily idea digest:** slot + store exist; the scheduled agent that reads `ideas.md` → writes `digest.json` is NOT wired yet.
- ✅ **Daily log check-in popups: LIVE.** launchd job `com.plaud.checkin` (`~/Library/LaunchAgents/com.plaud.checkin.plist`) fires `first-four-weeks/scripts/checkin.sh` at 12/15/18/23 Mon–Fri → osascript dialog → appends to `deploy/log/<date>.md` → commits + pushes. Manage via `scripts/README.md`.
- ⏳ **Log synthesis agent** (log → `journal.json` + weekly/monthly rollups, double-tagged by KR + leverage axis + GTM stage) — NOT wired yet.
- ⚠️ **PRIVACY:** the check-in pushes raw `log/` to the repo, and Vercel serves ALL repo files (log/, ideas.md, goals.md, HANDOFF.md) publicly — the passcode gate only covers the index.html app UI, NOT other files. Raw logs are world-readable at the Vercel URL. Fix: enable Vercel Password Protection (server-side, now that the Vercel connector is available) or keep raw capture out of the served root. This is now the top hardening priority.
- 💡 **Faster capture (proposed):** email → Gmail connector (available in session) → Claude parses text + screenshots via vision → appends to the knowledge base. Best low-friction path from phone; not built yet.

## Key decisions

- Objectives stay **D/E/F** (real team OKR labels), not A/B/C.
- Knowledge base lives in the **hub/repo** for now (not Notion). User is NOT connected to Notion in-session; option open to connect later for write-back.
- Capture = **both** native popups + web Log page.

## To continue / build & deploy

1. Edit `scratchpad/app.template.html`, then run the Python injector to write `deploy/index.html` + `plaud-tracker.html`.
2. `cd deploy && git add -A && git commit && git push` → Vercel redeploys.
3. Re-publish the Artifact from `plaud-tracker.html` (same file path keeps the URL).

## Open todos

- Wire the daily idea-digest agent (`ideas.md` → `digest.json`).
- Wire the daily-log popups (launchd) + synthesis agent (→ `journal.json`, weekly/monthly).
- Decide + build the fast image/email capture path (Gmail connector).
- Harden the passcode (Vercel Password Protection) — see Known issues.
- Keep this file updated each session.
