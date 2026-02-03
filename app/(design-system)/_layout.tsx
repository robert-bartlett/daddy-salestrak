import { NavMenu, type NavItem } from '@/components/ui/nav-menu';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MenuIcon, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useLayoutEffect } from 'react';
import { Platform, Pressable, View } from 'react-native';

const COMPONENTS: NavItem[] = [
  { label: 'Accordion', href: '/(design-system)/demos/accordion' },
  { label: 'Alert Dialog', href: '/(design-system)/demos/alert-dialog' },
  { label: 'Avatar', href: '/(design-system)/demos/avatar' },
  { label: 'Badge', href: '/(design-system)/demos/badge' },
  { label: 'Breadcrumb', href: '/(design-system)/demos/breadcrumb' },
  { label: 'Button', href: '/(design-system)/demos/button' },
  { label: 'Button Group', href: '/(design-system)/demos/button-group' },
  { label: 'Checkbox', href: '/(design-system)/demos/checkbox' },
  { label: 'Combobox', href: '/(design-system)/demos/combobox' },
  { label: 'Command', href: '/(design-system)/demos/command' },
  { label: 'Context Menu', href: '/(design-system)/demos/context-menu' },
  { label: 'Data Table', href: '/(design-system)/demos/data-table' },
  { label: 'Dialog', href: '/(design-system)/demos/dialog' },
  { label: 'Dropdown Menu', href: '/(design-system)/demos/dropdown-menu' },
  { label: 'Empty', href: '/(design-system)/demos/empty' },
  { label: 'Entity Selector', href: '/(design-system)/demos/entity-selector' },
  { label: 'Input', href: '/(design-system)/demos/input' },
  { label: 'Kbd', href: '/(design-system)/demos/kbd' },
  { label: 'Message', href: '/(design-system)/demos/message' },
  { label: 'Popover', href: '/(design-system)/demos/popover' },
  { label: 'Radio Group', href: '/(design-system)/demos/radio-group' },
  { label: 'Search', href: '/(design-system)/demos/search' },
  { label: 'Select', href: '/(design-system)/demos/select' },
  { label: 'Separator', href: '/(design-system)/demos/separator' },
  { label: 'Spinner', href: '/(design-system)/demos/spinner' },
  { label: 'Sheet', href: '/(design-system)/demos/sheet' },
  { label: 'Sidebar', href: '/(design-system)/demos/sidebar' },
  { label: 'Skeleton', href: '/(design-system)/demos/skeleton' },
  { label: 'Switch', href: '/(design-system)/demos/switch' },
  { label: 'Tabs', href: '/(design-system)/demos/tabs' },
  { label: 'Textarea', href: '/(design-system)/demos/textarea' },
  { label: 'Toggle', href: '/(design-system)/demos/toggle' },
  { label: 'Tooltip', href: '/(design-system)/demos/tooltip' },
];

const HEADER_ICON_SIZE = 22;
const HEADER_BUTTON_STYLE = {
  padding: 6,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const IconComponent = colorScheme === 'dark' ? MoonStarIcon : SunIcon;
  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable onPress={toggleColorScheme} hitSlop={8} style={HEADER_BUTTON_STYLE}>
        <IconComponent size={HEADER_ICON_SIZE} color={iconColor} />
      </Pressable>
    </View>
  );
}

function ComponentMenu() {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <NavMenu>
      <NavMenu.Trigger asChild>
        <Pressable hitSlop={8} style={HEADER_BUTTON_STYLE}>
          <MenuIcon size={HEADER_ICON_SIZE} color={iconColor} />
        </Pressable>
      </NavMenu.Trigger>

      <NavMenu.Content side="bottom" align="start">
        <NavMenu.Label>Components</NavMenu.Label>
        {COMPONENTS.map((item) => (
          <NavMenu.Item key={item.href as string} href={item.href}>
            {item.label}
          </NavMenu.Item>
        ))}
      </NavMenu.Content>
    </NavMenu>
  );
}

export default function DesignSystemLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useLayoutEffect(() => {
    setColorScheme('dark');
  }, []);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'dark']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={
          {
            headerTitle: 'Design System',
            headerLeft: () => <ComponentMenu />,
            headerRight: () => <ThemeToggle />,
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
            headerBackButtonDisplayMode: 'minimal',
            headerLeftContainerStyle: {
              paddingLeft: Platform.OS === 'web' ? 16 : 0,
            },
            headerRightContainerStyle: {
              paddingRight: Platform.OS === 'web' ? 16 : 0,
            },
          } as React.ComponentProps<typeof Stack>['screenOptions']
        }
      />
    </ThemeProvider>
  );
}
