"use client";

import { useCallback } from "react";
import { apiRequest } from "@/lib/api";
import type { RequestArea, RequestPriority } from "@/types/request.types";
import { getErrorMessage } from "@/utils/request.utils";

export function useCreateRequest() {
  const loadAreas = useCallback(
    async (
      setAreas: (areas: RequestArea[]) => void,
      setIsLoadingAreas: (loading: boolean) => void,
      setCreateError: (error: string) => void,
      setCreateTargetAreaId: (id: string) => void,
    ) => {
      setIsLoadingAreas(true);
      try {
        const response = await apiRequest<RequestArea[]>("/areas");
        const loadedAreas = Array.isArray(response) ? response : [];
        setAreas(loadedAreas);
        if (loadedAreas.length > 0) {
          setCreateTargetAreaId(loadedAreas[0].id);
        } else {
          setCreateError("Nenhuma área de destino foi encontrada.");
        }
      } catch (error) {
        setCreateError(
          `Não foi possível carregar as áreas de destino. ${getErrorMessage(error)}`,
        );
      } finally {
        setIsLoadingAreas(false);
      }
    },
    [],
  );

  const handleCreate = useCallback(
    async (
      ctx: {
        createTitle: string;
        createDescription: string;
        createPriority: RequestPriority;
        createTargetAreaId: string;
        setIsCreating: (creating: boolean) => void;
        setCreateError: (error: string) => void;
        setPageError: (error: string) => void;
        setSuccessMessage: (message: string) => void;
        setIsCreateModalOpen: (open: boolean) => void;
        refresh: () => Promise<void>;
      },
    ) => {
      const title = ctx.createTitle.trim();
      const description = ctx.createDescription.trim();

      if (!title) {
        ctx.setCreateError("Informe o título da solicitação.");
        return;
      }
      if (title.length > 150) {
        ctx.setCreateError("O título deve ter no máximo 150 caracteres.");
        return;
      }
      if (!description) {
        ctx.setCreateError("Informe a descrição da solicitação.");
        return;
      }
      if (!ctx.createTargetAreaId) {
        ctx.setCreateError("Selecione a área de destino.");
        return;
      }

      ctx.setIsCreating(true);
      ctx.setCreateError("");
      ctx.setPageError("");
      ctx.setSuccessMessage("");

      try {
        await apiRequest("/requests", {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            priority: ctx.createPriority,
            targetAreaId: ctx.createTargetAreaId,
          }),
        });

        ctx.setIsCreateModalOpen(false);
        ctx.setSuccessMessage("Solicitação cadastrada com sucesso.");

        try {
          await ctx.refresh();
        } catch {
          // The created item remains visible if refreshing the list fails.
        }
      } catch (error) {
        ctx.setCreateError(getErrorMessage(error));
      } finally {
        ctx.setIsCreating(false);
      }
    },
    [],
  );

  return { loadAreas, handleCreate };
}