"use client";

import { PRIORITY_OPTIONS } from "@/constants/request.constants";
import type { RequestPriority } from "@/types/request.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface RequestFormProps {
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  editPriority: RequestPriority;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onEditPriorityChange: (value: RequestPriority) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function RequestForm({
  isEditing,
  editTitle,
  editDescription,
  editPriority,
  onEditTitleChange,
  onEditDescriptionChange,
  onEditPriorityChange,
  onSave,
  isSaving,
}: RequestFormProps) {
  if (!isEditing) return null;

  return (
    <div className="space-y-3 rounded-md bg-muted/50 p-4">
      <div className="space-y-2">
        <Label htmlFor="editTitle">Título</Label>
        <Input
          id="editTitle"
          value={editTitle}
          onChange={(event) => onEditTitleChange(event.target.value)}
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="editDescription">Descrição</Label>
        <textarea
          id="editDescription"
          value={editDescription}
          onChange={(event) => onEditDescriptionChange(event.target.value)}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="editPriority">Prioridade</Label>
        <Select
          value={editPriority}
          onValueChange={(value) => onEditPriorityChange(value as RequestPriority)}
        >
          <SelectTrigger id="editPriority">
            <SelectValue>{getPriorityLabel(editPriority)}</SelectValue>
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
      <Button onClick={onSave} disabled={isSaving} className="w-full">
        {isSaving ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  );
}