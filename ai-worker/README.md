# EKA Profile AI

Cloudflare Worker used by the PowerShell biography assistant.

## Runtime

- Workers AI binding: `AI`
- Production model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Endpoint: `POST /api/chat`
- Health: `GET /health`
- Production origin: `https://thelouismahdi.github.io`
- No model API key is shipped to the browser.

## Knowledge layout

Verified public profile facts live in:

```text
src/profile-data.js
```

`PROFILE_SECTIONS` contains structured public facts and project summaries. Future verified public facts can be appended to `PROFILE_EXTENSIONS` without rewriting the Worker prompt or request logic.

The assistant may use general model knowledge for ordinary conversation and technical discussion. Mahdi-specific identity, background, project, preference, contact, and personal facts must stay grounded in the verified profile data.

## Automatic deployment

`.github/workflows/deploy-profile-ai.yml` deploys the Worker, performs a live `/health` + `/api/chat` smoke test, and writes the resulting `/api/chat` URL into `js/ai-config.js`.

Repository secrets required:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The workflow trims/validates the account ID before deployment. If credentials are missing, deployment is skipped and the site continues using its local profile engine.
