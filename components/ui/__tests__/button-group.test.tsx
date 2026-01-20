import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Text, View } from 'react-native';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  useButtonGroup,
} from '../button-group';
import { Button } from '../button';

describe('ButtonGroup', () => {
  describe('basic rendering', () => {
    it('renders children correctly', () => {
      render(
        <ButtonGroup testID="group">
          <Button testID="btn1">First</Button>
          <Button testID="btn2">Second</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('group')).toBeTruthy();
      expect(screen.getByTestId('btn1')).toBeTruthy();
      expect(screen.getByTestId('btn2')).toBeTruthy();
    });

    it('renders as a View container', () => {
      const { getByTestId } = render(
        <ButtonGroup testID="group">
          <Button>Test</Button>
        </ButtonGroup>
      );

      expect(getByTestId('group')).toBeTruthy();
    });

    it('has correct accessibility role', () => {
      const { getByTestId } = render(
        <ButtonGroup testID="group">
          <Button>Test</Button>
        </ButtonGroup>
      );

      expect(getByTestId('group').getAttribute('role')).toBe('group');
    });

    it('passes additional props to the container', () => {
      const { getByTestId } = render(
        <ButtonGroup testID="group" accessibilityLabel="Button group">
          <Button>Test</Button>
        </ButtonGroup>
      );

      expect(getByTestId('group').getAttribute('aria-label')).toBe(
        'Button group'
      );
    });
  });

  describe('child handling', () => {
    it('handles null children gracefully', () => {
      const showMiddle = false;

      render(
        <ButtonGroup testID="group">
          <Button testID="first">First</Button>
          {showMiddle && <Button testID="middle">Middle</Button>}
          <Button testID="last">Last</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('first')).toBeTruthy();
      expect(screen.queryByTestId('middle')).toBeNull();
      expect(screen.getByTestId('last')).toBeTruthy();
    });

    it('renders mixed children types', () => {
      render(
        <ButtonGroup testID="group">
          <Button testID="btn">Button</Button>
          <ButtonGroupText testID="text">Label</ButtonGroupText>
        </ButtonGroup>
      );

      expect(screen.getByTestId('btn')).toBeTruthy();
      expect(screen.getByTestId('text')).toBeTruthy();
    });

    it('preserves child testID props', () => {
      render(
        <ButtonGroup>
          <Button testID="preserved">Test</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('preserved')).toBeTruthy();
    });
  });
});

describe('ButtonGroupText', () => {
  it('renders text content correctly', () => {
    render(<ButtonGroupText testID="text">Label</ButtonGroupText>);

    expect(screen.getByText('Label')).toBeTruthy();
  });

  it('renders numeric content correctly', () => {
    render(<ButtonGroupText testID="text">{42}</ButtonGroupText>);

    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders non-text children directly', () => {
    render(
      <ButtonGroupText testID="text">
        <View testID="icon" />
        <Text>Label</Text>
      </ButtonGroupText>
    );

    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText('Label')).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { getByTestId } = render(
      <ButtonGroupText testID="text" className="bg-red-500">
        Test
      </ButtonGroupText>
    );

    expect(getByTestId('text')).toBeTruthy();
  });
});

describe('ButtonGroupSeparator', () => {
  it('renders within a ButtonGroup', () => {
    render(
      <ButtonGroup>
        <Button>Left</Button>
        <ButtonGroupSeparator testID="separator" />
        <Button>Right</Button>
      </ButtonGroup>
    );

    expect(screen.getByTestId('separator')).toBeTruthy();
  });

  it('renders standalone', () => {
    render(<ButtonGroupSeparator testID="separator" />);

    expect(screen.getByTestId('separator')).toBeTruthy();
  });

  it('accepts custom className', () => {
    const { getByTestId } = render(
      <ButtonGroup>
        <Button>Left</Button>
        <ButtonGroupSeparator testID="separator" className="bg-red-500" />
        <Button>Right</Button>
      </ButtonGroup>
    );

    expect(getByTestId('separator')).toBeTruthy();
  });
});

describe('useButtonGroup hook', () => {
  // Helper component to test the hook
  function OrientationDisplay() {
    const { orientation } = useButtonGroup();
    return <Text testID="orientation">{orientation}</Text>;
  }

  it('provides default orientation outside of ButtonGroup', () => {
    render(<OrientationDisplay />);

    expect(screen.getByTestId('orientation').textContent).toBe('horizontal');
  });

  it('provides horizontal orientation within horizontal ButtonGroup', () => {
    render(
      <ButtonGroup orientation="horizontal">
        <OrientationDisplay />
      </ButtonGroup>
    );

    expect(screen.getByTestId('orientation').textContent).toBe('horizontal');
  });

  it('provides vertical orientation within vertical ButtonGroup', () => {
    render(
      <ButtonGroup orientation="vertical">
        <OrientationDisplay />
      </ButtonGroup>
    );

    expect(screen.getByTestId('orientation').textContent).toBe('vertical');
  });

  it('updates when ButtonGroup orientation changes', () => {
    const { rerender } = render(
      <ButtonGroup orientation="horizontal">
        <OrientationDisplay />
      </ButtonGroup>
    );

    expect(screen.getByTestId('orientation').textContent).toBe('horizontal');

    rerender(
      <ButtonGroup orientation="vertical">
        <OrientationDisplay />
      </ButtonGroup>
    );

    expect(screen.getByTestId('orientation').textContent).toBe('vertical');
  });
});

describe('ButtonGroup composition', () => {
  it('renders a complete button group with separator', () => {
    render(
      <ButtonGroup testID="group">
        <Button testID="save">Save</Button>
        <ButtonGroupSeparator testID="sep" />
        <Button testID="dropdown">Dropdown</Button>
      </ButtonGroup>
    );

    expect(screen.getByTestId('group')).toBeTruthy();
    expect(screen.getByTestId('save')).toBeTruthy();
    expect(screen.getByTestId('sep')).toBeTruthy();
    expect(screen.getByTestId('dropdown')).toBeTruthy();
  });

  it('renders with text prefix', () => {
    render(
      <ButtonGroup testID="group">
        <ButtonGroupText testID="prefix">$</ButtonGroupText>
        <Button testID="amount">100</Button>
      </ButtonGroup>
    );

    expect(screen.getByText('$')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('renders multiple buttons', () => {
    render(
      <ButtonGroup>
        <Button testID="btn1">One</Button>
        <Button testID="btn2">Two</Button>
        <Button testID="btn3">Three</Button>
        <Button testID="btn4">Four</Button>
      </ButtonGroup>
    );

    expect(screen.getByText('One')).toBeTruthy();
    expect(screen.getByText('Two')).toBeTruthy();
    expect(screen.getByText('Three')).toBeTruthy();
    expect(screen.getByText('Four')).toBeTruthy();
  });
});
