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

Engineering/public profile facts live in:

```text
src/profile-data.js
```

Curated user-approved personal context extracted from Mahdi's own Telegram exports and explicit statements lives in:

```text
src/telegram-profile.js
```

`profile-data.js` covers identity, education, engineering stack, projects, tools, and working methods. `telegram-profile.js` covers approved biography facts, alias origins, writing, music taste, non-engineering interests, recurring intellectual themes, and conversational style.

The Worker intentionally uses curated summaries instead of injecting raw Telegram exports. This keeps the prompt smaller and avoids treating one-off moods, relationship details, forwarded material, or private third-party information as permanent profile facts.

Future verified public engineering facts can be appended to `PROFILE_EXTENSIONS`. Future personal/channel-derived data should be added as a curated section to `telegram-profile.js` with the same privacy boundary.

The assistant may use general model knowledge for ordinary conversation and technical discussion. Mahdi-specific identity, background, project, preference, contact, alias, interest, and personal facts must stay grounded in the two verified context layers.

## Automatic deployment

`.github/workflows/deploy-profile-ai.yml` deploys the Worker, performs a live `/health` + `/api/chat` smoke test, and writes the resulting `/api/chat` URL into `js/ai-config.js`.

Repository secrets required:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The workflow trims/validates the account ID before deployment. If credentials are missing, deployment is skipped and the site continues using its local profile engine.
