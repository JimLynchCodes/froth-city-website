function initDownloads() {
  document.querySelectorAll("[data-pdf]").forEach((panel) => {
    const pdf = panel.getAttribute("data-pdf");
    const filename = panel.getAttribute("data-filename");
    const box = panel.querySelector("[data-agree]");
    const link = panel.querySelector("[data-download]");
    if (!pdf || !filename || !box || !link) return;

    const sync = () => {
      const agreed = box.checked;
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

    box.addEventListener("change", sync);
    link.addEventListener("click", (event) => {
      if (!box.checked) event.preventDefault();
    });
    sync();
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

initDownloads();
initMenus();
initYear();
initHeader();
