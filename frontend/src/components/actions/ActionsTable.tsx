import Link from "next/link";
import { ActionItem, ActionItemStatus } from "@/types/meeting";
import StatusSelect from "./StatusSelect";
import EmptyState from "@/components/ui/EmptyState";

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "—";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ActionsTable({
  items,
  busyIds,
  onStatusChange,
  onEdit,
  onDeleteRequest,
}: {
  items: ActionItem[];
  busyIds: Set<number>;
  onStatusChange: (item: ActionItem, status: ActionItemStatus) => void;
  onEdit: (item: ActionItem) => void;
  onDeleteRequest: (item: ActionItem) => void;
}) {
  if (items.length === 0) {
    return <EmptyState title="No matches" description="No action items match your filters." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Task", "Meeting", "Owner", "Deadline", "Status", "Actions"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => {
            const isBusy = busyIds.has(item.id);
            return (
              <tr key={item.id} className={isBusy ? "opacity-50" : ""}>
                <td className="max-w-xs px-4 py-3 text-gray-900">{item.task}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/meetings/${item.meeting_id}`}
                    className="text-gray-500 underline-offset-2 hover:text-indigo-600 hover:underline"
                  >
                    Meeting #{item.meeting_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{item.owner ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700">{formatDeadline(item.deadline)}</td>
                <td className="px-4 py-3">
                  <StatusSelect
                    value={item.status}
                    disabled={isBusy}
                    onChange={(status) => onStatusChange(item, status)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.status !== "completed" && (
                      <button
                        onClick={() => onStatusChange(item, "completed")}
                        disabled={isBusy}
                        className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
                      >
                        Mark done
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(item)}
                      disabled={isBusy}
                      className="text-xs font-medium text-gray-600 hover:underline disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteRequest(item)}
                      disabled={isBusy}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}