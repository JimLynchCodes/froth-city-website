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

test("the weekly file is only a labeled example", () => {
  assert.equal(weekly.weeks.length, 1);
  assert.equal(weekly.weeks[0].example, true);
  assert.match(weekly.weeks[0].label, /not a recommendation/i);
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
