import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env.local");
const text = existsSync(envFile) ? readFileSync(envFile, "utf8") : "";
const has = (name) => new RegExp(`^${name}=.+`, "m").test(text);

if (!has("VITE_SUPABASE_URL") || !has("VITE_SUPABASE_ANON_KEY")) {
  console.error("Supabase is not configured in .env.local.");
  console.error("Run npx supabase start, copy the API URL and anon key into .env.local, then try again.");
  console.error("See .env.example and the README section Going live with Supabase.");
  process.exit(1);
}

const child = spawn("npx", ["vite"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
