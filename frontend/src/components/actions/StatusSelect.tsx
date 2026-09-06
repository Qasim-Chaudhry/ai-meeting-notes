import { ActionItemStatus } from "@/types/meeting";

const OPTIONS: { value: ActionItemStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: ActionItemStatus;
  onChange: (status: ActionItemStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as ActionItemStatus)}
      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}