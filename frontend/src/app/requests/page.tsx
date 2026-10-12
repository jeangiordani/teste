"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { RequestItem, RequestStatus, RequestPriority, RequestHistoryItem, RequestArea } from "@/types/request.types";

import {
  RequestFilters,
  RequestsTable,
  RequestModal,
  CreateRequestModal,
} from "@/components/requests";
import {
  useRequests,
  useRequestActions,
  useRequestHistory,
  useCreateRequest,
} from "@/hooks/requests";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RequestsPage() {
  const router = useRouter();
  const { user: _user, isLoading: isAuthLoading, error: authError } = useAuth();

  const {
    requests,
    isLoading,
    pageError,
    currentUser,
    filters,
    setFilters,
    refresh,
    clearFilters,
    setRequests,
  } = useRequests();

  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<RequestPriority>("MEDIUM");
  const [newStatus, setNewStatus] = useState<RequestStatus>("OPEN");
  const [comment, setComment] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [areas, setAreas] = useState<RequestArea[]>([]);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPriority, setCreatePriority] = useState<RequestPriority>("MEDIUM");
  const [createTargetAreaId, setCreateTargetAreaId] = useState("");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const requestActions = useRequestActions({
    currentUser: currentUser as { id: string; role: string; areaId?: string } | null,
  });

  const requestHistory = useRequestHistory();
  const createRequest = useCreateRequest();

  const permissions = selectedRequest
    ? requestActions.getPermissions(selectedRequest)
    : {
        canEdit: false,
        canDelete: false,
        canChangeStatus: false,
        isAdmin: false,
        isRequester: false,
        belongsToDestinationArea: false,
      };

  const actionContext = useMemo(
    () => ({
      selectedRequest,
      editTitle,
      editDescription,
      editPriority,
      newStatus,
      comment,
      setSelectedRequest,
      setEditTitle,
      setEditDescription,
      setEditPriority,
      setNewStatus,
      setComment,
      setIsEditing,
      setIsSaving,
      setModalError,
      setSuccessMessage,
      setRequests,
      setHistory,
      isSaving,
      isEditing,
    }),
    [
      selectedRequest,
      editTitle,
      editDescription,
      editPriority,
      newStatus,
      comment,
      setSelectedRequest,
      setEditTitle,
      setEditDescription,
      setEditPriority,
      setNewStatus,
      setComment,
      setIsEditing,
      setIsSaving,
      setModalError,
      setSuccessMessage,
      setRequests,
      setHistory,
      isSaving,
      isEditing,
    ],
  );

  const handleOpenModal = useCallback((request: RequestItem) => {
    requestActions.openModal(request, {
      setSelectedRequest,
      setEditTitle,
      setEditDescription,
      setEditPriority,
      setNewStatus,
      setComment,
      setIsEditing,
      setModalError,
      setSuccessMessage,
    });
  }, [requestActions]);

  const handleCloseModal = useCallback(() => {
    requestActions.closeModal({
      setSelectedRequest,
      setIsEditing,
      setModalError,
      setSuccessMessage,
    }, isSaving);
    setHistory([]);
  }, [requestActions, isSaving]);

  const handleLoadHistory = useCallback(async () => {
    if (!selectedRequest) return;
    await requestHistory.loadHistory(
      selectedRequest.id,
      setHistory,
      setIsHistoryLoading,
      setModalError,
    );
  }, [selectedRequest, requestHistory]);

  const handleSaveChanges = useCallback(async () => {
    await requestActions.handleSaveChanges(actionContext, permissions.canEdit);
  }, [requestActions, actionContext, permissions.canEdit]);

  const handleChangeStatus = useCallback(async () => {
    await requestActions.handleChangeStatus(actionContext, permissions.canChangeStatus);
    if (selectedRequest) {
      await handleLoadHistory();
    }
  }, [requestActions, actionContext, permissions.canChangeStatus, selectedRequest, handleLoadHistory]);

  const handleDelete = useCallback(async () => {
    await requestActions.handleDelete(actionContext, permissions.canDelete);
    setSelectedRequest(null);
  }, [requestActions, actionContext, permissions.canDelete]);

  const handleOpenCreateModal = useCallback(async () => {
    setIsCreateModalOpen(true);
    setCreateError("");
    setCreateTitle("");
    setCreateDescription("");
    setCreatePriority("MEDIUM");
    setCreateTargetAreaId("");
    await createRequest.loadAreas(
      setAreas,
      setIsLoadingAreas,
      setCreateError,
      setCreateTargetAreaId,
    );
  }, [createRequest]);

  const handleCloseCreateModal = useCallback(() => {
    if (isCreating) return;
    setIsCreateModalOpen(false);
    setCreateError("");
  }, [isCreating]);

  const handleCreate = useCallback(async () => {
    await createRequest.handleCreate({
      createTitle,
      createDescription,
      createPriority,
      createTargetAreaId,
      setIsCreating,
      setCreateError,
      setPageError: setModalError,
      setSuccessMessage,
      setIsCreateModalOpen,
      refresh,
    });
  }, [createRequest, createTitle, createDescription, createPriority, createTargetAreaId, refresh]);

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Acesso negado</CardTitle>
            <CardDescription>{authError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Voltar ao painel
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">Solicitações</h1>
            <p className="text-sm text-muted-foreground">
              Consulte as solicitações e gerencie as ações permitidas para o seu
              usuário.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleOpenCreateModal}>
              + Cadastrar solicitação
            </Button>
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Voltar para Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {pageError && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {pageError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {successMessage}
          </div>
        )}

        <Card>
          <CardContent className="pt-0">
            <RequestFilters
              search={filters.search}
              statusFilter={filters.statusFilter}
              priorityFilter={filters.priorityFilter}
              isLoading={isLoading}
              onSearchChange={(value) => setFilters({ search: value })}
              onStatusChange={(value) => setFilters({ statusFilter: value })}
              onPriorityChange={(value) => setFilters({ priorityFilter: value })}
              onSubmit={refresh}
              onClear={clearFilters}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <RequestsTable
              requests={requests}
              isLoading={isLoading}
              onRowClick={handleOpenModal}
            />
          </CardContent>
        </Card>

        {selectedRequest && (
          <RequestModal
            request={selectedRequest}
            onClose={handleCloseModal}
            isSaving={isSaving}
            modalError={modalError}
            successMessage={successMessage}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editTitle={editTitle}
            editDescription={editDescription}
            editPriority={editPriority}
            setEditTitle={setEditTitle}
            setEditDescription={setEditDescription}
            setEditPriority={setEditPriority}
            newStatus={newStatus}
            comment={comment}
            setNewStatus={setNewStatus}
            setComment={setComment}
            canEdit={permissions.canEdit}
            canChangeStatus={permissions.canChangeStatus}
            canDelete={permissions.canDelete}
            onSaveChanges={handleSaveChanges}
            onChangeStatus={handleChangeStatus}
            onDelete={handleDelete}
            history={history}
            isHistoryLoading={isHistoryLoading}
            onLoadHistory={handleLoadHistory}
          />
        )}

        <CreateRequestModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          isLoadingAreas={isLoadingAreas}
          areas={areas}
          createTitle={createTitle}
          createDescription={createDescription}
          createPriority={createPriority}
          createTargetAreaId={createTargetAreaId}
          createError={createError}
          isCreating={isCreating}
          onTitleChange={setCreateTitle}
          onDescriptionChange={setCreateDescription}
          onPriorityChange={setCreatePriority}
          onTargetAreaChange={setCreateTargetAreaId}
          onSubmit={handleCreate}
        />
      </div>
    </main>
  );
}