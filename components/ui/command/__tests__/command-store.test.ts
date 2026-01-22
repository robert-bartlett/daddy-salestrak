/**
 * Tests for command-store.ts
 *
 * Tests the core store functionality including:
 * - State management
 * - Item/group registration
 * - Filtering
 * - Navigation
 */

import {
  createCommandStore,
  defaultFilter,
  updateStoreOptions,
} from '../command-store';

describe('createCommandStore', () => {
  describe('initial state', () => {
    it('creates store with default state', () => {
      const store = createCommandStore();
      const state = store.getState();

      expect(state.search).toBe('');
      expect(state.value).toBe('');
      expect(state.filtered.count).toBe(0);
      expect(state.filtered.items.size).toBe(0);
      expect(state.filtered.groups.size).toBe(0);
    });

    it('accepts initial controlled value', () => {
      const store = createCommandStore({ value: 'initial' });
      expect(store.getState().value).toBe('initial');
    });
  });

  describe('item registration', () => {
    it('registers an item', () => {
      const store = createCommandStore();
      const unregister = store.registerItem({
        id: 'item-1',
        value: 'test',
        keywords: [],
        disabled: false,
        order: 0,
      });

      const state = store.getState();
      expect(state.filtered.count).toBe(1);
      expect(state.filtered.items.has('item-1')).toBe(true);

      unregister();
    });

    it('unregisters an item', () => {
      const store = createCommandStore();
      const unregister = store.registerItem({
        id: 'item-1',
        value: 'test',
        keywords: [],
        disabled: false,
        order: 0,
      });

      unregister();

      const state = store.getState();
      expect(state.filtered.count).toBe(0);
      expect(state.filtered.items.has('item-1')).toBe(false);
    });

    it('selects first item when no selection exists', () => {
      const store = createCommandStore();
      store.registerItem({
        id: 'item-1',
        value: 'first',
        keywords: [],
        disabled: false,
        order: 0,
      });

      expect(store.getState().value).toBe('first');
    });
  });

  describe('group registration', () => {
    it('registers a group', () => {
      const store = createCommandStore();
      const unregister = store.registerGroup({
        id: 'group-1',
        order: 0,
      });

      // Group visibility is tracked when items belong to it
      unregister();
    });
  });

  describe('search and filtering', () => {
    it('updates search state', () => {
      const store = createCommandStore();
      store.setSearch('test');

      expect(store.getState().search).toBe('test');
    });

    it('filters items based on search', () => {
      const store = createCommandStore();
      store.registerItem({
        id: 'item-1',
        value: 'apple',
        keywords: [],
        disabled: false,
        order: 0,
      });
      store.registerItem({
        id: 'item-2',
        value: 'banana',
        keywords: [],
        disabled: false,
        order: 1,
      });

      store.setSearch('app');

      const state = store.getState();
      expect(state.filtered.count).toBe(1);
      expect(state.filtered.items.has('item-1')).toBe(true);
      expect(state.filtered.items.has('item-2')).toBe(false);
    });

    it('respects shouldFilter=false', () => {
      const store = createCommandStore({ shouldFilter: false });
      store.registerItem({
        id: 'item-1',
        value: 'apple',
        keywords: [],
        disabled: false,
        order: 0,
      });
      store.registerItem({
        id: 'item-2',
        value: 'banana',
        keywords: [],
        disabled: false,
        order: 1,
      });

      store.setSearch('xyz');

      const state = store.getState();
      expect(state.filtered.count).toBe(2);
      expect(state.search).toBe('xyz');
    });

    it('uses custom filter function', () => {
      const customFilter = jest.fn(() => 0.5);
      const store = createCommandStore({ filter: customFilter });

      store.registerItem({
        id: 'item-1',
        value: 'test',
        keywords: [],
        disabled: false,
        order: 0,
      });

      store.setSearch('query');

      expect(customFilter).toHaveBeenCalledWith('test', 'query', []);
    });
  });

  describe('navigation', () => {
    let store: ReturnType<typeof createCommandStore>;

    beforeEach(() => {
      store = createCommandStore();
      store.registerItem({
        id: 'item-1',
        value: 'first',
        keywords: [],
        disabled: false,
        order: 0,
      });
      store.registerItem({
        id: 'item-2',
        value: 'second',
        keywords: [],
        disabled: false,
        order: 1,
      });
      store.registerItem({
        id: 'item-3',
        value: 'third',
        keywords: [],
        disabled: false,
        order: 2,
      });
    });

    it('selects next item', () => {
      store.setValue('first');
      store.selectNext();
      expect(store.getState().value).toBe('second');
    });

    it('selects previous item', () => {
      store.setValue('second');
      store.selectPrevious();
      expect(store.getState().value).toBe('first');
    });

    it('selects first item', () => {
      store.setValue('third');
      store.selectFirst();
      expect(store.getState().value).toBe('first');
    });

    it('selects last item', () => {
      store.setValue('first');
      store.selectLast();
      expect(store.getState().value).toBe('third');
    });

    it('wraps with loop=true', () => {
      store = createCommandStore({ loop: true });
      store.registerItem({
        id: 'item-1',
        value: 'first',
        keywords: [],
        disabled: false,
        order: 0,
      });
      store.registerItem({
        id: 'item-2',
        value: 'second',
        keywords: [],
        disabled: false,
        order: 1,
      });

      store.setValue('second');
      store.selectNext();
      expect(store.getState().value).toBe('first');
    });

    it('does not wrap with loop=false', () => {
      store.setValue('third');
      store.selectNext();
      expect(store.getState().value).toBe('third');
    });
  });

  describe('controlled value', () => {
    it('calls onValueChange callback', () => {
      const onValueChange = jest.fn();
      const store = createCommandStore({ onValueChange });

      store.registerItem({
        id: 'item-1',
        value: 'test',
        keywords: [],
        disabled: false,
        order: 0,
      });

      store.setValue('test');
      expect(onValueChange).toHaveBeenCalledWith('test');
    });
  });

  describe('subscription', () => {
    it('notifies subscribers on state change', () => {
      const store = createCommandStore();
      const listener = jest.fn();

      store.subscribe(listener);
      store.setSearch('test');

      expect(listener).toHaveBeenCalled();
    });

    it('unsubscribes correctly', () => {
      const store = createCommandStore();
      const listener = jest.fn();

      const unsubscribe = store.subscribe(listener);
      unsubscribe();

      store.setSearch('test');
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe('defaultFilter', () => {
  it('returns 1 for empty search', () => {
    expect(defaultFilter('anything', '')).toBe(1);
    expect(defaultFilter('anything', '   ')).toBe(1);
  });

  it('returns 1 for exact match', () => {
    expect(defaultFilter('test', 'test')).toBe(1);
  });

  it('returns 0.9 for starts-with match', () => {
    expect(defaultFilter('testing', 'test')).toBe(0.9);
  });

  it('returns 0.7 for contains match', () => {
    expect(defaultFilter('my test value', 'test')).toBe(0.7);
  });

  it('returns 0.5 for fuzzy match', () => {
    expect(defaultFilter('typescript', 'tsc')).toBe(0.5);
  });

  it('returns 0 for no match', () => {
    expect(defaultFilter('hello', 'xyz')).toBe(0);
  });

  it('matches against keywords', () => {
    expect(defaultFilter('settings', 'pref', ['preferences'])).toBeGreaterThan(0);
  });

  it('trims input strings', () => {
    expect(defaultFilter('  test  ', '  test  ')).toBe(1);
  });

  it('is case insensitive', () => {
    expect(defaultFilter('TEST', 'test')).toBe(1);
    expect(defaultFilter('test', 'TEST')).toBe(1);
  });
});

describe('updateStoreOptions', () => {
  it('updates store options', () => {
    const store = createCommandStore({ loop: false });
    updateStoreOptions(store, { loop: true });

    expect(store.options.loop).toBe(true);
  });

  it('updates value option reference', () => {
    const store = createCommandStore();
    store.registerItem({
      id: 'item-1',
      value: 'first',
      keywords: [],
      disabled: false,
      order: 0,
    });

    // Value starts undefined, update sets the option
    updateStoreOptions(store, { value: 'first' });
    expect(store.options.value).toBe('first');
  });
});
