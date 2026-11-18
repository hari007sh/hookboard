import type { z } from "zod";
import { demoCritique, demoHooks, demoPosts, demoSummary } from "./demo.js";
import { critiquePrompt, hooksPrompt, planPrompt, SYSTEM } from "./prompts.js";
import {
  BriefSchema,
  CritiqueOutputSchema,
  CritiqueRequestSchema,
  HooksOutputSchema,
  HooksRequestSchema,
  PlanOutputSchema,
  type Critique,
  type Hooks,
  type Plan,
} from "./schemas.js";

/** One structured model call: (output schema, system prompt, user prompt) -> parsed object. */
export type Generator = <S extends z.ZodType>(schema: S, system: string, user: string) => Promise<z.infer<S>>;

export interface PlannerOptions {
  /** Force sample output (no model calls). */
  demo?: boolean;
  /** Model call implementation; required unless demo is true. */
  generate?: Generator;
}

export interface Planner {
  planWeek(input: unknown): Promise<Plan>;
  writeHooks(input: unknown): Promise<Hooks>;
  critiqueCaption(input: unknown): Promise<Critique>;
}

export function normaliseHashtags(tags: string[]): string[] {
  const out: string[] = [];
  for (const raw of tags) {
    const tag = "#" + raw.trim().replace(/^#+/, "").replace(/\s+/g, "").toLowerCase();
    if (tag.length > 1 && !out.includes(tag)) out.push(tag);
  }
  return out.slice(0, 10);
}

export function createPlanner(opts: PlannerOptions): Planner {
  const demo = opts.demo || !opts.generate;
  const generate = opts.generate;

  return {
    async planWeek(input) {
      const brief = BriefSchema.parse(input);
      if (demo) return { summary: demoSummary(brief), posts: demoPosts(brief), mode: "demo" };

      const out = await generate!(PlanOutputSchema, SYSTEM, planPrompt(brief));
      if (out.posts.length !== brief.days) {
        throw new Error(`Model returned ${out.posts.length} posts, expected ${brief.days} posts`);
      }
      const posts = out.posts.map((p, i) => ({ ...p, day: i + 1, hashtags: normaliseHashtags(p.hashtags) }));
      return { summary: out.summary, posts, mode: "live" };
    },

    async writeHooks(input) {
      const req = HooksRequestSchema.parse(input);
      if (demo) return { ...demoHooks(req), mode: "demo" };
      const out = await generate!(HooksOutputSchema, SYSTEM, hooksPrompt(req));
      return { hooks: out.hooks.slice(0, req.count), mode: "live" };
    },

    async critiqueCaption(input) {
      const req = CritiqueRequestSchema.parse(input);
      if (demo) return { ...demoCritique(req), mode: "demo" };
      const out = await generate!(CritiqueOutputSchema, SYSTEM, critiquePrompt(req));
      return { ...out, score: Math.min(10, Math.max(1, Math.round(out.score))), mode: "live" };
    },
  };
}
