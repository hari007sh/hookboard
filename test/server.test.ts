import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createPlanner } from "../src/core/planner.js";
import { createApp } from "../src/server/app.js";

const brief = { niche: "home baking", audience: "busy parents", days: 3 };

describe("HTTP API (demo)", () => {
  const app = createApp({ serverHasKey: false });

  it("reports demo mode on /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, mode: "demo" });
  });

  it("returns a plan", async () => {
    const res = await request(app).post("/api/plan").send(brief);
    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(3);
    expect(res.body.mode).toBe("demo");
  });

  it("returns hooks and critiques", async () => {
    const hooks = await request(app).post("/api/hooks").send({ topic: "bread", niche: "baking", count: 2 });
    expect(hooks.body.hooks).toHaveLength(2);
    const critique = await request(app).post("/api/critique").send({ caption: "hello", niche: "baking" });
    expect(critique.body.rewrite).toBeTruthy();
  });

  it("rejects invalid input with 400 and field details", async () => {
    const res = await request(app).post("/api/plan").send({ niche: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_input");
    expect(res.body.issues.length).toBeGreaterThan(0);
  });
});

describe("HTTP API (live)", () => {
  it("uses a caller-supplied key without counting it against the rate limit", async () => {
    const plannerFor = vi.fn(() => createPlanner({ demo: true }));
    const app = createApp({ serverHasKey: false, plannerFor, rateLimit: 1 });
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post("/api/plan").set("x-anthropic-key", "sk-test").send(brief);
      expect(res.status).toBe(200);
    }
    expect(plannerFor).toHaveBeenCalledWith("sk-test");
  });

  it("rate-limits requests that use the server key", async () => {
    const app = createApp({ serverHasKey: true, plannerFor: () => createPlanner({ demo: true }), anonLimit: 2 });
    expect((await request(app).post("/api/plan").send(brief)).status).toBe(200);
    expect((await request(app).post("/api/plan").send(brief)).status).toBe(200);
    const blocked = await request(app).post("/api/plan").send(brief);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe("rate_limited");
  });

  it("gives signed-in users their own, larger limit and anonymous visitors a small one", async () => {
    const app = createApp({
      serverHasKey: true,
      plannerFor: () => createPlanner({ demo: true }),
      anonLimit: 1,
      rateLimit: 3,
      verifyUser: async (token) => (token === "good" ? "user-1" : null),
    });
    expect((await request(app).post("/api/hooks").send({ topic: "x1", niche: "yy" })).status).toBe(200);
    expect((await request(app).post("/api/hooks").send({ topic: "x1", niche: "yy" })).status).toBe(429);
    for (let i = 0; i < 3; i++) {
      const ok = await request(app).post("/api/hooks").set("authorization", "Bearer good").send({ topic: "x1", niche: "yy" });
      expect(ok.status).toBe(200);
    }
    const capped = await request(app).post("/api/hooks").set("authorization", "Bearer good").send({ topic: "x1", niche: "yy" });
    expect(capped.status).toBe(429);
  });

  it("rejects a bad session token instead of silently treating it as anonymous", async () => {
    const app = createApp({ serverHasKey: true, plannerFor: () => createPlanner({ demo: true }), verifyUser: async () => null });
    const res = await request(app).post("/api/hooks").set("authorization", "Bearer bad").send({ topic: "x1", niche: "yy" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("invalid_session");
  });

  it("maps model failures to a clean error without leaking internals", async () => {
    const app = createApp({
      serverHasKey: true,
      plannerFor: () =>
        createPlanner({
          generate: async () => {
            throw new Error("boom sk-secret");
          },
        }),
    });
    const res = await request(app).post("/api/plan").send(brief);
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("sk-secret");
  });
});
