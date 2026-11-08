import { Furi } from "./Furi";
import styles from "./app.module.css";

/**
 * AIが考えているあいだの表示。
 * 文の中の言葉に、順番に蛍光ペンの印がつく動き（見つけた言葉に印をつけるアプリの動きと同じ）。
 * 動きを減らす設定の端末では、動かさず文だけ出す。
 */
export function Thinking({ text }: { text: string }) {
  return (
    <div className={styles.thinking} role="status" aria-live="polite">
      <span aria-hidden className={styles.thinkLine}>
        {[3, 5, 2, 4].map((w, i) => (
          <span
            key={i}
            className={styles.thinkWord}
            style={{ width: `${w * 0.5}rem`, animationDelay: `${i * 0.35}s` }}
          />
        ))}
      </span>
      <span className={styles.thinkText}>
        <Furi text={text} />
      </span>
    </div>
  );
}
