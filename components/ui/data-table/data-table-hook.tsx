import {
  useReactTable as useTanstackReactTable,
  type CellContext,
  type TableOptions,
} from '@tanstack/react-table';
import * as React from 'react';

import { DataTableCell } from './data-table';
import type { DataTableColumnMeta } from './data-table-types';

/**
 * A wrapper around TanStack's useReactTable that provides a default cell renderer.
 *
 * The default cell renderer automatically wraps primitive values in DataTableCell,
 * applying proper alignment (right for numeric columns) and truncation based on
 * column meta configuration.
 *
 * @example
 * ```tsx
 * const table = useReactTable({
 *   data,
 *   columns,
 *   getCoreRowModel: getCoreRowModel(),
 * });
 * ```
 */
export function useReactTable<TData>(options: TableOptions<TData>) {
  const defaultColumn = React.useMemo(() => {
    const userDefaultColumn = options.defaultColumn ?? {};

    if (userDefaultColumn.cell) {
      return userDefaultColumn;
    }

    return {
      ...userDefaultColumn,
      cell: (context: CellContext<TData, unknown>) => {
        const meta = context.column.columnDef.meta as DataTableColumnMeta | undefined;
        const rendered = context.renderValue();

        if (rendered === null || rendered === undefined) {
          return null;
        }

        if (React.isValidElement(rendered)) {
          return rendered;
        }

        return (
          <DataTableCell truncate={meta?.truncate ?? true}>
            {rendered as React.ReactNode}
          </DataTableCell>
        );
      },
    };
  }, [options.defaultColumn]);

  return useTanstackReactTable({
    ...options,
    defaultColumn,
  });
}
