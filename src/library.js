import { authMode } from "./auth.js";
import { getSupabase } from "./supabase-client.js";

export function usesSignedPdf() {
  return authMode() === "supabase";
}

export async function signedPdfUrl(publicPath) {
  const name = String(publicPath || "").replace(/^\/downloads\//, "").split("?")[0];
  if (!name || name.includes("/") || name.includes("..")) {
    throw new Error("That PDF path is not valid.");
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error("The research library is not configured.");
  const { data, error } = await supabase.storage.from("reports").createSignedUrl(name, 120);
  if (error || !data?.signedUrl) {
    throw new Error("This PDF is not available to this account yet.");
  }
  return data.signedUrl;
}
