import { z } from "zod";

/** What the user tells us about their account. Validated at every entry point (UI, HTTP, MCP). */
export const BriefSchema = z.object({
  niche: z.string().trim().min(2).max(120).describe("What the account is about, e.g. 'home baking'"),
  audience: z.string().trim().min(2).max(200).describe("Who it is for, e.g. 'busy parents in Toronto'"),
  goal: z.string().trim().min(2).max(120).default("grow followers").describe("Main goal for the period"),
  tone: z.string().trim().max(80).default("friendly, direct").describe("Brand voice"),
  days: z.number().int().min(1).max(14).default(7).describe("How many days to plan (1-14)"),
  pastPosts: z.array(z.string().max(2000)).max(5).default([]).describe("Up to 5 past captions to match voice"),
});
export type Brief = z.infer<typeof BriefSchema>;

export const HooksRequestSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  niche: z.string().trim().min(2).max(120),
  count: z.number().int().min(1).max(10).default(5),
});
export type HooksRequest = z.infer<typeof HooksRequestSchema>;

export const CritiqueRequestSchema = z.object({
  caption: z.string().trim().min(1).max(2200),
  niche: z.string().trim().min(2).max(120),
});
export type CritiqueRequest = z.infer<typeof CritiqueRequestSchema>;

// ---- Model output shapes. Kept free of min/max so they translate cleanly to structured-output
// JSON Schema; counts are enforced in code after parsing.

export const PostSchema = z.object({
  day: z.number().int(),
  format: z.enum(["reel", "carousel", "single_image", "story"]),
  title: z.string(),
  hook: z.string().describe("Exact on-screen text for the first 0-1.5 seconds: max 12 words, no stage directions"),
  hookVisual: z.string().describe("What the viewer sees behind that text in the first 1.5 seconds"),
  payoff: z.string().describe("What the viewer gets by the end"),
  caption: z.string(),
  hashtags: z.array(z.string()),
  shotList: z.array(z.string()),
  qaChecklist: z.array(z.string()).describe("Checks before posting, e.g. hook frame readable on mute"),
});
export type Post = z.infer<typeof PostSchema>;

export const PlanOutputSchema = z.object({
  summary: z.string().describe("One-paragraph strategy for the period"),
  posts: z.array(PostSchema),
});
export const PlanSchema = PlanOutputSchema.extend({ mode: z.enum(["demo", "live"]) });
export type Plan = z.infer<typeof PlanSchema>;

export const HooksOutputSchema = z.object({
  hooks: z.array(z.object({ text: z.string(), visual: z.string(), why: z.string() })),
});
export type Hooks = z.infer<typeof HooksOutputSchema> & { mode: "demo" | "live" };

export const CritiqueOutputSchema = z.object({
  score: z.number().int().describe("1-10"),
  strengths: z.array(z.string()),
  fixes: z.array(z.string()),
  rewrite: z.string(),
});
export type Critique = z.infer<typeof CritiqueOutputSchema> & { mode: "demo" | "live" };
