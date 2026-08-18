# Workers AI response hotfix

Cloudflare GLM-4.7-Flash currently returns synchronous chat output through `choices[0].message.content`. The original Worker expected `result.response`, causing valid model output to be treated as empty and returning `503 ai_unavailable`, which triggered the browser's local fallback.

The Worker now parses the current chat-completion response shape, keeps legacy fallbacks, uses `max_completion_tokens`, and has a mocked regression test in `tests/ai-worker.mjs`.
