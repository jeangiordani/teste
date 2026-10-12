"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getCurrentUser, clearAccessToken } from "@/lib/api";
import type { AuthUser } from "@/types/auth.types";

interface UseAuthOptions {
  requiredRole?: "ADMIN" | "USER";
  redirectTo?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { requiredRole, redirectTo = "/login" } = options;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!getAccessToken()) {
        if (active) {
          router.replace(redirectTo);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (!active) return;

        if (requiredRole && currentUser.role !== requiredRole) {
          setError(
            requiredRole === "ADMIN"
              ? "Acesso restrito a administradores."
              : "Acesso não autorizado.",
          );
          return;
        }

        setUser(currentUser);
      } catch {
        if (active) {
          clearAccessToken();
          router.replace(redirectTo);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [router, redirectTo, requiredRole]);

  const logout = () => {
    clearAccessToken();
    router.replace(redirectTo);
  };

  return { user, isLoading, error, logout };
}