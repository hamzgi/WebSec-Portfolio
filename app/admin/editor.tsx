"use client";

import { useActionState, useEffect, useState } from "react";
import { fields, type EditableKind } from "@/lib/admin-content";
import { saveContent } from "./actions";
import styles from "./panel.module.css";

type Values = Record<string, string>;

export function Editor({ kind, id, initialValues }: { kind: EditableKind; id?: string; initialValues: Values }) {
  const [values, setValues] = useState(initialValues);
  const [state, action, pending] = useActionState(saveContent, { ok: false, message: "" });
  useEffect(() => {
    if (state.ok && id === "new") setValues({ status: "draft", sortOrder: "0" });
  }, [state, id]);
  function change(name: string, value: string) { setValues((current) => ({ ...current, [name]: value })); }
  return (
    <form action={action} className={styles.editor}>
      <input type="hidden" name="kind" value={kind} />
      {kind !== "profile" && <input type="hidden" name="id" value={id} />}
      <div className={styles.fields}>
        {fields[kind].map((field) => (
          <label key={field.name} className={field.type === "textarea" ? styles.wide : undefined}>
            <span>{field.label}{field.required && " *"}</span>
            {field.type === "textarea" ? (
              <textarea name={field.name} value={values[field.name] || ""} onChange={(e) => change(field.name, e.target.value)} required={field.required} maxLength={field.max} rows={4} />
            ) : (
              <input name={field.name} type={field.type || "text"} value={values[field.name] || ""} onChange={(e) => change(field.name, e.target.value)} required={field.required} maxLength={field.max} />
            )}
          </label>
        ))}
        {kind !== "profile" && <>
          <label><span>공개 상태</span><select name="status" value={values.status || "draft"} onChange={(e) => change("status", e.target.value)}><option value="draft">임시저장</option><option value="published">공개 예정</option></select></label>
          <label><span>표시 순서 (작을수록 먼저)</span><input name="sortOrder" type="number" min="-99999" max="99999" step="1" value={values.sortOrder ?? "0"} onChange={(e) => change("sortOrder", e.target.value)} required /></label>
        </>}
      </div>
      <button className={styles.save} type="submit" disabled={pending}>{pending ? "저장 중…" : "저장하기"} <span aria-hidden="true">↗</span></button>
      {state.message && <p role="status" className={styles.formMessage}>{state.message}</p>}
    </form>
  );
}
