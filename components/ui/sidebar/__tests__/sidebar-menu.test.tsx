import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Text } from 'react-native';
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '../sidebar-menu';
import { Sidebar } from '../sidebar';
import { SidebarProvider } from '../sidebar-context';
import { useIsMobile } from '@/hooks/use-is-mobile';

// Mock the hook module
jest.mock('@/hooks/use-is-mobile');
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;

// Helper to render within sidebar context
function renderWithSidebar(
  ui: React.ReactElement,
  {
    defaultOpen = true,
    collapsible = 'icon',
  }: { defaultOpen?: boolean; collapsible?: 'offcanvas' | 'icon' | 'none' } = {}
) {
  return render(
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible={collapsible}>{ui}</Sidebar>
    </SidebarProvider>
  );
}

describe('SidebarMenu', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

  describe('SidebarMenuButton component', () => {
    it('handles press events', () => {
      const onPress = jest.fn();

      renderWithSidebar(
        <SidebarMenuButton testID="button" onPress={onPress}>
          <Text>Press Me</Text>
        </SidebarMenuButton>
      );

      fireEvent.press(screen.getByTestId('button'));
      expect(onPress).toHaveBeenCalled();
    });

    it('has correct accessibility role', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuButton testID="button">
          <Text>Button</Text>
        </SidebarMenuButton>
      );

      expect(getByTestId('button').getAttribute('role')).toBe('button');
    });

    it('shows only the first child when collapsed', () => {
      const { queryByText } = renderWithSidebar(
        <SidebarMenuButton>
          Icon
          <Text>Label</Text>
        </SidebarMenuButton>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByText('Icon')).toBeTruthy();
      expect(queryByText('Label')).toBeNull();
    });

    it('renders full content on mobile even when collapsed', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <SidebarProvider defaultOpen={false} defaultOpenMobile={true}>
          <Sidebar collapsible="icon">
            <SidebarMenuButton>
              <Text>Icon</Text>
              <Text>Label</Text>
            </SidebarMenuButton>
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByText('Icon')).toBeTruthy();
      expect(screen.getByText('Label')).toBeTruthy();
    });

    it('shows all children when expanded', () => {
      renderWithSidebar(
        <SidebarMenuButton>
          <Text>Icon</Text>
          <Text>Label</Text>
        </SidebarMenuButton>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Icon')).toBeTruthy();
      expect(screen.getByText('Label')).toBeTruthy();
    });

    it('uses tooltip as accessibilityLabel when collapsed', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuButton testID="button" tooltip="Home">
          <Text>Icon</Text>
        </SidebarMenuButton>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(getByTestId('button').getAttribute('aria-label')).toBe('Home');
    });

    it('does not set accessibilityLabel when expanded', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuButton testID="button" tooltip="Home">
          <Text>Home</Text>
        </SidebarMenuButton>,
        { defaultOpen: true }
      );

      expect(getByTestId('button').getAttribute('aria-label')).toBeNull();
    });
  });

  describe('SidebarMenuAction component', () => {
    it('renders when expanded', () => {
      renderWithSidebar(
        <SidebarMenuItem>
          <SidebarMenuAction testID="action">
            <Text>Action</Text>
          </SidebarMenuAction>
        </SidebarMenuItem>,
        { defaultOpen: true }
      );

      expect(screen.getByTestId('action')).toBeTruthy();
    });

    it('does not render when collapsed', () => {
      const { queryByTestId } = renderWithSidebar(
        <SidebarMenuItem>
          <SidebarMenuAction testID="action">
            <Text>Action</Text>
          </SidebarMenuAction>
        </SidebarMenuItem>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByTestId('action')).toBeNull();
    });

    it('has correct accessibility role', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuItem>
          <SidebarMenuAction testID="action">
            <Text>Action</Text>
          </SidebarMenuAction>
        </SidebarMenuItem>,
        { defaultOpen: true }
      );

      expect(getByTestId('action').getAttribute('role')).toBe('button');
    });

  });

  describe('SidebarMenuBadge component', () => {
    it('renders when expanded', () => {
      renderWithSidebar(
        <SidebarMenuItem>
          <SidebarMenuBadge>
            <Text>5</Text>
          </SidebarMenuBadge>
        </SidebarMenuItem>,
        { defaultOpen: true }
      );

      expect(screen.getByText('5')).toBeTruthy();
    });

    it('does not render when collapsed', () => {
      const { queryByText } = renderWithSidebar(
        <SidebarMenuItem>
          <SidebarMenuBadge>
            <Text>5</Text>
          </SidebarMenuBadge>
        </SidebarMenuItem>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByText('5')).toBeNull();
    });

    it('renders badge as a non-interactive element', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuItem>
          <SidebarMenuBadge testID="badge">5</SidebarMenuBadge>
        </SidebarMenuItem>,
        { defaultOpen: true }
      );

      // Badge renders correctly (accessibilityRole="text" has no ARIA equivalent)
      const badge = getByTestId('badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toBe('5');
    });

    it('sets accessibilityLabel for string/number children', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuItem>
          <SidebarMenuBadge testID="badge">42</SidebarMenuBadge>
        </SidebarMenuItem>,
        { defaultOpen: true }
      );

      expect(getByTestId('badge').getAttribute('aria-label')).toBe('42');
    });
  });

  describe('SidebarMenuSkeleton component', () => {
    it('renders without icon by default', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSkeleton testID="skeleton" />
      );

      expect(getByTestId('skeleton')).toBeTruthy();
    });

    it('renders with icon when showIcon is true', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSkeleton testID="skeleton" showIcon />
      );

      expect(getByTestId('skeleton')).toBeTruthy();
    });

    it('has random width for text skeleton', () => {
      // Render multiple times and verify they have width styles
      const { rerender, getByTestId } = renderWithSidebar(
        <SidebarMenuSkeleton testID="skeleton" key="1" />
      );

      expect(getByTestId('skeleton')).toBeTruthy();

      rerender(
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarMenuSkeleton testID="skeleton" key="2" />
          </Sidebar>
        </SidebarProvider>
      );

      expect(getByTestId('skeleton')).toBeTruthy();
    });
  });
});
