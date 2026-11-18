import type { Brief, CritiqueRequest, HooksRequest, Post } from "./schemas.js";

/** Deterministic sample output so the product works (and demos) with no API key. */

const FORMATS: Post["format"][] = ["reel", "carousel", "reel", "single_image", "reel", "story", "carousel"];
const ANGLES = [
  "the mistake everyone makes",
  "a 30-second how-to",
  "before vs after",
  "a myth, busted",
  "behind the scenes",
  "a quick poll",
  "the 3 things I wish I knew",
];

const HOOKS = [
  (n: string) => `You're doing ${n} wrong. Here's the fix.`,
  (n: string) => `${capitalise(n)} in 30 seconds. Go.`,
  () => `Day 1 vs day 30. Same person.`,
  (n: string) => `The ${n} "rule" you can ignore`,
  () => `What it really looks like before I post`,
  (n: string) => `Quick one: which do you pick? (${n})`,
  (n: string) => `3 things I wish I knew before starting ${n}`,
];

const slug =(s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

export function demoPosts(brief: Brief): Post[] {
  const niche = slug(brief.niche) || "creator";
  return Array.from({ length: brief.days }, (_, i) => {
    const angle = ANGLES[i % ANGLES.length];
    return {
      day: i + 1,
      format: FORMATS[i % FORMATS.length],
      title: `${brief.niche}: ${angle}`,
      hook: HOOKS[i % HOOKS.length](brief.niche),
      hookVisual: "Close-up of your hands mid-action, bold text in the top third",
      payoff: `One clear takeaway about ${angle} that ${brief.audience} can use today`,
      caption: `${capitalise(angle)} — made for ${brief.audience}. Save this for later and tell me your version below.`,
      hashtags: [`#${niche}`, `#${niche}tips`, "#reels", "#howto", "#smallcreator", "#dailytips"],
      shotList: ["Close-up hook shot (0-1.5s)", "Main step or reveal", "Face-to-camera takeaway", "End card with CTA"],
      qaChecklist: ["Hook text readable on mute", "Under 30 seconds", "Subtitles on", "CTA in caption"],
    };
  });
}

export function demoSummary(brief: Brief): string {
  return `Demo plan (no API key set). ${brief.days} days for ${brief.audience}, focused on "${brief.goal}" in a ${brief.tone} voice: mix short reels for reach with carousels for saves.`;
}

export function demoHooks(req: HooksRequest) {
  const templates = [
    (t: string) => `Nobody talks about this part of ${t}`,
    (t: string) => `I tried ${t} so you don't have to`,
    (t: string) => `3 seconds that will change how you see ${t}`,
    (t: string) => `The ${t} mistake I made for years`,
    (t: string) => `Watch this before you try ${t}`,
  ];
  return {
    hooks: Array.from({ length: req.count }, (_, i) => ({
      text: templates[i % templates.length](req.topic),
      visual: "Tight close-up with bold caption text in the top third",
      why: "Opens a curiosity gap in the first second",
    })),
  };
}

export function demoCritique(req: CritiqueRequest) {
  const short = req.caption.length < 60;
  return {
    score: short ? 4 : 6,
    strengths: ["Clear topic"],
    fixes: [
      "Open with a line that makes people stop, not a description",
      "Add a single call to action (save, share or comment)",
      ...(short ? ["Add one sentence of value or story"] : []),
    ],
    rewrite: `Most people get ${req.niche} wrong. ${req.caption.trim()} — save this for your next try and tell me how it goes.`,
  };
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
