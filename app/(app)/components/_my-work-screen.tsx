import { Map, User } from 'lucide-react-native';

import { Box, VStack, Surface, Header } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useScreenNavigation } from '@/lib/screen-navigation-context';

type MyWorkScreenProps = {
  /** Callback when back button is pressed */
  onBackPress: () => void;
};

export function MyWorkScreen({ onBackPress }: MyWorkScreenProps) {
  const { navigateToProfile } = useScreenNavigation();

  return (
    <Box fill background="default">
      <Header
        title="My Work"
        safeAreaTop
        background="default"
        left={
          <Button variant="ghost" size="icon" onPress={navigateToProfile}>
            <Icon as={User} size={22} />
          </Button>
        }
        right={
          <Button variant="ghost" size="icon" onPress={onBackPress}>
            <Icon as={Map} size={22} />
          </Button>
        }
      />

      {/* Placeholder content */}
      <Box fill paddingX="md" paddingY="lg">
        <VStack gap="md" align="center">
          <Surface variant="muted" padding="xl">
            <VStack gap="sm" align="center">
              <Text size="lg" weight="semibold" align="center">
                My Work
              </Text>
              <Text tone="muted" align="center">
                Your assigned projects, tasks, and activities will appear here.
              </Text>
            </VStack>
          </Surface>
        </VStack>
      </Box>
    </Box>
  );
}
