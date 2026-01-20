import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Text } from 'react-native';
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../sidebar-submenu';
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

describe('SidebarSubmenu', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

  describe('SidebarMenuSub component', () => {
    it('does not render when collapsed', () => {
      const { queryByText } = renderWithSidebar(
        <SidebarMenuSub>
          <Text>Submenu Content</Text>
        </SidebarMenuSub>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByText('Submenu Content')).toBeNull();
    });

    it('renders submenu content on mobile even when collapsed', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <SidebarProvider defaultOpen={false} defaultOpenMobile={true}>
          <Sidebar collapsible="icon">
            <SidebarMenuSub>
              <Text>Mobile Submenu</Text>
            </SidebarMenuSub>
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByText('Mobile Submenu')).toBeTruthy();
    });
  });

  describe('SidebarMenuSubItem component', () => {
    it('renders children when expanded', () => {
      renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <Text>Sub Item</Text>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Sub Item')).toBeTruthy();
    });
  });

  describe('SidebarMenuSubButton component', () => {
    it('renders children', () => {
      renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>
              <Text>Button Text</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Button Text')).toBeTruthy();
    });

    it('handles press events', () => {
      const onPress = jest.fn();

      renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton testID="button" onPress={onPress}>
              <Text>Press Me</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      fireEvent.press(screen.getByTestId('button'));
      expect(onPress).toHaveBeenCalled();
    });

    it('has correct accessibility role', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton testID="button">
              <Text>Sub Item</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(getByTestId('button').getAttribute('role')).toBe('button');
    });

    it('renders function children', () => {
      const { getByText } = renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>
              {() => <Text>Function Child</Text>}
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(getByText('Function Child')).toBeTruthy();
    });
  });

  describe('full submenu composition', () => {
    it('renders complete submenu structure', () => {
      renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton isActive>
              <Text>Active Sub Item</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>
              <Text>Inactive Sub Item</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Active Sub Item')).toBeTruthy();
      expect(screen.getByText('Inactive Sub Item')).toBeTruthy();
    });

    it('hides entire submenu when sidebar is collapsed', () => {
      const { queryByText } = renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>
              <Text>Hidden Sub Item</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByText('Hidden Sub Item')).toBeNull();
    });
  });
});
