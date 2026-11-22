import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { buildSeed } from "../scripts/generate-seed.mjs";

const reports = JSON.parse(readFileSync(new URL("../src/data/reports.json", import.meta.url)));
const weekly = JSON.parse(readFileSync(new URL("../src/data/weekly-5-5.json", import.meta.url)));

test("seed.sql is generated from the static catalog", () => {
  const seed = readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");
  assert.equal(seed, buildSeed());
});

test("every report page cites the catalog date and pdf", () => {
  for (const report of reports) {
    const html = readFileSync(new URL(`../reports/${report.slug}/index.html`, import.meta.url), "utf8");
    assert.match(html, new RegExp(`datetime="${report.published}"`));
    assert.match(html, new RegExp(`data-pdf="/downloads/${report.pdfPath}"`));
    assert.equal(readdirSync(new URL("../private/downloads/", import.meta.url)).includes(report.pdfPath), true);
  }
});

test("the weekly file is the November 23 sector list", () => {
  assert.equal(weekly.weeks.length, 1);
  const week = weekly.weeks[0];
  assert.equal(week.weekOf, "2026-11-23");
  assert.equal(week.example, false);
  assert.deepEqual(
    week.long.map((item) => item.sector),
    ["Memory", "Safety / low volatility", "Healthcare", "Financials", "Bonds / cash-like"],
  );
  assert.deepEqual(
    week.short.map((item) => item.sector),
    ["Data center buildout", "Crypto miners turned AI data centers", "Hyperscalers", "Autos", "Housing tech"],
  );
  assert.deepEqual(week.long[0].tickers, ["KMEM", "MU", "SNDK", "SK Hynix"]);
  assert.equal(week.long[0].report, "/reports/memory/");
  assert.equal(week.short[0].report, "/reports/coreweave/");
  assert.equal(week.short[2].report, "/reports/oracle/");
  assert.equal(week.short[3].report, "/reports/lucid/");
  assert.equal(JSON.stringify(week).toLowerCase().includes("boost"), false);
  assert.equal(JSON.stringify(week).includes("\u2014") || JSON.stringify(week).includes("\u2013"), false);
});

test("new account and weekly copy has no em dash", () => {
  const files = [
    "../login/index.html",
    "../account/index.html",
    "../weekly-5-5/index.html",
    "../README.md",
    "../src/pages.js",
    "../src/weekly.js",
    "../supabase/migrations/20261122150000_accounts.sql",
  ];
  for (const file of files) {
    const text = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.equal(text.includes("\u2014") || text.includes("\u2013"), false, file);
  }
});
