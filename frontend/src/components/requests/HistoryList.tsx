"use client";

import { Button } from "@/components/ui/button";
import type { RequestHistoryItem } from "@/types/request.types";
import { getUserName, formatDate } from "@/utils/request.utils";

interface HistoryListProps {
  history: RequestHistoryItem[];
  isHistoryLoading: boolean;
  onLoadHistory: () => void;
}

export function HistoryList({
  history,
  isHistoryLoading,
  onLoadHistory,
}: HistoryListProps) {
  return (
    <div className="border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">Histórico</h3>
        <Button variant="outline" size="sm" onClick={onLoadHistory} disabled={isHistoryLoading}>
          {isHistoryLoading ? "Carregando..." : "Consultar histórico"}
        </Button>
      </div>

      {history.length > 0 ? (
        <ol className="mt-4 space-y-4">
          {history.map((item) => (
            <li key={item.id} className="border-l-2 border-primary/20 pl-4">
              <p className="text-sm font-medium">
                {item.description ?? item.action ?? "Alteração registrada"}
              </p>
              {item.previousStatus && item.newStatus && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.previousStatus} → {item.newStatus}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {item.changedByUser?.name ?? getUserName(item.user)} &middot;{" "}
                {formatDate(item.createdAt)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                Comentário: {item.comment?.trim() || "Sem comentário registrado."}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        !isHistoryLoading && (
          <p className="mt-3 text-sm text-muted-foreground">
            Clique em &ldquo;Consultar histórico&rdquo; para carregar os registros.
          </p>
        )
      )}
    </div>
  );
}