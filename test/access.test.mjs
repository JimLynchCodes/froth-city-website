import assert from "node:assert/strict";
import test from "node:test";
import { accessText, canRead, isMember } from "../src/access-policy.mjs";
import { freeDateISO } from "../src/access-dates.mjs";
import { weekView } from "../src/weekly.js";

test("one calendar month matches the published notes", () => {
  assert.equal(freeDateISO("2026-11-22"), "2026-12-22");
  assert.equal(freeDateISO("2026-11-21"), "2026-12-21");
  assert.equal(freeDateISO("2026-10-12"), "2026-11-12");
  assert.equal(freeDateISO("2026-01-31"), "2026-03-03");
});

test("subscribers can read before the free date and readers cannot", () => {
  assert.equal(canRead("2026-11-22", "reader", "2026-11-22"), false);
  assert.equal(canRead("2026-11-22", null, "2026-11-22"), false);
  assert.equal(canRead("2026-11-22", "subscriber", "2026-11-22"), true);
  assert.equal(canRead("2026-11-22", "premium", "2026-11-22"), true);
  assert.equal(canRead("2026-10-12", "reader", "2026-11-22"), true);
  assert.equal(isMember("reader"), false);
  assert.equal(accessText("2026-11-22", "subscriber", "2026-11-22"), "Included with your subscription");
  assert.equal(accessText("2026-10-12", "reader", "2026-11-22"), "Available");
});

test("weekly sectors stay hidden until the free date unless the tier is paid", () => {
  const weeks = [
    {
      weekOf: "2026-11-16",
      example: false,
      long: [{ sector: "Hidden sector", etf: "XLE", thesis: "secret" }],
      short: [],
    },
    {
      weekOf: "2026-10-05",
      example: false,
      long: [{ sector: "Old sector", etf: "XLU", thesis: "public now" }],
      short: [],
    },
  ];
  const reader = weekView(weeks, "reader", "2026-11-22");
  assert.equal(reader.current.locked, true);
  assert.equal(reader.current.long.length, 0);
  assert.equal(reader.archive[0].locked, false);
  assert.equal(reader.archive[0].long[0].sector, "Old sector");
  const member = weekView(weeks, "premium", "2026-11-22");
  assert.equal(member.current.locked, false);
  assert.equal(member.current.long[0].sector, "Hidden sector");
});

test("an example week is not treated as the live list", () => {
  const model = weekView(
    [{ weekOf: "2026-11-16", example: true, label: "Example week, not a recommendation", long: [], short: [] }],
    null,
    "2026-11-22",
  );
  assert.equal(model.current, null);
  assert.equal(model.example.example, true);
});
