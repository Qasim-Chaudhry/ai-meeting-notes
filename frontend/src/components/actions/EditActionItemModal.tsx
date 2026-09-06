import { useState, FormEvent } from "react";
import { ActionItem, ActionItemUpdateInput } from "@/types/meeting";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditActionItemModal({
  item,
  onClose,
  onSave,
  isSaving,
}: {
  item: ActionItem;
  onClose: () => void;
  onSave: (data: ActionItemUpdateInput) => void;
  isSaving: boolean;
}) {
  const [task, setTask] = useState(item.task);
  const [owner, setOwner] = useState(item.owner ?? "");
  const [deadline, setDeadline] = useState(item.deadline ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      task: task.trim(),
      owner: owner.trim() || undefined,
      deadline: deadline || undefined,
    });
  }

  return (
    <Modal title="Edit action item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="task"
          label="Task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
        />
        <Input
          id="owner"
          label="Owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="Unassigned"
        />
        <Input
          id="deadline"
          label="Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSaving}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}