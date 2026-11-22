import { resolveAuthMode } from "./auth-mode.mjs";
import { publishSession, sessionState } from "./session.js";
import { getSupabase, supabaseConfigured } from "./supabase-client.js";

const MOCK_KEY = "froth-dev-session";

export function authMode() {
  return resolveAuthMode({
    prod: import.meta.env.PROD,
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
    mockFlag: import.meta.env.VITE_AUTH_MOCK,
  });
}

function mockRecord(tier) {
  return {
    email: `${tier}@frothcity.test`,
    tier,
    displayName: `Test ${tier}`,
    since: new Date().toISOString(),
  };
}

function readMock() {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.email || !parsed.tier) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function signInMock(tier) {
  if (authMode() !== "mock") return;
  const record = mockRecord(tier);
  localStorage.setItem(MOCK_KEY, JSON.stringify(record));
  publishSession({ mode: "mock", ...record });
}

export function signOut() {
  if (authMode() === "mock") {
    localStorage.removeItem(MOCK_KEY);
    publishSession({ mode: "mock", tier: null, email: null, since: null, displayName: null });
    return Promise.resolve();
  }
  const supabase = getSupabase();
  if (!supabase) {
    publishSession({ mode: "off", tier: null, email: null, since: null, displayName: null });
    return Promise.resolve();
  }
  return supabase.auth.signOut().then(() => {
    publishSession({ mode: "supabase", tier: null, email: null, since: null, displayName: null });
  });
}

async function profileFor(user) {
  const supabase = getSupabase();
  const fallback = {
    email: user.email || "",
    tier: "reader",
    since: user.created_at,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || null,
  };
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from("profiles")
    .select("email, display_name, tier, created_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return fallback;
  return {
    email: data.email || fallback.email,
    tier: data.tier || "reader",
    since: data.created_at || user.created_at,
    displayName: data.display_name,
  };
}

async function publishUser(user) {
  if (!user) {
    publishSession({ mode: "supabase", tier: null, email: null, since: null, displayName: null });
    return;
  }
  const profile = await profileFor(user);
  publishSession({ mode: "supabase", ...profile });
}

export async function bootAuth() {
  const mode = authMode();
  if (mode === "mock") {
    const record = readMock();
    publishSession({
      mode: "mock",
      tier: record?.tier || null,
      email: record?.email || null,
      since: record?.since || null,
      displayName: record?.displayName || null,
    });
    return;
  }
  if (mode !== "supabase" || !supabaseConfigured()) {
    publishSession({ mode: "off", tier: null, email: null, since: null, displayName: null });
    return;
  }
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  await publishUser(data.session?.user || null);
  supabase.auth.onAuthStateChange((_event, session) => {
    publishUser(session?.user || null);
  });
}

export function redirectTarget() {
  return `${window.location.origin}/account/`;
}

export function currentSession() {
  return sessionState;
}
