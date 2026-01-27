import * as React from 'react';
import { View } from 'react-native';

import { Text } from '../text';
import type { DataTableEmptyProps } from './data-table-types';

/**
 * Empty state component for DataTable.
 * Displays when there are no rows to show.
 */
export function DataTableEmpty({
  message = 'No results.',
  children,
}: DataTableEmptyProps) {
  return (
    <View className="flex-1 items-center justify-center py-8">
      {children ?? (
        <Text tone="muted" size="sm">
          {message}
        </Text>
      )}
    </View>
  );
}

DataTableEmpty.displayName = 'DataTableEmpty';
