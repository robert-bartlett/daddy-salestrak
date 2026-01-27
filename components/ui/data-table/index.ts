/**
 * DataTable - A composable, virtualized data table system built on TanStack Table.
 *
 * This module provides headless table primitives with React Native support,
 * following the shadcn/ui pattern of composable components.
 *
 * @example
 * ```tsx
 * import {
 *   DataTable,
 *   DataTableColumnHeader,
 *   DataTablePagination,
 *   DataTableToolbar,
 *   createSelectionColumn,
 *   type DataTableColumnDef,
 * } from '@/components/ui/data-table';
 *
 * type Payment = { id: string; amount: number; status: string; email: string };
 *
 * const columns: DataTableColumnDef<Payment>[] = [
 *   createSelectionColumn<Payment>(),
 *   {
 *     accessorKey: 'email',
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title="Email" />
 *     ),
 *   },
 *   // ... more columns
 * ];
 *
 * function PaymentsTable({ data }: { data: Payment[] }) {
 *   const table = useReactTable({
 *     data,
 *     columns,
 *     getCoreRowModel: getCoreRowModel(),
 *     // ... other options
 *   });
 *
 *   return (
 *     <VStack gap="lg">
 *       <DataTableToolbar table={table} filters={[{ columnId: 'email' }]} showViewOptions />
 *       <DataTable table={table} density="regular" striped />
 *       <DataTablePagination table={table} />
 *     </VStack>
 *   );
 * }
 * ```
 */

// Core table component
export { DataTable, DataTableCell } from './data-table';

// Table hook with default cell theming
export { useReactTable } from './data-table-hook';

// Header components
export { DataTableColumnHeader } from './data-table-column-header';

// State components
export { DataTableEmpty } from './data-table-empty';
export { DataTableLoading } from './data-table-loading';

// Pagination and controls
export { DataTablePagination } from './data-table-pagination';
export { DataTableViewOptions } from './data-table-view-options';
export { DataTableToolbar } from './data-table-toolbar';

// Row actions
export { DataTableRowActions } from './data-table-row-actions';

// Selection helpers
export { createSelectionColumn } from './data-table-selection-column';

// Types
export type {
  DataTableActionItem,
  DataTableColumnDef,
  DataTableColumnHeaderProps,
  DataTableColumnMeta,
  DataTableDensity,
  DataTableEmptyProps,
  DataTableFilterConfig,
  DataTableLoadingProps,
  DataTablePaginationProps,
  DataTableProps,
  DataTableRowActionsProps,
  DataTableToolbarProps,
  DataTableViewOptionsProps,
} from './data-table-types';

// Utilities
export {
  DEFAULT_PAGE_SIZES,
  DENSITY_CONFIG,
  getColumnMeta,
  getColumnWidthStyle,
  getTruncationClass,
  SELECTION_COLUMN_WIDTH,
} from './data-table-utils';

// Re-export useful TanStack Table types for convenience
export type {
  CellContext,
  Column,
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  Table,
  VisibilityState,
} from '@tanstack/react-table';

// Re-export TanStack Table utilities consumers will need
export {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
