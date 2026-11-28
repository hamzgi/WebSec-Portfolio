export const contentKinds = ["skill", "credential", "timeline"] as const;
export type ContentKind = typeof contentKinds[number];
export type EditableKind = ContentKind | "profile";

type Field = { name: string; label: string; max: number; required?: boolean; type?: "textarea" | "email" | "url" | "date" };
export const fields: Record<EditableKind, Field[]> = {
  profile: [
    { name: "displayName", label: "이름 또는 활동명", max: 100, required: true },
    { name: "headline", label: "한 줄 소개", max: 160 },
    { name: "introduction", label: "자기소개", max: 5000, type: "textarea" },
    { name: "interests", label: "관심 분야 (쉼표로 구분)", max: 3000 },
    { name: "email", label: "이메일", max: 254, type: "email" },
    { name: "githubUrl", label: "GitHub 주소", max: 2048, type: "url" },
    { name: "linkedInUrl", label: "LinkedIn 주소", max: 2048, type: "url" },
    { name: "websiteUrl", label: "웹사이트 주소", max: 2048, type: "url" },
  ],
  skill: [
    { name: "name", label: "기술 이름", max: 100, required: true },
    { name: "category", label: "분류", max: 100 },
    { name: "description", label: "설명", max: 1000, type: "textarea" },
  ],
  credential: [
    { name: "name", label: "자격증 이름", max: 160, required: true },
    { name: "issuer", label: "발급 기관", max: 160 },
    { name: "issuedAt", label: "취득일", max: 10, type: "date" },
    { name: "expiresAt", label: "만료일", max: 10, type: "date" },
    { name: "credentialUrl", label: "자격 확인 주소", max: 2048, type: "url" },
    { name: "description", label: "설명", max: 1000, type: "textarea" },
  ],
  timeline: [
    { name: "title", label: "활동명", max: 160, required: true },
    { name: "organization", label: "기관 또는 단체", max: 160 },
    { name: "startDate", label: "시작일", max: 10, type: "date", required: true },
    { name: "endDate", label: "종료일", max: 10, type: "date" },
    { name: "description", label: "활동 설명", max: 5000, type: "textarea" },
  ],
};

export function isContentKind(value: string): value is ContentKind {
  return (contentKinds as readonly string[]).includes(value);
}

export class InputError extends Error {}

function readText(form: FormData, field: Field): string {
  const raw = form.get(field.name);
  if (raw !== null && typeof raw !== "string") throw new InputError("입력값을 확인해 주세요.");
  const value = (raw || "").trim();
  if (field.required && !value) throw new InputError(`${field.label}을(를) 입력해 주세요.`);
  if (value.length > field.max) throw new InputError(`${field.label}은(는) ${field.max}자 이내로 입력해 주세요.`);
  if (value && field.type === "url") {
    try { if (!["http:", "https:"].includes(new URL(value).protocol)) throw new Error(); }
    catch { throw new InputError(`${field.label}은(는) http 또는 https 주소로 입력해 주세요.`); }
  }
  if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new InputError("이메일 주소를 확인해 주세요.");
  if (value && field.type === "date") {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new InputError(`${field.label}을(를) 확인해 주세요.`);
  }
  return value;
}

export function parseContent(kind: EditableKind, form: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields[kind]) {
    const value = readText(form, field);
    if (field.name === "interests") {
      const interests = value.split(",").map((item) => item.trim()).filter(Boolean);
      if (interests.length > 30 || interests.some((item) => item.length > 100)) throw new InputError("관심 분야는 항목당 100자, 최대 30개까지 입력해 주세요.");
      result.interests = interests;
    } else {
      result[field.name] = value ? (field.type === "date" ? new Date(`${value}T00:00:00.000Z`) : value) : undefined;
    }
  }
  if (kind !== "profile") {
    const status = form.get("status");
    if (status !== "draft" && status !== "published") throw new InputError("공개 상태를 확인해 주세요.");
    const rawOrder = form.get("sortOrder");
    if (typeof rawOrder !== "string" || !/^-?\d{1,5}$/.test(rawOrder)) throw new InputError("표시 순서는 -99999부터 99999까지 정수로 입력해 주세요.");
    result.status = status;
    result.sortOrder = Number(rawOrder);
  }
  const start = result[kind === "credential" ? "issuedAt" : "startDate"];
  const end = result[kind === "credential" ? "expiresAt" : "endDate"];
  if (start instanceof Date && end instanceof Date && end < start) throw new InputError("종료일은 시작일보다 빠를 수 없습니다.");
  return result;
}
