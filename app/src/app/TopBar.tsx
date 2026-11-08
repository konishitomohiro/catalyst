"use client";

import { Furi } from "./Furi";
import { Icon } from "./Icon";
import styles from "./app.module.css";

/** 画面の上：見出しと文字の大きさ */
export function TopBar({
  title,
  onBack,
  backLabel = "もどる",
  children,
}: {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.topBar}>
      {onBack && (
        <button
          className={styles.round}
          onClick={onBack}
          aria-label={backLabel}
        >
          <Icon name="arrow_back" />
        </button>
      )}
      <h1 className={styles.topTitle}>
        <Furi text={title} />
      </h1>
      {children}
    </header>
  );
}
