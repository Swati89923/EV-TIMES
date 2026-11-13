# EV Times

A news website for electric-vehicle coverage: batteries, charging infrastructure, policy, markets and reviews.

### 🌐 Live site: **https://evtimes.vercel.app**

API: https://api-production-3f76d453.up.railway.app (health: `/actuator/health`)

| Layer    | Stack |
|----------|-------|
| Frontend | React 18, Vite, React Router, Tailwind CSS, TanStack Query, Axios |
| Backend  | Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA, Bean Validation, springdoc (Swagger) |
| Database | MySQL (H2 in-memory for local development and tests) |

## Features

- Front page with featured story, latest news, most-read list, category sections and search
- Article pages with related stories, read time, sharing and bookmarks
- Sign up / log in with JWT; roles `USER`, `EDITOR`, `ADMIN`
- Editor dashboard to write, edit and delete articles and upload images
- Dark mode, responsive layout

## Repository layout

```
evtime-backend/    Spring Boot REST API
evtime-frontend/   React single-page app
docker-compose.yml MySQL + API for local use
.github/           CI workflow, issue and PR templates
```

## Run locally

### 1. Backend (no MySQL needed)

```bash
cd evtime-backend
SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
```

PowerShell: `$env:SPRING_PROFILES_ACTIVE="dev"; ./gradlew bootRun`

The `dev` profile uses an in-memory database, inserts sample articles and creates an admin
`admin@evtimes.dev` / `Admin@12345` (development only). The API runs on <http://localhost:8080>;
interactive docs are at <http://localhost:8080/swagger-ui.html>.

### 2. Frontend

```bash
cd evtime-frontend
cp .env.example .env      # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev               # http://localhost:5173
```

### With Docker (MySQL + API)

```bash
cp .env.example .env      # set DB_PASSWORD and JWT_SECRET
docker compose up --build
```

## Configuration

All backend settings are environment variables; nothing secret lives in the repository.

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | yes | 32+ random characters used to sign tokens |
| `DB_URL` | prod | e.g. `jdbc:mysql://host:3306/evtimesdb` |
| `DB_USERNAME` / `DB_PASSWORD` | prod | Database credentials |
| `CORS_ALLOWED_ORIGINS` | prod | Frontend URL(s), comma separated |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | optional | Creates the first admin on startup |
| `SEED_DEMO_DATA` | optional | `true` inserts sample articles into an empty database |
| `PUBLIC_BASE_URL` | optional | Public API URL used in uploaded image links |
| `UPLOAD_DIR` | optional | Where images are stored (default `uploads`) |
| `PORT` | optional | HTTP port (default `8080`) |
| `FRONTEND_URL` | prod | Public website URL, used in sitemap, RSS and share links |
| `GOOGLE_CLIENT_ID` | optional | Enables "Continue with Google" (OAuth *Web application* client; add the site URL to *Authorized JavaScript origins*) |
| `AUTH_RATE_LIMIT` / `CHAT_RATE_LIMIT` | optional | Max login attempts (per 5 min) and chat messages (per 10 min) per IP |
| `SWAGGER_ENABLED` | optional | `true` exposes API docs (off by default; on in the `dev` profile) |
| `AI_BASE_URL` | optional | OpenAI-compatible chat API for the assistant, e.g. `http://localhost:11434/v1` (Ollama), `https://api.groq.com/openai/v1`. Empty = built-in answers only |
| `AI_API_KEY` / `AI_MODEL` | optional | Key (not needed for Ollama) and model name |
| `FEEDS_ENABLED` / `FEED_SOURCES` | optional | Live news import on/off and feed list (`Name\|https://feed,...`) |

Frontend: `VITE_API_URL` – base URL of the API including `/api`.

## API overview

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/signup`, `/api/auth/login` | public |
| GET | `/api/news` (`page`, `size`, `sortBy`, `direction`, `category`, `q`) | public |
| GET | `/api/news/featured`, `/trending`, `/categories`, `/{id}`, `/{id}/related` | public |
| POST / PUT / DELETE | `/api/news`, `/api/news/{id}` | `ADMIN`, `EDITOR` |
| POST | `/api/uploads` (multipart `file`) | `ADMIN`, `EDITOR` |
| GET / POST / DELETE | `/api/bookmarks`, `/api/bookmarks/{newsId}` | logged in |
| POST | `/api/chat` | public, rate limited |
| POST | `/api/admin/feeds/refresh` | `ADMIN` |
| GET | `/api/news/latest?since=` | public |
| POST | `/api/auth/google` (Google ID token) | public |
| GET | `/sitemap.xml`, `/rss.xml`, `/share/news/{id}` | public |
| POST | `/api/newsletter/subscribe`, `/api/contact` | public, rate limited |
| GET | `/api/admin/subscribers`, `/api/admin/messages` | `ADMIN` |
| GET | `/actuator/health` | public |

Errors are JSON: `{ "status": 400, "message": "...", "errors": { "field": "..." } }`.

## Tests

```bash
cd evtime-backend && ./gradlew test
cd evtime-frontend && npm run lint && npm run build
```

## Deployment

1. **Database** – create a MySQL database (any managed provider).
2. **Backend** – deploy `evtime-backend` (the included `Dockerfile` works on Render, Railway, Fly.io, etc.). Set the environment variables above and use `/actuator/health` as the health check. Mount a persistent volume at `/app/uploads` (or set `UPLOAD_DIR`) so images survive restarts.
3. **Frontend** – deploy `evtime-frontend` to Vercel or Netlify (build `npm run build`, output `dist`) with `VITE_API_URL=https://<your-api>/api`.
4. Set `CORS_ALLOWED_ORIGINS` on the backend to the frontend URL.

## Live deployment

| Part | Host | URL |
|------|------|-----|
| Frontend | Vercel (project `evtimes`) | https://evtimes.vercel.app |
| API + MySQL | Railway (project `evtimes`) | https://api-production-3f76d453.up.railway.app |

Backend variables live in the Railway service (`api`); the frontend needs `VITE_API_URL` in Vercel. Deploy manually with `railway up` from `evtime-backend` and `vercel deploy --prod` from `evtime-frontend`, or connect the GitHub repository in each dashboard (set the root directory to `evtime-backend` / `evtime-frontend`) for automatic deploys on every merge.

## Before you publish

- [ ] Strong `JWT_SECRET`, new database password, `ADMIN_PASSWORD` changed from the development default
- [ ] `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` set to the real website address (https)
- [ ] `SEED_DEMO_DATA=false` unless you want the sample articles
- [ ] Persistent storage for `UPLOAD_DIR`, database backups enabled
- [ ] Edit the domain in `evtime-frontend/public/robots.txt`, submit `https://<api>/sitemap.xml` to Google Search Console
- [ ] Privacy Policy and Terms reviewed and adapted to your legal entity and country
- [ ] **Content sources:** imported stories show only the headline, a short summary and a link to the publisher. Before running ads or other commercial features, check each feed's terms of use (or ask the publisher for permission), and remove any source you do not have the right to use via `FEED_SOURCES`
- [ ] The database schema is managed with `ddl-auto=update`; for a larger launch move to migrations (Flyway)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
