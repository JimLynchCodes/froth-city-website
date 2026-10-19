const FREE_DELAY_DAYS = 30;
const DAY = 86_400_000;

function freeAvailableDate(iso) {
  return new Date(new Date(`${iso}T00:00:00Z`).getTime() + FREE_DELAY_DAYS * DAY);
}

function fmtDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function initGates() {
  document.querySelectorAll("[data-published]").forEach((panel) => {
    const published = panel.getAttribute("data-published");
    const pdf = panel.getAttribute("data-pdf");
    const filename = panel.getAttribute("data-filename");
    if (!published || !pdf || !filename) return;

    const freeOn = freeAvailableDate(published);
    const isFree = Date.now() >= freeOn.getTime();
    const pending = panel.querySelector("[data-pending]");
    const freeEl = panel.querySelector("[data-free]");
    const lockedEl = panel.querySelector("[data-locked]");
    if (pending) pending.hidden = true;

    if (isFree && freeEl) {
      freeEl.hidden = false;
      const box = freeEl.querySelector("[data-agree]");
      const link = freeEl.querySelector("[data-download]");
      const sync = () => {
        const agreed = Boolean(box && box.checked);
        if (!link) return;
        if (agreed) {
          link.href = pdf;
          link.setAttribute("download", filename);
          link.classList.remove("is-disabled");
          link.removeAttribute("aria-disabled");
        } else {
          link.removeAttribute("href");
          link.removeAttribute("download");
          link.classList.add("is-disabled");
          link.setAttribute("aria-disabled", "true");
        }
      };
      box?.addEventListener("change", sync);
      link?.addEventListener("click", (event) => {
        if (!box || !box.checked) event.preventDefault();
      });
      sync();
      return;
    }

    if (lockedEl) {
      const slot = lockedEl.querySelector("[data-free-on]");
      if (slot) slot.textContent = fmtDate(freeOn);
      lockedEl.hidden = false;
    }
  });
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

initGates();
initMenus();
initYear();
initHeader();
