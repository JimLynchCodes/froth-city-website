export function resolveAuthMode({ prod, url, key, mockFlag }) {
  if (url && key) return "supabase";
  if (!prod && mockFlag !== "0" && mockFlag !== "false") return "mock";
  return "off";
}
