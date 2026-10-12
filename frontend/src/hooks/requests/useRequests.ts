"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, getCurrentUser } from "@/lib/api";
import type { AuthUser } from "@/types/auth.types";
import type { RequestItem, RequestsResponse } from "@/types/request.types";
import { getErrorMessage } from "@/utils/request.utils";

interface UseRequestsFilters {
  search: string;
  statusFilter: string;
  priorityFilter: string;
}

interface UseRequestsReturn {
  requests: RequestItem[];
  isLoading: boolean;
  pageError: string;
  currentUser: AuthUser | null;
  filters: UseRequestsFilters;
  setFilters: (filters: Partial<UseRequestsFilters>) => void;
  refresh: () => Promise<void>;
  clearFilters: () => void;
  setRequests: (updater: RequestItem[] | ((prev: RequestItem[]) => RequestItem[])) => void;
}

export function useRequests(): UseRequestsReturn {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [filters, setFiltersState] = useState<UseRequestsFilters>({
    search: "",
    statusFilter: "",
    priorityFilter: "",
  });

  const setFilters = useCallback((newFilters: Partial<UseRequestsFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const loadRequests = useCallback(async () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.statusFilter) {
      params.set("status", filters.statusFilter);
    }

    if (filters.priorityFilter) {
      params.set("priority", filters.priorityFilter);
    }

    params.set("order", "DESC");
    params.set("page", "1");
    params.set("limit", "100");

    const query = params.toString();
    const response = await apiRequest<RequestItem[] | RequestsResponse>(
      `/requests${query ? `?${query}` : ""}`,
    );

    if (Array.isArray(response)) {
      setRequests(response);
      return;
    }

    setRequests(response.data ?? response.items ?? []);
  }, [filters]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setPageError("");
    try {
      await loadRequests();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [loadRequests]);

  const clearFilters = useCallback(async () => {
    setFiltersState({ search: "", statusFilter: "", priorityFilter: "" });
    setIsLoading(true);
    setPageError("");
    try {
      const response = await apiRequest<RequestItem[] | RequestsResponse>(
        "/requests?order=DESC&page=1&limit=100",
      );
      setRequests(
        Array.isArray(response) ? response : response.data ?? response.items ?? [],
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initializePage() {
      setIsLoading(true);
      setPageError("");

      try {
        const user = await getCurrentUser();
        if (!active) return;
        setCurrentUser(user);

        const params = new URLSearchParams();
        params.set("order", "DESC");
        params.set("page", "1");
        params.set("limit", "100");

        const response = await apiRequest<RequestItem[] | RequestsResponse>(
          `/requests?${params.toString()}`,
        );
        if (!active) return;

        if (Array.isArray(response)) {
          setRequests(response);
        } else {
          setRequests(response.data ?? response.items ?? []);
        }
      } catch (error) {
        if (active) {
          setPageError(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void initializePage();

    return () => {
      active = false;
    };
  }, []);

  return {
    requests,
    isLoading,
    pageError,
    currentUser,
    filters,
    setFilters,
    refresh,
    clearFilters,
    setRequests,
  };
}