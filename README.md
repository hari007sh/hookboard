# Hookboard

Plan a week of Reels and posts for a small creator or small business in about a minute. Every post
comes with a 0–1.5s visual hook, payoff, caption, 5–10 targeted hashtags, shot list and a
before-you-post checklist. It also writes hook variants and critiques captions.

One core, three ways to use it:

| Surface | Entry point | Who it's for |
|---|---|---|
| Web app (React + Vite) | `web/` | Creators |
| JSON HTTP API (Express) | `src/server/` | Other apps / automations |
| MCP server (stdio) | `src/mcp/` | Claude Desktop, Claude Code, any MCP client |

## How it works

```
web UI ──HTTP──▶ Express API ──┐
                               ├──▶ core planner ──▶ Claude (Messages API, structured outputs)
Claude Desktop ──MCP stdio─────┘        │
                                         └──▶ demo mode (no key: deterministic sample output)
```

- **Typed end to end:** zod schemas validate every input (UI, HTTP and MCP) and define the
  model's output format, using Claude structured outputs, so responses always parse.
- **Model:** `claude-opus-5-5` by default (override with `HOOKBOARD_MODEL`), with the
  system prompt prompt-cached and server-side refusal fallback turned on.
- **Cost control:** visitors can bring their own Anthropic key (sent per request in
  `x-anthropic-key`, never stored on the server). Requests on the server's key are rate-limited per IP
  (`HOOKBOARD_RATE_LIMIT`, default 20/hour).
- **Prompt-injection hygiene:** pasted captions are wrapped in tags and treated as data.
- **Errors:** invalid input → 400 with field details; model or auth failures map to clear messages with
  no internals leaked.

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page: hero, feature bento, how it works, live embedded widget, FAQ |
| `/login` | Google sign-in or emailed sign-in link (Supabase Auth) |
| `/app` | Planner: plan / hooks / caption check / saved plans / settings (own API key) |
| `/embed` + `/widget.js` | Embeddable hook generator: `<script src="https://YOUR-HOST/widget.js" data-niche="home baking" async></script>` |

## Accounts (Supabase)

Project `Hookboard` (ca-central-1). Table `public.plans` with row-level security: users can only
read, insert and delete their own rows. The API verifies Supabase sessions to give signed-in users their own
rate limit (`HOOKBOARD_RATE_LIMIT`, default 20/hour) and anonymous visitors a small one
(`HOOKBOARD_ANON_LIMIT`, default 3/hour).

Config lives in `.env` (server) and `web/.env.local` (browser); see the `.env.example` files.

**One-time dashboard setup** (Supabase → Authentication):
1. **URL Configuration:** set Site URL to your deployed URL and add redirect URLs
   `http://localhost:8790/**` and `http://localhost:5173/**`.
2. **Google:** in Google Cloud Console → APIs & Services → Credentials, create an OAuth client ID
   (Web application) with authorized redirect URI
   `https://knzchmnyjxoemelagqrj.supabase.co/auth/v1/callback`. Paste its client ID and secret into
   Supabase → Authentication → Sign In / Providers → Google, and enable it.
3. **Email links** work out of the box on Supabase's built-in mailer (a few emails per hour);
   add your own SMTP before launch.

## Run it

```bash
npm install && (cd web && npm install && npm run build)
npm run server            # http://localhost:8790 (demo mode without a key)
export ANTHROPIC_API_KEY=...   # live mode
```

Dev UI with hot reload: `cd web && npm run dev` (proxies `/api` to :8790).

### Use it from Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "hookboard": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/hookboard/src/mcp/index.ts"],
      "env": { "ANTHROPIC_API_KEY": "your key" }
    }
  }
}
```

Claude Code: `claude mcp add hookboard -- npx tsx /absolute/path/to/hookboard/src/mcp/index.ts`

Then ask: *"Plan 5 days of posts for my pottery studio, audience is first-time hobbyists."*

## Tests

```bash
npm test         # 20 tests: core, HTTP API, MCP (in-memory client); all offline
npm run typecheck
```

## 3-minute demo script (for a client)

1. Open the web app, press **Plan my week**. Explain demo mode, then paste a key and run it live for
   a real niche the client picks.
2. Click a phone frame to show the caption, hashtags, shot list and checklist; copy a caption.
3. Open Claude Desktop with the MCP server attached and ask it to plan a week, so they see the same
   engine driven by an agent.
4. Show `src/core/planner.ts` and the tests: one typed core, three adapters, model calls injected
   so everything is testable offline.
