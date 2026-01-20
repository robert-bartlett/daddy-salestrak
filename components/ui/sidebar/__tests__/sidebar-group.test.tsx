import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Text } from 'react-native';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebarGroup,
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

  describe('collapsible SidebarGroup', () => {
    it('renders content when collapsible and open by default', () => {
      renderWithSidebar(
        <SidebarGroup collapsible>
          <SidebarGroupLabel>Collapsible Group</SidebarGroupLabel>
          <SidebarGroupContent>
            <Text>Content Here</Text>
          </SidebarGroupContent>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Collapsible Group')).toBeTruthy();
      expect(screen.getByText('Content Here')).toBeTruthy();
    });

    it('hides content when collapsible and defaultOpen is false', () => {
      const { queryByText } = renderWithSidebar(
        <SidebarGroup collapsible defaultOpen={false}>
          <SidebarGroupLabel>Collapsible Group</SidebarGroupLabel>
          <SidebarGroupContent>
            <Text>Hidden Content</Text>
          </SidebarGroupContent>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(screen.getByText('Collapsible Group')).toBeTruthy();
      expect(queryByText('Hidden Content')).toBeNull();
    });

    it('toggles content visibility when label is clicked', () => {
      const { queryByText, getByRole } = renderWithSidebar(
        <SidebarGroup collapsible>
          <SidebarGroupLabel>Toggle Me</SidebarGroupLabel>
          <SidebarGroupContent>
            <Text>Toggleable Content</Text>
          </SidebarGroupContent>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      // Content should be visible initially
      expect(screen.getByText('Toggleable Content')).toBeTruthy();

      // Click the label to collapse
      const labelButton = getByRole('button');
      fireEvent.press(labelButton);

      // Content should now be hidden
      expect(queryByText('Toggleable Content')).toBeNull();

      // Click again to expand
      fireEvent.press(labelButton);

      // Content should be visible again
      expect(screen.getByText('Toggleable Content')).toBeTruthy();
    });

    it('renders label as button when collapsible', () => {
      const { getByRole } = renderWithSidebar(
        <SidebarGroup collapsible>
          <SidebarGroupLabel>Accessible Label</SidebarGroupLabel>
          <SidebarGroupContent>
            <Text>Content</Text>
          </SidebarGroupContent>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      const labelButton = getByRole('button');
      expect(labelButton).toBeTruthy();
      expect(screen.getByText('Accessible Label')).toBeTruthy();
    });

    it('renders label as static view when not collapsible', () => {
      const { queryByRole } = renderWithSidebar(
        <SidebarGroup>
          <SidebarGroupLabel>Static Label</SidebarGroupLabel>
          <SidebarGroupContent>
            <Text>Content</Text>
          </SidebarGroupContent>
        </SidebarGroup>,
        { defaultOpen: true }
      );

      // Label should not be a button when group is not collapsible
      expect(queryByRole('button')).toBeNull();
      expect(screen.getByText('Static Label')).toBeTruthy();
    });
  });

  describe('useSidebarGroup hook', () => {
    it('returns null when used outside SidebarGroup', () => {
      function TestComponent() {
        const context = useSidebarGroup();
        return <Text testID="result">{context === null ? 'null' : 'has context'}</Text>;
      }

      render(<TestComponent />);
      expect(screen.getByTestId('result').textContent).toBe('null');
    });

    it('returns context with correct values inside SidebarGroup', () => {
      function TestComponent() {
        const context = useSidebarGroup();
        return (
          <Text testID="result">
            {context
              ? `collapsible:${context.collapsible},open:${context.isOpen}`
              : 'null'}
          </Text>
        );
      }

      renderWithSidebar(
        <SidebarGroup collapsible defaultOpen={false}>
          <TestComponent />
        </SidebarGroup>,
        { defaultOpen: true }
      );

      expect(screen.getByTestId('result').textContent).toBe('collapsible:true,open:false');
    });
  });
});
