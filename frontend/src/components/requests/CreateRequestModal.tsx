"use client";

import { PRIORITY_OPTIONS } from "@/constants/request.constants";
import type { RequestArea, RequestPriority } from "@/types/request.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getPriorityLabel(value: RequestPriority): string {
  return PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function getAreaName(areas: RequestArea[], areaId: string): string {
  return areas.find((a) => a.id === areaId)?.name ?? areaId;
}

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoadingAreas: boolean;
  areas: RequestArea[];
  createTitle: string;
  createDescription: string;
  createPriority: RequestPriority;
  createTargetAreaId: string;
  createError: string;
  isCreating: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: RequestPriority) => void;
  onTargetAreaChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}

export function CreateRequestModal({
  isOpen,
  onClose,
  isLoadingAreas,
  areas,
  createTitle,
  createDescription,
  createPriority,
  createTargetAreaId,
  createError,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onTargetAreaChange,
  onSubmit,
}: CreateRequestModalProps) {
  if (!isOpen) return null;

  return (
    <div
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
        aria-labelledby="create-request-modal-title"
        className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-background shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h2
              id="create-request-modal-title"
              className="text-xl font-bold"
            >
              Nova solicitação
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isCreating}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-5 p-5"
        >
          {createError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {createError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="createTitle">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="createTitle"
              value={createTitle}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Título da solicitação"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="createDescription">
              Descrição <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="createDescription"
              value={createDescription}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Descreva a solicitação..."
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="createPriority">Prioridade</Label>
              <Select
                value={createPriority}
                onValueChange={(value) => onPriorityChange(value as RequestPriority)}
              >
                <SelectTrigger id="createPriority">
                  <SelectValue>{getPriorityLabel(createPriority)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="createTargetAreaId">
                Área de destino <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createTargetAreaId}
                onValueChange={(value) => onTargetAreaChange(value ?? "")}
                disabled={isLoadingAreas}
                required
              >
                <SelectTrigger id="createTargetAreaId">
                  <SelectValue placeholder="Selecione uma área">
                    {createTargetAreaId ? getAreaName(areas, createTargetAreaId) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAreas ? (
                    <SelectItem value="" disabled>
                      Carregando áreas...
                    </SelectItem>
                  ) : (
                    areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t p-5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isCreating ||
                isLoadingAreas ||
                !createTitle.trim() ||
                !createDescription.trim() ||
                !createTargetAreaId
              }
            >
              {isCreating ? "Cadastrando..." : "Cadastrar solicitação"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}