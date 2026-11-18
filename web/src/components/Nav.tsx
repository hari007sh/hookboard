import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../lib/auth";
import { Logo } from "./ui";

export function Nav({ variant = "landing" }: { variant?: "landing" | "app" }) {
  const { session, signOut, enabled } = useAuth();
  const [open, setOpen] = useState(false);
  const links =
    variant === "landing"
      ? [
          ["#features", "Features"],
          ["#how", "How it works"],
          ["#embed", "Embed"],
          ["#faq", "FAQ"],
        ]
      : [];

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft md:flex" aria-label="Main">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="hover:text-ink">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <span className="hidden max-w-48 truncate text-sm text-ink-soft sm:block">{session.user.email}</span>
              {variant === "landing" && <Link to="/app" className="btn-ink py-2 text-sm">Open planner</Link>}
              <button type="button" onClick={signOut} className="btn-ghost px-3 py-2 text-sm" aria-label="Sign out">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              {enabled && <Link to="/login" className="hidden text-sm font-semibold hover:underline sm:block">Sign in</Link>}
              <Link to={enabled ? "/login" : "/app"} className="btn-ink py-2 text-sm">
                {enabled ? "Start free" : "Open planner"}
              </Link>
            </>
          )}
          {links.length > 0 && (
            <button type="button" className="rounded-lg p-2 md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          )}
        </div>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-line px-4 py-3 md:hidden" aria-label="Mobile">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 font-semibold hover:bg-white">{label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
