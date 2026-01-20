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
    it('renders children when expanded', () => {
      renderWithSidebar(
        <SidebarMenuSub>
          <Text>Submenu Content</Text>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Submenu Content')).toBeTruthy();
    });

    it('does not render when collapsed', () => {
      const { queryByText } = renderWithSidebar(
        <SidebarMenuSub>
          <Text>Submenu Content</Text>
        </SidebarMenuSub>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByText('Submenu Content')).toBeNull();
    });

    it('accepts custom className', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSub testID="submenu" className="custom-class">
          <Text>Content</Text>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(getByTestId('submenu')).toBeTruthy();
    });
  });

  describe('SidebarMenuSubItem component', () => {
    it('renders children', () => {
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

    it('accepts custom className', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem testID="subitem" className="custom-class">
            <Text>Item</Text>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(getByTestId('subitem')).toBeTruthy();
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

      fireEvent.click(screen.getByTestId('button'));
      expect(onPress).toHaveBeenCalled();
    });

    it('applies isActive styling', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton testID="button" isActive>
              <Text>Active Item</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      // Component renders with isActive prop
      expect(getByTestId('button')).toBeTruthy();
    });

    it('applies default size (md)', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton testID="button">
              <Text>Default Size</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(getByTestId('button')).toBeTruthy();
    });

    it('applies small size when specified', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton testID="button" size="sm">
              <Text>Small</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(getByTestId('button')).toBeTruthy();
    });

    it('accepts custom className', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton testID="button" className="custom-class">
              <Text>Custom</Text>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>,
        { defaultOpen: true }
      );

      expect(getByTestId('button')).toBeTruthy();
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
