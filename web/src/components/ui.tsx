import { Check, Copy as CopyIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { Post } from "../api";
import { FORMAT_LABEL } from "../api";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect x="7" y="2" width="18" height="28" rx="5" fill="#3D5AFE" />
        <rect x="10.5" y="8" width="11" height="3.2" rx="1.6" fill="#fff" />
        <rect x="10.5" y="13.5" width="7.5" height="3.2" rx="1.6" fill="#FFC93C" />
        <circle cx="25" cy="25" r="5" fill="#FF4F9A" stroke="#1E1530" strokeWidth="1.5" />
      </svg>
      Hookboard
    </Link>
  );
}

/** Google's "G" mark, as required on Google sign-in buttons. */
export function GoogleIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const TONES = [
  "bg-cobalt text-white",
  "bg-pink text-white",
  "bg-mint text-white",
  "bg-sun text-ink",
  "bg-tomato text-white",
];

/** A post drawn as a 9:16 phone screen with its hook as on-screen text. */
export function PhoneFrame({
  post,
  index,
  active = false,
  onClick,
  className = "",
}: {
  post: Pick<Post, "day" | "format" | "hook" | "title">;
  index: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick, "aria-expanded": active } : {})}
      className={`relative flex aspect-[9/16] w-full flex-col justify-between overflow-hidden rounded-phone border-[3px] border-ink p-3.5 text-left shadow-sticker transition ${TONES[index % TONES.length]} ${active ? "-translate-y-1.5 ring-4 ring-sun" : ""} ${onClick ? "cursor-pointer hover:-translate-y-1" : ""} ${className}`}
    >
      <span className="mx-auto h-1.5 w-10 rounded-full bg-current opacity-30" aria-hidden="true" />
      <span className="font-display text-[1.05rem] leading-[1.15] font-extrabold [text-wrap:balance] line-clamp-6">{post.hook}</span>
      <span className="flex flex-col items-start gap-1.5 text-xs font-semibold">
        {post.title && <span className="line-clamp-2 opacity-90">{post.title}</span>}
        <span className="rounded-full bg-white/25 px-2 py-0.5">
          Day {post.day} · {FORMAT_LABEL[post.format]}
        </span>
      </span>
    </Tag>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-lg border-2 border-line bg-white px-2 py-0.5 text-xs font-semibold text-ink hover:border-ink"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {done ? <Check className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      {done ? "Copied" : label}
    </button>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <Logo className="text-ink" />
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/app" className="hover:text-ink">Open the planner</Link>
          <a href="/#embed" className="hover:text-ink">Embed widget</a>
          <a href="/#mcp" className="hover:text-ink">Use with Claude</a>
          <a href="/#faq" className="hover:text-ink">FAQ</a>
          <Link to="/privacy" className="hover:text-ink">Privacy</Link>
          <Link to="/terms" className="hover:text-ink">Terms</Link>
        </nav>
        <p>Built with Claude · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
