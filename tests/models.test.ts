import { test } from "node:test";
import assert from "node:assert/strict";
import { Credential, Profile, Project, SiteSettings, Skill, Timeline } from "../lib/models";
import { connectToDatabase } from "../lib/db";

test("portfolio content defaults to draft and rejects invalid publication states", async () => {
  for (const doc of [
    new Project({ title: "Project", slug: "project" }),
    new Skill({ name: "TypeScript" }),
    new Credential({ name: "Certificate" }),
    new Timeline({ title: "Activity", startDate: new Date("2024-01-01") }),
  ]) {
    assert.equal(doc.get("status"), "draft");
    assert.equal(doc.get("sortOrder"), 0);
    await doc.validate();
    doc.set("status", "public");
    await assert.rejects(doc.validate());
  }
});

test("project slugs and external URLs are validated", async () => {
  await assert.rejects(new Project({ title: "Project", slug: "bad/slug" }).validate());
  await assert.rejects(new Project({ title: "Project", slug: "project", repositoryUrl: "javascript:alert(1)" }).validate());
  await new Project({ title: "Project", slug: "project", repositoryUrl: "https://github.com/hamzgi/example" }).validate();
});

test("profile and settings reject invalid contact details", async () => {
  await assert.rejects(new Profile({ displayName: "Name", email: "not-an-email" }).validate());
  await assert.rejects(new Profile({ displayName: "Name", linkedInUrl: "javascript:alert(1)" }).validate());
  await assert.rejects(new SiteSettings({ siteTitle: "Portfolio", githubUsername: "not/a/user" }).validate());
  await new Profile({ displayName: "Name", email: "name@example.com" }).validate();
  assert.equal(new Profile({ displayName: "Name" }).key, "primary");
});

test("database connection fails clearly and can be retried when URI is missing", async () => {
  const previous = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  try {
    await assert.rejects(connectToDatabase(), /MONGODB_URI is not configured/);
    await assert.rejects(connectToDatabase(), /MONGODB_URI is not configured/);
  } finally {
    if (previous === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previous;
  }
});
