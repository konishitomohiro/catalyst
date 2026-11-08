"use client";
// テスト用サイトかどうか（app/page.tsx がサーバーで決めて渡す）
import { createContext, useContext } from "react";

export const TestFlag = createContext(false);
export const useTestInput = () => useContext(TestFlag);
