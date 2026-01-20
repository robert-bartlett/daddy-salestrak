import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Text } from 'react-native';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '../sidebar-group';
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

describe('SidebarGroup', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

  describe('SidebarGroupLabel component', () => {
    it('renders string children when expanded', () => {
      renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupLabel>Label Text</SidebarGroupLabel>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Label Text')).toBeTruthy();
    });

    it('renders numeric children when expanded', () => {
      renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupLabel>{42}</SidebarGroupLabel>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(screen.getByText('42')).toBeTruthy();
    });

    it('renders React element children when expanded', () => {
      renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupLabel>
            <Text>Custom Label</Text>
          </SidebarGroupLabel>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Custom Label')).toBeTruthy();
    });

    it('does not render when collapsed', () => {
      const { queryByText } = renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupLabel>Hidden Label</SidebarGroupLabel>
        </SidebarGroup>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByText('Hidden Label')).toBeNull();
    });
  });

  describe('SidebarGroupAction component', () => {
    it('renders when expanded', () => {
      renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupAction testID="action">
            <Text>+</Text>
          </SidebarGroupAction>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(screen.getByTestId('action')).toBeTruthy();
    });

    it('does not render when collapsed', () => {
      const { queryByTestId } = renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupAction testID="action">
            <Text>+</Text>
          </SidebarGroupAction>
        </SidebarGroup>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByTestId('action')).toBeNull();
    });

    it('has correct accessibility role', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupAction testID="action">
            <Text>+</Text>
          </SidebarGroupAction>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(getByTestId('action').getAttribute('role')).toBe('button');
    });

    it('handles press events', () => {
      const onPress = jest.fn();

      renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupAction testID="action" onPress={onPress}>
            <Text>+</Text>
          </SidebarGroupAction>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      fireEvent.press(screen.getByTestId('action'));
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('full group composition', () => {
    it('renders complete group structure', () => {
      renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupAction testID="add-action">
            <Text>+</Text>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <Text>Item 1</Text>
            <Text>Item 2</Text>
          </SidebarGroupContent>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Navigation')).toBeTruthy();
      expect(screen.getByTestId('add-action')).toBeTruthy();
      expect(screen.getByText('Item 1')).toBeTruthy();
      expect(screen.getByText('Item 2')).toBeTruthy();
    });

    it('hides label and action but shows content when collapsed', () => {
      const { queryByText, queryByTestId, getByText } = renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupAction testID="add-action">
            <Text>+</Text>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <Text>Item 1</Text>
          </SidebarGroupContent>
        </SidebarGroup>,
        { defaultOpen: false, collapsible: 'icon' }
      );

      expect(queryByText('Navigation')).toBeNull();
      expect(queryByTestId('add-action')).toBeNull();
      expect(getByText('Item 1')).toBeTruthy();
    });
  });
});
