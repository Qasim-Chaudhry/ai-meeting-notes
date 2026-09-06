"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMeetings, getActionItems } from "@/services/api";
import { Meeting } from "@/types/meeting";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MeetingCard from "@/components/meetings/MeetingCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import { SkeletonCard, SkeletonStatsCard } from "@/components/ui/Skeleton";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [totalMeetings, setTotalMeetings] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounce search input -> triggers refetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch meetings list (search + pagination)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await getMeetings({ page, limit: PAGE_SIZE, search: search || undefined });
        if (cancelled) return;
        setMeetings(data.items);
        setTotalMeetings(data.pagination.total);
        setTotalPages(data.pagination.total_pages);
        setHasNext(data.pagination.has_next);
        setHasPrev(data.pagination.has_prev);
      } catch {
        if (!cancelled) setErrorMessage("We couldn't load your meetings. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  // Fetch aggregate stats for action items (separate, unfiltered)
  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      setIsStatsLoading(true);
      try {
        const [pending, inProgress, completed] = await Promise.all([
          getActionItems({ status: "pending", limit: 1 }),
          getActionItems({ status: "in_progress", limit: 1 }),
          getActionItems({ status: "completed", limit: 1 }),
        ]);
        if (cancelled) return;
        setPendingCount(pending.pagination.total + inProgress.pagination.total);
        setCompletedCount(completed.pagination.total);
      } catch {
        // stats are non-critical; fail silently
      } finally {
        if (!cancelled) setIsStatsLoading(false);
      }
    }
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={() => setPage((p) => p)} />;
  }

  return (
    <ProtectedRoute>
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            An overview of your meetings and action items.
          </p>
        </div>
        <Link href="/meetings/new">
          <Button>Create Meeting</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isStatsLoading ? (
          <>
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </>
        ) : (
          <>
            <Card>
              <p className="text-sm font-medium text-gray-500">Total Meetings</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{totalMeetings}</p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-500">Pending Action Items</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{pendingCount}</p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-500">Completed Action Items</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{completedCount}</p>
            </Card>
          </>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Meetings
          </h3>
        </div>

        <div className="mb-4 max-w-xs">
          <Input
            placeholder="Search by title…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : meetings.length === 0 ? (
          <EmptyState
            title={search ? "No matching meetings" : "No meetings yet"}
            description={
              search
                ? "Try a different search term."
                : "Create your first meeting to get started."
            }
            action={
              !search && (
                <Link href="/meetings/new">
                  <Button size="sm">Create Meeting</Button>
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrev={hasPrev}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}