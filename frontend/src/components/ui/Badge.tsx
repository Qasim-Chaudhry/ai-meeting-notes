import { ReactNode } from "react";

type Tone = "gray" | "amber" | "blue" | "green" | "red";

const TONE_STYLES: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-700 ring-gray-500/10",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
};

export default function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}