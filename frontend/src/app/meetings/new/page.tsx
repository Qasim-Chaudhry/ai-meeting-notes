"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createMeeting, ApiError } from "@/services/api";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function NewMeetingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [notesError, setNotesError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    let valid = true;
    setTitleError(undefined);
    setNotesError(undefined);

    if (!title.trim()) {
      setTitleError("Enter a title for this meeting.");
      valid = false;
    }
    if (!notes.trim()) {
      setNotesError("Enter some notes to analyze.");
      valid = false;
    } else if (notes.trim().length < 20) {
      setNotesError("Add a bit more detail so the AI has something to work with.");
      valid = false;
    }
    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const meeting = await createMeeting({ title: title.trim(), notes: notes.trim() });
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setSubmitError("Too many requests right now. Please wait a moment and try again.");
      } else if (err instanceof ApiError && err.status >= 500) {
        setSubmitError("We couldn't analyze this meeting right now. Please try again shortly.");
      } else {
        setSubmitError("Something went wrong while saving this meeting. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">New meeting</h2>
        <p className="mt-1 text-sm text-gray-500">
          Paste in your raw notes and we&apos;ll pull out a summary and action items.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Input
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Claims Team Meeting"
          disabled={isSubmitting}
          error={titleError}
        />

        <Textarea
          id="notes"
          label="Meeting notes"
          rows={10}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            "Meeting with Claims team.\nAmjad will review ACC integration.\nAli will prepare deployment scripts by Friday."
          }
          disabled={isSubmitting}
          error={notesError}
        />

        {submitError && <ErrorMessage message={submitError} />}

        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? "Analyzing meeting…" : "Analyze Meeting"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            // YAHAN BADLAV KIYA HAI: Cancel karne par ab user dashboard par wapas jayega
            onClick={() => router.push("/dashboard")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  );
}
