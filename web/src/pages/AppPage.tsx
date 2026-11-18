import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  ClipboardCheck,
  Film,
  KeyRound,
  Loader2,
  MessageSquareText,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import {
  call,
  deletePlan,
  health,
  listPlans,
  loadKey,
  savePlan,
  saveKey,
  type Critique,
  type Hooks,
  type Plan,
  type Post,
  type SavedPlan,
} from "../api";
import { Nav } from "../components/Nav";
import { CopyButton, PhoneFrame } from "../components/ui";
import { useAuth } from "../lib/auth";

type Tab = "plan" | "hooks" | "critique" | "saved" | "settings";

const TABS: { id: Tab; label: string; icon: ReactNode; needsAccount?: boolean }[] = [
  { id: "plan", label: "Plan my week", icon: <CalendarDays /> },
  { id: "hooks", label: "Write hooks", icon: <Zap /> },
  { id: "critique", label: "Check a caption", icon: <MessageSquareText /> },
  { id: "saved", label: "Saved plans", icon: <Bookmark />, needsAccount: true },
  { id: "settings", label: "Settings", icon: <Settings /> },
];

export default function AppPage() {
  const { session, enabled } = useAuth();
  const [tab, setTab] = useState<Tab>("plan");
  const [apiKey, setApiKey] = useState(loadKey);
  const [serverMode, setServerMode] = useState<"demo" | "live">("demo");
  const [opened, setOpened] = useState<Plan | null>(null);

  useEffect(() => { health().then(setServerMode); }, []);
  useEffect(() => saveKey(apiKey), [apiKey]);

  const live = Boolean(apiKey) || serverMode === "live";

  return (
    <div className="min-h-dvh">
      <Nav variant="app" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Tools" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.filter((t) => !t.needsAccount || session).map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
              className="flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left font-semibold text-ink-soft hover:bg-white aria-pressed:bg-ink aria-pressed:text-white [&_svg]:size-5"
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {!live && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-sun px-4 py-3" role="status">
              <p className="font-medium">You're seeing sample output. Add an Anthropic API key in Settings to get plans written for your account.</p>
              <button type="button" className="btn-ink py-1.5 text-sm" onClick={() => setTab("settings")}>
                <KeyRound className="size-4" /> Add key
              </button>
            </div>
          )}
          {!session && enabled && (
            <p className="mb-5 text-sm text-ink-soft">
              <Link to="/login" className="font-semibold text-cobalt underline">Sign in</Link> to save plans and get a bigger free allowance.
            </p>
          )}

          {tab === "plan" && <PlanTool apiKey={apiKey} initial={opened} />}
          {tab === "hooks" && <HooksTool apiKey={apiKey} />}
          {tab === "critique" && <CritiqueTool apiKey={apiKey} />}
          {tab === "saved" && <SavedTool onOpen={(p) => { setOpened(p); setTab("plan"); }} />}
          {tab === "settings" && <SettingsTool apiKey={apiKey} setApiKey={setApiKey} />}
        </div>
      </div>
    </div>
  );
}

function useRequest<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<T>) => {
    setBusy(true);
    setError("");
    try { setData(await fn()); } catch (e) { setError(e instanceof Error ? e.message : "Request failed."); } finally { setBusy(false); }
  };
  return { data, setData, error, busy, run };
}

function PlanTool({ apiKey, initial }: { apiKey: string; initial: Plan | null }) {
  const { session } = useAuth();
  const [form, setForm] = useState({ niche: "home baking", audience: "busy parents in Toronto", goal: "grow followers", tone: "warm, playful", days: 7, pastPosts: "" });
  const [open, setOpen] = useState<number | null>(null);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [saveError, setSaveError] = useState("");
  const { data, setData, error, busy, run } = useRequest<Plan>();

  useEffect(() => { if (initial) { setData(initial); setSaved("saved"); } }, [initial, setData]);

  const brief = () => ({ ...form, pastPosts: form.pastPosts.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).slice(0, 5) });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setOpen(null);
    setSaved("idle");
    run(() => call<Plan>("plan", brief(), apiKey));
  };
  const save = async () => {
    if (!data) return;
    setSaved("saving");
    setSaveError("");
    try {
      await savePlan(`${form.niche} · ${data.posts.length} days`, brief(), data);
      setSaved("saved");
    } catch (e) {
      setSaved("idle");
      setSaveError(e instanceof Error ? e.message : "Couldn't save the plan.");
    }
  };
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: k === "days" ? Number(e.target.value) : e.target.value });

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[300px_1fr]">
      <form onSubmit={submit} className="panel grid gap-3.5 p-5 xl:sticky xl:top-24">
        <h2 className="text-xl font-bold">Your account</h2>
        <label className="field">What you post about<input className="input" required value={form.niche} onChange={set("niche")} /></label>
        <label className="field">Who it's for<input className="input" required value={form.audience} onChange={set("audience")} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field">Goal<input className="input" value={form.goal} onChange={set("goal")} /></label>
          <label className="field">Voice<input className="input" value={form.tone} onChange={set("tone")} /></label>
        </div>
        <label className="field">
          Days to plan
          <select className="input" value={form.days} onChange={set("days")}>
            {[3, 5, 7, 10, 14].map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </label>
        <label className="field">
          Past captions (optional, blank line between each)
          <textarea className="input" rows={3} value={form.pastPosts} onChange={set("pastPosts")} />
        </label>
        <button className="btn-primary py-3" disabled={busy}>
          {busy ? <><Loader2 className="size-4 animate-spin" /> Planning…</> : <><CalendarDays className="size-4" /> Plan my week</>}
        </button>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      </form>

      <section aria-live="polite" className="min-w-0">
        {!data && !busy && (
          <div className="panel grid place-items-center gap-3 p-10 text-center">
            <Film className="size-10 text-cobalt" />
            <p className="max-w-sm text-ink-soft">Fill in your account and press <strong className="text-ink">Plan my week</strong>. Each post appears as a phone screen with its opening hook.</p>
          </div>
        )}
        {busy && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Loading">
            {Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-[9/16] animate-pulse rounded-phone bg-line" />)}
          </div>
        )}
        {data && !busy && (
          <>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-2xl text-ink-soft">{data.summary}</p>
              {session ? (
                <button type="button" className="btn-ghost py-2 text-sm" disabled={saved !== "idle"} onClick={save}>
                  {saved === "saved" ? <BookmarkCheck className="size-4 text-mint" /> : <Bookmark className="size-4" />}
                  {saved === "saved" ? "Saved" : saved === "saving" ? "Saving…" : "Save plan"}
                </button>
              ) : (
                <Link to="/login" className="btn-ghost py-2 text-sm"><Bookmark className="size-4" /> Sign in to save</Link>
              )}
            </div>
            {saveError && <p className="mb-3 text-sm text-danger" role="alert">{saveError}</p>}
            <ol className="flex snap-x gap-4 overflow-x-auto px-1 pt-2 pb-5">
              {data.posts.map((p, i) => (
                <li key={p.day} className="w-40 shrink-0 snap-start sm:w-44">
                  <PhoneFrame post={p} index={i} active={open === i} onClick={() => setOpen(open === i ? null : i)} />
                </li>
              ))}
            </ol>
            {open !== null ? <PostDetail post={data.posts[open]} /> : <p className="text-sm text-ink-soft">Tap a screen to see its caption, hashtags and shot list.</p>}
          </>
        )}
      </section>
    </div>
  );
}

function PostDetail({ post }: { post: Post }) {
  return (
    <article className="panel max-w-3xl p-6">
      <h3 className="text-2xl font-bold">Day {post.day}: {post.title}</h3>
      <dl className="mt-4 grid gap-4">
        <div>
          <dt className="font-semibold">Opening hook</dt>
          <dd className="mt-1 font-display text-xl font-bold">{post.hook}</dd>
          {post.hookVisual && <dd className="text-sm text-ink-soft">On screen: {post.hookVisual}</dd>}
        </div>
        <div><dt className="font-semibold">Payoff</dt><dd className="text-ink-soft">{post.payoff}</dd></div>
        <div>
          <dt className="flex items-center gap-2 font-semibold">Caption <CopyButton text={post.caption} /></dt>
          <dd className="mt-1 whitespace-pre-wrap">{post.caption}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 font-semibold">Hashtags <CopyButton text={post.hashtags.join(" ")} /></dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {post.hashtags.map((h) => <span key={h} className="rounded-full bg-cobalt/10 px-2.5 py-0.5 text-sm font-semibold text-cobalt">{h}</span>)}
          </dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-2 font-bold"><Film className="size-4 text-pink" /> Shot list</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5">{post.shotList.map((s) => <li key={s}>{s}</li>)}</ol>
        </div>
        <div>
          <h4 className="flex items-center gap-2 font-bold"><ClipboardCheck className="size-4 text-mint" /> Before you post</h4>
          <ul className="mt-2 space-y-1.5">
            {post.qaChecklist.map((s) => (
              <li key={s}><label className="flex items-start gap-2"><input type="checkbox" className="mt-1 accent-mint" /> {s}</label></li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function HooksTool({ apiKey }: { apiKey: string }) {
  const [topic, setTopic] = useState("sourdough that won't rise");
  const [niche, setNiche] = useState("home baking");
  const { data, error, busy, run } = useRequest<Hooks>();
  return (
    <div className="max-w-3xl">
      <form className="panel grid gap-3 p-5 sm:grid-cols-[2fr_1fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); run(() => call<Hooks>("hooks", { topic, niche, count: 5 }, apiKey)); }}>
        <label className="field">Video topic<input className="input" required value={topic} onChange={(e) => setTopic(e.target.value)} /></label>
        <label className="field">Niche<input className="input" required value={niche} onChange={(e) => setNiche(e.target.value)} /></label>
        <button className="btn-primary py-3" disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />} Write 5 hooks</button>
      </form>
      {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
      {data && (
        <ol className="mt-5 grid gap-3">
          {data.hooks.map((h, i) => (
            <li key={h.text} className="panel flex gap-4 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sun font-display font-extrabold">{i + 1}</span>
              <div className="min-w-0">
                <p className="font-display text-xl leading-snug font-bold">{h.text}</p>
                <p className="mt-1 text-sm text-ink-soft"><strong className="text-ink">On screen:</strong> {h.visual}</p>
                <p className="text-sm text-ink-soft"><strong className="text-ink">Why it works:</strong> {h.why}</p>
                <div className="mt-2"><CopyButton text={h.text} /></div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function CritiqueTool({ apiKey }: { apiKey: string }) {
  const [caption, setCaption] = useState("New bread today, came out ok I think");
  const [niche, setNiche] = useState("home baking");
  const { data, error, busy, run } = useRequest<Critique>();
  return (
    <div className="grid max-w-5xl items-start gap-6 lg:grid-cols-2">
      <form className="panel grid gap-3 p-5" onSubmit={(e) => { e.preventDefault(); run(() => call<Critique>("critique", { caption, niche }, apiKey)); }}>
        <label className="field">Caption<textarea className="input" rows={6} required value={caption} onChange={(e) => setCaption(e.target.value)} /></label>
        <label className="field">Niche<input className="input" required value={niche} onChange={(e) => setNiche(e.target.value)} /></label>
        <button className="btn-primary py-3" disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <MessageSquareText className="size-4" />} Check caption</button>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      </form>
      {data && (
        <article className="panel p-6">
          <p className="font-display text-xl"><strong className="text-6xl font-extrabold">{data.score}</strong>/10</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><h4 className="font-bold text-mint">Working</h4><ul className="mt-1 list-disc pl-5">{data.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>
            <div><h4 className="font-bold text-tomato">Fix</h4><ul className="mt-1 list-disc pl-5">{data.fixes.map((s) => <li key={s}>{s}</li>)}</ul></div>
          </div>
          <h4 className="mt-5 flex items-center gap-2 font-bold">Rewrite <CopyButton text={data.rewrite} /></h4>
          <p className="mt-1 rounded-2xl bg-paper p-4 whitespace-pre-wrap">{data.rewrite}</p>
        </article>
      )}
    </div>
  );
}

function SavedTool({ onOpen }: { onOpen: (p: Plan) => void }) {
  const [plans, setPlans] = useState<SavedPlan[] | null>(null);
  const [error, setError] = useState("");
  const load = () => listPlans().then(setPlans).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (error) return <p className="text-danger" role="alert">{error}</p>;
  if (!plans) return <Loader2 className="size-6 animate-spin text-ink-soft" />;
  if (!plans.length) return <div className="panel p-8 text-ink-soft">No saved plans yet. Plan a week, then press <strong className="text-ink">Save plan</strong>.</div>;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((p) => (
        <li key={p.id} className="panel flex flex-col gap-4 p-5">
          <div className="grid grid-cols-3 gap-2">
            {p.plan.posts.slice(0, 3).map((post, i) => <PhoneFrame key={post.day} post={post} index={i} className="text-[0.6rem] shadow-none [&_.font-display]:text-[0.7rem]" />)}
          </div>
          <div>
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-ink-soft">{new Date(p.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="mt-auto flex gap-2">
            <button type="button" className="btn-ink flex-1 py-2 text-sm" onClick={() => onOpen(p.plan)}>Open</button>
            <button type="button" className="btn-ghost px-3 py-2" aria-label={`Delete ${p.title}`} onClick={async () => { await deletePlan(p.id); load(); }}>
              <Trash2 className="size-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SettingsTool({ apiKey, setApiKey }: { apiKey: string; setApiKey: (k: string) => void }) {
  return (
    <div className="panel max-w-xl p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold"><KeyRound className="size-5" /> Your Anthropic API key</h2>
      <p className="mt-2 text-ink-soft">
        Optional. With your own key there's no hourly limit. It stays in this browser tab and is sent only with your requests; Hookboard never stores it.
      </p>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="text" name="username" autoComplete="username" value="anthropic" readOnly hidden />
        <input className="input mt-4" type="password" autoComplete="off" placeholder="sk-ant-…" value={apiKey} onChange={(e) => setApiKey(e.target.value.trim())} aria-label="Anthropic API key" />
      </form>
      {apiKey && <button type="button" className="mt-3 text-sm font-semibold text-danger underline" onClick={() => setApiKey("")}>Remove key</button>}
    </div>
  );
}
