import type { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react-native';
import * as React from 'react';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Icon } from '../icon';
import { Text } from '../text';
import type { DataTableActionItem, DataTableRowActionsProps } from './data-table-types';

/**
 * DataTableRowActions - Row action menu rendered inside a cell.
 *
 * Displays a dropdown menu with configurable actions for each row.
 * Supports icons, disabled states, and destructive styling.
 *
 * @example
 * ```tsx
 * // In column definition:
 * {
 *   id: 'actions',
 *   enableSorting: false,
 *   enableHiding: false,
 *   cell: ({ row }) => (
 *     <DataTableRowActions
 *       row={row}
 *       items={[
 *         { id: 'copy', label: 'Copy ID', onSelect: (r) => copy(r.id) },
 *         { id: 'delete', label: 'Delete', onSelect: handleDelete, destructive: true },
 *       ]}
 *     />
 *   ),
 * }
 * ```
 */
export function DataTableRowActions<TData>({
  row,
  items,
  label = 'Open menu',
}: DataTableRowActionsProps<TData>) {
  // Group items to insert separators before destructive actions
  const hasDestructive = items.some((item) => item.destructive);
  const regularItems = items.filter((item) => !item.destructive);
  const destructiveItems = items.filter((item) => item.destructive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={label}
        >
          <Icon as={MoreHorizontal} size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {regularItems.map((item) => (
          <DropdownMenuItem
            key={item.id}
            disabled={item.disabled}
            onPress={() => item.onSelect(row.original)}
          >
            {item.icon && (
              <Icon as={item.icon} size={14} className="mr-2" tone="muted" />
            )}
            <Text size="sm">{item.label}</Text>
          </DropdownMenuItem>
        ))}

        {hasDestructive && regularItems.length > 0 && (
          <DropdownMenuSeparator />
        )}

        {destructiveItems.map((item) => (
          <DropdownMenuItem
            key={item.id}
            variant="destructive"
            disabled={item.disabled}
            onPress={() => item.onSelect(row.original)}
          >
            {item.icon && (
              <Icon as={item.icon} size={14} className="mr-2" tone="destructive" />
            )}
            <Text size="sm">{item.label}</Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

DataTableRowActions.displayName = 'DataTableRowActions';
