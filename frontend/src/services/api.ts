import {
  Meeting,
  MeetingCreateInput,
  MeetingUpdateInput,
  ActionItem,
  ActionItemUpdateInput,
  ActionItemStatus,
  PaginatedMeetings,
  PaginatedActionItems,
} from "@/types/meeting";
import { User, LoginInput, RegisterInput, TokenResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL is not configured.", 500);
  }

  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // response body wasn't JSON
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
// ==========================================
// Meeting endpoints
// ==========================================

export function createMeeting(data: MeetingCreateInput): Promise<Meeting> {
  return request<Meeting>("/api/meetings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 🌟 Paginated Meetings Fetch Endpoint
export function getMeetings(params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<PaginatedMeetings> {
  const { page = 1, limit = 10, search } = params;
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  return request<PaginatedMeetings>(`/api/meetings?${query.toString()}`);
}

export function getMeeting(id: number): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${id}`);
}

export function updateMeeting(
  id: number,
  data: MeetingUpdateInput
): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteMeeting(id: number): Promise<void> {
  return request<void>(`/api/meetings/${id}`, { method: "DELETE" });
}

// ==========================================
// Action item endpoints
// ==========================================

// 🌟 Paginated Action Items Fetch Endpoint
export function getActionItems(params: {
  status?: ActionItemStatus;
  owner?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedActionItems> {
  const { status, owner, search, page = 1, limit = 10 } = params;
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set("status", status);
  if (owner) query.set("owner", owner);
  if (search) query.set("search", search);
  return request<PaginatedActionItems>(`/api/action-items?${query.toString()}`);
}

export function updateActionItem(
  id: number,
  data: ActionItemUpdateInput
): Promise<ActionItem> {
  return request<ActionItem>(`/api/action-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteActionItem(id: number): Promise<void> {
  return request<void>(`/api/action-items/${id}`, { method: "DELETE" });
}

// ==========================================
// Auth endpoints
// ==========================================

export async function registerUser(data: RegisterInput): Promise<User> {
  return request<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginInput): Promise<TokenResponse> {
  // Backend expects OAuth2 form data (username/password), not JSON
  const formBody = new URLSearchParams();
  formBody.set("username", data.email);
  formBody.set("password", data.password);

  if (!API_BASE_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL is not configured.", 500);
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody.toString(),
  });

  if (!response.ok) {
    let detail = "Login failed.";
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new ApiError(detail, response.status);
  }

  return response.json();
}

export function getCurrentUser(): Promise<User> {
  return request<User>("/api/auth/me");
}