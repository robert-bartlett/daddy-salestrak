import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export default function Screen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <Text className="text-2xl font-semibold">Design System</Text>
      <Text className="text-center text-muted-foreground">
        Tap the menu icon to browse components.
      </Text>
    </View>
  );
}
