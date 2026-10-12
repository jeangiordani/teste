"use client";

import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/constants/request.constants";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Search, Filter, X, Funnel } from "lucide-react";

interface RequestFiltersProps {
  search: string;
  statusFilter: string;
  priorityFilter: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
}

function getStatusLabel(value: string): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function getPriorityLabel(value: string): string {
  return PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function RequestFilters({
  search,
  statusFilter,
  priorityFilter,
  isLoading,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSubmit,
  onClear,
}: RequestFiltersProps) {
  const hasActiveFilters = search || statusFilter || priorityFilter;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Funnel className="h-4 w-4 text-muted-foreground" />
            Filtros
          </CardTitle>
          <CardDescription>
            Refine sua busca por solicitações
          </CardDescription>
        </div>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear} className="gap-1">
            <X className="h-3.5 w-3.5" />
            Limpar todos
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {search && (
              <FilterChip
                label={`Busca: "${search}"`}
                onRemove={() => onSearchChange("")}
              />
            )}
            {statusFilter && (
              <FilterChip
                label={`Status: ${getStatusLabel(statusFilter)}`}
                onRemove={() => onStatusChange("")}
              />
            )}
            {priorityFilter && (
              <FilterChip
                label={`Prioridade: ${getPriorityLabel(priorityFilter)}`}
                onRemove={() => onPriorityChange("")}
              />
            )}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(event);
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          <div className="md:col-span-2 relative">
            <Label htmlFor="search" className="mb-1.5 block text-sm font-medium">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Título, descrição ou ID..."
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="statusFilter" className="mb-1.5 block text-sm font-medium">
              Status
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => onStatusChange(value ?? "")}
            >
              <SelectTrigger id="statusFilter">
                <SelectValue placeholder="Todos os status">
                  {statusFilter ? (
                    <>
                      <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-primary" />
                      {getStatusLabel(statusFilter)}
                    </>
                  ) : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priorityFilter" className="mb-1.5 block text-sm font-medium">
              Prioridade
            </Label>
            <Select
              value={priorityFilter}
              onValueChange={(value) => onPriorityChange(value ?? "")}
            >
              <SelectTrigger id="priorityFilter">
                <SelectValue placeholder="Todas as prioridades">
                  {priorityFilter ? (
                    <>
                      <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-primary" />
                      {getPriorityLabel(priorityFilter)}
                    </>
                  ) : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as prioridades</SelectItem>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 md:col-span-4 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1 md:flex-none min-w-[140px]">
              {isLoading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Filtrando...
                </>
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </>
              )}
            </Button>
            {hasActiveFilters && (
              <Button type="button" variant="outline" onClick={onClear} className="md:flex-none">
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}