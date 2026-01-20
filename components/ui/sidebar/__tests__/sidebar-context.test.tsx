import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Text, Pressable } from 'react-native';
import { SidebarProvider, useSidebar } from '../sidebar-context';
import { useIsMobile } from '@/hooks/use-is-mobile';

// Mock the hook module
jest.mock('@/hooks/use-is-mobile');
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;

// Helper component to test the hook
function TestConsumer() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    variant,
  } = useSidebar();

  return (
    <>
      <Text testID="state">{state}</Text>
      <Text testID="open">{String(open)}</Text>
      <Text testID="openMobile">{String(openMobile)}</Text>
      <Text testID="isMobile">{String(isMobile)}</Text>
      <Text testID="variant">{variant}</Text>
      <Pressable testID="toggle" onPress={toggleSidebar} />
      <Pressable testID="setOpen" onPress={() => setOpen(false)} />
      <Pressable testID="setOpenMobile" onPress={() => setOpenMobile(true)} />
    </>
  );
}

describe('SidebarContext', () => {
  beforeEach(() => {
    // Reset to desktop viewport
    mockUseIsMobile.mockReturnValue(false);
    // Clear localStorage to prevent state persistence between tests
    localStorage.removeItem('sidebar_state');
  });

  describe('SidebarProvider', () => {
    it('renders children correctly', () => {
      render(
        <SidebarProvider>
          <Text>Test Content</Text>
        </SidebarProvider>
      );

      expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('provides default values', () => {
      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('state').textContent).toBe('expanded');
      expect(screen.getByTestId('open').textContent).toBe('true');
      expect(screen.getByTestId('openMobile').textContent).toBe('false');
      expect(screen.getByTestId('variant').textContent).toBe('sidebar');
    });

    it('respects defaultOpen prop', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('state').textContent).toBe('collapsed');
      expect(screen.getByTestId('open').textContent).toBe('false');
    });

    it('respects defaultOpenMobile prop', () => {
      render(
        <SidebarProvider defaultOpenMobile={true}>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('openMobile').textContent).toBe('true');
    });

    it('respects variant prop', () => {
      render(
        <SidebarProvider variant="floating">
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('variant').textContent).toBe('floating');
    });
  });

  describe('useSidebar hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useSidebar must be used within a SidebarProvider.');

      consoleError.mockRestore();
    });

    it('toggleSidebar toggles desktop state when not mobile', () => {
      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open').textContent).toBe('true');

      fireEvent.click(screen.getByTestId('toggle'));

      expect(screen.getByTestId('open').textContent).toBe('false');
    });

    it('toggleSidebar toggles mobile state when isMobile', () => {
      // Set mobile viewport
      mockUseIsMobile.mockReturnValue(true);

      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('openMobile').textContent).toBe('false');

      fireEvent.click(screen.getByTestId('toggle'));

      expect(screen.getByTestId('openMobile').textContent).toBe('true');
    });

    it('setOpen updates open state', () => {
      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open').textContent).toBe('true');

      fireEvent.click(screen.getByTestId('setOpen'));

      expect(screen.getByTestId('open').textContent).toBe('false');
    });

    it('setOpenMobile updates mobile state', () => {
      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('openMobile').textContent).toBe('false');

      fireEvent.click(screen.getByTestId('setOpenMobile'));

      expect(screen.getByTestId('openMobile').textContent).toBe('true');
    });
  });

  describe('controlled mode', () => {
    it('uses controlled open value when provided', () => {
      const onOpenChange = jest.fn();

      render(
        <SidebarProvider open={false} onOpenChange={onOpenChange}>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open').textContent).toBe('false');

      fireEvent.click(screen.getByTestId('toggle'));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('uses controlled openMobile value when provided', () => {
      // Set mobile viewport
      mockUseIsMobile.mockReturnValue(true);

      const onOpenMobileChange = jest.fn();

      render(
        <SidebarProvider openMobile={false} onOpenMobileChange={onOpenMobileChange}>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('openMobile').textContent).toBe('false');

      fireEvent.click(screen.getByTestId('toggle'));

      expect(onOpenMobileChange).toHaveBeenCalledWith(true);
    });
  });

  describe('state derived from open', () => {
    it('state is expanded when open is true', () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('state').textContent).toBe('expanded');
    });

    it('state is collapsed when open is false', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('state').textContent).toBe('collapsed');
    });
  });

  describe('isMobile detection', () => {
    it('isMobile is false on desktop viewport', () => {
      mockUseIsMobile.mockReturnValue(false);

      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('isMobile').textContent).toBe('false');
    });

    it('isMobile is true on mobile viewport', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('isMobile').textContent).toBe('true');
    });
  });
});
