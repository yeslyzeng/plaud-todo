# First Four Weeks · Plaud Community Operations

A self-contained, single-file **hub** for the first-four-weeks onboarding plan, built in the
Plaud brand system (Jokker fonts embedded, no external requests). App-style layout: a left
sidebar (Overview · Weeks · Objectives · Idea bank · Running note · How this ships) and a
main content area with a live task board.

The whole site is **`index.html`** — no framework, no build step.

## Sub-pages

- **Overview** — proactive-focus panel, overall + per-week progress, all 21 moves grouped by week.
- **Weeks 01–04** — one week at a time, with an "add your own move" input.
- **Objectives D / E / F** — moves filtered by OKR objective.
- **Idea bank** — quick-capture for ideas (stored in `localStorage`), with Export.
- **Running note** — a free-form observations pad.
- **How this ships** — this deploy workflow, in-app.

State (task status, custom moves, notes, ideas, theme) is saved to the browser's
`localStorage` — per device, no backend.

## Deploy — automatic on every push

This repo is wired to **Vercel** (Import Git Repository → framework preset **Other**,
empty build command). Every push to `main` triggers a fresh production deploy automatically.

```
edit index.html  →  git commit  →  git push  →  GitHub  →  Vercel auto-deploy  →  live
```

Pushes from this machine are authorised by a repo-scoped SSH deploy key
(`~/.ssh/id_ed25519_plaud_ffw2`, set via `core.sshCommand` — it never touches global git config).

### To ship an update

```bash
git add -A && git commit -m "Update tracker" && git push
```

Live in ~30 seconds. For a fully hands-off flow, a local file-watcher (launchd + fswatch) can
auto-commit and push on every change to `index.html` — ask to set it up.
