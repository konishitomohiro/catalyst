import { Transcriber } from "./Transcriber";
import styles from "./page.module.css";

export const metadata = { title: "試作：文字起こし | catalyst" };

export default function Page() {
  return (
    <main className={styles.main}>
      <h1>試作：文字起こし</h1>
      <p className={styles.hint}>
        ブラウザの音声認識（無料）が、日本語の医療用語をどのくらい正しく文字にできるかを確かめるページ。
        話した内容はこの端末にだけ表示し、保存しない。ただしブラウザによっては、音声認識のために音声が外部のサーバーへ送られる。実在の患者の話は使わないこと。
      </p>
      <Transcriber />
      <details className={styles.box}>
        <summary>オンライン（Zoom など）の音声で試すには</summary>
        <p>
          ブラウザの音声認識はマイクの音しか拾わない。通話の相手の声を入れるには、次のどちらかを試す。
        </p>
        <ul>
          <li>
            パソコンのスピーカーから通話の音を出し、マイクで拾う（いちばん手軽）
          </li>
          <li>
            仮想オーディオ機器（Mac なら BlackHole
            など）で、通話の音をマイク入力に回す
          </li>
        </ul>
      </details>
    </main>
  );
}
