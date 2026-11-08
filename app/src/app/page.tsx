import { connection } from "next/server";
import { Suspense } from "react";
import { testInputEnabled } from "@/lib/testInput";
import { App } from "./App";

export default function Home() {
  // 環境変数を、作るときではなく動かすときに読む（テスト用サイトだけ「用意した発言」を出すため）。
  // 読み終わるまでは、テスト用の欄なしの画面を出しておく
  return (
    <Suspense fallback={<App />}>
      <WithFlag />
    </Suspense>
  );
}

async function WithFlag() {
  await connection();
  return <App testInput={testInputEnabled()} />;
}
