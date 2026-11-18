import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleId {
  initialize(config: Record<string, unknown>): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
  prompt(): void;
  cancel(): void;
}
declare global {
  interface Window { google?: { accounts: { id: GoogleId } } }
}

let loader: Promise<GoogleId> | null = null;
function loadGsi(): Promise<GoogleId> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.onload = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error("Google sign-in failed to load")));
    s.onerror = () => reject(new Error("Google sign-in failed to load"));
    document.head.appendChild(s);
  });
  return loader;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const googleButtonAvailable = Boolean(CLIENT_ID && supabase);

/**
 * Google's own "Sign in with Google" button (Google Identity Services). Google shows *this site* on its
 * consent screen, then we hand the ID token to Supabase with signInWithIdToken. A nonce binds the token
 * to this sign-in attempt: Google gets the SHA-256 hash, Supabase gets the raw value to compare.
 */
export function GoogleSignInButton({ onError, oneTap = false }: { onError?: (msg: string) => void; oneTap?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !supabase || !el.current) return;
    let cancelled = false;
    const rawNonce = crypto.randomUUID() + crypto.randomUUID();

    (async () => {
      try {
        const gsi = await loadGsi();
        const hashed = await sha256Hex(rawNonce);
        if (cancelled || !el.current) return;
        gsi.initialize({
          client_id: CLIENT_ID,
          nonce: hashed,
          use_fedcm_for_prompt: true,
          itp_support: true,
          callback: async ({ credential }: { credential: string }) => {
            const { error } = await supabase!.auth.signInWithIdToken({ provider: "google", token: credential, nonce: rawNonce });
            if (error) onError?.(error.message);
          },
        });
        gsi.renderButton(el.current, { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: 320, logo_alignment: "left" });
        if (oneTap) gsi.prompt();
      } catch (e) {
        setFailed(true);
        onError?.(e instanceof Error ? e.message : "Google sign-in failed to load");
      }
    })();

    return () => {
      cancelled = true;
      window.google?.accounts?.id?.cancel();
    };
  }, [oneTap, onError]);

  if (failed) return null;
  return <div ref={el} className="flex min-h-11 justify-center" />;
}
