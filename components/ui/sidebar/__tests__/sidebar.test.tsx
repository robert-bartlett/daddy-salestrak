import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Text } from 'react-native';
import {
  Sidebar,
  SidebarContent,
  SidebarErrorBoundary,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
} from '../sidebar';
import { useSidebarInternal } from '../sidebar-internal-context';
import { SidebarProvider } from '../sidebar-context';
import { useIsMobile } from '@/hooks/use-is-mobile';

// Mock the hook module
jest.mock('@/hooks/use-is-mobile');
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;

// Helper component to test internal context
function InternalContextConsumer() {
  const internal = useSidebarInternal();
  return (
    <>
      <Text testID="collapsible">{internal?.collapsible ?? 'null'}</Text>
      <Text testID="variant">{internal?.variant ?? 'null'}</Text>
      <Text testID="side">{internal?.side ?? 'null'}</Text>
      <Text testID="isCollapsed">{String(internal?.isCollapsed ?? 'null')}</Text>
    </>
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    // Reset to desktop viewport
    mockUseIsMobile.mockReturnValue(false);
  });

  describe('Sidebar component', () => {
    it('renders children on desktop', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <Text>Sidebar Content</Text>
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByText('Sidebar Content')).toBeTruthy();
    });

    it('applies default props', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <InternalContextConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByTestId('collapsible').textContent).toBe('offcanvas');
      expect(screen.getByTestId('side').textContent).toBe('left');
    });

    it('passes collapsible prop to internal context', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <InternalContextConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByTestId('collapsible').textContent).toBe('icon');
    });

    it('passes side prop to internal context', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right">
            <InternalContextConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByTestId('side').textContent).toBe('right');
    });

    it('passes variant from SidebarProvider to internal context', () => {
      render(
        <SidebarProvider variant="floating">
          <Sidebar>
            <InternalContextConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByTestId('variant').textContent).toBe('floating');
    });

    it('calculates isCollapsed correctly for icon mode', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="icon">
            <InternalContextConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByTestId('isCollapsed').textContent).toBe('true');
    });

    it('isCollapsed is false when open', () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon">
            <InternalContextConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByTestId('isCollapsed').textContent).toBe('false');
    });

    it('isCollapsed is false when collapsible is not icon', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="offcanvas">
            <InternalContextConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByTestId('isCollapsed').textContent).toBe('false');
    });

    it('isCollapsed is always false on mobile', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <SidebarProvider defaultOpen={false} defaultOpenMobile={true}>
          <Sidebar collapsible="icon">
            <InternalContextConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      // Even with icon collapsible and collapsed state, mobile should show expanded
      expect(screen.getByTestId('isCollapsed').textContent).toBe('false');
    });

    it('renders non-collapsible sidebar correctly', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="none">
            <Text>Non-collapsible</Text>
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByText('Non-collapsible')).toBeTruthy();
    });
  });

  describe('SidebarHeader', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <Text>Header Content</Text>
            </SidebarHeader>
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByText('Header Content')).toBeTruthy();
    });

    it('accepts custom className', () => {
      const { getByTestId } = render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader testID="header" className="custom-class">
              <Text>Header</Text>
            </SidebarHeader>
          </Sidebar>
        </SidebarProvider>
      );

      expect(getByTestId('header')).toBeTruthy();
    });
  });

  describe('SidebarContent', () => {
    it('renders children in scrollable area', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <Text>Scrollable Content</Text>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByText('Scrollable Content')).toBeTruthy();
    });
  });

  describe('SidebarFooter', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarFooter>
              <Text>Footer Content</Text>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByText('Footer Content')).toBeTruthy();
    });
  });

  describe('SidebarInset', () => {
    it('renders children', () => {
      render(
        <SidebarProvider>
          <Sidebar />
          <SidebarInset>
            <Text>Main Content</Text>
          </SidebarInset>
        </SidebarProvider>
      );

      expect(screen.getByText('Main Content')).toBeTruthy();
    });
  });

  describe('useSidebarInternal hook', () => {
    it('returns null when used outside Sidebar', () => {
      function OutsideConsumer() {
        const internal = useSidebarInternal();
        return <Text testID="result">{internal === null ? 'null' : 'not-null'}</Text>;
      }

      render(
        <SidebarProvider>
          <OutsideConsumer />
        </SidebarProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('null');
    });

    it('returns context value when used inside Sidebar', () => {
      function InsideConsumer() {
        const internal = useSidebarInternal();
        return <Text testID="result">{internal === null ? 'null' : 'not-null'}</Text>;
      }

      render(
        <SidebarProvider>
          <Sidebar>
            <InsideConsumer />
          </Sidebar>
        </SidebarProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('not-null');
    });
  });
});

describe('SidebarErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders children when no error', () => {
    render(
      <SidebarErrorBoundary>
        <Text>Child Content</Text>
      </SidebarErrorBoundary>
    );

    expect(screen.getByText('Child Content')).toBeTruthy();
  });

  it('renders default fallback when error occurs', () => {
    function ThrowingComponent(): never {
      throw new Error('Test error');
    }

    render(
      <SidebarErrorBoundary>
        <ThrowingComponent />
      </SidebarErrorBoundary>
    );

    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('renders custom fallback ReactNode when provided', () => {
    function ThrowingComponent(): never {
      throw new Error('Test error');
    }

    render(
      <SidebarErrorBoundary fallback={<Text>Custom Error</Text>}>
        <ThrowingComponent />
      </SidebarErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeTruthy();
  });

  it('renders custom fallback function with error and reset', () => {
    function ThrowingComponent(): never {
      throw new Error('Test error message');
    }

    render(
      <SidebarErrorBoundary
        fallback={({ error, reset }) => (
          <>
            <Text testID="error-message">{error.message}</Text>
            <Text testID="has-reset">{typeof reset === 'function' ? 'yes' : 'no'}</Text>
          </>
        )}
      >
        <ThrowingComponent />
      </SidebarErrorBoundary>
    );

    expect(screen.getByTestId('error-message').textContent).toBe('Test error message');
    expect(screen.getByTestId('has-reset').textContent).toBe('yes');
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();

    function ThrowingComponent(): never {
      throw new Error('Test error');
    }

    render(
      <SidebarErrorBoundary onError={onError}>
        <ThrowingComponent />
      </SidebarErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('reset function clears error state', () => {
    let shouldThrow = true;

    function MaybeThrowingComponent() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <Text>Recovered</Text>;
    }

    render(
      <SidebarErrorBoundary
        fallback={({ reset }) => (
          <Text
            testID="reset-button"
            onPress={() => {
              shouldThrow = false;
              reset();
            }}
          >
            Reset
          </Text>
        )}
      >
        <MaybeThrowingComponent />
      </SidebarErrorBoundary>
    );

    expect(screen.getByTestId('reset-button')).toBeTruthy();

    fireEvent.click(screen.getByTestId('reset-button'));

    expect(screen.getByText('Recovered')).toBeTruthy();
  });

  it('default fallback has accessible retry button', () => {
    function ThrowingComponent(): never {
      throw new Error('Test error');
    }

    render(
      <SidebarErrorBoundary>
        <ThrowingComponent />
      </SidebarErrorBoundary>
    );

    const retryButton = screen.getByLabelText('Retry loading sidebar');
    expect(retryButton).toBeTruthy();
    expect(retryButton.getAttribute('role')).toBe('button');
  });
});
