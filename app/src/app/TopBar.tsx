"use client";

import { Furi } from "./Furi";
import { SizeSwitch } from "./Settings";
import styles from "./app.module.css";

/** 画面の上：見出しと文字の大きさ */
export function TopBar({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.topBar}>
      <h1 className={styles.topTitle}>
        <Furi text={title} />
      </h1>
      {children}
      <SizeSwitch />
    </header>
  );
}
