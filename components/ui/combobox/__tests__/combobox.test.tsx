import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import * as React from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '../index';

// Wrapper that forces popover to stay open for testing
function TestCombobox({
  children,
  ...props
}: React.ComponentProps<typeof Combobox> & { children: React.ReactNode }) {
  return (
    <Combobox open={true} {...props}>
      {children}
    </Combobox>
  );
}

describe('Combobox', () => {
  describe('Single-select mode', () => {
    it('renders trigger with placeholder when no value selected', async () => {
      await act(async () => {
        render(
          <Combobox>
            <ComboboxTrigger placeholder="Select framework..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="react">React</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      });
      expect(screen.getByText('Select framework...')).toBeTruthy();
    });

    it('calls onValueChange when item is selected', async () => {
      const onValueChange = jest.fn();

      await act(async () => {
        render(
          <TestCombobox onValueChange={onValueChange}>
            <ComboboxTrigger placeholder="Select..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="react">React</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </TestCombobox>
        );
      });

      await act(async () => {
        fireEvent.click(screen.getByText('React'));
      });

      expect(onValueChange).toHaveBeenCalledWith('react');
    });

    it('displays selected value label in trigger', async () => {
      const Controlled = () => {
        const [value, setValue] = React.useState<string | undefined>('react');
        return (
          <Combobox value={value} onValueChange={setValue}>
            <ComboboxTrigger placeholder="Select..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="react">React</ComboboxItem>
                <ComboboxItem value="vue">Vue</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      };

      await act(async () => {
        render(<Controlled />);
      });

      expect(screen.getByText('React')).toBeTruthy();
    });
  });

  describe('Multi-select mode', () => {
    it('renders trigger with placeholder when no values selected', async () => {
      await act(async () => {
        render(
          <Combobox multiple values={[]} onValuesChange={() => {}}>
            <ComboboxTrigger placeholder="Select tags..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="bug">Bug</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      });

      expect(screen.getByText('Select tags...')).toBeTruthy();
    });

    it('displays selected values as comma-separated list', async () => {
      await act(async () => {
        render(
          <Combobox multiple values={['bug', 'feature']} onValuesChange={() => {}}>
            <ComboboxTrigger placeholder="Select tags..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="bug">Bug</ComboboxItem>
                <ComboboxItem value="feature">Feature</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      });

      // Wait for labels to be registered (displays either labels or fallback values)
      await waitFor(() => {
        // Check for either capitalized labels or lowercase fallback values
        const trigger = screen.getByTestId('trigger');
        const hasLabels = trigger.textContent?.includes('Bug') && trigger.textContent?.includes('Feature');
        const hasFallback = trigger.textContent?.includes('bug') && trigger.textContent?.includes('feature');
        expect(hasLabels || hasFallback).toBeTruthy();
      });
    });

    it('displays count when displayMode is "count"', async () => {
      await act(async () => {
        render(
          <Combobox multiple values={['bug', 'feature', 'enhancement']} onValuesChange={() => {}}>
            <ComboboxTrigger placeholder="Select tags..." displayMode="count" testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="bug">Bug</ComboboxItem>
                <ComboboxItem value="feature">Feature</ComboboxItem>
                <ComboboxItem value="enhancement">Enhancement</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      });

      expect(screen.getByText('3 selected')).toBeTruthy();
    });

    it('toggles items in/out of values array', async () => {
      const onValuesChange = jest.fn();

      const Controlled = () => {
        const [values, setValues] = React.useState<string[]>(['bug']);
        return (
          <TestCombobox
            multiple
            values={values}
            onValuesChange={(v) => {
              setValues(v);
              onValuesChange(v);
            }}
          >
            <ComboboxTrigger placeholder="Select tags..." testID="trigger" />
            <ComboboxContent closeOnSelect={false}>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="bug">Bug</ComboboxItem>
                <ComboboxItem value="feature">Feature</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </TestCombobox>
        );
      };

      await act(async () => {
        render(<Controlled />);
      });

      // Add feature
      await act(async () => {
        fireEvent.click(screen.getByText('Feature'));
      });

      expect(onValuesChange).toHaveBeenCalledWith(['bug', 'feature']);

      // Remove bug
      await act(async () => {
        fireEvent.click(screen.getByText('Bug'));
      });

      expect(onValuesChange).toHaveBeenCalledWith(['feature']);
    });
  });

  describe('Filtering', () => {
    it('filters items based on search input', async () => {
      await act(async () => {
        render(
          <TestCombobox>
            <ComboboxTrigger placeholder="Select..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="react">React</ComboboxItem>
                <ComboboxItem value="vue">Vue</ComboboxItem>
                <ComboboxItem value="angular">Angular</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </TestCombobox>
        );
      });

      const input = screen.getByPlaceholderText('Search...');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'rea' }, nativeEvent: { text: 'rea' } });
      });

      await waitFor(() => {
        expect(screen.queryByText('Vue')).toBeNull();
        expect(screen.queryByText('Angular')).toBeNull();
      });
      expect(screen.getByText('React')).toBeTruthy();
    });

    it('shows empty state when no items match', async () => {
      await act(async () => {
        render(
          <TestCombobox>
            <ComboboxTrigger placeholder="Select..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
                <ComboboxItem value="react">React</ComboboxItem>
                <ComboboxItem value="vue">Vue</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </TestCombobox>
        );
      });

      const input = screen.getByPlaceholderText('Search...');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'xyz' }, nativeEvent: { text: 'xyz' } });
      });

      await waitFor(() => {
        expect(screen.getByText('No frameworks found.')).toBeTruthy();
      });
    });
  });

  describe('Groups', () => {
    it('renders groups with headings', async () => {
      await act(async () => {
        render(
          <TestCombobox>
            <ComboboxTrigger placeholder="Select..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxGroup heading="Frontend">
                  <ComboboxItem value="react">React</ComboboxItem>
                  <ComboboxItem value="vue">Vue</ComboboxItem>
                </ComboboxGroup>
                <ComboboxGroup heading="Backend">
                  <ComboboxItem value="node">Node.js</ComboboxItem>
                  <ComboboxItem value="python">Python</ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </TestCombobox>
        );
      });

      expect(screen.getByText('Frontend')).toBeTruthy();
      expect(screen.getByText('Backend')).toBeTruthy();
    });

    it('hides groups when all items are filtered out', async () => {
      await act(async () => {
        render(
          <TestCombobox>
            <ComboboxTrigger placeholder="Select..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxGroup heading="Frontend">
                  <ComboboxItem value="react">React</ComboboxItem>
                </ComboboxGroup>
                <ComboboxGroup heading="Backend">
                  <ComboboxItem value="node">Node.js</ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </TestCombobox>
        );
      });

      const input = screen.getByPlaceholderText('Search...');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'react' }, nativeEvent: { text: 'react' } });
      });

      await waitFor(() => {
        expect(screen.queryByText('Backend')).toBeNull();
      });
      expect(screen.getByText('Frontend')).toBeTruthy();
    });
  });

  describe('Disabled items', () => {
    it('does not select disabled items', async () => {
      const onValueChange = jest.fn();

      await act(async () => {
        render(
          <TestCombobox onValueChange={onValueChange}>
            <ComboboxTrigger placeholder="Select..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="react">React</ComboboxItem>
                <ComboboxItem value="legacy" disabled>
                  Legacy
                </ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </TestCombobox>
        );
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Legacy'));
      });

      // Disabled item should not trigger onValueChange
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('Close behavior', () => {
    it('closes on select in single-select mode by default', async () => {
      const onOpenChange = jest.fn();

      await act(async () => {
        render(
          <Combobox open={true} onOpenChange={onOpenChange}>
            <ComboboxTrigger placeholder="Select..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="react">React</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      });

      await act(async () => {
        fireEvent.click(screen.getByText('React'));
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('stays open in multi-select mode by default', async () => {
      const onOpenChange = jest.fn();

      await act(async () => {
        render(
          <Combobox multiple open={true} onOpenChange={onOpenChange} values={[]} onValuesChange={() => {}}>
            <ComboboxTrigger placeholder="Select tags..." testID="trigger" />
            <ComboboxContent>
              <ComboboxInput placeholder="Search..." hideIcon />
              <ComboboxList>
                <ComboboxItem value="bug">Bug</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Bug'));
      });

      // Should not have been called with false
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });
});
