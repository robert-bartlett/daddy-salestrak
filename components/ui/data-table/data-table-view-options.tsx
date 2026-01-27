import type { Table } from '@tanstack/react-table';
import { SlidersHorizontal } from 'lucide-react-native';
import * as React from 'react';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Icon } from '../icon';
import { Text } from '../text';
import type { DataTableViewOptionsProps } from './data-table-types';

/**
 * DataTableViewOptions - Column visibility toggle dropdown.
 *
 * Displays all hideable columns with checkboxes to toggle visibility.
 * Only shows columns where `column.getCanHide()` returns true.
 *
 * @example
 * ```tsx
 * <DataTableViewOptions table={table} label="View" />
 * ```
 */
export function DataTableViewOptions<TData>({
  table,
  label = 'View',
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Icon as={SlidersHorizontal} size={14} className="mr-2" />
          <Text size="sm">{label}</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          // Get a display name for the column
          const columnId = column.id;
          const displayName =
            typeof column.columnDef.header === 'string'
              ? column.columnDef.header
              : columnId.charAt(0).toUpperCase() + columnId.slice(1);

          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {displayName}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

DataTableViewOptions.displayName = 'DataTableViewOptions';
