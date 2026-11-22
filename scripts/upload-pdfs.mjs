import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function readEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    const match = text.match(new RegExp(`^${name}=(.*)$`, "m"));
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

const url = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  console.error("Then run this again to upload private/downloads into the reports bucket.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const dir = resolve("private/downloads");
const files = readdirSync(dir).filter((name) => name.endsWith(".pdf"));
for (const name of files) {
  const body = readFileSync(resolve(dir, name));
  const { error } = await supabase.storage.from("reports").upload(name, body, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) {
    console.error(`${name}: ${error.message}`);
    process.exit(1);
  }
  console.log(`Uploaded ${name}`);
}
