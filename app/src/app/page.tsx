import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>catalyst</h1>
      <p>
        開発中。画面はデザインタブ（例/Docs/4_デザイン.md）が決まってから作る。
      </p>
      <h2>試作</h2>
      <ul>
        <li>
          <Link href="/prototype/transcribe">文字起こし</Link>
          ：ブラウザの音声認識が、医療用語をどのくらい正しく文字にできるか
        </li>
      </ul>
    </main>
  );
}
