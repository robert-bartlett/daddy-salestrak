import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Text } from '@/components/ui/text';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Home,
  Inbox,
  LogOut,
  Search,
  Settings,
  User,
  Users,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

// Navigation items for the sidebar
const NAV_ITEMS = [
  { icon: Home, label: 'Home', isActive: true, badge: undefined },
  { icon: Inbox, label: 'Inbox', isActive: false, badge: '12' },
  { icon: Calendar, label: 'Calendar', isActive: false, badge: undefined },
  { icon: Search, label: 'Search', isActive: false, badge: undefined },
  { icon: FileText, label: 'Documents', isActive: false, badge: '3' },
];

const PROJECTS = [
  { name: 'Design System', color: '#ef4444' },
  { name: 'Marketing Site', color: '#3b82f6' },
  { name: 'Mobile App', color: '#22c55e' },
];

type FocusablePressableRef = React.ElementRef<typeof Pressable> & {
  focus?: () => void;
};

function NavUser() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const triggerRef = React.useRef<FocusablePressableRef | null>(null);

  // Close the menu and return focus to trigger (web only)
  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
    if (Platform.OS === 'web') {
      requestAnimationFrame(() => {
        triggerRef.current?.focus?.();
      });
    }
  }, []);

  // Handle Escape key to close the menu (web only)
  // Enter/Space toggle is already handled natively by Pressable
  const handleKeyDown = React.useCallback(
    (event: any) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
      }
    },
    [isOpen, closeMenu]
  );

  // Web-specific keyboard props for the container to capture Escape from submenu items
  const webKeyboardProps =
    Platform.OS === 'web' ? ({ onKeyDown: handleKeyDown } as any) : {};

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <View {...webKeyboardProps}>
          <Pressable
            ref={triggerRef}
            onPress={() => setIsOpen(!isOpen)}
            accessibilityRole="button"
            accessibilityLabel="User menu"
            accessibilityState={{ expanded: isOpen }}
            className="flex w-full flex-row items-center gap-2 rounded-md p-2 active:bg-sidebar-accent">
            <Avatar alt="User avatar" className="size-8">
              <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
              <AvatarFallback>
                <Text className="text-xs">CN</Text>
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-sidebar-foreground">shadcn</Text>
                  <Text className="text-xs text-sidebar-foreground/60">m@example.com</Text>
                </View>
                <Icon
                  as={isOpen ? ChevronUp : ChevronDown}
                  className="text-sidebar-foreground/60"
                  size={16}
                />
              </>
            )}
          </Pressable>
          {isOpen && !isCollapsed && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <Icon as={User} className="text-sidebar-foreground" size={16} />
                  <Text>Profile</Text>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <Icon as={Settings} className="text-sidebar-foreground" size={16} />
                  <Text>Settings</Text>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <Icon as={LogOut} className="text-sidebar-foreground" size={16} />
                  <Text>Log out</Text>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
        </View>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Acme Inc">
              <View className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Text className="font-bold text-sidebar-primary-foreground">A</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-sidebar-foreground">Acme Inc</Text>
                <Text className="text-xs text-sidebar-foreground/60">Enterprise</Text>
              </View>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton isActive={item.isActive} tooltip={item.label}>
                    <Icon as={item.icon} className="text-sidebar-foreground" size={20} />
                    <Text>{item.label}</Text>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PROJECTS.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton tooltip={project.name}>
                    <View
                      className="size-4 rounded"
                      style={{ backgroundColor: project.color }}
                    />
                    <Text>{project.name}</Text>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Team</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Team Members">
                  <Icon as={Users} className="text-sidebar-foreground" size={20} />
                  <Text>Team Members</Text>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function MainContent() {
  const { isMobile, state } = useSidebar();

  return (
    <SidebarInset>
      {/* Header with trigger */}
      <View className="flex flex-row items-center gap-2 border-b border-border p-4">
        <SidebarTrigger />
        <View className="h-4 w-px bg-border" />
        <Text className="font-medium text-foreground">Dashboard</Text>
      </View>

      {/* Main content area */}
      <View className="flex-1 p-6">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Welcome back!</Text>
            <Text className="text-muted-foreground">
              This is a demo of the shadcn-inspired Sidebar component for React Native.
            </Text>
          </View>

          <View className="gap-4">
            <Text className="font-semibold text-foreground">How to use:</Text>
            <View className="gap-2">
              <Text className="text-muted-foreground">
                • Click the <Text className="font-medium text-foreground">panel icon</Text> in the header to toggle the sidebar
              </Text>
              {Platform.OS === 'web' && (
                <Text className="text-muted-foreground">
                  • Use <Text className="font-medium text-foreground">Cmd+B</Text> (Mac) or{' '}
                  <Text className="font-medium text-foreground">Ctrl+B</Text> (Windows) to toggle
                </Text>
              )}
              <Text className="text-muted-foreground">
                • On mobile, the sidebar appears as a slide-out sheet
              </Text>
              <Text className="text-muted-foreground">
                • When collapsed, hover over icons to see tooltips (web)
              </Text>
            </View>
          </View>

          <View className="rounded-lg border border-border bg-card p-4">
            <Text className="font-medium text-card-foreground">Current State</Text>
            <View className="mt-2 flex-row flex-wrap gap-4">
              <View className="gap-1">
                <Text className="text-xs text-muted-foreground">Sidebar State</Text>
                <Text className="font-mono text-sm text-foreground">{state}</Text>
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted-foreground">Device</Text>
                <Text className="font-mono text-sm text-foreground">
                  {isMobile ? 'Mobile' : 'Desktop'}
                </Text>
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted-foreground">Platform</Text>
                <Text className="font-mono text-sm text-foreground">{Platform.OS}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SidebarInset>
  );
}

export default function SidebarDemo() {
  return (
    <SidebarProvider variant="inset">
      <AppSidebar />
      <MainContent />
    </SidebarProvider>
  );
}
