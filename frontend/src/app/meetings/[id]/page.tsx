"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMeeting, ApiError } from "@/services/api";
import { Meeting } from "@/types/meeting";
import ActionItemList from "@/components/meetings/ActionItemList";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import Card from "@/components/ui/Card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = Number(params.id);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMeeting = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getMeeting(meetingId);
      setMeeting(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setErrorMessage("This meeting couldn't be found. It may have been deleted.");
      } else {
        setErrorMessage("We couldn't load this meeting. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    if (Number.isNaN(meetingId)) {
      setErrorMessage("Invalid meeting ID.");
      setIsLoading(false);
      return;
    }
    loadMeeting();
  }, [meetingId, loadMeeting]);

  // Content render function jo check karega ke kya dikhana hai
  const renderContent = () => {
    if (isLoading) return <LoadingState message="Loading meeting…" />;
    if (errorMessage) return <ErrorState message={errorMessage} onRetry={loadMeeting} />;
    if (!meeting) return null;

    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{meeting.title}</h2>
          <p className="mt-1 text-sm text-gray-500">
            Created {new Date(meeting.created_at).toLocaleString()}
          </p>
        </div>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Notes</h3>
          <Card className="mt-2">
            <p className="whitespace-pre-line text-sm text-gray-700">
              {meeting.notes || "No notes were provided."}
            </p>
          </Card>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Summary</h3>
          <Card className="mt-2">
            <p className="text-sm text-gray-700">
              {meeting.summary || "No summary is available for this meeting."}
            </p>
          </Card>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Action Items
          </h3>
          <ActionItemList items={meeting.action_items} />
        </section>
      </div>
    );
  };

  // Main return sirf ProtectedRoute chalaye ga
  return <ProtectedRoute>{renderContent()}</ProtectedRoute>;
}
