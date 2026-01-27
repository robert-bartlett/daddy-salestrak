import type {
  Column,
  ColumnDef,
  Row,
  Table,
} from '@tanstack/react-table';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react-native';

/**
 * Semantic column metadata for layout and formatting control.
 * Applied via column.meta in column definitions.
 */
export type DataTableColumnMeta = {
  /** Fixed column width in pixels */
  width?: number;
  /** Minimum column width in pixels */
  minWidth?: number;
  /** Maximum column width in pixels */
  maxWidth?: number;
  /** Whether the column contains numeric data (right-aligns content) */
  isNumeric?: boolean;
  /** Whether to truncate long text with ellipsis */
  truncate?: boolean;
};

/**
 * Extended column definition with typed meta.
 */
export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<
  TData,
  TValue
> & {
  meta?: DataTableColumnMeta;
};

/**
 * Density variants controlling cell padding and text size.
 */
export type DataTableDensity = 'compact' | 'regular' | 'spacious';

/**
 * Props for the main DataTable component.
 */
export type DataTableProps<TData> = {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Enable sticky header behavior */
  stickyHeader?: boolean;
  /** Cell density (padding and text size) */
  density?: DataTableDensity;
  /** Alternate row background colors */
  striped?: boolean;
  /** Show loading state instead of rows */
  loading?: boolean;
  /** Custom empty state content */
  emptyState?: ReactNode;
  /** Callback when a row is pressed */
  onRowPress?: (row: Row<TData>) => void;
  /** Determine if a row should be pressable */
  rowPressable?: (row: Row<TData>) => boolean;
  /** Test ID for testing */
  testID?: string;
};

/**
 * Props for sortable/hideable column header.
 */
export type DataTableColumnHeaderProps<TData, TValue = unknown> = {
  /** TanStack column instance */
  column: Column<TData, TValue>;
  /** Display title for the header */
  title: string;
  /** Whether the column can be hidden (defaults to column.getCanHide()) */
  canHide?: boolean;
};

/**
 * Props for pagination controls.
 */
export type DataTablePaginationProps<TData> = {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Available page size options */
  pageSizes?: number[];
};

/**
 * Filter configuration for toolbar.
 */
export type DataTableFilterConfig = {
  /** Column ID to filter */
  columnId: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Accessible label for the filter */
  label?: string;
};

/**
 * Props for the toolbar component.
 */
export type DataTableToolbarProps<TData> = {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Filter configurations */
  filters?: DataTableFilterConfig[];
  /** Show column visibility options */
  showViewOptions?: boolean;
};

/**
 * Props for column visibility options.
 */
export type DataTableViewOptionsProps<TData> = {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Button label text */
  label?: string;
};

/**
 * Action item configuration for row actions menu.
 */
export type DataTableActionItem<TData> = {
  /** Unique identifier for the action */
  id: string;
  /** Display label */
  label: string;
  /** Callback when action is selected */
  onSelect: (row: TData) => void;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Optional Lucide icon component */
  icon?: LucideIcon;
};

/**
 * Props for row actions component.
 */
export type DataTableRowActionsProps<TData> = {
  /** TanStack row instance */
  row: Row<TData>;
  /** Action items to display in the menu */
  items: DataTableActionItem<TData>[];
  /** Accessible label for the trigger button */
  label?: string;
};

/**
 * Props for empty state component.
 */
export type DataTableEmptyProps = {
  /** Custom message to display */
  message?: string;
  /** Custom content to render */
  children?: ReactNode;
};

/**
 * Props for loading state component.
 */
export type DataTableLoadingProps = {
  /** Custom message to display */
  message?: string;
};
