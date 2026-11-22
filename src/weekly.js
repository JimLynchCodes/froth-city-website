import { canRead, isMember } from "./access-policy.mjs";
import { formatLong, freeDateISO, todayISO } from "./access-dates.mjs";
import { sessionState } from "./session.js";
import { getSupabase } from "./supabase-client.js";

function entry(row) {
  return {
    sector: row.sector,
    etf: row.etf || "",
    thesis: row.thesis,
  };
}

function groupWeeks(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.weekOf;
    if (!map.has(key)) {
      map.set(key, {
        weekOf: key,
        example: Boolean(row.example),
        label: row.label || "",
        long: [],
        short: [],
      });
    }
    const week = map.get(key);
    week.example = week.example || Boolean(row.example);
    if (row.label) week.label = row.label;
    const list = row.side === "short" ? week.short : week.long;
    list.push(entry(row));
  }
  return [...map.values()].sort((a, b) => (a.weekOf < b.weekOf ? 1 : -1));
}

async function loadRemoteWeeks() {
  const supabase = getSupabase();
  const [{ data: dates, error: dateError }, { data: rows, error: rowError }] = await Promise.all([
    supabase.rpc("weekly_week_dates"),
    supabase.from("weekly_5_5").select("week_of, side, position, sector, etf, thesis, example").order("position"),
  ]);
  if (dateError) throw dateError;
  if (rowError) throw rowError;
  const merged = (rows || []).map((row) => ({
    weekOf: row.week_of,
    side: row.side,
    sector: row.sector,
    etf: row.etf,
    thesis: row.thesis,
    example: row.example,
    label: row.example ? "Example week, not a recommendation" : "",
  }));
  const known = new Set(merged.map((row) => row.weekOf));
  for (const date of dates || []) {
    if (known.has(date.week_of)) continue;
    merged.push({
      weekOf: date.week_of,
      side: "long",
      sector: "",
      etf: "",
      thesis: "",
      example: date.example,
      label: "",
      locked: true,
    });
  }
  return groupWeeks(merged).map((week) => {
    if (!week.long.some((item) => item.sector) && !week.short.some((item) => item.sector)) {
      week.long = [];
      week.short = [];
      week.locked = true;
    }
    return week;
  });
}

async function loadWeeks() {
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return loadRemoteWeeks();
  }

  const data = await import("./data/weekly-5-5.json");
  const weeks = data.default?.weeks || data.weeks || [];
  const flat = [];
  for (const week of weeks) {
    for (const side of ["long", "short"]) {
      (week[side] || []).forEach((item) => {
        flat.push({
          weekOf: week.weekOf,
          side,
          sector: item.sector,
          etf: item.etf,
          thesis: item.thesis,
          example: Boolean(week.example),
          label: week.label || "",
        });
      });
    }
  }
  return groupWeeks(flat);
}

function sectorList(items) {
  if (!items.length) {
    return `<p class="sector-empty">No sectors in this column.</p>`;
  }
  return `<ol class="sector-list">${items
    .map((item) => {
      const etf = item.etf ? `<span class="ticker">${escapeHtml(item.etf)}</span>` : "";
      return `<li><p class="sector-name">${escapeHtml(item.sector)} ${etf}</p><p>${escapeHtml(item.thesis)}</p></li>`;
    })
    .join("")}</ol>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function weekCard(week, { archive = false } = {}) {
  const when = formatLong(week.weekOf);
  if (week.locked) {
    return `<article class="week-card is-locked">
      <p class="eyebrow">${archive ? "Archive" : "Current week"}</p>
      <h3>Week of ${when}</h3>
      <p>This list is for Subscriber and Premium members. Free access for everyone else begins ${formatLong(freeDateISO(week.weekOf))}.</p>
      <a class="text-link" href="/login/">Sign in</a>
    </article>`;
  }
  const badge = week.example ? `<p class="example-flag">${escapeHtml(week.label || "Example week, not a recommendation")}</p>` : "";
  return `<article class="week-card${week.example ? " is-example" : ""}">
    ${badge}
    <p class="eyebrow">${archive ? "Archive" : week.example ? "Placeholder" : "Current week"}</p>
    <h3>Week of ${when}</h3>
    <div class="sector-cols">
      <section>
        <h4><span class="dir dir-long">Long sectors</span></h4>
        ${sectorList(week.long)}
      </section>
      <section>
        <h4><span class="dir dir-short">Short sectors</span></h4>
        ${sectorList(week.short)}
      </section>
    </div>
  </article>`;
}

export function weekView(weeks, tier, today) {
  const ordered = [...weeks].sort((a, b) => (a.weekOf < b.weekOf ? 1 : -1));
  const real = ordered.filter((week) => !week.example);
  const examples = ordered.filter((week) => week.example);
  const current = real[0] || null;
  const archive = real.slice(1);
  const gate = (week) => {
    if (!week) return null;
    if (week.example) return week;
    if (canRead(week.weekOf, tier, today)) return { ...week, locked: false };
    return { ...week, locked: true, long: [], short: [] };
  };
  return {
    current: gate(current),
    archive: archive.map((week) => gate(week)).filter(Boolean),
    example: real.length ? null : examples[0] || null,
    member: isMember(tier),
  };
}

export async function renderWeekly(root = document.querySelector("#weekly-root")) {
  if (!root) return;
  const today = todayISO();
  let weeks = [];
  try {
    weeks = await loadWeeks();
  } catch {
    root.innerHTML = `<p class="form-error">The weekly list could not be loaded. The page will show the published list again when the library responds.</p>`;
    return;
  }
  const model = weekView(weeks, sessionState.tier, today);
  const parts = [];
  if (!model.current) {
    parts.push(`<article class="week-card">
      <p class="eyebrow">Current week</p>
      <h3>No published week yet</h3>
      <p>The list goes out Monday morning: five sectors to go long and five sectors to short. A real week will replace this note.</p>
    </article>`);
  } else {
    parts.push(weekCard(model.current));
  }
  if (model.example) parts.push(weekCard(model.example));
  if (model.archive.length) {
    parts.push(`<h2 class="archive-title">Archive</h2>`);
    parts.push(model.archive.map((week) => weekCard(week, { archive: true })).join(""));
  }
  root.innerHTML = parts.join("");
}

export function initWeekly() {
  const root = document.querySelector("#weekly-root");
  if (!root) return;
  const draw = () => renderWeekly(root);
  if (sessionState.ready) draw();
  window.addEventListener("froth-session", draw);
}
