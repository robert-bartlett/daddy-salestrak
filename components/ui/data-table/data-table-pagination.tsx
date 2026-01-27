import type { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

import { Button } from '../button';
import { Icon } from '../icon';
import { Box, HStack } from '../layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '../select';
import { Text } from '../text';
import type { DataTablePaginationProps } from './data-table-types';
import { DEFAULT_PAGE_SIZES } from './data-table-utils';

/**
 * DataTablePagination - Pagination controls for DataTable.
 *
 * Provides:
 * - Selected row count display
 * - Page size selector
 * - Page number display (e.g., "Page 1 of 10")
 * - First, previous, next, last page buttons
 *
 * @example
 * ```tsx
 * <DataTablePagination table={table} pageSizes={[10, 20, 50]} />
 * ```
 */
export function DataTablePagination<TData>({
  table,
  pageSizes = DEFAULT_PAGE_SIZES,
}: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const hasResults = totalCount > 0;
  const isPageCountUnknown = pageCount === -1;
  const lastPageDisabled = pageCount <= 0 || isPageCountUnknown || !table.getCanNextPage();

  // Convert page size to Option format for Select
  const pageSizeValue: Option = {
    value: String(pageSize),
    label: String(pageSize),
  };

  const handlePageSizeChange = React.useCallback(
    (option: Option | undefined) => {
      if (option) {
        table.setPageSize(Number(option.value));
      }
    },
    [table]
  );

  return (
    <View className="flex-row items-center justify-between gap-6 px-2">
      {/* Selection count */}
      <Box fill>
        <Text size="sm" tone="muted">
          {selectedCount} of {totalCount} row(s) selected.
        </Text>
      </Box>

      {/* Right side controls */}
      <HStack gap="lg" align="center">
        {/* Page size selector */}
        <HStack gap="sm" align="center">
          <Text size="sm" tone="muted">
            Rows per page
          </Text>
          <Select value={pageSizeValue} onValueChange={handlePageSizeChange}>
            <SelectTrigger size="sm">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  label={String(size)}
                />
              ))}
            </SelectContent>
          </Select>
        </HStack>

        {/* Page indicator */}
        <Text size="sm" weight="medium">
          {!hasResults
            ? 'No results'
            : isPageCountUnknown
              ? `Page ${pageIndex + 1}`
              : `Page ${pageIndex + 1} of ${pageCount}`}
        </Text>

        {/* Navigation buttons */}
        <HStack gap="xs" align="center">
          {/* First page */}
          <Button
            variant="outline"
            size="icon"
            onPress={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
            aria-disabled={!table.getCanPreviousPage()}
          >
            <Icon as={ChevronsLeft} size={16} />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="icon"
            onPress={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
            aria-disabled={!table.getCanPreviousPage()}
          >
            <Icon as={ChevronLeft} size={16} />
          </Button>

          {/* Next page */}
          <Button
            variant="outline"
            size="icon"
            onPress={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
            aria-disabled={!table.getCanNextPage()}
          >
            <Icon as={ChevronRight} size={16} />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="icon"
            onPress={() => {
              if (pageCount > 0) {
                table.setPageIndex(pageCount - 1);
              }
            }}
            disabled={lastPageDisabled}
            aria-label="Go to last page"
            aria-disabled={lastPageDisabled}
          >
            <Icon as={ChevronsRight} size={16} />
          </Button>
        </HStack>
      </HStack>
    </View>
  );
}

DataTablePagination.displayName = 'DataTablePagination';
