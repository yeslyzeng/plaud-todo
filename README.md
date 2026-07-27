# First Four Weeks · Plaud Community Operations

A self-contained, single-file living tracker for the first-four-weeks onboarding plan,
built in the Plaud brand system (Jokker fonts embedded, no external requests).

## Deploy

This repo is a **static site** — the whole site is `index.html`. No build step.

It is wired for **automatic deploys on Vercel**: once this repo is connected to a
Vercel project (Import Git Repository → this repo → framework preset "Other", no build
command), every push to `main` triggers a new production deployment automatically.

## Updating

Edit `index.html` (or regenerate it from the source template), then:

```bash
git add -A && git commit -m "Update tracker" && git push
```

Vercel picks up the push and redeploys — nothing else to do.
