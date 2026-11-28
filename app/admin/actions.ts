"use server";

import mongoose, { type Model } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { isContentKind, parseContent, InputError, type ContentKind } from "@/lib/admin-content";
import { connectToDatabase } from "@/lib/db";
import { Profile, Skill, Credential, Timeline } from "@/lib/models";

function modelFor(kind: ContentKind): Model<Record<string, unknown>> {
  return ({ skill: Skill, credential: Credential, timeline: Timeline }[kind]) as unknown as Model<Record<string, unknown>>;
}

function messageUrl(message: string, kind: string) {
  return `/admin?message=${encodeURIComponent(message)}#${kind}`;
}

export type SaveState = { ok: boolean; message: string };

export async function saveContent(_previous: SaveState, form: FormData): Promise<SaveState> {
  await requireAdmin();
  const kind = form.get("kind");
  const id = form.get("id");
  if (typeof kind !== "string" || (kind !== "profile" && !isContentKind(kind))) return { ok: false, message: "잘못된 요청입니다." };
  if (kind !== "profile" && (typeof id !== "string" || (id !== "new" && !/^[a-f\d]{24}$/i.test(id)))) return { ok: false, message: "잘못된 항목입니다." };

  let error: string | undefined;
  try {
    const data = parseContent(kind, form);
    await connectToDatabase();
    if (kind === "profile") {
      const doc = await Profile.findOne({ key: "primary" }) ?? new Profile({ key: "primary" });
      doc.set(data);
      await doc.save();
    } else {
      const model = modelFor(kind);
      const doc = id === "new" ? new model() : await model.findById(id);
      if (!doc) throw new InputError("해당 항목을 찾을 수 없습니다.");
      doc.set(data);
      await doc.save();
    }
  } catch (err) {
    if (err instanceof InputError) error = err.message;
    else if (err instanceof mongoose.Error.ValidationError) error = "입력값을 다시 확인해 주세요.";
    else error = "저장하지 못했습니다. 데이터베이스 연결 상태를 확인해 주세요.";
  }
  if (error) return { ok: false, message: error };
  revalidatePath("/admin");
  return { ok: true, message: "저장했습니다." };
}

export async function deleteContent(form: FormData) {
  await requireAdmin();
  const kind = form.get("kind");
  const id = form.get("id");
  if (typeof kind !== "string" || !isContentKind(kind) || typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) redirect(messageUrl("잘못된 요청입니다.", "content"));
  let message = "삭제했습니다.";
  try {
    await connectToDatabase();
    const result = await modelFor(kind).deleteOne({ _id: id });
    if (!result.deletedCount) message = "해당 항목을 찾을 수 없습니다.";
  } catch { message = "삭제하지 못했습니다. 데이터베이스 연결 상태를 확인해 주세요."; }
  revalidatePath("/admin");
  redirect(messageUrl(message, kind));
}
