"use client";

import { useCallback } from "react";
import { apiRequest } from "@/lib/api";
import type { RequestItem, RequestStatus, RequestPriority } from "@/types/request.types";
import { getErrorMessage } from "@/utils/request.utils";

interface UseRequestActionsProps {
  currentUser: { id: string; role: string; areaId?: string } | null;
}

interface RequestActionContext {
  selectedRequest: RequestItem | null;
  editTitle: string;
  editDescription: string;
  editPriority: RequestPriority;
  newStatus: RequestStatus;
  comment: string;
  setSelectedRequest: (request: RequestItem | null | ((prev: RequestItem | null) => RequestItem | null)) => void;
  setEditTitle: (value: string) => void;
  setEditDescription: (value: string) => void;
  setEditPriority: (value: RequestPriority) => void;
  setNewStatus: (value: RequestStatus) => void;
  setComment: (value: string) => void;
  setIsEditing: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setModalError: (error: string) => void;
  setSuccessMessage: (message: string) => void;
  setRequests: (updater: RequestItem[] | ((prev: RequestItem[]) => RequestItem[])) => void;
  setHistory: (history: Array<{
    id: string | number;
    requestId?: string;
    action?: string;
    description?: string;
    previousStatus?: string | null;
    newStatus?: string | null;
    comment?: string | null;
    createdAt: string;
    changedByUser?: { id?: string; name?: string; email?: string };
    user?: { name?: string; username?: string };
  }>) => void;
  isSaving: boolean;
  isEditing: boolean;
}

export function useRequestActions({ currentUser }: UseRequestActionsProps) {
  const isAdmin = currentUser?.role === "ADMIN";

  const getPermissions = useCallback(
    (selectedRequest: RequestItem | null) => {
      const isRequester = selectedRequest
        ? String(selectedRequest.requester.id) === String(currentUser?.id)
        : false;

      const belongsToDestinationArea = selectedRequest
        ? String(selectedRequest.targetArea.id) === String(currentUser?.areaId ?? "")
        : false;

      return {
        canEdit: isAdmin || isRequester,
        canDelete: isAdmin || isRequester,
        canChangeStatus: isAdmin || belongsToDestinationArea,
        isAdmin,
        isRequester,
        belongsToDestinationArea,
      };
    },
    [currentUser, isAdmin],
  );

  const openModal = useCallback(
    (
      request: RequestItem,
      ctx: Pick<
        RequestActionContext,
        | "setSelectedRequest"
        | "setEditTitle"
        | "setEditDescription"
        | "setEditPriority"
        | "setNewStatus"
        | "setComment"
        | "setIsEditing"
        | "setModalError"
        | "setSuccessMessage"
      >,
    ) => {
      ctx.setSelectedRequest(request);
      ctx.setEditTitle(request.title);
      ctx.setEditDescription(request.description);
      ctx.setEditPriority(request.priority);
      ctx.setNewStatus(request.status);
      ctx.setComment("");
      ctx.setIsEditing(false);
      ctx.setModalError("");
      ctx.setSuccessMessage("");
    },
    [],
  );

  const closeModal = useCallback(
    (
      ctx: Pick<
        RequestActionContext,
        | "setSelectedRequest"
        | "setIsEditing"
        | "setModalError"
        | "setSuccessMessage"
      >,
      isSaving: boolean,
    ) => {
      if (isSaving) return;
      ctx.setSelectedRequest(null);
      ctx.setIsEditing(false);
      ctx.setModalError("");
      ctx.setSuccessMessage("");
    },
    [],
  );

  const handleSaveChanges = useCallback(
    async (
      ctx: Pick<
        RequestActionContext,
        | "selectedRequest"
        | "editTitle"
        | "editDescription"
        | "editPriority"
        | "setSelectedRequest"
        | "setRequests"
        | "setIsEditing"
        | "setSuccessMessage"
        | "setModalError"
        | "setIsSaving"
      >,
      canEdit: boolean,
    ) => {
      if (!ctx.selectedRequest || !canEdit) return;
      if (!ctx.editTitle.trim()) {
        ctx.setModalError("Informe o título da solicitação.");
        return;
      }

      ctx.setIsSaving(true);
      ctx.setModalError("");
      ctx.setSuccessMessage("");

      try {
        const updatedRequest = await apiRequest<RequestItem>(
          `/requests/${ctx.selectedRequest.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              title: ctx.editTitle.trim(),
              description: ctx.editDescription.trim(),
              priority: ctx.editPriority,
            }),
          },
        );

        ctx.setSelectedRequest((previous) =>
          previous ? { ...previous, ...updatedRequest } : null,
        );

        ctx.setRequests((previous) =>
          previous.map((request) =>
            String(request.id) === String(ctx.selectedRequest!.id)
              ? { ...request, ...updatedRequest }
              : request,
          ),
        );

        ctx.setIsEditing(false);
        ctx.setSuccessMessage("Solicitação atualizada com sucesso.");
      } catch (error) {
        ctx.setModalError(getErrorMessage(error));
      } finally {
        ctx.setIsSaving(false);
      }
    },
    [],
  );

  const handleChangeStatus = useCallback(
    async (
      ctx: Pick<
        RequestActionContext,
        | "selectedRequest"
        | "newStatus"
        | "comment"
        | "setSelectedRequest"
        | "setRequests"
        | "setComment"
        | "setSuccessMessage"
        | "setModalError"
        | "setIsSaving"
      >,
      canChangeStatus: boolean,
    ) => {
      if (!ctx.selectedRequest || !canChangeStatus) return;

      const trimmedComment = ctx.comment.trim();
      if (!trimmedComment) {
        ctx.setModalError("O comentário é obrigatório para alterar o status.");
        return;
      }
      if (trimmedComment.length > 500) {
        ctx.setModalError("O comentário deve ter no máximo 500 caracteres.");
        return;
      }

      ctx.setIsSaving(true);
      ctx.setModalError("");
      ctx.setSuccessMessage("");

      try {
        const updatedRequest = await apiRequest<RequestItem>(
          `/requests/${ctx.selectedRequest.id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: ctx.newStatus,
              comment: trimmedComment,
            }),
          },
        );

        const result: RequestItem = {
          ...ctx.selectedRequest,
          ...updatedRequest,
          status: updatedRequest.status ?? ctx.newStatus,
        };

        ctx.setSelectedRequest(result);
        ctx.setRequests((previous) =>
          previous.map((request) =>
            String(request.id) === String(ctx.selectedRequest!.id)
              ? { ...request, ...result }
              : request,
          ),
        );

        ctx.setComment("");
        ctx.setSuccessMessage("Status atualizado com sucesso.");
      } catch (error) {
        ctx.setModalError(getErrorMessage(error));
      } finally {
        ctx.setIsSaving(false);
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (
      ctx: Pick<
        RequestActionContext,
        | "selectedRequest"
        | "setRequests"
        | "setSelectedRequest"
        | "setSuccessMessage"
        | "setModalError"
        | "setIsSaving"
      >,
      canDelete: boolean,
    ) => {
      if (!ctx.selectedRequest || !canDelete) return;

      // const confirmed = window.confirm(
      //   `Deseja realmente excluir a solicitação "${ctx.selectedRequest.title}"?`,
      // );
      // if (!confirmed) return;

      ctx.setIsSaving(true);
      ctx.setModalError("");
      ctx.setSuccessMessage("");

      try {
        await apiRequest<void>(`/requests/${ctx.selectedRequest.id}`, {
          method: "DELETE",
        });

        ctx.setRequests((previous) =>
          previous.filter(
            (request) => String(request.id) !== String(ctx.selectedRequest!.id),
          ),
        );

        ctx.setSelectedRequest(null);
        ctx.setSuccessMessage("Solicitação excluída com sucesso.");
      } catch (error) {
        ctx.setModalError(getErrorMessage(error));
      } finally {
        ctx.setIsSaving(false);
      }
    },
    [],
  );

  return {
    getPermissions,
    openModal,
    closeModal,
    handleSaveChanges,
    handleChangeStatus,
    handleDelete,
  };
}