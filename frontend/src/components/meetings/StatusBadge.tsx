import { ActionItemStatus } from "@/types/meeting";
import Badge from "@/components/ui/Badge";

const STATUS_CONFIG: Record<ActionItemStatus, { tone: "amber" | "blue" | "green"; label: string }> = {
  pending: { tone: "amber", label: "Pending" },
  in_progress: { tone: "blue", label: "In Progress" },
  completed: { tone: "green", label: "Completed" },
};

export default function StatusBadge({ status }: { status: ActionItemStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}