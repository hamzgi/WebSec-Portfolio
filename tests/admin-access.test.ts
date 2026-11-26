import assert from "node:assert/strict";
import { test } from "node:test";
import { isAdminGitHubId } from "../lib/admin-access";

test("only the configured immutable GitHub ID is authorized", () => {
  assert.equal(isAdminGitHubId("128930363", "128930363"), true);
  assert.equal(isAdminGitHubId("128930364", "128930363"), false);
  assert.equal(isAdminGitHubId(undefined, "128930363"), false);
  assert.equal(isAdminGitHubId("128930363", undefined), false);
  assert.equal(isAdminGitHubId("", ""), false);
  assert.equal(isAdminGitHubId("hamzgi", "hamzgi"), false);
});
