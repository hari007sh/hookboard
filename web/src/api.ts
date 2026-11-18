import { supabase } from "./lib/supabase";

export type Format = "reel" | "carousel" | "single_image" | "story";

export interface Post {
  day: number;
  format: Format;
  title: string;
  hook: string;
  hookVisual?: string;
  payoff: string;
  caption: string;
  hashtags: string[];
  shotList: string[];
  qaChecklist: string[];
}
export interface Plan { summary: string; posts: Post[]; mode: "demo" | "live" }
export interface Hooks { hooks: { text: string; visual: string; why: string }[]; mode: "demo" | "live" }
export interface Critique { score: number; strengths: string[]; fixes: string[]; rewrite: string; mode: "demo" | "live" }
export interface SavedPlan { id: string; title: string; created_at: string; plan: Plan }

export const FORMAT_LABEL: Record<Format, string> = { reel: "Reel", carousel: "Carousel", single_image: "Photo", story: "Story" };

const KEY_STORE = "hookboard.apiKey";

export function loadKey(): string {
  try { return sessionStorage.getItem(KEY_STORE) ?? ""; } catch { return ""; }
}
export function saveKey(key: string) {
  try { if (key) sessionStorage.setItem(KEY_STORE, key); else sessionStorage.removeItem(KEY_STORE); } catch { /* storage blocked */ }
}

export async function call<T>(path: string, body: unknown, apiKey = ""): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (apiKey) headers["x-anthropic-key"] = apiKey;
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(`/api/${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data.error === "invalid_input") {
      throw new Error(data.issues.map((i: { path: string; message: string }) => `${i.path || "input"}: ${i.message}`).join("; "));
    }
    throw new Error(data.message ?? `Request failed (${res.status}).`);
  }
  return data as T;
}

export async function health(): Promise<"demo" | "live"> {
  try { return (await (await fetch("/api/health")).json()).mode; } catch { return "demo"; }
}

export async function savePlan(title: string, brief: unknown, plan: Plan) {
  if (!supabase) throw new Error("Accounts aren't set up on this server.");
  const { error } = await supabase.from("plans").insert({ title, brief, plan });
  if (error) throw new Error(error.message);
}

export async function listPlans(): Promise<SavedPlan[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("plans").select("id,title,created_at,plan").order("created_at", { ascending: false }).limit(30);
  if (error) throw new Error(error.message);
  return data as SavedPlan[];
}

export async function deletePlan(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from("plans").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
