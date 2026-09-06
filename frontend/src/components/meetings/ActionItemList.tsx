import { ActionItem } from "@/types/meeting";
import ActionItemCard from "./ActionItemCard";
import EmptyState from "@/components/ui/EmptyState";

export default function ActionItemList({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No action items"
        description="No action items were found in this meeting."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <ActionItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}