import Anthropic from "@anthropic-ai/sdk";
import express, { type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { ZodError } from "zod";
import { claudeGenerator, ModelError } from "../core/claude.js";
import { createPlanner, type Planner } from "../core/planner.js";

export interface AppOptions {
  /** Whether the server has its own Anthropic credentials. Without them and without a caller key, demo mode. */
  serverHasKey: boolean;
  /** Builds a planner for a request; `apiKey` is the caller's key, if any. */
  plannerFor?: (apiKey?: string) => Planner;
  /** Max server-key requests per signed-in user per hour. */
  rateLimit?: number;
  /** Max server-key requests per anonymous IP per hour (landing-page demo, embed widget). */
  anonLimit?: number;
  /** Resolves a Supabase access token to a user id, or null if invalid. */
  verifyUser?: (token: string) => Promise<string | null>;
  /** Directory with the built web UI to serve, if present. */
  staticDir?: string;
}

export function createApp(opts: AppOptions) {
  const plannerFor = opts.plannerFor ?? ((key?: string) => createPlanner({ generate: claudeGenerator(key) }));
  const demoPlanner = createPlanner({ demo: true });
  const userLimit = opts.rateLimit ?? 20;
  const anonLimit = opts.anonLimit ?? 3;
  const hits = new Map<string, { count: number; resetAt: number }>();

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "64kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, mode: opts.serverHasKey ? "live" : "demo" });
  });

  const route = (action: keyof Planner) => async (req: Request, res: Response) => {
    const header = req.header("x-anthropic-key")?.trim();
    const callerKey = header ? header : undefined;
    let planner: Planner;

    if (callerKey) {
      planner = plannerFor(callerKey);
    } else if (opts.serverHasKey) {
      const token = req.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
      // Behind Cloudflare Tunnel the socket peer is the tunnel; Cloudflare passes the visitor in cf-connecting-ip.
      const clientIp = req.header("cf-connecting-ip") ?? req.ip ?? "unknown";
      let bucket = `ip:${clientIp}`;
      let limit = anonLimit;
      if (token && opts.verifyUser) {
        const userId = await opts.verifyUser(token).catch(() => null);
        if (!userId) {
          res.status(401).json({ error: "invalid_session", message: "Your session expired. Sign in again." });
          return;
        }
        bucket = `user:${userId}`;
        limit = userLimit;
      }
      if (!allow(bucket, limit)) {
        res.status(429).json({
          error: "rate_limited",
          message: bucket.startsWith("user:")
            ? "You've hit this hour's free limit. Add your own API key in settings to keep going."
            : "Free preview limit reached. Sign in for more, or add your own API key.",
        });
        return;
      }
      planner = plannerFor();
    } else {
      planner = demoPlanner;
    }

    try {
      res.json(await planner[action](req.body));
    } catch (err) {
      sendError(res, err);
    }
  };

  app.post("/api/plan", route("planWeek"));
  app.post("/api/hooks", route("writeHooks"));
  app.post("/api/critique", route("critiqueCaption"));

  if (opts.staticDir && fs.existsSync(opts.staticDir)) {
    app.use(express.static(opts.staticDir));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(opts.staticDir!, "index.html")));
  }

  return app;

  function allow(bucket: string, limit: number): boolean {
    const now = Date.now();
    const entry = hits.get(bucket);
    if (!entry || entry.resetAt < now) {
      hits.set(bucket, { count: 1, resetAt: now + 60 * 60 * 1000 });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  }
}

function sendError(res: Response, err: unknown) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "invalid_input",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  } else if (err instanceof ModelError) {
    res.status(err.status).json({ error: "model_error", message: err.message });
  } else if (err instanceof Anthropic.AuthenticationError) {
    res.status(401).json({ error: "invalid_api_key", message: "That Anthropic API key was rejected." });
  } else if (err instanceof Anthropic.RateLimitError) {
    res.status(429).json({ error: "upstream_rate_limited", message: "Claude is busy. Try again in a minute." });
  } else {
    console.error("request failed:", err instanceof Error ? err.name : "unknown error");
    res.status(500).json({ error: "internal_error", message: "Something went wrong." });
  }
}
