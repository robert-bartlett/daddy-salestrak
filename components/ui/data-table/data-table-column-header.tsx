import type { Column } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable } from 'react-native';

import { cn } from '@/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Icon } from '../icon';
import { Text } from '../text';
import type { DataTableColumnHeaderProps } from './data-table-types';

/**
 * DataTableColumnHeader - A sortable and hideable column header.
 *
 * When the column supports sorting, renders a dropdown menu with:
 * - Sort ascending
 * - Sort descending
 * - Hide column (if column can be hidden)
 *
 * When the column doesn't support sorting, renders a plain text header.
 *
 * @example
 * ```tsx
 * // In column definition:
 * {
 *   accessorKey: 'email',
 *   header: ({ column }) => (
 *     <DataTableColumnHeader column={column} title="Email" />
 *   ),
 * }
 * ```
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  canHide,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort();
  const canHideColumn = canHide ?? column.getCanHide();

  // If not sortable, render plain text
  if (!canSort) {
    return <Text weight="medium">{title}</Text>;
  }

  const sortDirection = column.getIsSorted();

  // Determine which icon to show based on sort state
  const SORT_ICONS = { asc: ArrowUp, desc: ArrowDown } as const;
  const SortIcon = (sortDirection && SORT_ICONS[sortDirection]) || ChevronsUpDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          className={cn(
            'flex-row items-center',
            Platform.select({
              web: 'cursor-pointer rounded-sm hover:bg-muted/50 active:bg-muted data-[state=open]:bg-muted',
              default: '',
            })
          )}
          accessibilityRole="button"
        >
          <Text weight="medium">{title}</Text>
          <Icon
            as={SortIcon}
            size={14}
            className={cn(
              'ml-2',
              sortDirection ? 'text-foreground' : 'text-muted-foreground'
            )}
          />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onPress={() => column.toggleSorting(false)}>
          <Icon as={ArrowUp} size={14} className="mr-2 text-muted-foreground" />
          <Text size="sm">Asc</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={() => column.toggleSorting(true)}>
          <Icon as={ArrowDown} size={14} className="mr-2 text-muted-foreground" />
          <Text size="sm">Desc</Text>
        </DropdownMenuItem>
        {canHideColumn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onPress={() => column.toggleVisibility(false)}>
              <Icon as={EyeOff} size={14} className="mr-2 text-muted-foreground" />
              <Text size="sm">Hide</Text>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

DataTableColumnHeader.displayName = 'DataTableColumnHeader';
