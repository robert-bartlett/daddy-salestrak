import type { Table } from '@tanstack/react-table';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

import { Button } from '../button';
import { Icon } from '../icon';
import { Input } from '../input';
import { Text } from '../text';
import type { DataTableFilterConfig, DataTableToolbarProps } from './data-table-types';
import { DataTableViewOptions } from './data-table-view-options';

/**
 * Individual filter input for a column.
 */
function DataTableFilterInput<TData>({
  table,
  config,
}: {
  table: Table<TData>;
  config: DataTableFilterConfig;
}) {
  const column = table.getColumn(config.columnId);

  // Warn in development if filter config references invalid column
  if (__DEV__ && !column) {
    console.warn(
      `DataTableToolbar: Filter config references non-existent column "${config.columnId}". ` +
        `Available columns: ${table.getAllColumns().map((c) => c.id).join(', ')}`
    );
  }

  // If column doesn't exist or can't be filtered, don't render
  if (!column || !column.getCanFilter()) {
    return null;
  }

  const filterValue = column.getFilterValue() as string | undefined;

  return (
    <Input
      placeholder={config.placeholder ?? `Filter ${config.columnId}...`}
      value={filterValue ?? ''}
      onChangeText={(value) => column.setFilterValue(value)}
      width="sm"
      aria-label={config.label ?? `Filter by ${config.columnId}`}
    />
  );
}

/**
 * DataTableToolbar - Optional filter inputs and view options.
 *
 * Renders filter inputs for specified columns and optionally
 * includes the column visibility dropdown.
 *
 * @example
 * ```tsx
 * <DataTableToolbar
 *   table={table}
 *   filters={[
 *     { columnId: 'email', placeholder: 'Filter emails...' },
 *     { columnId: 'status', placeholder: 'Filter status...' },
 *   ]}
 *   showViewOptions
 * />
 * ```
 */
export function DataTableToolbar<TData>({
  table,
  filters = [],
  showViewOptions = false,
}: DataTableToolbarProps<TData>) {
  // Check if any filters are active
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <View className="flex-row items-center justify-between gap-2 py-1">
      {/* Left side: filters */}
      <View className="flex-1 flex-row items-center gap-2">
        {filters.map((config) => (
          <DataTableFilterInput
            key={config.columnId}
            table={table}
            config={config}
          />
        ))}

        {/* Reset filters button */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => table.resetColumnFilters()}
          >
            <Text size="sm">Reset</Text>
            <Icon as={X} size={14} className="ml-2" />
          </Button>
        )}
      </View>

      {/* Right side: view options */}
      {showViewOptions && <DataTableViewOptions table={table} />}
    </View>
  );
}

DataTableToolbar.displayName = 'DataTableToolbar';
