# EV Times - Frontend

React single-page app for the EV Times news platform.

**Stack:** React 18, Vite, React Router 6, Tailwind CSS 4, TanStack Query, Axios, lucide-react.

## Getting started

```bash
cd evtime-frontend
cp .env.example .env     # point VITE_API_URL at the backend
npm install
npm run dev              # http://localhost:5173
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080/api` | Base URL of the backend API |

## Structure

```
src/
  api/         Axios client and endpoint helpers
  components/  Layout, article cards, shared UI
  context/     Auth, theme and toast providers
  hooks/       Bookmarks and document-title hooks
  pages/       Route pages (admin pages under pages/admin)
  utils/       Formatting helpers
```

## Features

Home with featured stories, latest news, most-read and per-section blocks; category and search pages; article pages with related stories, sharing and bookmarks; JWT login and signup; profile; admin/editor dashboard with article create, edit, delete and image upload; dark mode; responsive layout.

## Deployment

`npm run build` outputs a static site. `vercel.json` and `public/_redirects` provide the SPA fallback for Vercel and Netlify. Set `VITE_API_URL` in the host's environment settings before building.
