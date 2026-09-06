import { ActionItem } from "@/types/meeting";
import Card from "@/components/ui/Card";
import StatusBadge from "./StatusBadge";

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "—";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ActionItemCard({ item }: { item: ActionItem }) {
  return (
    <Card>
      <p className="font-medium text-gray-900">{item.task}</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-gray-500">Owner</dt>
        <dd className="text-gray-900">{item.owner ?? "—"}</dd>

        <dt className="text-gray-500">Deadline</dt>
        <dd className="text-gray-900">{formatDeadline(item.deadline)}</dd>

        <dt className="text-gray-500">Status</dt>
        <dd>
          <StatusBadge status={item.status} />
        </dd>
      </dl>
    </Card>
  );
}