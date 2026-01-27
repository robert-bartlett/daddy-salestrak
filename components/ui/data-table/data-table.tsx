import { flexRender, type Header, type Row } from '@tanstack/react-table';
import * as React from 'react';
import { FlatList, Platform, Pressable, View } from 'react-native';

import { cn } from '@/lib/utils';

import { ScrollArea } from '../scroll-area';
import { Text, TextClassContext } from '../text';
import { DataTableEmpty } from './data-table-empty';
import { DataTableLoading } from './data-table-loading';
import type { DataTableColumnMeta, DataTableProps } from './data-table-types';
import {
  DENSITY_CONFIG,
  getColumnMeta,
  getColumnWidthStyle,
  getTruncationClass,
} from './data-table-utils';

/**
 * DataTable - A virtualized data table component built on TanStack Table.
 *
 * Renders headers and rows for a TanStack Table instance with support for:
 * - Virtualized rows via FlatList
 * - Sticky headers
 * - Density variants (compact, regular, spacious)
 * - Striped rows
 * - Loading and empty states
 * - Row press handling
 *
 * @example
 * ```tsx
 * const table = useReactTable({ data, columns, ... });
 *
 * <DataTable
 *   table={table}
 *   density="regular"
 *   striped
 *   stickyHeader
 * />
 * ```
 */
export function DataTable<TData>({
  table,
  stickyHeader = false,
  density = 'regular',
  striped = false,
  loading = false,
  emptyState,
  onRowPress,
  rowPressable,
  testID,
}: DataTableProps<TData>) {
  const densityConfig = DENSITY_CONFIG[density];
  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();
  const headerRowCount = headerGroups.length;

  // Get row selection state to trigger FlatList re-renders when selection changes
  const rowSelection = table.getState().rowSelection;
  const columnVisibility = table.getState().columnVisibility;

  // Calculate minimum width based on all visible columns
  // Use column IDs as dependency to avoid recalculating on every table state change
  const visibleColumns = table.getVisibleLeafColumns();
  const visibleColumnIds = visibleColumns.map((c) => c.id).join(',');

  const minTableWidth = React.useMemo(() => {
    let totalWidth = 0;
    for (const column of visibleColumns) {
      const meta = getColumnMeta(column);
      totalWidth += meta?.width ?? meta?.minWidth ?? 80;
    }
    return totalWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumnIds]);

  const getHeaderWidthStyle = React.useCallback((header: Header<TData, unknown>) => {
    if (header.colSpan <= 1) {
      const meta = getColumnMeta(header.column);
      return getColumnWidthStyle(meta);
    }

    const leafColumns = header
      .column
      .getLeafColumns()
      .filter((column) => (column.getIsVisible ? column.getIsVisible() : true));
    let minWidth = 0;
    let fixedWidth = 0;
    let hasFlexible = false;

    for (const column of leafColumns) {
      const meta = getColumnMeta(column);
      if (meta?.width !== undefined) {
        minWidth += meta.width;
        fixedWidth += meta.width;
      } else {
        hasFlexible = true;
        minWidth += meta?.minWidth ?? 80;
      }
    }

    if (hasFlexible) {
      return { flex: 1, minWidth };
    }

    return { width: fixedWidth, minWidth: fixedWidth, maxWidth: fixedWidth };
  }, []);

  // Key extractor for FlatList
  const keyExtractor = React.useCallback((row: Row<TData>) => row.id, []);

  // Get item layout for fixed height rows (improves performance)
  // Note: offset accounts for header rows rendered via ListHeaderComponent
  const getItemLayout = React.useCallback(
    (_data: ArrayLike<Row<TData>> | null | undefined, index: number) => ({
      length: densityConfig.rowHeight,
      offset: densityConfig.rowHeight * (index + headerRowCount), // header rows offset
      index,
    }),
    [densityConfig.rowHeight, headerRowCount]
  );

  // Header renderer
  const renderHeader = React.useCallback(() => {
    return (
      <View className={cn('border-b border-border', 'bg-muted/50')}>
        {headerGroups.map((headerGroup, groupIndex) => (
          <View
            key={headerGroup.id}
            className={cn(
              'flex-row',
              groupIndex < headerGroups.length - 1 && 'border-b border-border'
            )}
            style={{ height: densityConfig.rowHeight }}
            {...(Platform.OS === 'web' ? { role: 'row' } : null)}>
            {headerGroup.headers.map((header) => {
              const meta = getColumnMeta(header.column);
              const widthStyle = getHeaderWidthStyle(header);
              const isSelectionColumn = header.column.id === 'select';
              const padding = isSelectionColumn
                ? densityConfig.headerPaddingWithLeft
                : densityConfig.headerPadding;

              return (
                <View
                  key={header.id}
                  className={cn(
                    'flex-row items-center justify-start',
                    padding,
                    getTruncationClass(meta)
                  )}
                  style={widthStyle}
                  {...(Platform.OS === 'web' ? { role: 'columnheader' } : null)}>
                  {header.isPlaceholder
                    ? null
                    : (() => {
                        const content = flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        );
                        if (typeof content === 'string' || typeof content === 'number') {
                          return <Text weight="medium">{content}</Text>;
                        }
                        return content;
                      })()}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  }, [headerGroups, densityConfig, getHeaderWidthStyle]);

  // Row renderer
  const renderRow = React.useCallback(
    ({ item: row, index }: { item: Row<TData>; index: number }) => {
      const isPressable = !!onRowPress && (rowPressable ? rowPressable(row) : true);
      const isStriped = striped && index % 2 === 1;

      const rowContent = (
        <View
          className={cn(
            'flex-row',
            'border-b border-border',
            isStriped && 'bg-muted/30',
            isPressable &&
              Platform.select({
                web: 'cursor-pointer hover:bg-muted/50 active:bg-muted/70',
                default: '',
              })
          )}
          style={{ height: densityConfig.rowHeight }}
          {...(Platform.OS === 'web' ? { role: 'row' } : null)}>
          {row.getVisibleCells().map((cell) => {
            const meta = getColumnMeta(cell.column);
            const widthStyle = getColumnWidthStyle(meta);
            const isSelectionColumn = cell.column.id === 'select';
            const padding = isSelectionColumn
              ? densityConfig.cellPaddingWithLeft
              : densityConfig.cellPadding;

            return (
              <View
                key={cell.id}
                className={cn(
                  'flex-row items-center justify-start',
                  padding,
                  getTruncationClass(meta)
                )}
                style={widthStyle}
                {...(Platform.OS === 'web' ? { role: 'cell' } : null)}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </View>
            );
          })}
        </View>
      );

      if (isPressable) {
        return (
          <Pressable onPress={() => onRowPress(row)} accessibilityRole="button">
            {rowContent}
          </Pressable>
        );
      }

      return rowContent;
    },
    [onRowPress, rowPressable, striped, densityConfig]
  );

  // Empty state renderer
  const renderEmpty = React.useCallback(() => {
    if (loading) {
      return <DataTableLoading />;
    }
    return emptyState ?? <DataTableEmpty />;
  }, [loading, emptyState]);

  // The table content
  const listExtraData = React.useMemo(
    () => ({ rowSelection, columnVisibility }),
    [rowSelection, columnVisibility]
  );

  const tableContent = (
    <TextClassContext.Provider value={densityConfig.textSize}>
      <View style={{ minWidth: minTableWidth }}>
        <FlatList
          data={loading ? [] : rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={stickyHeader ? [0] : undefined}
          ListEmptyComponent={renderEmpty}
          testID={testID}
          // extraData triggers row re-renders when external state changes.
          // Only rowSelection and column visibility are needed because:
          // - Sorting: Changes the rows array order, so data prop changes → FlatList re-renders
          // - Column visibility: Row objects are stable; cells re-evaluate on re-render
          // - Row selection: Row object identity doesn't change, only selection state does
          extraData={listExtraData}
          // Performance optimizations
          removeClippedSubviews={Platform.OS !== 'web'}
          maxToRenderPerBatch={20}
          windowSize={5}
          initialNumToRender={10}
        />
      </View>
    </TextClassContext.Provider>
  );

  return (
    <View
      className={cn('overflow-hidden rounded-md border border-border', 'bg-background')}
      {...(Platform.OS === 'web' ? { role: 'table' } : null)}>
      <ScrollArea orientation="horizontal" fill showScrollbar="auto" scrollbarSize="thin">
        {tableContent}
      </ScrollArea>
    </View>
  );
}

DataTable.displayName = 'DataTable';

/**
 * Default cell renderer for simple text values.
 * Wraps cell content in a Text component with appropriate styling.
 */
export function DataTableCell({
  children,
  truncate = true,
}: {
  children: React.ReactNode;
  truncate?: boolean;
}) {
  return (
    <Text numberOfLines={truncate ? 1 : undefined} className={truncate ? 'flex-1' : undefined}>
      {children}
    </Text>
  );
}

DataTableCell.displayName = 'DataTableCell';
