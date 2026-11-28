import Link from "next/link";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { fields, type ContentKind, type EditableKind } from "@/lib/admin-content";
import { connectToDatabase } from "@/lib/db";
import { Profile, Skill, Credential, Timeline } from "@/lib/models";
import { deleteContent } from "./actions";
import { DeleteButton } from "./delete-button";
import { Editor } from "./editor";
import styles from "./panel.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "관리자 | WebSec Portfolio", robots: { index: false, follow: false } };

type Entry = Record<string, unknown> & { _id: { toString(): string } };
type Section = { kind: ContentKind; title: string; subtitle: string; items: Entry[] };

function fieldValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.join(", ");
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function editorValues(kind: EditableKind, entry?: Record<string, unknown>): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields[kind]) values[field.name] = fieldValue(entry?.[field.name]);
  if (kind !== "profile") {
    values.status = fieldValue(entry?.status) || "draft";
    values.sortOrder = fieldValue(entry?.sortOrder) || "0";
  }
  return values;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const session = await requireAdmin();
  const { message } = await searchParams;
  let profile: Record<string, unknown> | undefined;
  let sections: Section[] = [];
  let databaseAvailable = true;
  try {
    await connectToDatabase();
    const [profileDoc, skills, credentials, timeline] = await Promise.all([
      Profile.findOne({ key: "primary" }).lean(),
      Skill.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
      Credential.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
      Timeline.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
    ]);
    profile = profileDoc ?? undefined;
    sections = [
      { kind: "skill", title: "기술 스택", subtitle: "사용할 수 있는 기술과 경험을 정리해요.", items: skills as Entry[] },
      { kind: "credential", title: "자격증", subtitle: "취득한 자격과 확인 링크를 기록해요.", items: credentials as Entry[] },
      { kind: "timeline", title: "활동 이력", subtitle: "지나온 경험을 타임라인으로 남겨요.", items: timeline as Entry[] },
    ];
  } catch (error) {
    databaseAvailable = false;
    // Log only a coarse error class, never a URI, credentials, or driver message.
    const category = !process.env.MONGODB_URI ? "missing_configuration"
      : error instanceof Error && error.name === "MongooseServerSelectionError" ? "server_selection"
      : error instanceof Error && error.name === "MongoServerError" ? "database_server"
      : "other";
    console.error(`Admin database unavailable: ${category}`);
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.adminHeader}>
          <div><Link href="/" className={styles.back}>← 포트폴리오로 돌아가기</Link><p className={styles.eyebrow}>PRIVATE / CONTROL ROOM</p><h1>관리자 공간</h1><p>{session.user?.name || "관리자"}님, 안녕하세요. 이곳에서 포트폴리오 내용을 관리합니다.</p></div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><button className={styles.signout} type="submit">로그아웃 ↗</button></form>
        </header>
        {message && <p role="status" className={styles.notice}>{message}</p>}
        {!databaseAvailable ? (
          <div className={styles.notice} role="alert">데이터베이스에 연결할 수 없습니다. 서버의 MONGODB_URI와 MongoDB Atlas 네트워크 접근 설정을 확인해 주세요.</div>
        ) : <>
          <p className={styles.info}>여기에 저장한 내용은 다음 단계에서 공개 포트폴리오에 연결됩니다. 기술·자격증·활동은 임시저장 또는 공개 예정으로 관리할 수 있어요.</p>
          <nav className={styles.sectionNav} aria-label="관리 항목"><a href="#profile">자기소개</a><a href="#skill">기술 스택</a><a href="#credential">자격증</a><a href="#timeline">활동 이력</a></nav>
          <section id="profile" className={styles.section}>
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / PROFILE</p><h2>자기소개와 연락처</h2><p>나를 소개하는 기본 정보와 연락처를 작성해요.</p></div></div>
            <Editor kind="profile" initialValues={editorValues("profile", profile)} />
          </section>
          {sections.map((section, index) => <section id={section.kind} className={styles.section} key={section.kind}>
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>0{index + 2} / {section.kind.toUpperCase()}</p><h2>{section.title}</h2><p>{section.subtitle}</p></div><span className={styles.count}>{section.items.length}개 항목</span></div>
            <div className={styles.entries}>
              {section.items.length === 0 && <p className={styles.empty}>아직 등록된 항목이 없습니다.</p>}
              {section.items.map((item) => <details key={String(item._id)} className={styles.item}>
                <summary><span>{fieldValue(item.name || item.title)}</span><small>{item.status === "published" ? "공개 예정" : "임시저장"} · 순서 {fieldValue(item.sortOrder)}</small></summary>
                <Editor kind={section.kind} id={String(item._id)} initialValues={editorValues(section.kind, item)} />
                <form action={deleteContent} className={styles.delete}><input type="hidden" name="kind" value={section.kind} /><input type="hidden" name="id" value={String(item._id)} /><DeleteButton /></form>
              </details>)}
              <details className={styles.newItem}><summary>＋ {section.title} 항목 추가</summary><Editor kind={section.kind} id="new" initialValues={editorValues(section.kind)} /></details>
            </div>
          </section>)}
        </>}
        <p className={styles.footnote}>WEBSEC PORTFOLIO / CONTROL ROOM</p>
      </div>
    </main>
  );
}
