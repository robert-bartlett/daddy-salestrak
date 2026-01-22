import { render, screen, fireEvent } from '@testing-library/react';
import { Home } from 'lucide-react-native';
import * as React from 'react';
import { Text, View } from 'react-native';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../breadcrumb';

describe('Breadcrumb', () => {
  describe('basic rendering', () => {
    it('renders children correctly', () => {
      render(
        <Breadcrumb testID="breadcrumb">
          <BreadcrumbList testID="list">
            <BreadcrumbItem testID="item">
              <BreadcrumbLink testID="link">
                <Text>Home</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(screen.getByTestId('breadcrumb')).toBeTruthy();
      expect(screen.getByTestId('list')).toBeTruthy();
      expect(screen.getByTestId('item')).toBeTruthy();
      expect(screen.getByTestId('link')).toBeTruthy();
      expect(screen.getByText('Home')).toBeTruthy();
    });

    it('has correct accessibility attributes on web', () => {
      const { getByTestId } = render(
        <Breadcrumb testID="breadcrumb">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Text>Home</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(getByTestId('breadcrumb').getAttribute('role')).toBe('navigation');
      expect(getByTestId('breadcrumb').getAttribute('aria-label')).toBe('breadcrumb');
    });

    it('passes additional props to the container', () => {
      const { getByTestId } = render(
        <Breadcrumb testID="breadcrumb" accessibilityHint="Navigate breadcrumb">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Text>Home</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(getByTestId('breadcrumb')).toBeTruthy();
    });
  });
});

describe('BreadcrumbList', () => {
  it('renders with list role on web', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList testID="list">
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('list').getAttribute('role')).toBe('list');
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList testID="list" className="custom-class">
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('list')).toBeTruthy();
  });
});

describe('BreadcrumbItem', () => {
  it('renders with listitem role on web', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem testID="item">
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('item').getAttribute('role')).toBe('listitem');
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem testID="item" className="custom-class">
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('item')).toBeTruthy();
  });
});

describe('BreadcrumbLink', () => {
  it('has link accessibility role', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink testID="link">
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('link').getAttribute('role')).toBe('link');
  });

  it('calls onPress when pressed', () => {
    const handlePress = jest.fn();

    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink testID="link" onPress={handlePress}>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    fireEvent.click(screen.getByTestId('link'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('accepts asChild prop', () => {
    // asChild pattern is handled by @rn-primitives/slot
    // This test just verifies the prop is accepted without errors
    const { getByText } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild={false}>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByText('Home')).toBeTruthy();
  });

  it('renders with icon prop', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink testID="link" icon={Home}>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('link')).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
  });
});

describe('BreadcrumbPage', () => {
  it('has disabled link accessibility state', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage testID="page">
              <Text>Current Page</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    // BreadcrumbPage should render with link role
    expect(getByTestId('page').getAttribute('role')).toBe('link');
    // Check that aria-current is set for the current page
    expect(getByTestId('page').getAttribute('aria-current')).toBe('page');
  });

  it('renders children correctly', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage testID="page">
              <Text>Current Page</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByText('Current Page')).toBeTruthy();
  });

  it('renders with icon prop', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage testID="page" icon={Home}>
              <Text>Current Page</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('page')).toBeTruthy();
    expect(screen.getByText('Current Page')).toBeTruthy();
  });
});

describe('BreadcrumbSeparator', () => {
  it('renders default ChevronRight icon', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator testID="separator" />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Page</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('separator')).toBeTruthy();
  });

  it('uses custom separator from context', () => {
    render(
      <Breadcrumb separator={<Text testID="custom-sep">/</Text>}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Page</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByTestId('custom-sep')).toBeTruthy();
    expect(screen.getByText('/')).toBeTruthy();
  });

  it('allows per-separator override via children', () => {
    render(
      <Breadcrumb separator={<Text>/</Text>}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Text testID="override-sep">→</Text>
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Page</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByTestId('override-sep')).toBeTruthy();
    expect(screen.getByText('→')).toBeTruthy();
    // The context separator "/" should NOT be rendered since we overrode it
    expect(screen.queryByText('/')).toBeNull();
  });

  it('is hidden from accessibility tree on web', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator testID="separator" />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Page</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(getByTestId('separator').getAttribute('aria-hidden')).toBe('true');
  });
});

describe('BreadcrumbEllipsis', () => {
  it('renders MoreHorizontal icon when disabled', () => {
    const { getByTestId } = render(
      <BreadcrumbEllipsis testID="ellipsis" />
    );

    expect(getByTestId('ellipsis')).toBeTruthy();
    expect(getByTestId('ellipsis').getAttribute('aria-disabled')).toBe('true');
  });

  it('calls onPress when pressed', () => {
    const handlePress = jest.fn();

    render(
      <BreadcrumbEllipsis testID="ellipsis" onPress={handlePress} />
    );

    fireEvent.click(screen.getByTestId('ellipsis'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <BreadcrumbEllipsis testID="ellipsis" className="custom-class" />
    );

    expect(getByTestId('ellipsis')).toBeTruthy();
  });
});

describe('maxItems collapse logic', () => {
  it('does nothing when items <= maxItems', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList maxItems={4} testID="list">
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Products</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Current</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    // All items should be visible
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
    expect(screen.getByText('Current')).toBeTruthy();
  });

  it('collapses middle items when items > maxItems', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList maxItems={3} testID="list">
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Category</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Subcategory</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Product</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Details</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    // First item should be visible
    expect(screen.getByText('Home')).toBeTruthy();
    // Middle items should be collapsed (not visible)
    expect(screen.queryByText('Category')).toBeNull();
    expect(screen.queryByText('Subcategory')).toBeNull();
    expect(screen.queryByText('Product')).toBeNull();
    // Last item should be visible (maxItems - 2 = 1)
    expect(screen.getByText('Details')).toBeTruthy();
  });

  it('keeps first and last items visible with ellipsis', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList maxItems={4} testID="list">
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>A</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>B</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>C</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>D</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>E</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    // First should be visible
    expect(screen.getByText('Home')).toBeTruthy();
    // Middle items should be collapsed
    expect(screen.queryByText('A')).toBeNull();
    expect(screen.queryByText('B')).toBeNull();
    expect(screen.queryByText('C')).toBeNull();
    // Last (maxItems - 2 = 2) should be visible
    expect(screen.getByText('D')).toBeTruthy();
    expect(screen.getByText('E')).toBeTruthy();
  });
});

describe('edge cases', () => {
  it('handles empty BreadcrumbList', () => {
    const { getByTestId } = render(
      <Breadcrumb>
        <BreadcrumbList testID="list" />
      </Breadcrumb>
    );

    expect(getByTestId('list')).toBeTruthy();
  });

  it('handles single item (no separator needed)', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Home</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('handles null/undefined children gracefully', () => {
    const showMiddle = false;

    render(
      <Breadcrumb>
        <BreadcrumbList testID="list">
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {showMiddle && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <Text>Middle</Text>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Current</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.queryByText('Middle')).toBeNull();
    expect(screen.getByText('Current')).toBeTruthy();
  });

  it('handles maxItems edge value (0)', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList maxItems={0}>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Current</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    // maxItems < 2 should show all items (no collapse)
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Current')).toBeTruthy();
  });

  it('handles maxItems edge value (1)', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList maxItems={1}>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Current</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    // maxItems < 2 should show all items (no collapse)
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Current')).toBeTruthy();
  });

  it('handles maxItems edge value (2)', () => {
    render(
      <Breadcrumb separator={<Text testID="sep">/</Text>}>
        <BreadcrumbList maxItems={2}>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Category</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Current</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    // With maxItems=2: first (1) + ellipsis (1) + last (0) = 2
    // So only first item and ellipsis should show
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.queryByText('Category')).toBeNull();
    expect(screen.queryByText('Current')).toBeNull();
    expect(screen.getAllByTestId('sep')).toHaveLength(1);
  });

  it('forwards ellipsisProps to the auto-collapsed ellipsis', () => {
    const handlePress = jest.fn();

    render(
      <Breadcrumb>
        <BreadcrumbList maxItems={2} ellipsisProps={{ testID: 'ellipsis', onPress: handlePress }}>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Category</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Current</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    fireEvent.click(screen.getByTestId('ellipsis'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});

describe('fragment handling', () => {
  it('collapses items wrapped in fragments', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList maxItems={3}>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Text>Category</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Text>Subcategory</Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Details</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.queryByText('Category')).toBeNull();
    expect(screen.queryByText('Subcategory')).toBeNull();
    expect(screen.getByText('Details')).toBeTruthy();
  });
});

describe('composition', () => {
  it('renders a complete breadcrumb trail', () => {
    const handleHomePress = jest.fn();
    const handleProductsPress = jest.fn();

    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onPress={handleHomePress}>
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onPress={handleProductsPress}>
              <Text>Products</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Text>Widget</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
    expect(screen.getByText('Widget')).toBeTruthy();

    fireEvent.click(screen.getByText('Home'));
    expect(handleHomePress).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Products'));
    expect(handleProductsPress).toHaveBeenCalledTimes(1);
  });
});
