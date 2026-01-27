import type { Row, Table } from '@tanstack/react-table';
import * as React from 'react';

import { Checkbox } from '../checkbox';
import type { DataTableColumnDef } from './data-table-types';
import { SELECTION_COLUMN_WIDTH } from './data-table-utils';

/**
 * Selection header checkbox component.
 * Handles select-all for visible rows (current page, filtered).
 *
 * Supports three states:
 * - Unchecked: No rows selected
 * - Indeterminate: Some rows selected (visual support pending in Checkbox component)
 * - Checked: All rows selected
 */
function SelectionHeader<TData>({ table }: { table: Table<TData> }) {
  const isAllSelected = table.getIsAllPageRowsSelected();
  const isSomeSelected = table.getIsSomePageRowsSelected();

  // Determine the checkbox state
  // Note: When Checkbox component adds visual indeterminate support,
  // pass indeterminate={isSomeSelected && !isAllSelected}
  const checked = isAllSelected || (isSomeSelected ? 'indeterminate' : false);

  return (
    <Checkbox
      checked={checked === 'indeterminate' ? false : checked}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label={
        isAllSelected
          ? 'Deselect all rows'
          : isSomeSelected
            ? 'Select all rows (some selected)'
            : 'Select all rows'
      }
    />
  );
}

/**
 * Selection cell checkbox component.
 * Handles individual row selection.
 */
function SelectionCell<TData>({ row }: { row: Row<TData> }) {
  const canSelect = row.getCanSelect();

  return (
    <Checkbox
      checked={row.getIsSelected()}
      disabled={!canSelect}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  );
}

/**
 * Creates a selection column definition for row selection.
 *
 * The header checkbox toggles all visible rows (current page when paginated).
 * Uses `table.getIsAllPageRowsSelected()` and `table.toggleAllPageRowsSelected()`
 * to ensure only visible rows are affected.
 *
 * @example
 * ```tsx
 * const columns: DataTableColumnDef<Payment>[] = [
 *   createSelectionColumn<Payment>(),
 *   { accessorKey: 'email', header: 'Email' },
 *   // ... other columns
 * ];
 * ```
 */
export function createSelectionColumn<TData>(): DataTableColumnDef<TData, unknown> {
  const columnDef: DataTableColumnDef<TData, unknown> = {
    id: 'select',
    header: ({ table }) => <SelectionHeader table={table} />,
    cell: ({ row }) => <SelectionCell row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: {
      width: SELECTION_COLUMN_WIDTH,
    },
  };
  return columnDef;
}
