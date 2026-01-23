import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Box, Center, HStack, VStack } from '@/components/ui/layout';
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
import { Separator } from '@/components/ui/separator';
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
import { Platform } from 'react-native';

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

type FocusablePressableRef = React.ElementRef<typeof SidebarMenuButton> & {
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
        <Box {...webKeyboardProps}>
          <SidebarMenuButton
            ref={triggerRef}
            onPress={() => setIsOpen(!isOpen)}
            isActive={isOpen}
            tooltip="User menu">
            <Avatar alt="User avatar">
              <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
              <AvatarFallback>
                <Text size="xs">CN</Text>
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <Box fill>
                  <VStack gap="xs">
                    <Text size="sm" weight="medium">
                      shadcn
                    </Text>
                    <Text size="xs">m@example.com</Text>
                  </VStack>
                </Box>
                <Icon as={isOpen ? ChevronUp : ChevronDown} size={16} />
              </>
            )}
          </SidebarMenuButton>
          {isOpen && !isCollapsed && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <Icon as={User} size={16} />
                  <Text>Profile</Text>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <Icon as={Settings} size={16} />
                  <Text>Settings</Text>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <Icon as={LogOut} size={16} />
                  <Text>Log out</Text>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}
        </Box>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="none">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Acme Inc">
              <Box size="xl" background="sidebar-primary" rounded="lg">
                <Center fill>
                  <Text weight="bold">A</Text>
                </Center>
              </Box>
              <Box fill>
                <VStack gap="xs">
                  <Text weight="semibold">Acme Inc</Text>
                  <Text size="xs">Enterprise</Text>
                </VStack>
              </Box>
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
                    <Icon as={item.icon} size={20} />
                    <Text>{item.label}</Text>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup collapsible>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PROJECTS.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton tooltip={project.name}>
                    <Box size="md" rounded="sm" background={project.color} />
                    <Text>{project.name}</Text>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup collapsible defaultOpen={false}>
          <SidebarGroupLabel>Team</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Team Members">
                  <Icon as={Users} size={20} />
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
      {/* Header with trigger (mobile only) */}
      <Box padding="md">
        <HStack gap="sm" align="center">
          {isMobile && (
            <>
              <SidebarTrigger />
              <Separator orientation="vertical" length="md" />
            </>
          )}
          <Text weight="medium">Dashboard</Text>
        </HStack>
      </Box>
      <Separator />

      {/* Main content area */}
      <Box fill padding="lg">
        <VStack gap="lg">
          <VStack gap="sm">
            <Text size="2xl" weight="bold">
              Welcome back!
            </Text>
            <Text tone="muted">
              This is a demo of the shadcn-inspired Sidebar component for React Native.
            </Text>
          </VStack>

          <VStack gap="md">
            <Text weight="semibold">How to use:</Text>
            <VStack gap="sm">
              {isMobile ? (
                <>
                  <Text tone="muted">
                    • Tap the <Text weight="medium">panel icon</Text> in the header to open the sidebar
                  </Text>
                  <Text tone="muted">• The sidebar appears as a slide-out sheet</Text>
                </>
              ) : (
                <Text tone="muted">• The sidebar is always visible on desktop</Text>
              )}
            </VStack>
          </VStack>

          <Box background="card" border rounded="lg" padding="md">
            <VStack gap="sm">
              <Text weight="medium">Current State</Text>
              <HStack gap="md" wrap>
                <VStack gap="xs">
                  <Text size="xs" tone="muted">
                    Sidebar State
                  </Text>
                  <Text size="sm">{state}</Text>
                </VStack>
                <VStack gap="xs">
                  <Text size="xs" tone="muted">
                    Device
                  </Text>
                  <Text size="sm">{isMobile ? 'Mobile' : 'Desktop'}</Text>
                </VStack>
                <VStack gap="xs">
                  <Text size="xs" tone="muted">
                    Platform
                  </Text>
                  <Text size="sm">{Platform.OS}</Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
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
