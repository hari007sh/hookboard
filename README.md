# Hookboard

**Plan a week of Reels in about a minute.** → [hookboard.net](https://hookboard.net)

Hookboard plans 3–14 days of short-form posts for a creator or small business. Every post comes with a
0–1.5 s on-screen hook, the shot behind it, a payoff, a caption, 5–10 targeted hashtags, a shot list and a
pre-posting checklist. It also writes hook variants and critiques captions.

One typed core, three ways to use it:

| Surface | Entry point | For |
|---|---|---|
| Web app (React 19, Tailwind) | `web/` | creators |
| JSON HTTP API (Express) | `src/server/` | other apps and automations |
| **MCP server** (stdio) | `src/mcp/` | Claude Desktop, Claude Code, any MCP client |

## How it works

```
web app ──HTTP──▶ Express API ──┐
                                ├──▶ core planner ──▶ Claude (Anthropic API, structured outputs)
Claude Desktop ──MCP (stdio)────┘
```

- **Typed end to end:** zod schemas validate every input (web, HTTP and MCP) and define the model's output
  format through Claude structured outputs, so every response parses into the expected shape.
- **Model:** Claude Opus 5.5 by default (`HOOKBOARD_MODEL` to change). The system prompt is prompt-cached,
  and refusals fall back to another model on the server side.
- **Quality rules in the prompt:** hooks are on-screen words (≤12 words) with the visual described separately,
  and the model never invents facts about the creator. Missing details become `[placeholders]`.
- **Accounts:** Supabase Auth (Google Identity Services button + email sign-in links). Saved plans live in
  Postgres with row-level security, so users can read and delete only their own rows.
- **Cost control:** signed-in users and anonymous visitors get separate hourly limits, keyed on the real
  client IP behind Cloudflare. Users can also bring their own Anthropic key (sent per request, never stored).
- **Embeddable widget:** `<script src="https://hookboard.net/widget.js" data-niche="home baking" async></script>`
  renders a hook generator in an auto-resizing iframe on any site.

## Use it from Claude (MCP)

```bash
claude mcp add hookboard -- npx tsx /path/to/hookboard/src/mcp/index.ts
```

Tools: `plan_week`, `write_hooks`, `critique_caption`. Then ask: *"Plan 5 days of posts for my pottery studio."*

## Run locally

```bash
npm install && (cd web && npm install && npm run build)
cp .env.example .env            # add ANTHROPIC_API_KEY (+ Supabase values for accounts)
npm run server                  # http://localhost:8790; demo mode with sample output when no key is set
```

Without credentials everything still works in demo mode, which is handy for UI work and tests.

## Tests

```bash
npm test          # core planner, HTTP API (limits, auth, errors), MCP server via an in-memory MCP client
npm run typecheck
```

## Deploy

`Dockerfile` + `deploy/docker-compose.yml` run the app behind a Cloudflare Tunnel connector (no inbound ports).
Database schema: `supabase/migrations/`. Auth URLs and providers: `supabase/config.toml`.
