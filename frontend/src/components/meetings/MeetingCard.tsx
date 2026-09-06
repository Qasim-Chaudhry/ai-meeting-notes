import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Meeting } from "@/types/meeting";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <Link href={`/meetings/${meeting.id}`} className="block">
      <Card interactive>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-gray-900">{meeting.title}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{formatDate(meeting.created_at)}</p>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {meeting.summary || "No summary available yet."}
            </p>
          </div>
          <Badge tone="gray">
            {meeting.action_items.length}{" "}
            {meeting.action_items.length === 1 ? "action" : "actions"}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}