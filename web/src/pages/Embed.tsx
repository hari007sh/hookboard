import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { call, type Hooks } from "../api";
import { CopyButton } from "../components/ui";

/** Compact hook generator meant to live inside an iframe on other sites (see public/widget.js). */
export default function Embed() {
  const params = new URLSearchParams(window.location.search);
  const [niche, setNiche] = useState(params.get("niche") || "");
  const [topic, setTopic] = useState("");
  const [data, setData] = useState<Hooks | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);

  // Tell the host page how tall we are so the iframe can fit its content.
  useEffect(() => {
    if (!root.current || window.parent === window) return;
    const ro = new ResizeObserver(() => {
      window.parent.postMessage({ type: "hookboard:height", height: document.documentElement.scrollHeight }, "*");
    });
    ro.observe(root.current);
    return () => ro.disconnect();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setData(await call<Hooks>("hooks", { topic, niche, count: 3 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't write hooks. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={root} className="min-h-full bg-white p-5">
      <h1 className="flex items-center gap-2 text-xl font-extrabold">
        <Sparkles className="size-5 text-pink" /> Free hook generator
      </h1>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <label className="field">
          What's your video about?
          <input className="input" required minLength={2} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. sourdough that won't rise" />
        </label>
        <label className="field">
          Your niche
          <input className="input" required minLength={2} value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. home baking" />
        </label>
        <button className="btn-primary" disabled={busy}>{busy ? "Writing hooks…" : "Write 3 hooks"}</button>
      </form>
      {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
      {data && (
        <ol className="mt-5 grid gap-3">
          {data.hooks.map((h) => (
            <li key={h.text} className="rounded-2xl bg-paper p-3.5">
              <p className="font-display text-lg leading-snug font-bold">{h.text}</p>
              <p className="mt-1 text-sm text-ink-soft">{h.visual}</p>
              <div className="mt-2"><CopyButton text={h.text} /></div>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-5 text-xs text-ink-soft">
        Powered by{" "}
        <a href="/" target="_blank" rel="noopener" className="font-semibold text-ink underline">Hookboard</a>
        {data?.mode === "demo" && " · sample output"}
      </p>
    </div>
  );
}
