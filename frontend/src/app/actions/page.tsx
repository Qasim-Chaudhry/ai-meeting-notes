"use client";

import { useEffect, useState } from "react";
import { getActionItems, updateActionItem, deleteActionItem, ApiError } from "@/services/api";
import { ActionItem, ActionItemStatus, ActionItemUpdateInput } from "@/types/meeting";
import ActionsFilters from "@/components/actions/ActionsFilters";
import ActionsTable from "@/components/actions/ActionsTable";
import EditActionItemModal from "@/components/actions/EditActionItemModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type StatusFilter = ActionItemStatus | "all";
const PAGE_SIZE = 10;

export default function ActionsPage() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [ownerInput, setOwnerInput] = useState("");
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ActionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search/owner text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setOwner(ownerInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, ownerInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await getActionItems({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          owner: owner || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotalPages(data.pagination.total_pages);
        setHasNext(data.pagination.has_next);
        setHasPrev(data.pagination.has_prev);
      } catch {
        if (!cancelled) setErrorMessage("We couldn't load action items. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, owner, statusFilter]);

  function setBusy(id: number, busy: boolean) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleStatusChange(item: ActionItem, status: ActionItemStatus) {
    const previous = items;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)));
    setBusy(item.id, true);
    try {
      const updated = await updateActionItem(item.id, { status });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      setItems(previous);
      setErrorMessage("Couldn't update the status. Please try again.");
    } finally {
      setBusy(item.id, false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteActionItem(deletingItem.id);
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      setDeletingItem(null);
    } catch {
      setErrorMessage("Couldn't delete this item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveEdit(data: ActionItemUpdateInput) {
    if (!editingItem) return;
    setIsSavingEdit(true);
    try {
      const updated = await updateActionItem(editingItem.id, data);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setEditingItem(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setErrorMessage("Some of the details you entered aren't valid. Please check and try again.");
      } else {
        setErrorMessage("Couldn't save your changes. Please try again.");
      }
    } finally {
      setIsSavingEdit(false);
    }
  }

  // 1. Loading aur Error states ko safely renderContent function ke andar handle kiya
  const renderContent = () => {
    if (isLoading && items.length === 0) return <LoadingState message="Loading action items…" />;
    if (errorMessage && items.length === 0) {
      return <ErrorState message={errorMessage} onRetry={() => setPage((p) => p)} />;
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Action Tracker</h2>
          <p className="mt-1 text-sm text-gray-500">
            All action items extracted from your meetings, in one place.
          </p>
        </div>

        <ActionsFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          owner={ownerInput}
          onOwnerChange={setOwnerInput}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {errorMessage && <ErrorMessage message={errorMessage} />}

        <ActionsTable
          items={items}
          busyIds={busyIds}
          onStatusChange={handleStatusChange}
          onEdit={setEditingItem}
          onDeleteRequest={setDeletingItem}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrev={hasPrev}
          onPageChange={setPage}
        />

        {editingItem && (
          <EditActionItemModal
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleSaveEdit}
            isSaving={isSavingEdit}
          />
        )}

        {deletingItem && (
          <ConfirmDialog
            title="Delete action item"
            message={`Delete "${deletingItem.task}"? This can't be undone.`}
            isConfirming={isDeleting}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingItem(null)}
          />
        )}
      </div>
    );
  };

  // 2. Poori execution ko base security wrapper ke andar se chalaya
  return <ProtectedRoute>{renderContent()}</ProtectedRoute>;
}
