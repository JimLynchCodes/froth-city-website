import { applyAccess } from "./access-dates.mjs";
import { applyMembership } from "./access-policy.mjs";
import { bootAuth } from "./auth.js";
import { signedPdfUrl, usesSignedPdf } from "./library.js";
import { initAccountButton, initAccountPage, initContactForm, initLoginPage } from "./pages.js";
import { sessionState } from "./session.js";
import { initWeekly } from "./weekly.js";

function initDownloads() {
  document.querySelectorAll("[data-pdf]").forEach((panel) => {
    if (panel.dataset.downloadBound === "1" || panel.hasAttribute("hidden")) return;
    const pdf = panel.getAttribute("data-pdf");
    const filename = panel.getAttribute("data-filename");
    const box = panel.querySelector("[data-agree]");
    const link = panel.querySelector("[data-download]");
    if (!pdf || !filename || !box || !link) return;
    panel.dataset.downloadBound = "1";
    let error = panel.querySelector("[data-pdf-error]");
    if (!error) {
      error = document.createElement("p");
      error.className = "form-error";
      error.setAttribute("data-pdf-error", "");
      error.hidden = true;
      panel.append(error);
    }

    const sync = () => {
      const agreed = box.checked;
      if (agreed && !usesSignedPdf()) {
        link.href = pdf;
        link.setAttribute("download", filename);
      } else {
        link.removeAttribute("href");
        link.removeAttribute("download");
      }
      link.classList.toggle("is-disabled", !agreed);
      if (agreed) link.removeAttribute("aria-disabled");
      else link.setAttribute("aria-disabled", "true");
    };

    box.addEventListener("change", sync);
    link.addEventListener("click", async (event) => {
      if (!box.checked) {
        event.preventDefault();
        return;
      }
      if (!usesSignedPdf()) return;
      event.preventDefault();
      error.hidden = true;
      try {
        const url = await signedPdfUrl(pdf);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.target = "_blank";
        anchor.rel = "noopener";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      } catch (err) {
        error.hidden = false;
        error.textContent = err instanceof Error ? err.message : "This PDF is not available to this account yet.";
      }
    });
    sync();
  });
}

function refreshAccess() {
  applyAccess(document);
  applyMembership(document, sessionState.tier);
  initDownloads();
}

function initMenus() {
  document.querySelectorAll("details.menu").forEach((menu) => {
    const summary = menu.querySelector("summary");
    summary?.addEventListener("click", (event) => {
      event.preventDefault();
      if (menu.matches(":hover") && menu.open) return;
      menu.open = !menu.open;
    });
    menu.addEventListener("mouseenter", () => {
      menu.open = true;
    });
    menu.addEventListener("mouseleave", () => {
      const active = document.activeElement;
      if (!menu.contains(active) || active === summary) menu.open = false;
    });
    menu.addEventListener("focusout", (event) => {
      if (!menu.contains(event.relatedTarget)) menu.open = false;
    });
  });

  const toggle = document.querySelector(".nav-check");
  const toggleLabel = document.querySelector(".nav-toggle .sr-only");
  toggle?.addEventListener("change", () => {
    if (toggleLabel && toggle instanceof HTMLInputElement) {
      toggleLabel.textContent = toggle.checked ? "Close navigation" : "Open navigation";
    }
  });
  document.querySelectorAll(".mobile-drawer a").forEach((link) => {
    link.addEventListener("click", () => {
      if (toggle) toggle.checked = false;
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle instanceof HTMLInputElement && toggle.checked) {
      toggle.checked = false;
    }
  });
}

function initYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });
}

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

applyAccess(document);
initDownloads();
initMenus();
initYear();
initHeader();
initAccountButton();
initLoginPage();
initAccountPage();
initContactForm();
initWeekly();
bootAuth().then(() => {
  refreshAccess();
  window.addEventListener("froth-session", refreshAccess);
});
