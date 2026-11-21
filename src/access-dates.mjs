const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function freeDateISO(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCMonth(date.getUTCMonth() + 1);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${mm}-${dd}`;
}

export function todayISO(date = new Date()) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function formatLong(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function isOpen(published, today = todayISO()) {
  return today >= freeDateISO(published);
}

export function accessSentence(published) {
  return `Available to members now. Free access for non-members begins ${formatLong(freeDateISO(published))}.`;
}

export function accessLabel(published, today = todayISO()) {
  return isOpen(published, today) ? "Available" : accessSentence(published);
}

function setHidden(attrs, hide) {
  const stripped = attrs.replace(/\s+hidden(?:="[^"]*"|='[^']*'|=[^\s>]+)?/gi, "");
  return hide ? `${stripped} hidden` : stripped;
}

export function stampHtml(html, today = todayISO()) {
  let next = html.replace(
    /<([a-z0-9]+)(\s[^>]*?\bdata-published="(\d{4}-\d{2}-\d{2})"[^>]*)>/gi,
    (full, tag, attrs, iso) => {
      const mode = /\bdata-access="(open|closed)"/.exec(attrs);
      let updated = attrs;
      if (mode) {
        const show = (mode[1] === "open") === isOpen(iso, today);
        updated = setHidden(attrs, !show);
      }
      return `<${tag}${updated}>`;
    },
  );

  next = next.replace(
    /(<([a-z0-9]+)\b[^>]*\bdata-access-text\b[^>]*\bdata-published="(\d{4}-\d{2}-\d{2})"[^>]*>)[\s\S]*?(<\/\2>)/gi,
    (full, open, tag, iso, close) => `${open}${accessLabel(iso, today)}${close}`,
  );
  next = next.replace(
    /(<([a-z0-9]+)\b[^>]*\bdata-published="(\d{4}-\d{2}-\d{2})"[^>]*\bdata-access-text\b[^>]*>)[\s\S]*?(<\/\2>)/gi,
    (full, open, tag, iso, close) => `${open}${accessLabel(iso, today)}${close}`,
  );

  next = next.replace(
    /data-published="(\d{4}-\d{2}-\d{2})"([\s\S]{0,500}?)<time\b([^>]*\bdata-free-date\b[^>]*)>[\s\S]*?<\/time>/gi,
    (full, iso, between, timeAttrs) => {
      const free = freeDateISO(iso);
      let attrs = timeAttrs.replace(/\sdatetime="[^"]*"/i, "");
      attrs = `${attrs} datetime="${free}"`;
      return `data-published="${iso}"${between}<time${attrs}>${formatLong(free)}</time>`;
    },
  );

  return next;
}

export function applyAccess(root = document, today = todayISO()) {
  root.querySelectorAll("[data-published]").forEach((el) => {
    const iso = el.getAttribute("data-published");
    if (!iso) return;
    const free = freeDateISO(iso);
    el.querySelectorAll("[data-free-date]").forEach((time) => {
      time.setAttribute("datetime", free);
      time.textContent = formatLong(free);
    });
    const mode = el.getAttribute("data-access");
    if (mode === "open" || mode === "closed") {
      const show = (mode === "open") === isOpen(iso, today);
      el.toggleAttribute("hidden", !show);
    }
    if (el.hasAttribute("data-access-text")) {
      el.textContent = accessLabel(iso, today);
    }
  });
}
