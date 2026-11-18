import { Bot, CalendarDays, ChevronDown, Code2, Film, Hash, ListChecks, MessageSquareText, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import type { Post } from "../api";
import { Footer, CopyButton, GoogleIcon, PhoneFrame } from "../components/ui";
import { Nav } from "../components/Nav";
import { useAuth } from "../lib/auth";

const HERO_POSTS: Pick<Post, "day" | "format" | "hook" | "title">[] = [
  { day: 1, format: "reel", hook: "You're proofing your dough wrong. Here's the fix.", title: "The mistake everyone makes" },
  { day: 2, format: "carousel", hook: "Sourdough in 30 seconds. Go.", title: "A 30-second how-to" },
  { day: 3, format: "reel", hook: "Day 1 vs day 30. Same oven.", title: "Before vs after" },
];

const FANNED = [
  { rotate: -8, x: 18, y: 30 },
  { rotate: 0, x: 0, y: 0 },
  { rotate: 8, x: -18, y: 30 },
];

export default function Landing() {
  const { enabled, signInWithGoogle, session } = useAuth();
  const navigate = useNavigate();
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const embedSnippet = `<script src="${origin}/widget.js" data-niche="your niche" async></script>`;
  const mcpSnippet = `claude mcp add hookboard -- npx tsx /path/to/hookboard/src/mcp/index.ts`;

  const startWithGoogle = async () => {
    if (session) return navigate("/app");
    try {
      await signInWithGoogle();
    } catch {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-dvh">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[-10%] size-[34rem] rounded-full bg-pink/20 blur-3xl" />
          <div className="absolute top-40 left-[-12%] size-[30rem] rounded-full bg-cobalt/15 blur-3xl" />
          <div className="absolute right-[30%] bottom-[-8rem] size-[22rem] rounded-full bg-sun/25 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <p className="sticker mb-6 bg-sun">
              <Sparkles className="size-4" /> Your content planner, written by Claude
            </p>
            <h1 className="text-5xl leading-[0.98] font-extrabold sm:text-6xl lg:text-7xl">
              Plan a week of Reels in about a minute.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">
              Tell Hookboard what you post about and who watches. You get a hook for the first second, a caption,
              hashtags and a shot list for every day.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {enabled && (
                <button type="button" onClick={startWithGoogle} className="btn-ghost py-3 text-base shadow-sticker">
                  <GoogleIcon /> {session ? "Open your planner" : "Continue with Google"}
                </button>
              )}
              <Link to="/app" className="btn-primary py-3 text-base">
                Try it without an account
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
              <li className="flex items-center gap-1.5"><Zap className="size-4 text-cobalt" /> 0–1.5s hooks</li>
              <li className="flex items-center gap-1.5"><Hash className="size-4 text-pink" /> 5–10 hashtags per post</li>
              <li className="flex items-center gap-1.5"><Film className="size-4 text-mint" /> Phone-ready shot lists</li>
            </ul>
          </div>

          <div className="relative mx-auto h-[24rem] w-full max-w-md sm:h-[34rem]">
            <div className="absolute inset-0 flex items-start justify-center pt-4">
              {HERO_POSTS.map((post, i) => (
                <motion.div
                  key={post.day}
                  className="w-32 shrink-0 sm:w-48"
                  style={{ zIndex: i === 1 ? 2 : 1 }}
                  initial={{ rotate: 0, x: (1 - i) * 180, y: 40, opacity: 0 }}
                  animate={{ rotate: FANNED[i].rotate, x: FANNED[i].x, y: FANNED[i].y, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.15 + i * 0.08 }}
                >
                  <PhoneFrame post={post} index={i} />
                </motion.div>
              ))}
            </div>
            <span className="sticker absolute top-0 -left-2 z-10 rotate-[-6deg] sm:left-0"><Zap className="size-4 text-cobalt" /> Hook in 1.5s</span>
            <span className="sticker absolute right-0 bottom-24 z-10 rotate-[5deg] bg-pink text-white">#sourdough #homebaker</span>
            <span className="sticker absolute bottom-6 left-6 z-10 rotate-[-3deg]"><ListChecks className="size-4 text-mint" /> Shot list ready</span>
          </div>
        </div>
      </section>

      {/* Features: bento */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <h2 className="max-w-2xl text-4xl font-extrabold sm:text-5xl">Everything a post needs, before you press record.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-6">
          <Tile className="md:col-span-4 md:row-span-2 bg-cobalt text-white" icon={<CalendarDays />} title="A full week, planned">
            <p className="max-w-md text-white/85">7 or 14 days with a mix of Reels, carousels, photos and stories, so you're never stuck on what to post.</p>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {["Stop scrolling, bakers", "3 rules I break", "Oven test: $20 vs $200", "Which crumb wins?"].map((hook, i) => (
                <PhoneFrame key={hook} index={i + 1} post={{ day: i + 1, format: i % 2 ? "carousel" : "reel", hook, title: "" }} className="shadow-none" />
              ))}
            </div>
          </Tile>
          <Tile className="md:col-span-2 bg-sun" icon={<Zap />} title="Hooks that stop the scroll">
            <p className="text-ink/80">Five takes on any topic, each with the visual and why it works.</p>
          </Tile>
          <Tile className="md:col-span-2 bg-white" icon={<Hash className="text-pink" />} title="Hashtags that fit">
            <p className="text-ink-soft">5–10 targeted tags per post, mixed between niche and mid-size.</p>
          </Tile>
          <Tile className="md:col-span-2 bg-white" icon={<MessageSquareText className="text-mint" />} title="Caption check">
            <p className="text-ink-soft">Paste a caption, get a score out of 10, fixes and a rewrite.</p>
          </Tile>
          <Tile className="md:col-span-2 bg-pink text-white" icon={<Bot />} title="Works inside Claude">
            <p className="text-white/85">Plug Hookboard into Claude Desktop or Claude Code and plan by chatting.</p>
          </Tile>
          <Tile className="md:col-span-2 bg-ink text-white" icon={<Code2 />} title="Embed on your site">
            <p className="text-white/80">A free hook generator for your blog or agency site, in one line of code.</p>
          </Tile>
        </div>
      </section>

      {/* How it works: a real sequence */}
      <section id="how" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-4xl font-extrabold sm:text-5xl">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Describe your account", "Your niche, who watches, your goal and voice. Paste a few old captions if you want it to sound like you."],
              ["Get your week", "Each day arrives as a phone screen with its hook. Open one for the caption, hashtags, shot list and checklist."],
              ["Film and post", "Copy the caption, tick the checklist, and save the plan to your account for next time."],
            ].map(([title, body], i) => (
              <li key={title} className="panel p-6">
                <span className="grid size-10 place-items-center rounded-full bg-ink font-display text-lg font-extrabold text-white">{i + 1}</span>
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-ink-soft">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Embed: live widget + snippet */}
      <section id="embed" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="text-4xl font-extrabold sm:text-5xl">Try it right here.</h2>
            <p className="mt-4 max-w-lg text-lg text-ink-soft">
              This is the embeddable hook generator, running live. Put the same box on your own site with one line:
            </p>
            <div className="mt-6 rounded-2xl bg-ink p-4 text-sm text-white">
              <div className="mb-2 flex items-center justify-between text-white/60">
                <span>HTML</span>
                <CopyButton text={embedSnippet} />
              </div>
              <code className="block overflow-x-auto whitespace-pre text-[0.8rem] leading-relaxed text-sun">{embedSnippet}</code>
            </div>
            <div id="mcp" className="mt-10 scroll-mt-20">
              <h3 className="text-2xl font-bold">Prefer chatting? Use it in Claude.</h3>
              <p className="mt-2 text-ink-soft">Hookboard is also an MCP server, so Claude can plan your week for you.</p>
              <div className="mt-4 rounded-2xl bg-white p-4 text-sm ring-1 ring-line">
                <div className="mb-2 flex items-center justify-between text-ink-soft">
                  <span>Terminal</span>
                  <CopyButton text={mcpSnippet} />
                </div>
                <code className="block overflow-x-auto whitespace-pre text-[0.8rem]">{mcpSnippet}</code>
              </div>
            </div>
          </div>
          <iframe
            title="Hookboard hook generator"
            src="/embed?niche=home%20baking"
            className="h-[27rem] w-full rounded-3xl border-[3px] border-ink bg-white shadow-sticker"
            loading="lazy"
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-4xl font-extrabold sm:text-5xl">Questions</h2>
          <div className="mt-8 divide-y divide-line">
            {[
              ["Is it free?", "Yes while it's in beta. Signed-in accounts get a generous hourly allowance. If you plan a lot, add your own Anthropic API key in the planner's settings."],
              ["Does it post to Instagram for me?", "No. Hookboard plans and writes; you stay in control of what goes live on your account."],
              ["What happens to my plans?", "Saved plans are stored in your account and only you can see them. You can delete them at any time."],
              ["Which AI writes the plans?", "Claude, by Anthropic. Every plan is checked against a strict format so each post always has a hook, caption, hashtags and shot list."],
            ].map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {q}
                  <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-ink bg-sun px-6 py-14 text-center shadow-sticker sm:px-12">
          <h2 className="mx-auto max-w-2xl text-4xl font-extrabold sm:text-5xl">Next week's posts, sorted tonight.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {enabled && (
              <button type="button" onClick={startWithGoogle} className="btn-ghost py-3 text-base">
                <GoogleIcon /> Continue with Google
              </button>
            )}
            <Link to="/app" className="btn-ink py-3 text-base">Open the planner</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Tile({ className = "", icon, title, children }: { className?: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className={`rounded-3xl border-[3px] border-ink p-6 shadow-sticker ${className}`}>
      <div className="flex items-center gap-2 [&_svg]:size-6">{icon}</div>
      <h3 className="mt-4 text-2xl font-bold">{title}</h3>
      <div className="mt-2">{children}</div>
    </article>
  );
}
