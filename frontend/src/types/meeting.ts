export type ActionItemStatus = "pending" | "in_progress" | "completed";

export interface ActionItem {
  id: number;
  meeting_id: number;
  task: string;
  owner: string | null;
  deadline: string | null; // ISO date string, e.g. "2026-08-28"
  status: ActionItemStatus;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  notes: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  action_items: ActionItem[];
}

export interface MeetingCreateInput {
  title: string;
  notes?: string;
}

export interface MeetingUpdateInput {
  title?: string;
  notes?: string;
}

export interface ActionItemUpdateInput {
  task?: string;
  owner?: string;
  deadline?: string;
  status?: ActionItemStatus;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedMeetings {
  items: Meeting[];
  pagination: PaginationMeta;
}

export interface PaginatedActionItems {
  items: ActionItem[];
  pagination: PaginationMeta;
}