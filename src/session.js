export const sessionState = {
  mode: "off",
  tier: null,
  email: null,
  since: null,
  displayName: null,
  ready: false,
};

export function publishSession(next) {
  Object.assign(sessionState, next, { ready: true });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("froth-session"));
  }
}
