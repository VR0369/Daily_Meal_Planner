# 🍽️ Meal Planner

A modern, responsive full-stack **daily / weekly / monthly meal planner** with an
automatically synchronized grocery list and AI-style meal suggestions.

- **Frontend:** React 19, React Router 7, Material UI 6, React Context, Axios (Vite)
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Runs instantly** with an in-memory MongoDB — no database setup required to try it.

---

## ✨ Features

**Dashboard** — Opens today's plan by default and automatically rolls over to the
next day at midnight. Shows stat cards (Meals Planned, Meals Remaining, Days
Completed, Completion %, Ingredients Needed / Purchased) plus upcoming meals. If
today's plan is already complete it surfaces tomorrow.

**Daily / Weekly / Monthly planners**
- *Daily:* per-meal editing (Breakfast, Lunch, Dinner, plus optional Snacks &
  Dessert) with a copy-to-tomorrow action.
- *Weekly:* seven consecutive day columns with a one-click "copy week forward".
- *Monthly:* a real calendar with completion colour coding — **white** (empty),
  **light yellow** (some meals), **light green** (full day). Hover shows a meal
  summary; clicking opens the day with copy / move / delete actions.

**Meal entry & ingredient builder** — Each meal has a name and an ingredient
builder: choose *"How many ingredients? (1–15)"* to generate rows, each with a
name, quantity, and availability radio (Available / Not Available / Need More).

**Grocery list** — Auto-generated from every ingredient marked *Not Available* or
*Need More*. Duplicates are merged and annotated with the meals/days they're
needed for. **Purchased** flips every matching ingredient across all meals back to
*Available* and refreshes the list; **Cannot Find** keeps the item and lets you
add a replacement.

**Categories** — 17 built-in categories (Vegetarian, Vegan, Keto, Indian, …). Add
your own custom categories, saved to the database and available everywhere.

**AI meal suggestions** — Pick a category and get curated Breakfast/Lunch/Dinner
ideas with starter ingredient lists. Accept, edit, replace one, or regenerate.

**Also:** global search (meals, ingredients, categories, dates), auto-save
everywhere (no Save button), light / dark / system theme, fully responsive.

---

## 🚀 Quick start

Requires **Node.js 18+**.

```bash
# 1. Install both client and server dependencies
npm run install:all

# 2. Start the API and the client together (http://localhost:5173)
npm run dev
```

That's it. With no `MONGO_URI` set, the server boots an **in-memory MongoDB** and
seeds sample data automatically, so the app is fully usable immediately.

> The client dev server proxies `/api` to the Express API on port 5000, so there
> are no CORS issues in development.

### Running the pieces separately

```bash
npm run server   # API only  → http://localhost:5000/api
npm run client   # Vite only → http://localhost:5173
```

---

## 🗄️ Using a real MongoDB (persistent data)

Copy the example env file and set a connection string:

```bash
cp server/.env.example server/.env
```

```ini
# server/.env
MONGO_URI=mongodb://127.0.0.1:27017/mealplanner     # local
# or MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mealplanner
```

Then (re)seed categories and sample plans:

```bash
npm run seed
```

---

## 🚀 Deploy to Render

The repo ships a [`render.yaml`](render.yaml) Blueprint that provisions both the
API (web service) and the client (static site).

1. **Database first.** Render has no managed MongoDB, so create a free
   [MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster, add a database
   user, allow network access from `0.0.0.0/0`, and copy the connection string.
2. In Render: **New → Blueprint** and select this repo. It reads `render.yaml`
   and proposes `meal-planner-api` and `meal-planner-client`.
3. Fill the two prompted secrets:
   - `MONGO_URI` → your Atlas connection string
   - `VITE_API_URL` → the API URL **+ `/api`** (e.g. `https://meal-planner-api.onrender.com/api`)
4. Apply. `JWT_SECRET` is auto-generated and `CLIENT_ORIGIN` (CORS) is auto-wired
   from the client's URL. On first boot the API seeds Atlas automatically.

Notes:
- `VITE_API_URL` is baked in at **build time** — if you change it, trigger a
  client **rebuild**, not just a restart.
- Free web services cold-start after ~15 min idle; data persists in Atlas.

---

## 🏗️ Project structure

```
meal-planner/
├── package.json            # root scripts (install:all, dev, seed…)
├── server/                 # Express + Mongoose REST API
│   ├── .env.example
│   └── src/
│       ├── index.js        # app entry (DB connect, middleware, routes)
│       ├── config/db.js    # Mongo connect + in-memory fallback
│       ├── models/         # User, Category, MealPlan, GroceryItem, Settings
│       ├── controllers/    # request handlers
│       ├── routes/         # REST routers
│       ├── middleware/     # auth (optional JWT) + error handling
│       ├── utils/          # dates, grocerySync, aiSuggestions, constants
│       └── seed/seed.js    # seed script + boot-time seeding
└── client/                 # React + MUI (Vite)
    └── src/
        ├── api/            # axios client + endpoint functions
        ├── context/        # ColorMode (theme) + App data/toasts
        ├── components/     # layout, common, planner components
        ├── pages/          # Dashboard, planners, Grocery, Categories, Settings
        ├── hooks/          # usePlanEditor (auto-save), midnight refresh…
        ├── theme/          # MUI light/dark theme
        └── utils/          # date + constant helpers
```

---

## 🔌 REST API

Base URL: `/api`. In single-user demo mode requests are unauthenticated and
scoped to `user = null`; send a `Bearer` token to scope to a real user.

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/health` | Health check |
| POST | `/auth/register` · `/auth/login` | Auth (JWT) |
| GET | `/mealplans/active` | Day the dashboard should show (today/tomorrow) |
| GET | `/mealplans?date=` | One day's plan |
| GET | `/mealplans/week?date=` · `/mealplans/month?date=` · `/mealplans/range?start=&end=` | Multi-day |
| POST | `/mealplans` | Create a plan |
| PUT | `/mealplans` | Upsert a whole day (auto-save) |
| PUT | `/mealplans/:id/meal` | Upsert one meal |
| DELETE | `/mealplans/:id` | Delete a day |
| POST | `/mealplans/copy` · `/mealplans/copy-week` | Copy / move meals |
| GET/POST/DELETE | `/categories` | List / add / remove categories |
| GET | `/grocery` · POST `/grocery/refresh` | Grocery list |
| POST | `/grocery/:id/purchased` · `/grocery/:id/cannot-find` | Grocery actions |
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/search?q=` | Search meals/ingredients/categories/dates |
| POST | `/suggestions` | AI meal suggestions |
| GET/PUT | `/settings` | User settings |

All responses use a `{ success, data }` envelope; errors return
`{ success: false, message }`.

---

## 🧭 Data model (Mongoose)

- **MealPlan** — one document per (user, day): `{ date, duration, category, meals[], notes }`.
- **Meal** (embedded) — `{ mealType, mealName, ingredients[], notes }`.
- **Ingredient** (embedded) — `{ name, quantity, status }` where status is
  `Available | Not Available | Need More`.
- **GroceryItem** — derived, duplicate-merged, with `sources[]` and purchase state.
- **Category**, **Settings**, **User** — supporting collections.

---

## 🔮 Designed to extend

The architecture leaves room for the roadmap items: JWT/OAuth auth (already
scaffolded), multiple family members & shared plans (every document is
`user`-scoped), nutritional analysis (add fields to the ingredient schema),
recipe library, PDF/CSV export, push/meal reminders, and a React Native client
(the REST API is UI-agnostic).

---

## ⚠️ Notes

- The "AI" suggestion engine is an offline, curated generator (no API key
  needed). Swap `server/src/utils/aiSuggestions.js#generateSuggestions` for a
  real LLM call to upgrade it.
- `mongodb-memory-server` downloads a small MongoDB binary on first run.
```
