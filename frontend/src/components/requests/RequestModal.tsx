"use client";

import { useRef, useEffect } from "react";
import type { RequestItem, RequestStatus, RequestPriority } from "@/types/request.types";
import { RequestDetail } from "./RequestDetail";
import { RequestForm } from "./RequestForm";
import { StatusChangeForm } from "./StatusChangeForm";
import { HistoryList } from "./HistoryList";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RequestModalProps {
  request: RequestItem;
  onClose: () => void;
  isSaving: boolean;
  modalError: string;
  successMessage: string;
  isEditing: boolean;
  setIsEditing: (value: boolean | ((prev: boolean) => boolean)) => void;
  editTitle: string;
  editDescription: string;
  editPriority: RequestPriority;
  setEditTitle: (value: string) => void;
  setEditDescription: (value: string) => void;
  setEditPriority: (value: RequestPriority) => void;
  newStatus: RequestStatus;
  comment: string;
  setNewStatus: (value: RequestStatus) => void;
  setComment: (value: string) => void;
  canEdit: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  onSaveChanges: () => Promise<void>;
  onChangeStatus: () => Promise<void>;
  onDelete: () => Promise<void>;
  history: Array<{
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
  }>;
  isHistoryLoading: boolean;
  onLoadHistory: () => void;
}

export function RequestModal({
  request,
  onClose,
  isSaving,
  modalError,
  successMessage,
  isEditing,
  setIsEditing,
  editTitle,
  editDescription,
  editPriority,
  setEditTitle,
  setEditDescription,
  setEditPriority,
  newStatus,
  comment,
  setNewStatus,
  setComment,
  canEdit,
  canChangeStatus,
  canDelete,
  onSaveChanges,
  onChangeStatus,
  onDelete,
  history,
  isHistoryLoading,
  onLoadHistory,
}: RequestModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
        className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h2 id="request-modal-title" className="text-xl font-bold">
              {request.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Solicitação #{request.id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Fechar modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </header>

        <div className="space-y-5 p-5">
          {modalError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {modalError}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              {successMessage}
            </div>
          )}

          <RequestDetail request={request} />

          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Descrição</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {request.description || "Sem descrição."}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Ações disponíveis</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {canEdit
                ? "Você tem permissão para editar esta solicitação."
                : canChangeStatus
                ? "Você pode alterar o status desta solicitação."
                : "Você pode consultar os dados, mas não pode alterá-los."}
            </p>

            {canEdit && (
              <div className="mt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? "Cancelar edição" : "Editar solicitação"}
                </Button>

                <RequestForm
                  isEditing={isEditing}
                  editTitle={editTitle}
                  editDescription={editDescription}
                  editPriority={editPriority}
                  onEditTitleChange={setEditTitle}
                  onEditDescriptionChange={setEditDescription}
                  onEditPriorityChange={setEditPriority}
                  onSave={onSaveChanges}
                  isSaving={isSaving}
                />
              </div>
            )}

            {canChangeStatus && (
              <StatusChangeForm
                newStatus={newStatus}
                selectedRequestStatus={request.status}
                comment={comment}
                onNewStatusChange={setNewStatus}
                onCommentChange={setComment}
                onSave={onChangeStatus}
                isSaving={isSaving}
                canChange={canChangeStatus}
              />
            )}

            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger
                  className="mt-3 w-full inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Excluir solicitação
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir solicitação</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a solicitação &ldquo;{request.title}&rdquo;?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} disabled={isSaving}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <HistoryList
            history={history}
            isHistoryLoading={isHistoryLoading}
            onLoadHistory={onLoadHistory}
          />
        </div>

        <footer className="flex justify-end border-t p-5">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Fechar
          </Button>
        </footer>
      </section>
    </div>
  );
}