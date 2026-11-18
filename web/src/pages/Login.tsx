import { Mail, MailCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleIcon, Logo, PhoneFrame } from "../components/ui";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { enabled, session, signInWithGoogle, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) navigate("/app", { replace: true });
  }, [session, navigate]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await signInWithEmail(email);
      setSent(true);
    });
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <Logo />
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-4xl font-extrabold">Start planning</h1>
          <p className="mt-2 text-ink-soft">Create a free account to save your plans and get more generations.</p>

          {!enabled ? (
            <p className="mt-8 rounded-2xl bg-white p-4 text-ink-soft ring-1 ring-line">
              Accounts aren't set up on this server yet. You can still <Link to="/app" className="font-semibold text-cobalt underline">use the planner</Link>.
            </p>
          ) : sent ? (
            <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-line" role="status">
              <MailCheck className="size-7 text-mint" />
              <p className="mt-3 font-semibold">Check your inbox</p>
              <p className="mt-1 text-ink-soft">We sent a sign-in link to {email}. Open it on this device.</p>
              <button type="button" className="mt-4 text-sm font-semibold text-cobalt underline" onClick={() => setSent(false)}>
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <button type="button" disabled={busy} onClick={() => run(signInWithGoogle)} className="btn-ghost mt-8 w-full py-3 text-base shadow-sticker">
                <GoogleIcon /> Continue with Google
              </button>
              <div className="my-6 flex items-center gap-3 text-sm text-ink-soft">
                <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
              </div>
              <form onSubmit={submitEmail} className="grid gap-3">
                <label className="field">
                  Email
                  <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </label>
                <button className="btn-primary w-full py-3" disabled={busy}>
                  <Mail className="size-4" /> Email me a sign-in link
                </button>
              </form>
            </>
          )}
          {error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}
          <p className="mt-6 text-xs text-ink-soft">
            By continuing you agree to the <Link to="/terms" className="underline">Terms</Link> and{" "}
            <Link to="/privacy" className="underline">Privacy policy</Link>.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            Just looking? <Link to="/app" className="font-semibold text-ink underline">Try it without an account</Link>
          </p>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden border-l-[3px] border-ink bg-cobalt lg:block" aria-hidden="true">
        <div className="absolute inset-0 grid grid-cols-3 gap-5 p-10 opacity-95 [transform:rotate(-8deg)_scale(1.25)]">
          {[
            "Nobody tells you this about lamination",
            "3 seconds to a better crumb",
            "I tested 4 flours so you don't have to",
            "The proofing myth, busted",
            "What 5am bake days really look like",
            "Which loaf wins? Vote below",
            "Stop scoring your bread like this",
            "Day 1 vs day 30",
            "My $4 bread hack",
          ].map((hook, i) => (
            <PhoneFrame key={hook} index={i + 1} post={{ day: i + 1, format: "reel", hook, title: "" }} />
          ))}
        </div>
      </aside>
    </div>
  );
}
