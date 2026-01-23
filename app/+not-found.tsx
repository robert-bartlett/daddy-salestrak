import { Box, VStack } from '@/components/ui/layout';
import { Link, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Box padding="md">
        <VStack gap="sm">
          <Text>This screen doesn't exist.</Text>

          <Link href="/">
            <Text>Go to home screen!</Text>
          </Link>
        </VStack>
      </Box>
    </>
  );
}
