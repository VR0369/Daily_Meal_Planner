---
name: run-app
description: Launch and drive the Daily Meal Planner locally (Express API + Vite/React client with in-memory MongoDB). Use when asked to run, start, or screenshot the app, or to confirm a change works in the real app.
---

# Run the Meal Planner locally

Full-stack app: Express API (`server/`) on **:5000** and a Vite/React client
(`client/`) on **:5173**. With no `MONGO_URI` the server boots an in-memory
MongoDB and seeds sample data automatically — no DB setup needed.

Requires Node 18+ (verified on Node 24 / npm 11).

## First run: install (three steps — the README only mentions one)

```bash
npm install                 # ROOT deps — README's install:all SKIPS this,
                            # but the dev script needs `concurrently`
npm run install:all         # installs server/ then client/ deps
```

Two postinstall scripts get **blocked** by npm's allow-scripts and must be
approved, or Vite and the in-memory DB binary won't work:

```bash
npm --prefix client approve-scripts esbuild
npm --prefix server approve-scripts mongodb-memory-server
```

> `mongodb-memory-server` downloads a small MongoDB binary on the first boot,
> so the first `npm run dev` takes ~30–60s longer than later runs.

## Launch

```bash
npm run dev                 # runs server + client together via concurrently
```

Wait for these lines (server) and the Vite "Local:" URL (client):

```
[server] ✅ MongoDB connected: 127.0.0.1/mealplanner
[server] 🚀 Meal Planner API listening on http://localhost:5000/api
[client]   ➜  Local:   http://localhost:5173/
```

**Port note:** if 5173 is busy, Vite silently picks the next free port
(e.g. **5174**) and prints it. Always read the actual URL from the client
log — don't assume 5173. The client proxies `/api` to :5000, so no CORS setup.

## Smoke-test the API

```bash
curl -s http://localhost:5000/api/health            # {"success":true,"status":"ok"...}
curl -s http://localhost:5000/api/dashboard/stats   # seeded stats
curl -s http://localhost:5174/api/mealplans/active  # via client proxy (use real port)
```

## Drive the UI (confirm React renders, not just the HTML shell)

`curl http://localhost:5174/` only returns an empty `<div id="root">`. To
prove the SPA renders, screenshot it with headless Chrome (present on this
Windows box; no Playwright/chromium-cli needed). `--virtual-time-budget`
lets async data load before capture:

```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
SHOT="$SCRATCHPAD/dashboard.png"   # use your scratchpad dir
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,1000 --virtual-time-budget=9000 \
  --screenshot="$SHOT" "http://localhost:5174/"      # use the real port
```

Then Read the PNG. A healthy Dashboard shows stat cards (Meals Planned,
Completion %, …) and an "Upcoming meals" list. Other routes to spot-check:
`/grocery`, `/daily`, `/weekly`, `/monthly`, `/categories`, `/settings`.
(Edge works too: `/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`.)

## Known quirk (not a launch failure)

The Dashboard reports "Ingredients Needed" directly from meal plans, but the
Grocery List (`/grocery`) is a derived `GroceryItem` collection that only
materializes on **Refresh** (`POST /api/grocery/refresh`) or when meals
change. After a fresh seed the grocery page can show "Nothing to buy" until
refreshed — expected, not a bug.

## Other scripts

```bash
npm run server    # API only  → http://localhost:5000/api
npm run client    # Vite only → http://localhost:5173
npm run seed      # (re)seed — only meaningful with a real MONGO_URI set
```
