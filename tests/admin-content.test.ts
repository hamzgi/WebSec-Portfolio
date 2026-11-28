import assert from "node:assert/strict";
import { test } from "node:test";
import { InputError, isContentKind, parseContent } from "../lib/admin-content";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

test("profile input normalizes interests and clears empty optional fields", () => {
  const result = parseContent("profile", form({ displayName: "  홍길동  ", interests: " 보안, Docker , , Kubernetes ", email: "" }));
  assert.equal(result.displayName, "홍길동");
  assert.deepEqual(result.interests, ["보안", "Docker", "Kubernetes"]);
  assert.equal(result.email, undefined);
});

test("skill input requires valid status, order and title", () => {
  const data = form({ name: " Docker ", status: "published", sortOrder: "-2" });
  assert.deepEqual(parseContent("skill", data), { name: "Docker", category: undefined, description: undefined, status: "published", sortOrder: -2 });
  data.set("status", "admin");
  assert.throws(() => parseContent("skill", data), InputError);
  data.set("status", "draft");
  data.set("sortOrder", "1.5");
  assert.throws(() => parseContent("skill", data), InputError);
  assert.equal(isContentKind("project"), false);
});

test("invalid URLs and emails are rejected on the server", () => {
  assert.throws(() => parseContent("profile", form({ displayName: "A", githubUrl: "javascript:alert(1)" })), InputError);
  assert.throws(() => parseContent("profile", form({ displayName: "A", email: "invalid" })), InputError);
});

test("dates must exist and end no earlier than start", () => {
  const base = { title: "활동", status: "draft", sortOrder: "0" };
  assert.throws(() => parseContent("timeline", form({ ...base, startDate: "2026-02-30" })), InputError);
  assert.throws(() => parseContent("timeline", form({ ...base, startDate: "2026-01-02", endDate: "2026-01-01" })), InputError);
  const valid = parseContent("timeline", form({ ...base, startDate: "2026-01-02", endDate: "2026-01-02" }));
  assert.equal((valid.startDate as Date).toISOString(), "2026-01-02T00:00:00.000Z");
});
