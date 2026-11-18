import path from "node:path";
import { fileURLToPath } from "node:url";
import { hasServerCredentials, MODEL } from "../core/claude.js";
import { createApp } from "./app.js";
import { supabaseVerifier } from "./auth.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 8790);
const serverHasKey = hasServerCredentials();
const verifyUser = supabaseVerifier();

createApp({
  serverHasKey,
  verifyUser,
  rateLimit: Number(process.env.HOOKBOARD_RATE_LIMIT ?? 20),
  anonLimit: Number(process.env.HOOKBOARD_ANON_LIMIT ?? 3),
  staticDir: path.resolve(here, "../../web/dist"),
}).listen(port, () => {
  console.log(
    `Hookboard on http://localhost:${port} (${serverHasKey ? `live, ${MODEL}` : "demo mode"}; auth ${verifyUser ? "on" : "off"})`,
  );
});
