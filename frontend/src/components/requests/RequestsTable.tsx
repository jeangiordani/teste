"use client";

import type { RequestItem } from "@/types/request.types";
import { getUserName, getPriorityLabel, getStatusLabel, getStatusClass, formatDate } from "@/utils/request.utils";
import { Button } from "@/components/ui/button";

interface RequestsTableProps {
  requests: RequestItem[];
  isLoading: boolean;
  onRowClick: (request: RequestItem) => void;
}

export function RequestsTable({
  requests,
  isLoading,
  onRowClick,
}: RequestsTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between border-b px-4 py-4">
        <h2 className="font-semibold">Todas as solicitações</h2>
        <span className="text-sm text-muted-foreground">
          {requests.length} registro(s)
        </span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Carregando solicitações...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma solicitação encontrada.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Solicitação</th>
                <th className="px-4 py-3">Solicitante</th>
                <th className="px-4 py-3">Área de destino</th>
                <th className="px-4 py-3">Prioridade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onRowClick(request)}
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">{request.title}</div>
                    <div className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                      {request.description}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      #{request.id}
                    </div>
                  </td>
                  <td className="px-4 py-4">{getUserName(request.requester)}</td>
                  <td className="px-4 py-4">{request.targetArea?.name ?? "—"}</td>
                  <td className="px-4 py-4">{getPriorityLabel(request.priority)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(request.status)}`}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(request);
                      }}
                    >
                      Ações
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}