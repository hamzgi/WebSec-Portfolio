"use client";

export function DeleteButton() {
  return <button type="submit" onClick={(event) => { if (!window.confirm("이 항목을 삭제할까요?")) event.preventDefault(); }}>삭제</button>;
}
