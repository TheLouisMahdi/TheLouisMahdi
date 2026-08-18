# EKA Profile AI

Cloudflare Worker used by the PowerShell biography assistant.

## Runtime

- Workers AI binding: `AI`
- Default model: `@cf/zai-org/glm-4.7-flash`
- Endpoint: `POST /api/chat`
- Health: `GET /health`
- Production origin: `https://thelouismahdi.github.io`
- No model API key is shipped to the browser.

## Automatic deployment

`.github/workflows/deploy-profile-ai.yml` deploys the Worker and writes the resulting `/api/chat` URL into `js/ai-config.js`.

Repository secrets required:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

If they are missing, the workflow exits safely without deployment and the site continues using its local profile engine.
