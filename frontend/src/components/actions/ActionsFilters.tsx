import { ActionItemStatus } from "@/types/meeting";
import Input from "@/components/ui/Input";

type StatusFilter = ActionItemStatus | "all";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function ActionsFilters({
  search,
  onSearchChange,
  owner,
  onOwnerChange,
  statusFilter,
  onStatusFilterChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  owner: string;
  onOwnerChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by task…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sm:w-56"
        />
        <Input
          placeholder="Filter by owner…"
          value={owner}
          onChange={(e) => onOwnerChange(e.target.value)}
          className="sm:w-48"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onStatusFilterChange(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === f.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}