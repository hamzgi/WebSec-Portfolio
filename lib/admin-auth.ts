import "server-only";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  if (!process.env.AUTH_SECRET || !process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET || !process.env.ADMIN_GITHUB_ID) redirect("/admin/login");
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}
