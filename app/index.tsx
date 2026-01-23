import { Box, Center, VStack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';

export default function Screen() {
  return (
    <Box fill padding="md">
      <Center fill>
        <VStack gap="md" align="center">
          <Text size="2xl" weight="semibold">
            Design System
          </Text>
          <Text tone="muted" align="center">
            Tap the menu icon to browse components.
          </Text>
        </VStack>
      </Center>
    </Box>
  );
}
