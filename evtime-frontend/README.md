# EV Times - Frontend

React single-page app for the EV Times news platform.

**Stack:** React 18, Vite, React Router 6, Tailwind CSS 4, TanStack Query, Axios, motion, lucide-react.

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

## Animations

Built with `motion` plus a few CSS keyframes: page transitions, scroll-reveal and staggered cards,
hero Ken Burns, sliding nav indicator, header shrink on scroll, spring dropdowns/modals, animated
counters and a reading-progress bar. Everything is wrapped in `MotionConfig reducedMotion="user"`
and a `prefers-reduced-motion` media query, so users who ask for less motion get a static UI.
Shared helpers live in `src/components/motionKit.jsx`.

## EV Assistant (chat widget)

`src/components/ChatWidget.jsx` is mounted globally. It calls `POST {VITE_API_URL}/chat` with the
last 10 messages and shows the reply (lightweight markdown, story links as chips). The conversation
is kept in `sessionStorage` (last 20 messages). Rate limiting (HTTP 429) and network errors show a
retry button. The widget needs no API key in the browser; the model is configured on the server.


## Sign in with Google

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an **OAuth client ID** of type *Web application*.
2. Under **Authorized JavaScript origins** add every address the site is served from, e.g. `http://localhost:5173` and `https://your-domain.com`.
3. Set `GOOGLE_CLIENT_ID` on the **backend** (the frontend reads it from `GET /api/auth/config`, so nothing else to configure).
4. Fill in the OAuth consent screen (app name, support email, privacy policy link `/privacy`) and publish it so any Google account can sign in.

When the backend has no client id the Google button is simply not shown.

## Going live

- **Domain placeholders:** replace `https://example.com` in `index.html` (canonical link, RSS link, default share image) and in `public/robots.txt` (Sitemap line, served by the backend at `/sitemap.xml`) with your real addresses.
- **Share links:** article share buttons point to `<API origin>/share/news/<id>`, a small page served by the backend with Open Graph tags that redirects people to the article. Set `FRONTEND_URL` on the backend to your site address.
- **Vercel / Netlify:** build command `npm run build`, output directory `dist`, environment variable `VITE_API_URL=https://<your-api-domain>/api`. `vercel.json` and `public/_redirects` already provide the single-page-app fallback.
- Add the site address to the backend `CORS_ALLOWED_ORIGINS`.
