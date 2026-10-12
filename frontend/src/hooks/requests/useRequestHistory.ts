"use client";

import { useCallback } from "react";
import { apiRequest } from "@/lib/api";
import type { RequestHistoryItem } from "@/types/request.types";
import { getErrorMessage } from "@/utils/request.utils";

export function useRequestHistory() {
  const loadHistory = useCallback(
    async (
      requestId: string | number,
      setHistory: (history: RequestHistoryItem[]) => void,
      setIsHistoryLoading: (loading: boolean) => void,
      setModalError: (error: string) => void,
    ) => {
      setIsHistoryLoading(true);
      setModalError("");

      try {
        const response = await apiRequest<
          RequestHistoryItem[] | { data?: RequestHistoryItem[] }
        >(`/requests/${requestId}/history`);

        setHistory(
          Array.isArray(response) ? response : response.data ?? [],
        );
      } catch (error) {
        setModalError(getErrorMessage(error));
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [],
  );

  return { loadHistory };
}