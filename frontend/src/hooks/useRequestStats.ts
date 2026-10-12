"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRequestStats } from "@/lib/api";
import type { RequestStats } from "@/lib/api";

export function useRequestStats() {
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!mountedRef.current || fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRequestStats();
      console.log("Stats API response:", data);
      if (mountedRef.current) {
        setStats(data);
      }
    } catch (err) {
      console.error("Stats API error:", err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}