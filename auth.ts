import "server-only";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAdminGitHubId } from "@/lib/admin-access";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: { signIn: "/admin/login", error: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    signIn({ account }) {
      return account?.provider === "github" &&
        isAdminGitHubId(account.providerAccountId, process.env.ADMIN_GITHUB_ID);
    },
    jwt({ token, account }) {
      if (account?.provider === "github") token.githubId = account.providerAccountId;
      return token;
    },
    session({ session, token }) {
      // Re-check the current allowlist on every session read, including after a config change.
      if (!isAdminGitHubId(token.githubId, process.env.ADMIN_GITHUB_ID)) {
        return { ...session, user: undefined };
      }
      return session;
    },
  },
});
