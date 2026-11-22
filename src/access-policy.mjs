import { accessLabel, isOpen, todayISO } from "./access-dates.mjs";

export function isMember(tier) {
  return tier === "subscriber" || tier === "premium";
}

export function canRead(published, tier, today = todayISO()) {
  return isOpen(published, today) || isMember(tier);
}

export function accessText(published, tier, today = todayISO()) {
  if (isMember(tier) && !isOpen(published, today)) return "Included with your subscription";
  return accessLabel(published, today);
}

export function applyMembership(root, tier, today = todayISO()) {
  root.querySelectorAll("[data-published]").forEach((el) => {
    const iso = el.getAttribute("data-published");
    if (!iso) return;
    const open = canRead(iso, tier, today);
    const mode = el.getAttribute("data-access");
    if (mode === "closed" && el.classList.contains("member-notice")) {
      el.toggleAttribute("hidden", open);
    }
    if (mode === "open") {
      el.toggleAttribute("hidden", !open);
    }
    if (el.classList.contains("member-label")) {
      el.textContent = accessText(iso, tier, today);
      if (isMember(tier) && !isOpen(iso, today)) el.hidden = false;
    }
    if (el.hasAttribute("data-access-text")) {
      el.textContent = accessText(iso, tier, today);
    }
  });
}
