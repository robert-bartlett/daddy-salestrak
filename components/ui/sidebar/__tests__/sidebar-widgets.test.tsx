import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Text } from 'react-native';
import {
  SidebarInput,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '../sidebar-widgets';
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
    side = 'left' as 'left' | 'right',
  }: { defaultOpen?: boolean; collapsible?: 'offcanvas' | 'icon' | 'none'; side?: 'left' | 'right' } = {}
) {
  return render(
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible={collapsible} side={side}>
        {ui}
      </Sidebar>
    </SidebarProvider>
  );
}

describe('SidebarWidgets', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

  describe('SidebarTrigger component', () => {
    it('renders trigger button', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger testID="trigger" />
        </SidebarProvider>
      );

      expect(screen.getByTestId('trigger')).toBeTruthy();
    });

    it('has correct accessibility label', () => {
      const { getByTestId } = render(
        <SidebarProvider>
          <SidebarTrigger testID="trigger" />
        </SidebarProvider>
      );

      expect(getByTestId('trigger').getAttribute('aria-label')).toBe('Toggle sidebar');
    });

    it('toggles sidebar on press', () => {
      function TestComponent() {
        const [open, setOpen] = React.useState(true);
        return (
          <SidebarProvider open={open} onOpenChange={setOpen}>
            <SidebarTrigger testID="trigger" />
            <Text testID="state">{open ? 'open' : 'closed'}</Text>
          </SidebarProvider>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId('state').textContent).toBe('open');

      fireEvent.click(screen.getByTestId('trigger'));

      expect(screen.getByTestId('state').textContent).toBe('closed');
    });

    it('calls custom onPress handler along with toggle', () => {
      const onPress = jest.fn();

      render(
        <SidebarProvider>
          <SidebarTrigger testID="trigger" onPress={onPress} />
        </SidebarProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));

      expect(onPress).toHaveBeenCalled();
    });

    it('accepts custom className', () => {
      const { getByTestId } = render(
        <SidebarProvider>
          <SidebarTrigger testID="trigger" className="custom-class" />
        </SidebarProvider>
      );

      expect(getByTestId('trigger')).toBeTruthy();
    });
  });

  describe('SidebarRail component', () => {
    it('renders within sidebar', () => {
      renderWithSidebar(
        <SidebarRail testID="rail" />,
        { defaultOpen: true }
      );

      expect(screen.getByTestId('rail')).toBeTruthy();
    });

    it('has correct accessibility role', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarRail testID="rail" />
      );

      expect(getByTestId('rail').getAttribute('role')).toBe('button');
    });

    it('has correct accessibility label', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarRail testID="rail" />
      );

      expect(getByTestId('rail').getAttribute('aria-label')).toBe('Toggle sidebar');
    });

    it('toggles sidebar on press', () => {
      function TestComponent() {
        const [open, setOpen] = React.useState(true);
        return (
          <SidebarProvider open={open} onOpenChange={setOpen}>
            <Sidebar collapsible="icon">
              <SidebarRail testID="rail" />
            </Sidebar>
            <Text testID="state">{open ? 'open' : 'closed'}</Text>
          </SidebarProvider>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId('state').textContent).toBe('open');

      fireEvent.click(screen.getByTestId('rail'));

      expect(screen.getByTestId('state').textContent).toBe('closed');
    });

    it('calls custom onPress handler along with toggle', () => {
      const onPress = jest.fn();

      renderWithSidebar(
        <SidebarRail testID="rail" onPress={onPress} />
      );

      fireEvent.click(screen.getByTestId('rail'));

      expect(onPress).toHaveBeenCalled();
    });

    it('renders correctly for left-side sidebar', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarRail testID="rail" />,
        { side: 'left' }
      );

      expect(getByTestId('rail')).toBeTruthy();
    });

    it('renders correctly for right-side sidebar', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarRail testID="rail" />,
        { side: 'right' }
      );

      expect(getByTestId('rail')).toBeTruthy();
    });
  });

  describe('SidebarSeparator component', () => {
    it('renders separator', () => {
      renderWithSidebar(
        <SidebarSeparator testID="separator" />
      );

      expect(screen.getByTestId('separator')).toBeTruthy();
    });

    it('accepts custom className', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarSeparator testID="separator" className="custom-class" />
      );

      expect(getByTestId('separator')).toBeTruthy();
    });
  });

  describe('SidebarInput component', () => {
    it('renders input field', () => {
      renderWithSidebar(
        <SidebarInput testID="input" placeholder="Search..." />
      );

      expect(screen.getByTestId('input')).toBeTruthy();
    });

    it('accepts custom className', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarInput testID="input" className="custom-class" />
      );

      expect(getByTestId('input')).toBeTruthy();
    });

    it('handles text input', () => {
      const onChangeText = jest.fn();

      renderWithSidebar(
        <SidebarInput testID="input" onChangeText={onChangeText} />
      );

      fireEvent.change(screen.getByTestId('input'), { target: { value: 'test input' } });

      expect(onChangeText).toHaveBeenCalledWith('test input');
    });

    it('respects placeholder prop', () => {
      const { getByTestId } = renderWithSidebar(
        <SidebarInput testID="input" placeholder="Type here..." />
      );

      expect(getByTestId('input').getAttribute('placeholder')).toBe('Type here...');
    });
  });

  describe('widget integration', () => {
    it('renders trigger outside sidebar to toggle', () => {
      function TestComponent() {
        const [open, setOpen] = React.useState(true);
        return (
          <SidebarProvider open={open} onOpenChange={setOpen}>
            <SidebarTrigger testID="trigger" />
            <Sidebar collapsible="icon">
              <Text testID="content">Sidebar Content</Text>
            </Sidebar>
            <Text testID="state">{open ? 'open' : 'closed'}</Text>
          </SidebarProvider>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId('state').textContent).toBe('open');

      fireEvent.click(screen.getByTestId('trigger'));

      expect(screen.getByTestId('state').textContent).toBe('closed');
    });

    it('renders rail inside sidebar to toggle', () => {
      function TestComponent() {
        const [open, setOpen] = React.useState(true);
        return (
          <SidebarProvider open={open} onOpenChange={setOpen}>
            <Sidebar collapsible="icon">
              <SidebarRail testID="rail" />
            </Sidebar>
            <Text testID="state">{open ? 'open' : 'closed'}</Text>
          </SidebarProvider>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId('state').textContent).toBe('open');

      fireEvent.click(screen.getByTestId('rail'));

      expect(screen.getByTestId('state').textContent).toBe('closed');
    });
  });
});
