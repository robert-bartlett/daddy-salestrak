import '@/global.css';

import { NavMenu, type NavItem } from '@/components/ui/nav-menu';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MenuIcon, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useLayoutEffect } from 'react';
import { Platform, Pressable, View } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// All available component demos
const COMPONENTS: NavItem[] = [
  { label: 'Accordion', href: '/demos/accordion' },
  { label: 'Alert Dialog', href: '/demos/alert-dialog' },
  { label: 'Avatar', href: '/demos/avatar' },
  { label: 'Badge', href: '/demos/badge' },
  { label: 'Breadcrumb', href: '/demos/breadcrumb' },
  { label: 'Button', href: '/demos/button' },
  { label: 'Button Group', href: '/demos/button-group' },
  { label: 'Checkbox', href: '/demos/checkbox' },
  { label: 'Command', href: '/demos/command' },
  { label: 'Context Menu', href: '/demos/context-menu' },
  { label: 'Dialog', href: '/demos/dialog' },
  { label: 'Dropdown Menu', href: '/demos/dropdown-menu' },
  { label: 'Input', href: '/demos/input' },
  { label: 'Popover', href: '/demos/popover' },
  { label: 'Radio Group', href: '/demos/radio-group' },
  { label: 'Select', href: '/demos/select' },
  { label: 'Separator', href: '/demos/separator' },
  { label: 'Spinner', href: '/demos/spinner' },
  { label: 'Sheet', href: '/demos/sheet' },
  { label: 'Sidebar', href: '/demos/sidebar' },
  { label: 'Skeleton', href: '/demos/skeleton' },
  { label: 'Switch', href: '/demos/switch' },
  { label: 'Tabs', href: '/demos/tabs' },
  { label: 'Textarea', href: '/demos/textarea' },
  { label: 'Toggle', href: '/demos/toggle' },
  { label: 'Tooltip', href: '/demos/tooltip' },
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

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Set dark mode on first load
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
            // These props exist in React Navigation but expo-router types are incomplete
            headerLeftContainerStyle: {
              paddingLeft: Platform.OS === 'web' ? 16 : 0,
            },
            headerRightContainerStyle: {
              paddingRight: Platform.OS === 'web' ? 16 : 0,
            },
          } as React.ComponentProps<typeof Stack>['screenOptions']
        }
      />
      <PortalHost />
    </ThemeProvider>
  );
}
