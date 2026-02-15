/**
 * Hook to read data table filter menu filters from URL and transform them for backend.
 * 
 * This hook reads the `filters` URL parameter (JSON array format from DataTableFilterMenu)
 * and transforms it to the backend-compatible format.
 */

import type { ColumnDef } from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { getFiltersStateParser } from "../lib/parsers";
import { transformFiltersForBackend } from "../lib/transform-filters";

/**
 * Hook that reads filters from URL (set by DataTableFilterMenu) and transforms
 * them for backend consumption.
 * 
 * @param columns - Column definitions to get filterKey from meta
 * @returns Backend-compatible filter object
 * 
 * @example
 * const columns = useOrderColumns();
 * const filters = useBackendFilters(columns);
 * 
 * useTypedOrdersQuery({ filters, ... });
 */
export function useBackendFilters<TData>(
  columns: ColumnDef<TData>[]
): Record<string, unknown> {
  const columnIds = useMemo(
    () => columns.filter((c) => c.id).map((c) => c.id as string),
    [columns]
  );

  const [filters] = useQueryState(
    "filters",
    getFiltersStateParser<TData>(columnIds).withDefault([])
  );

  const backendFilters = useMemo(
    () => transformFiltersForBackend(filters, columns),
    [filters, columns]
  );

  return backendFilters;
}
