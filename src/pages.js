import { formatLong } from "./access-dates.mjs";
import { authMode, redirectTarget, signInMock, signOut } from "./auth.js";
import { sessionState } from "./session.js";
import { getSupabase } from "./supabase-client.js";

const TIER_LABEL = { reader: "Reader", subscriber: "Subscriber", premium: "Premium" };

function show(el) {
  if (el) el.hidden = false;
}

function message(el, text, ok = false) {
  if (!el) return;
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("is-ok", Boolean(ok && text));
}

function originPath(path) {
  return `${window.location.origin}${path}`;
}

export function initAccountButton() {
  const bar = document.querySelector(".site-header .bar");
  const brand = bar?.querySelector(".brand");
  if (!bar || !brand || bar.querySelector(".account-btn")) return;
  const link = document.createElement("a");
  link.className = "account-btn";
  link.href = "/login/";
  link.setAttribute("aria-label", "Sign in");
  link.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <circle cx="12" cy="8" r="3.1"></circle>
    <path d="M5.6 19.2c1.15-3.05 3.35-4.5 6.4-4.5s5.25 1.45 6.4 4.5"></path>
  </svg>`;
  const end = document.createElement("div");
  end.className = "bar-end";
  const nav = bar.querySelector(".desktop-nav");
  const toggle = bar.querySelector(".nav-toggle");
  if (nav) end.append(nav);
  end.append(link);
  if (toggle) end.append(toggle);
  bar.append(end);

  const paint = () => {
    const signedIn = Boolean(sessionState.email);
    link.href = signedIn ? "/account/" : "/login/";
    link.setAttribute("aria-label", signedIn ? "Account" : "Sign in");
  };
  paint();
  window.addEventListener("froth-session", paint);
}

export function initLoginPage() {
  const root = document.querySelector("#login-root");
  if (!root) return;
  const mode = authMode();
  const status = root.querySelector("[data-auth-status]");
  const supabasePanel = root.querySelector("[data-auth-panel='supabase']");
  const mockPanel = root.querySelector("[data-auth-panel='mock']");
  const offPanel = root.querySelector("[data-auth-panel='off']");
  const recovery = root.querySelector("[data-auth-panel='recovery']");
  const params = new URLSearchParams(window.location.search);

  if (mode === "mock") show(mockPanel);
  else if (mode === "supabase") show(supabasePanel);
  else show(offPanel);

  if (params.get("error")) {
    message(status, "Sign-in did not finish. Try again from this page.");
  }
  if (params.get("reset") === "1" && mode === "supabase") {
    message(status, "If the reset link was valid, set a new password below.", true);
    show(recovery);
  }

  if (mode === "mock") {
    mockPanel?.querySelectorAll("[data-mock-tier]").forEach((button) => {
      button.addEventListener("click", () => {
        signInMock(button.getAttribute("data-mock-tier"));
        window.location.assign("/account/");
      });
    });
  }

  const supabase = mode === "supabase" ? getSupabase() : null;
  if (supabase) {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") show(recovery);
    });
  }

  const recoveryVisit = params.get("reset") === "1" || window.location.hash.includes("type=recovery");
  const goAccountIfSignedIn = () => {
    if (sessionState.email && !recoveryVisit) window.location.replace("/account/");
  };
  window.addEventListener("froth-session", goAccountIfSignedIn);

  root.querySelector("[data-google]")?.addEventListener("click", async () => {
    message(status, "");
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTarget() },
    });
    if (error) message(status, "Google sign-in is not available yet. Check the provider setup.");
  });

  const emailForm = root.querySelector("[data-email-form]");
  emailForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabase) return;
    const form = event.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;
    const intent = event.submitter?.getAttribute("data-intent") || "sign-in";
    message(status, "");
    if (intent === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTarget() },
      });
      message(status, error ? "The sign-in link could not be sent." : "Check your email for the sign-in link.", !error);
      return;
    }
    if (intent === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: originPath("/login/?reset=1"),
      });
      message(status, error ? "The reset email could not be sent." : "Check your email for the password reset link.", !error);
      return;
    }
    if (intent === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTarget() },
      });
      if (error) {
        message(status, "The account could not be created. If you already have one, sign in instead.");
        return;
      }
      if (data.session) {
        window.location.assign("/account/");
        return;
      }
      message(status, "Check your email to confirm the account, then sign in.", true);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      message(status, "That email and password did not match an account.");
      return;
    }
    window.location.assign("/account/");
  });

  root.querySelector("[data-recovery-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabase) return;
    const password = event.currentTarget.password.value;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      message(status, "The new password was not saved. Open the reset link again.");
      return;
    }
    message(status, "Password updated.", true);
    window.location.assign("/account/");
  });
}

export function initAccountPage() {
  const root = document.querySelector("#account-root");
  if (!root) return;
  const paint = () => {
    if (!sessionState.ready) return;
    if (!sessionState.email) {
      window.location.replace("/login/");
      return;
    }
    root.hidden = false;
    const waiting = document.querySelector("[data-account-waiting]");
    if (waiting) waiting.hidden = true;
    const email = root.querySelector("[data-account-email]");
    const tier = root.querySelector("[data-account-tier]");
    const since = root.querySelector("[data-account-since]");
    if (email) email.textContent = sessionState.email;
    if (tier) tier.textContent = TIER_LABEL[sessionState.tier] || "Reader";
    if (since && sessionState.since) {
      since.textContent = formatLong(String(sessionState.since).slice(0, 10));
      since.setAttribute("datetime", String(sessionState.since).slice(0, 10));
    }
    const dev = root.querySelector("[data-account-dev]");
    if (dev) dev.hidden = sessionState.mode !== "mock";
  };
  paint();
  window.addEventListener("froth-session", paint);
  root.querySelector("[data-sign-out]")?.addEventListener("click", async () => {
    await signOut();
    window.location.assign("/login/");
  });
}

export function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const status = form.querySelector("[data-contact-status]");
  const mode = authMode();
  const note = form.querySelector("[data-contact-note]");
  if (note && mode !== "supabase") {
    note.hidden = false;
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const body = form.message.value.trim();
    if (mode !== "supabase") {
      message(status, "This form is not connected yet. Email research@frothcity.com.");
      return;
    }
    const supabase = getSupabase();
    const { error } = await supabase.from("contact_messages").insert({ name, email, message: body });
    if (error) {
      message(status, "The message was not saved. Email research@frothcity.com instead.");
      return;
    }
    form.reset();
    message(status, "Message received. We read everything.", true);
  });
}
