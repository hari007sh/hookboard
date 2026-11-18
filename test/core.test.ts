import { describe, expect, it, vi } from "vitest";
import { createPlanner, type Generator } from "../src/core/planner.js";
import { BriefSchema, PlanSchema } from "../src/core/schemas.js";

const brief = BriefSchema.parse({
  niche: "home baking",
  audience: "busy parents in Toronto",
  goal: "grow followers",
  tone: "warm, playful",
  days: 7,
});

describe("BriefSchema", () => {
  it("rejects an empty niche and out-of-range days", () => {
    expect(BriefSchema.safeParse({ ...brief, niche: "" }).success).toBe(false);
    expect(BriefSchema.safeParse({ ...brief, days: 40 }).success).toBe(false);
  });

  it("defaults days to 7", () => {
    const { days, ...rest } = brief;
    expect(BriefSchema.parse(rest).days).toBe(7);
  });
});

describe("demo mode", () => {
  const planner = createPlanner({ demo: true });

  it("plans one post per requested day, each with 5-10 hashtags", async () => {
    const plan = await planner.planWeek({ ...brief, days: 14 });
    expect(PlanSchema.parse(plan).posts).toHaveLength(14);
    for (const post of plan.posts) {
      expect(post.hashtags.length).toBeGreaterThanOrEqual(5);
      expect(post.hashtags.length).toBeLessThanOrEqual(10);
      expect(post.hashtags.every((h) => h.startsWith("#"))).toBe(true);
      expect(post.hook.split(/\s+/).length).toBeLessThanOrEqual(12);
      expect(post.hookVisual.length).toBeGreaterThan(0);
    }
    expect(plan.mode).toBe("demo");
  });

  it("is deterministic for the same brief", async () => {
    expect(await planner.planWeek(brief)).toEqual(await planner.planWeek(brief));
  });

  it("writes the requested number of hooks and critiques captions", async () => {
    const hooks = await planner.writeHooks({ topic: "sourdough fails", niche: "home baking", count: 4 });
    expect(hooks.hooks).toHaveLength(4);
    const critique = await planner.critiqueCaption({ caption: "new bread today", niche: "home baking" });
    expect(critique.score).toBeGreaterThanOrEqual(1);
    expect(critique.score).toBeLessThanOrEqual(10);
    expect(critique.rewrite.length).toBeGreaterThan(0);
  });
});

describe("live mode", () => {
  it("sends the brief to the generator and normalises hashtags", async () => {
    const generate: Generator = vi.fn(async () => ({
      summary: "s",
      posts: [
        {
          day: 1,
          format: "reel",
          title: "t",
          hook: "h",
          hookVisual: "v",
          payoff: "p",
          caption: "c",
          hashtags: ["baking", "#Sourdough", "baking", "toronto", "bread", "homebaker", "kitchen"],
          shotList: ["a"],
          qaChecklist: ["b"],
        },
      ],
    })) as Generator;
    const planner = createPlanner({ generate });
    const plan = await planner.planWeek({ ...brief, days: 1 });

    const [, , user] = (generate as any).mock.calls[0];
    expect(user).toContain("home baking");
    expect(user).toContain("busy parents in Toronto");
    expect(plan.mode).toBe("live");
    // de-duplicated, '#'-prefixed, lower-cased, capped at 10
    expect(plan.posts[0].hashtags).toEqual(["#baking", "#sourdough", "#toronto", "#bread", "#homebaker", "#kitchen"]);
  });

  it("tells the model not to invent facts and to keep hooks short", async () => {
    const generate = vi.fn(async () => ({ score: 5, strengths: [], fixes: [], rewrite: "r" })) as unknown as Generator;
    await createPlanner({ generate }).critiqueCaption({ caption: "new bread", niche: "baking" });
    const [, system] = (generate as any).mock.calls[0];
    expect(system).toMatch(/Never invent facts/);
    expect(system).toMatch(/12 words or fewer/);
  });

  it("fails loudly when the model returns the wrong number of posts", async () => {
    const generate: Generator = async () => ({ summary: "s", posts: [] }) as any;
    await expect(createPlanner({ generate }).planWeek(brief)).rejects.toThrow(/expected 7 posts/);
  });
});
