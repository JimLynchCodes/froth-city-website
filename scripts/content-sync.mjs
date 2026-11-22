import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function readEnv(name) {
  if (process.env[name]) return process.env[name];
  const file = resolve(process.cwd(), ".env.local");
  try {
    const text = readFileSync(file, "utf8");
    const match = text.match(new RegExp(`^${name}=(.*)$`, "m"));
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

const url = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment or .env.local.");
  console.error("The service role key stays off Netlify and out of any VITE_ variable.");
  process.exit(1);
}

const reports = JSON.parse(readFileSync(resolve("src/data/reports.json"), "utf8"));
const weekly = JSON.parse(readFileSync(resolve("src/data/weekly-5-5.json"), "utf8"));
const supabase = createClient(url, key, { auth: { persistSession: false } });

const reportRows = reports.map((report) => ({
  slug: report.slug,
  title: report.title,
  ticker: report.ticker,
  tickers: report.tickers,
  industry: report.industry,
  direction: report.direction,
  published_on: report.published,
  pdf_path: report.pdfPath,
  pdf_filename: report.pdfFilename,
  href: report.href,
}));

const weekRows = [];
for (const week of weekly.weeks) {
  for (const side of ["long", "short"]) {
    (week[side] || []).forEach((item, index) => {
      weekRows.push({
        week_of: week.weekOf,
        side,
        position: index + 1,
        sector: item.sector,
        etf: item.etf || null,
        tickers: item.tickers || [],
        thesis: item.thesis,
        report_href: item.report || null,
        example: Boolean(week.example),
      });
    });
  }
}

const { error: clearWeeks } = await supabase.from("weekly_5_5").delete().not("id", "is", null);
if (clearWeeks) {
  console.error(clearWeeks.message);
  process.exit(1);
}
const { error: weekError } = await supabase.from("weekly_5_5").insert(weekRows);
if (weekError) {
  console.error(weekError.message);
  process.exit(1);
}
const { error: reportError } = await supabase.from("reports").upsert(reportRows);
if (reportError) {
  console.error(reportError.message);
  process.exit(1);
}
const slugs = reports.map((report) => report.slug);
const { data: existing, error: listError } = await supabase.from("reports").select("slug");
if (listError) {
  console.error(listError.message);
  process.exit(1);
}
const stale = (existing || []).map((row) => row.slug).filter((slug) => !slugs.includes(slug));
if (stale.length) {
  const { error: dropError } = await supabase.from("reports").delete().in("slug", stale);
  if (dropError) {
    console.error(dropError.message);
    process.exit(1);
  }
}
console.log(`Synced ${reportRows.length} reports and ${weekRows.length} weekly rows.`);
