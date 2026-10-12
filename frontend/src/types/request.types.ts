export type RequestStatus = "OPEN" | "IN_ANALYSIS" | "APPROVED" | "REJECTED";

export type RequestPriority = "LOW" | "MEDIUM" | "HIGH";

export interface RequestUser {
  id: string;
  name?: string;
  username?: string;
  email?: string;
}

export interface RequestArea {
  id: string;
  name: string;
}

export interface RequestItem {
  id: string | number;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  requester: RequestUser;
  targetArea: RequestArea;
  createdAt: string;
  updatedAt: string;
}

export interface RequestHistoryItem {
  id: string | number;
  requestId?: string;
  action?: string;
  description?: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  comment?: string | null;
  createdAt: string;
  changedByUser?: {
    id?: string;
    name?: string;
    email?: string;
  };
  user?: {
    name?: string;
    username?: string;
  };
}

export interface RequestsResponse {
  data?: RequestItem[];
  items?: RequestItem[];
  total?: number;
}

export interface CreateRequestData {
  title: string;
  description: string;
  priority: RequestPriority;
  targetAreaId: string;
}