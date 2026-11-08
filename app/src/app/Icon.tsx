// アイコン（Material Symbols。Stitch の見本と同じ）。読み上げでは読まない（意味は必ず文字でも示す）
import type { Role } from "@/lib/roles";

export function Icon({
  name,
  fill = false,
  className,
}: {
  name: string;
  fill?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined ${className ?? ""}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}

export const ROLE_ICON: Record<Role, string> = {
  医師: "stethoscope",
  患者: "person",
  薬剤師: "medication",
  看護師: "medical_services",
  介護者: "volunteer_activism",
};
