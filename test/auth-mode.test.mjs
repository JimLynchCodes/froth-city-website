import assert from "node:assert/strict";
import test from "node:test";
import { resolveAuthMode } from "../src/auth-mode.mjs";

test("production without keys stays signed out", () => {
  assert.equal(resolveAuthMode({ prod: true, url: "", key: "", mockFlag: "1" }), "off");
  assert.equal(resolveAuthMode({ prod: true, url: undefined, key: undefined, mockFlag: undefined }), "off");
});

test("local dev without keys uses the mock picker", () => {
  assert.equal(resolveAuthMode({ prod: false, url: "", key: "", mockFlag: undefined }), "mock");
});

test("an explicit flag can turn the mock picker off", () => {
  assert.equal(resolveAuthMode({ prod: false, url: "", key: "", mockFlag: "0" }), "off");
});

test("keys select Supabase even in production", () => {
  assert.equal(
    resolveAuthMode({ prod: true, url: "https://example.supabase.co", key: "anon", mockFlag: "1" }),
    "supabase",
  );
});
