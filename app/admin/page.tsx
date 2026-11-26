import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import styles from "./panel.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "관리자 | WebSec Portfolio", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!process.env.AUTH_SECRET || !process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET || !process.env.ADMIN_GITHUB_ID) redirect("/admin/login");
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>← 포트폴리오로 돌아가기</Link>
        <section className={styles.card}>
          <p className={styles.eyebrow}>PRIVATE / ADMIN ACCESS</p>
          <h1>관리자 공간</h1>
          <p>{session.user.name || "관리자"}님, 환영합니다. GitHub 관리자 계정으로 로그인되어 있습니다.</p>
          <div className={styles.notice}>콘텐츠 관리 기능은 다음 단계에서 추가됩니다.</div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
            <button className={styles.button} type="submit">로그아웃 <span aria-hidden="true">↗</span></button>
          </form>
          <p className={styles.footnote}>WEBSEC PORTFOLIO / CONTROL ROOM</p>
        </section>
      </div>
    </main>
  );
}
