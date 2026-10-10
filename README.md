# Portfolio Pilot — Frontend

React 19 + Vite + Tailwind 4 + React Router + Axios + Framer Motion + Lucide.

> Split from the complete project history
> ([shb09/portfolio-pilot](https://github.com/shb09/portfolio-pilot)).
> Backend lives in [shb09/portfolio-pilot-backend](https://github.com/shb09/portfolio-pilot-backend);
> point `VITE_API_URL` at its deployed HTTPS URL. No server secrets belong here.

## Themes

- **Paper** (default): `#F4F1E8` canvas, `#FFFEFA` surfaces, ink `#171717` type + borders, acid lime `#D7FF3F` actions, coral `#FF6B4A` emphasis.
- **Carbon** (dark): `#141412` canvas, lime-on-ink actions. Toggle in top nav / account menu / settings, persisted (`pp_theme`, `data-theme` attr), no-flash bootstrap in `index.html`.

## Flow

`/ → /login /register (two-column auth) → /dashboard (mission header, readiness meter,
lime next-step, publish, module counts, recents, missing sections) → /profile /projects
/skills /education /experience /certifications /achievements (timeline/grid/row variants,
search, sort, filters) → /preview (publish controls) → /portfolio/:username (editorial
broadsheet, fires analytics) → /analytics (bars + donut) → /settings (account, theme, link)`

## Dev

```bash
npm install
npm run dev     # :5173, /api + /portfolio proxied to localhost:8080
npm run build
```

## Prod

Set `VITE_API_URL` (backend origin) and `VITE_PUBLIC_URL` (prefix for `/portfolio/*`
if served separately); add the app origin to backend `app.cors.allowed-origins`.
Auth token + theme persist in `localStorage` (`pp_token`, `pp_user`, `pp_theme`).
