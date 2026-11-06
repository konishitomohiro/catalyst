// 送り手・受け手になりうる5職種（例/Docs/1_方向.md 7章）
export const ROLES = ["医師", "患者", "薬剤師", "看護師", "介護者"] as const;
export type Role = (typeof ROLES)[number];

/** 画面に出すときのふりがな */
export const ROLE_READING: Record<Role, string> = {
  医師: "いし",
  患者: "かんじゃ",
  薬剤師: "やくざいし",
  看護師: "かんごし",
  介護者: "かいごしゃ",
};

export function isRole(x: unknown): x is Role {
  return typeof x === "string" && (ROLES as readonly string[]).includes(x);
}
