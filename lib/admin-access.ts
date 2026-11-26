/** Compare the immutable GitHub account ID, and fail closed on missing config. */
export function isAdminGitHubId(id: unknown, configuredId: string | undefined): boolean {
  const allowed = configuredId?.trim();
  return Boolean(allowed && /^[1-9]\d*$/.test(allowed) && typeof id === "string" && id === allowed);
}
