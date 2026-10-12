"use client";

import type { RequestItem } from "@/types/request.types";
import { getUserName, getPriorityLabel, getStatusLabel, getStatusClass } from "@/utils/request.utils";

interface RequestDetailProps {
  request: RequestItem;
}

export function RequestDetail({ request }: RequestDetailProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Solicitante</p>
        <p className="mt-1 font-medium">{getUserName(request.requester)}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Área de destino</p>
        <p className="mt-1 font-medium">{request.targetArea?.name ?? "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Status atual</p>
        <span
          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(request.status)}`}
        >
          {getStatusLabel(request.status)}
        </span>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Prioridade</p>
        <p className="mt-1 font-medium">{getPriorityLabel(request.priority)}</p>
      </div>
    </div>
  );
}