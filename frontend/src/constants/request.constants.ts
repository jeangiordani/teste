import type { RequestStatus, RequestPriority } from "@/types/request.types";

export const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "OPEN", label: "Aberta" },
  { value: "IN_ANALYSIS", label: "Em análise" },
  { value: "APPROVED", label: "Aprovada" },
  { value: "REJECTED", label: "Rejeitada" },
];

export const PRIORITY_OPTIONS: { value: RequestPriority; label: string }[] = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
];