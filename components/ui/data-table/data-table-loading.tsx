import * as React from 'react';
import { View } from 'react-native';

import { Spinner } from '../spinner';
import { Text } from '../text';
import { HStack } from '../layout';
import type { DataTableLoadingProps } from './data-table-types';

/**
 * Loading state component for DataTable.
 * Displays a spinner and optional message while data is being fetched.
 */
export function DataTableLoading({
  message = 'Loading...',
}: DataTableLoadingProps) {
  return (
    <View className="flex-1 items-center justify-center py-8">
      <HStack gap="sm" align="center">
        <Spinner size={16} tone="muted" />
        <Text tone="muted" size="sm">
          {message}
        </Text>
      </HStack>
    </View>
  );
}

DataTableLoading.displayName = 'DataTableLoading';
