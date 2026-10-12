import type { RequestStatus, RequestPriority, RequestUser, RequestHistoryItem } from "@/types/request.types";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/constants/request.constants";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocorreu um erro inesperado.";
}

export function getStatusLabel(status: RequestStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getPriorityLabel(priority: RequestPriority): string {
  return PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? priority;
}

export function getUserName(user?: RequestUser | RequestHistoryItem["user"]): string {
  return user?.name ?? user?.username ?? "Usuário";
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export function getStatusClass(status: RequestStatus): string {
  switch (status) {
    case "OPEN":
      return "bg-amber-100 text-amber-800";
    case "IN_ANALYSIS":
      return "bg-blue-100 text-blue-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}