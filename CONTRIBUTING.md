# Contributing to EV Times

## Workflow

1. **Open an issue** describing the bug or feature (use the templates).
2. **Create a branch** from `main`: `feat/<topic>`, `fix/<topic>` or `chore/<topic>`.
3. Make small, focused commits using [Conventional Commits](https://www.conventionalcommits.org/):
   `feat(news): add related stories`, `fix(auth): return 401 on bad login`.
4. **Open a pull request** that references the issue (`Closes #12`). CI must pass.
5. Merge after review. Delete the branch.

## Running checks locally

```bash
# backend
cd evtime-backend && ./gradlew test

# frontend
cd evtime-frontend && npm run lint && npm run build
```

## Rules

- Never commit secrets (`.env`, passwords, API keys). Use environment variables.
- Validate all input on the backend, even if the frontend also validates it.
- Add or update tests when you change backend behaviour.
- Keep pull requests small enough to review in one sitting.
