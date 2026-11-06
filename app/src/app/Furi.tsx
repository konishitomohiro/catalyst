// ふりがな。文言の中の {漢字|よみ} を <ruby> にする（例/Docs/4_デザイン.md）
import { Fragment } from "react";

const PATTERN = /\{([^|}]+)\|([^}]+)\}/g;

export function Furi({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    out.push(text.slice(last, m.index));
    out.push(
      <ruby key={m.index}>
        {m[1]}
        <rt>{m[2]}</rt>
      </ruby>,
    );
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}

/** AIが見つけた言葉。読みがあればふりがなを付ける */
export function Term({ term, reading }: { term: string; reading?: string }) {
  if (!reading) return <>{term}</>;
  return (
    <ruby>
      {term}
      <rt>{reading}</rt>
    </ruby>
  );
}
