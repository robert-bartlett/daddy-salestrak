import type { DataTableColumnMeta, DataTableDensity } from './data-table-types';

/**
 * Density configuration for cell padding and text styling.
 */
export const DENSITY_CONFIG: Record<
  DataTableDensity,
  {
    cellPadding: string;
    cellPaddingWithLeft: string;
    headerPadding: string;
    headerPaddingWithLeft: string;
    textSize: string;
    rowHeight: number;
  }
> = {
  compact: {
    cellPadding: 'pr-2 py-1',
    cellPaddingWithLeft: 'px-2 py-1',
    headerPadding: 'pr-2 py-1.5',
    headerPaddingWithLeft: 'px-2 py-1.5',
    textSize: 'text-xs',
    rowHeight: 32,
  },
  regular: {
    cellPadding: 'pr-3 py-2',
    cellPaddingWithLeft: 'px-3 py-2',
    headerPadding: 'pr-3 py-2.5',
    headerPaddingWithLeft: 'px-3 py-2.5',
    textSize: 'text-sm',
    rowHeight: 44,
  },
  spacious: {
    cellPadding: 'pr-4 py-3',
    cellPaddingWithLeft: 'px-4 py-3',
    headerPadding: 'pr-4 py-3.5',
    headerPaddingWithLeft: 'px-4 py-3.5',
    textSize: 'text-base',
    rowHeight: 56,
  },
};


/**
 * Build inline style object for column width constraints.
 */
export function getColumnWidthStyle(meta?: DataTableColumnMeta): {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
} {
  if (!meta) {
    return { flex: 1, minWidth: 80 };
  }

  const style: {
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    flex?: number;
  } = {};

  if (meta.width !== undefined) {
    style.width = meta.width;
    style.minWidth = meta.width;
    style.maxWidth = meta.width;
  } else {
    // Flexible width with constraints
    style.flex = 1;
    style.minWidth = meta.minWidth ?? 80;
    if (meta.maxWidth !== undefined) {
      style.maxWidth = meta.maxWidth;
    }
  }

  return style;
}

/**
 * Get truncation class based on meta.
 */
export function getTruncationClass(meta?: DataTableColumnMeta): string {
  if (meta?.truncate) {
    return 'overflow-hidden';
  }
  return '';
}

/**
 * Default page sizes for pagination.
 */
export const DEFAULT_PAGE_SIZES = [10, 20, 30, 50, 100];

/**
 * Selection column width (fixed).
 */
export const SELECTION_COLUMN_WIDTH = 44;

/**
 * Extract column meta with proper typing.
 */
export function getColumnMeta(
  column: { columnDef: { meta?: unknown } }
): DataTableColumnMeta | undefined {
  return column.columnDef.meta as DataTableColumnMeta | undefined;
}
