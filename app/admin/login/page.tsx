import Link from "next/link";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import styles from "../panel.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "관리자 로그인 | WebSec Portfolio", robots: { index: false, follow: false } };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const configured = Boolean(process.env.AUTH_SECRET && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET && process.env.ADMIN_GITHUB_ID);
  const { error } = await searchParams;
  if (configured && (await auth())?.user) redirect("/admin");

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>← 포트폴리오로 돌아가기</Link>
        <section className={styles.card}>
          <p className={styles.eyebrow}>PRIVATE / ADMIN ACCESS</p>
          <h1>관리자 로그인</h1>
          <p>포트폴리오 관리를 위해 등록된 GitHub 계정으로 로그인해 주세요.</p>
          {!configured ? (
            <p className={styles.notice}>GitHub 로그인 설정이 아직 완료되지 않았습니다. 프로젝트 README의 관리자 인증 설정을 확인해 주세요.</p>
          ) : (
            <>
              {error && <p role="alert" className={styles.notice}>로그인할 수 없습니다. 관리자 계정과 OAuth 설정을 확인해 주세요.</p>}
              <form action={async () => { "use server"; await signIn("github", { redirectTo: "/admin" }); }}>
                <button className={styles.button} type="submit">GitHub로 로그인 <span aria-hidden="true">↗</span></button>
              </form>
            </>
          )}
          <p className={styles.footnote}>AUTHORIZED ACCOUNT ONLY</p>
        </section>
      </div>
    </main>
  );
}
