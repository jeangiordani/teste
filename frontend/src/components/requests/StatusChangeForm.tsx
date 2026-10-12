"use client";

import { STATUS_OPTIONS } from "@/constants/request.constants";
import type { RequestStatus } from "@/types/request.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getStatusLabel(value: RequestStatus): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

interface StatusChangeFormProps {
  newStatus: RequestStatus;
  selectedRequestStatus: RequestStatus;
  comment: string;
  onNewStatusChange: (value: RequestStatus) => void;
  onCommentChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  canChange: boolean;
}

export function StatusChangeForm({
  newStatus,
  selectedRequestStatus,
  comment,
  onNewStatusChange,
  onCommentChange,
  onSave,
  isSaving,
  canChange,
}: StatusChangeFormProps) {
  return (
    <div className="mt-3 space-y-3 rounded-md bg-muted/50 p-4">
      <Label htmlFor="newStatus">Alterar status</Label>
      <Select
        value={newStatus}
        onValueChange={(value) => onNewStatusChange(value as RequestStatus)}
      >
        <SelectTrigger id="newStatus">
          <SelectValue>{getStatusLabel(newStatus)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-2">
        <Label htmlFor="comment">
          Comentário <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="Informe o motivo da alteração de status..."
          maxLength={500}
          required
          rows={3}
          disabled={isSaving}
        />
        <p className="text-xs text-muted-foreground">
          {comment.trim().length}/500 caracteres
        </p>
      </div>

      <Button
        onClick={onSave}
        disabled={
          isSaving ||
          newStatus === selectedRequestStatus ||
          !comment.trim() ||
          !canChange
        }
        className="w-full"
      >
        {isSaving ? "Salvando..." : "Atualizar status"}
      </Button>
    </div>
  );
}