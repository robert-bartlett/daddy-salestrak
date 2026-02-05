/**
 * SearchTrigger - Reusable search button for headers
 *
 * Opens the universal search / command palette when pressed.
 */

import { Search } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useUniversalSearch } from '@/lib/universal-search-context';

type SearchTriggerProps = {
  /** Icon size. Defaults to 20 */
  size?: number;
};

export function SearchTrigger({ size = 20 }: SearchTriggerProps) {
  const { open } = useUniversalSearch();

  return (
    <Button variant="ghost" size="icon" onPress={open} accessibilityLabel="Search">
      <Icon as={Search} size={size} />
    </Button>
  );
}
